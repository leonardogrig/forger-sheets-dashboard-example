import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { cacheService } from '@/lib/redis';

interface DashboardMetrics {
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  averagePrice: number;
  ratingDistribution: { range: string; count: number }[];
  priceVsRating: { price: number; rating: number; productName: string }[];
  dailySales: { date: string; count: number }[];
  revenueByProduct: { productName: string; revenue: number; reviewCount: number }[];
  categoryPerformance: { category: string; averageRating: number; productCount: number }[];
  priceDistribution: { range: string; count: number }[];
  reviewsPerProduct: { productName: string; reviewCount: number }[];
  recentReviews: {
    id: string;
    title: string;
    content: string;
    productName: string;
    reviewerName: string;
    createdAt: string;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const minRating = url.searchParams.get('minRating');
    const maxRating = url.searchParams.get('maxRating');
    const dateFrom = url.searchParams.get('dateFrom');
    const dateTo = url.searchParams.get('dateTo');

    const cacheKey = cacheService.generateKey(
      'dashboard',
      'metrics',
      category || 'all',
      minPrice || '0',
      maxPrice || '999999',
      minRating || '0',
      maxRating || '5',
      dateFrom || 'all',
      dateTo || 'all'
    );

    const cached = await cacheService.get<DashboardMetrics>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const whereConditions: any = {};
    
    if (category) {
      whereConditions.category = {
        contains: category,
        mode: 'insensitive'
      };
    }
    
    if (minRating || maxRating) {
      whereConditions.rating = {};
      if (minRating) whereConditions.rating.gte = parseFloat(minRating);
      if (maxRating) whereConditions.rating.lte = parseFloat(maxRating);
    }

    const metrics = await calculateDashboardMetrics(whereConditions, {
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    await cacheService.set(cacheKey, metrics, 300);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

async function calculateDashboardMetrics(
  whereConditions: any,
  filters: {
    minPrice?: number;
    maxPrice?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<DashboardMetrics> {
  const [
    totalProducts,
    averageRating,
    totalReviews,
    products,
    sales,
    reviews
  ] = await Promise.all([
    prisma.product.count({ where: whereConditions }),
    
    prisma.product.aggregate({
      where: whereConditions,
      _avg: { rating: true }
    }).then(result => result._avg.rating || 0),
    
    prisma.review.count({
      where: {
        product: whereConditions
      }
    }),
    
    prisma.product.findMany({
      where: whereConditions,
      include: {
        reviews: true,
        sales: filters.dateFrom || filters.dateTo ? {
          where: {
            dateSold: {
              ...(filters.dateFrom && { gte: filters.dateFrom }),
              ...(filters.dateTo && { lte: filters.dateTo })
            }
          }
        } : true
      }
    }),
    
    prisma.sale.findMany({
      where: {
        product: whereConditions,
        ...(filters.dateFrom || filters.dateTo ? {
          dateSold: {
            ...(filters.dateFrom && { gte: filters.dateFrom }),
            ...(filters.dateTo && { lte: filters.dateTo })
          }
        } : {})
      },
      include: {
        product: true
      }
    }),
    
    prisma.review.findMany({
      where: {
        product: whereConditions
      },
      include: {
        product: true,
        reviewer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
  ]);

  const filteredProducts = products.filter(product => {
    const price = parsePrice(product.actualPrice);
    if (filters.minPrice && price < filters.minPrice) return false;
    if (filters.maxPrice && price > filters.maxPrice) return false;
    return true;
  });

  const averagePrice = filteredProducts.reduce((sum, product) => {
    return sum + parsePrice(product.actualPrice);
  }, 0) / (filteredProducts.length || 1);

  const ratingDistribution = [
    { range: '1-2', count: 0 },
    { range: '2-3', count: 0 },
    { range: '3-4', count: 0 },
    { range: '4-5', count: 0 }
  ];

  filteredProducts.forEach(product => {
    if (product.rating >= 1 && product.rating < 2) ratingDistribution[0].count++;
    else if (product.rating >= 2 && product.rating < 3) ratingDistribution[1].count++;
    else if (product.rating >= 3 && product.rating < 4) ratingDistribution[2].count++;
    else if (product.rating >= 4 && product.rating <= 5) ratingDistribution[3].count++;
  });

  const priceVsRating = filteredProducts.map(product => ({
    price: parsePrice(product.actualPrice),
    rating: product.rating,
    productName: product.name
  }));

  const salesByDate = new Map<string, number>();
  sales.forEach(sale => {
    const dateKey = sale.dateSold.toISOString().split('T')[0];
    salesByDate.set(dateKey, (salesByDate.get(dateKey) || 0) + 1);
  });

  const dailySales = Array.from(salesByDate.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const revenueByProduct = filteredProducts.map(product => ({
    productName: product.name,
    revenue: parsePrice(product.actualPrice) * product.reviews.length,
    reviewCount: product.reviews.length
  })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const categoryStats = new Map<string, { totalRating: number; count: number }>();
  filteredProducts.forEach(product => {
    const mainCategory = product.category.split('|')[0] || 'Other';
    const existing = categoryStats.get(mainCategory) || { totalRating: 0, count: 0 };
    categoryStats.set(mainCategory, {
      totalRating: existing.totalRating + product.rating,
      count: existing.count + 1
    });
  });

  const categoryPerformance = Array.from(categoryStats.entries()).map(([category, stats]) => ({
    category,
    averageRating: stats.totalRating / stats.count,
    productCount: stats.count
  }));

  const priceRanges = [
    { range: '₹0-500', min: 0, max: 500, count: 0 },
    { range: '₹500-1000', min: 500, max: 1000, count: 0 },
    { range: '₹1000-2000', min: 1000, max: 2000, count: 0 },
    { range: '₹2000+', min: 2000, max: Infinity, count: 0 }
  ];

  filteredProducts.forEach(product => {
    const price = parsePrice(product.actualPrice);
    for (const range of priceRanges) {
      if (price >= range.min && price < range.max) {
        range.count++;
        break;
      }
    }
  });

  const priceDistribution = priceRanges.map(({ range, count }) => ({ range, count }));

  const reviewsPerProduct = filteredProducts.map(product => ({
    productName: product.name,
    reviewCount: product.reviews.length
  })).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 10);

  const recentReviews = reviews.map(review => ({
    id: review.id,
    title: review.title,
    content: review.content.substring(0, 150) + (review.content.length > 150 ? '...' : ''),
    productName: review.product.name,
    reviewerName: review.reviewer.name,
    createdAt: review.createdAt.toISOString()
  }));

  return {
    totalProducts: filteredProducts.length,
    averageRating: Math.round(averageRating * 100) / 100,
    totalReviews,
    averagePrice: Math.round(averagePrice),
    ratingDistribution,
    priceVsRating,
    dailySales,
    revenueByProduct,
    categoryPerformance,
    priceDistribution,
    reviewsPerProduct,
    recentReviews
  };
}

function parsePrice(priceString: string): number {
  const numericString = priceString.replace(/[^\d.]/g, '');
  return parseFloat(numericString) || 0;
}