import { google } from 'googleapis';

export class GoogleSheetsAPIKeyService {
  private sheets;
  private spreadsheetId: string;
  private sheetName: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
    
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is required for API key authentication');
    }

    this.sheets = google.sheets({ 
      version: 'v4', 
      auth: process.env.GOOGLE_API_KEY 
    });
  }

  async fetchSheetData() {
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
        return rowData;
      });
    } catch (error) {
      console.error('Error fetching sheet data with API key:', error);
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
}