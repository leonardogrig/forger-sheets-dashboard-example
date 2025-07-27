import prisma from './prisma';
import { googleSheetsService } from './google-sheets';
import { cacheService } from './redis';

interface ProcessedData {
  products: Map<string, any>;
  reviews: any[];
  reviewers: Map<string, any>;
  sales: any[];
}

export class DataSyncService {
  async syncData(): Promise<{ success: boolean; rowsUpdated: number; error?: string }> {
    const syncLog = await prisma.syncLog.create({
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    try {
      console.log('Starting data sync...');
      
      const sheetData = await googleSheetsService.fetchSheetData();
      console.log(`Fetched ${sheetData.length} rows from Google Sheets`);

      const processedData = this.processSheetData(sheetData);
      console.log(`Processed data: ${processedData.products.size} products, ${processedData.reviewers.size} reviewers, ${processedData.reviews.length} reviews, ${processedData.sales.length} sales`);
      
      await this.updateDatabase(processedData);
      
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'SUCCESS',
          rowsUpdated: sheetData.length,
          completedAt: new Date(),
        },
      });

      await cacheService.invalidatePattern('dashboard:*');
      
      console.log(`Data sync completed successfully. Updated ${sheetData.length} rows.`);
      
      return {
        success: true,
        rowsUpdated: sheetData.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'ERROR',
          errorMessage,
          completedAt: new Date(),
        },
      });

      console.error('Data sync failed:', error);
      
      return {
        success: false,
        rowsUpdated: 0,
        error: errorMessage,
      };
    }
  }

  private processSheetData(sheetData: any[]): ProcessedData {
    const products = new Map();
    const reviewers = new Map();
    const reviews: any[] = [];
    const sales: any[] = [];

    for (const row of sheetData) {
      const productId = row.product_id?.trim();
      if (!productId || productId.length === 0) continue;

      // Skip rows that seem to be headers or invalid data
      if (productId.toLowerCase().includes('product_id') || 
          productId.toLowerCase().includes('product id')) continue;

      if (!products.has(productId)) {
        products.set(productId, {
          id: productId,
          name: row.product_name?.trim() || 'Unknown Product',
          category: row.category?.trim() || 'Unknown Category',
          actualPrice: row.actual_price?.trim() || '₹0',
          rating: googleSheetsService.parseRating(row.rating || '0'),
          aboutProduct: row.about_product?.trim() || '',
          productLink: row.product_link?.trim() || '',
        });
      }

      if (row.date_sold?.trim()) {
        try {
          sales.push({
            productId,
            dateSold: googleSheetsService.parseDate(row.date_sold.trim()),
          });
        } catch (error) {
          console.warn(`Invalid date format for product ${productId}: ${row.date_sold}`);
        }
      }

      const userIds = googleSheetsService.parseUserIds(row.user_id || '');
      const userNames = googleSheetsService.parseUserNames(row.user_name || '');
      const reviewIds = googleSheetsService.parseReviewIds(row.review_id || '');
      const reviewTitles = googleSheetsService.parseReviewTitles(row.review_title || '');
      const reviewContents = googleSheetsService.parseReviewContents(row.review_content || '');

      const maxReviews = Math.max(
        userIds.length,
        userNames.length,
        reviewIds.length,
        reviewTitles.length,
        reviewContents.length
      );

      for (let i = 0; i < maxReviews; i++) {
        const userId = userIds[i] || userIds[0] || '';
        const userName = userNames[i] || userNames[0] || '';
        const reviewId = reviewIds[i] || '';
        const reviewTitle = reviewTitles[i] || '';
        const reviewContent = reviewContents[i] || '';

        if (userId && userId.length > 0 && !reviewers.has(userId)) {
          reviewers.set(userId, {
            id: userId,
            name: userName || 'Anonymous',
          });
        }

        if (reviewId && reviewId.length > 0 && userId && userId.length > 0) {
          reviews.push({
            id: reviewId,
            productId,
            reviewerId: userId,
            title: reviewTitle || 'No title',
            content: reviewContent || 'No content',
          });
        }
      }
    }

    return { products, reviewers, reviews, sales };
  }

  private async updateDatabase(data: ProcessedData): Promise<void> {
    // Use longer transaction timeout and batch operations
    await prisma.$transaction(async (tx) => {
      console.log('Clearing existing data...');
      await tx.review.deleteMany();
      await tx.sale.deleteMany();
      await tx.reviewer.deleteMany();
      await tx.product.deleteMany();

      console.log('Inserting products...');
      const productsArray = Array.from(data.products.values());
      
      // Batch insert products in chunks of 50
      const productChunks = this.chunkArray(productsArray, 50);
      for (let i = 0; i < productChunks.length; i++) {
        console.log(`Inserting product batch ${i + 1}/${productChunks.length}`);
        await Promise.all(
          productChunks[i].map(product =>
            tx.product.upsert({
              where: { id: product.id },
              update: product,
              create: product,
            })
          )
        );
      }

      console.log('Inserting reviewers...');
      const reviewersArray = Array.from(data.reviewers.values());
      
      // Batch insert reviewers in chunks of 100
      const reviewerChunks = this.chunkArray(reviewersArray, 100);
      for (let i = 0; i < reviewerChunks.length; i++) {
        console.log(`Inserting reviewer batch ${i + 1}/${reviewerChunks.length}`);
        await Promise.all(
          reviewerChunks[i].map(reviewer =>
            tx.reviewer.upsert({
              where: { id: reviewer.id },
              update: reviewer,
              create: reviewer,
            })
          )
        );
      }

      console.log('Inserting sales...');
      // Batch insert sales in chunks of 100
      const salesChunks = this.chunkArray(data.sales, 100);
      for (let i = 0; i < salesChunks.length; i++) {
        console.log(`Inserting sales batch ${i + 1}/${salesChunks.length}`);
        await Promise.all(
          salesChunks[i].map(sale =>
            tx.sale.create({ data: sale })
          )
        );
      }

      console.log('Inserting reviews...');
      // Batch insert reviews in chunks of 100
      const reviewChunks = this.chunkArray(data.reviews, 100);
      for (let i = 0; i < reviewChunks.length; i++) {
        console.log(`Inserting review batch ${i + 1}/${reviewChunks.length}`);
        await Promise.all(
          reviewChunks[i].map(review =>
            tx.review.upsert({
              where: { id: review.id },
              update: review,
              create: review,
            })
          )
        );
      }
    }, {
      timeout: 60000, // 60 second timeout instead of default 5 seconds
    });
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getLastSyncStatus() {
    const lastSync = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
    });

    return lastSync;
  }

  async getSyncHistory(limit: number = 10) {
    const syncHistory = await prisma.syncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return syncHistory;
  }
}

export const dataSyncService = new DataSyncService();