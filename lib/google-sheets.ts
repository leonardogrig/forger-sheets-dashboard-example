import { google } from 'googleapis';

interface SheetRow {
  product_id: string;
  date_sold: string;
  product_name: string;
  category: string;
  actual_price: string;
  rating: string;
  about_product: string;
  user_id: string;
  user_name: string;
  review_id: string;
  review_title: string;
  review_content: string;
  product_link: string;
}

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;
  private sheetName: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
    
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    this.sheets = this.initializeSheets();
  }

  private initializeSheets() {
    let auth;

    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64) {
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString()
      );
      auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } else if (process.env.GOOGLE_API_KEY) {
      // Simple API key authentication for read-only access
      auth = process.env.GOOGLE_API_KEY;
    } else {
      throw new Error(`
Google Sheets authentication not configured properly.

Available options:
1. Service Account (Recommended): Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_KEY_BASE64
2. API Key (Simple): Set GOOGLE_API_KEY
3. OAuth2 (Complex): Requires proper token management implementation

Current configuration:
- GOOGLE_CLIENT_ID: ${!!process.env.GOOGLE_CLIENT_ID}
- GOOGLE_CLIENT_SECRET: ${!!process.env.GOOGLE_CLIENT_SECRET}
- GOOGLE_SERVICE_ACCOUNT_KEY_PATH: ${!!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH}
- GOOGLE_API_KEY: ${!!process.env.GOOGLE_API_KEY}

Please follow the setup guide in GOOGLE_SHEETS_SETUP.md
      `);
    }

    return google.sheets({ version: 'v4', auth });
  }

  async fetchSheetData(): Promise<SheetRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: this.sheetName,
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        throw new Error('No data found in the spreadsheet');
      }

      const headers = rows[0] as string[];
      const dataRows = rows.slice(1);

      return dataRows.map((row: string[]) => {
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = row[index] || '';
        });
        return rowData as SheetRow;
      });
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      
      // If authentication fails, provide helpful error message
      if (error instanceof Error && error.message.includes('authentication')) {
        throw new Error('Google Sheets authentication failed. Please set up a Service Account or proper OAuth2 tokens.');
      }
      
      throw new Error(`Failed to fetch sheet data: ${error}`);
    }
  }

  async getSheetInfo() {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      return {
        title: response.data.properties?.title,
        sheetCount: response.data.sheets?.length || 0,
        sheets: response.data.sheets?.map(sheet => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount,
        })) || [],
      };
    } catch (error) {
      console.error('Error getting sheet info:', error);
      throw new Error(`Failed to get sheet info: ${error}`);
    }
  }

  parsePrice(priceString: string): number {
    const numericString = priceString.replace(/[^\d.]/g, '');
    return parseFloat(numericString) || 0;
  }

  parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(2000 + year, month - 1, day);
  }

  parseRating(ratingString: string): number {
    return parseFloat(ratingString) || 0;
  }

  parseUserIds(userIdString: string): string[] {
    return userIdString.split(',').map(id => id.trim()).filter(id => id.length > 0);
  }

  parseUserNames(userNameString: string): string[] {
    return userNameString.split(',').map(name => name.trim()).filter(name => name.length > 0);
  }

  parseReviewIds(reviewIdString: string): string[] {
    return reviewIdString.split(',').map(id => id.trim()).filter(id => id.length > 0);
  }

  parseReviewTitles(reviewTitleString: string): string[] {
    return reviewTitleString.split(',').map(title => title.trim()).filter(title => title.length > 0);
  }

  parseReviewContents(reviewContentString: string): string[] {
    return reviewContentString.split(',').map(content => content.trim()).filter(content => content.length > 0);
  }
}

export const googleSheetsService = new GoogleSheetsService();