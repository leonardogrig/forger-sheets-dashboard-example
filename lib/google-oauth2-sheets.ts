import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export class GoogleOAuth2SheetsService {
  private oauth2Client;
  private spreadsheetId: string;
  private sheetName: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!;
    this.sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
    
    if (!this.spreadsheetId) {
      throw new Error('GOOGLE_SHEET_ID environment variable is required');
    }

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL + '/api/auth/callback/google'
    );
  }

  async getAccessToken(): Promise<string> {
    // Get the current user's session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      throw new Error('User not authenticated');
    }

    // In a real implementation, you'd store and retrieve the user's access token
    // For now, this is a placeholder that shows the structure needed
    
    // You would need to:
    // 1. Store access tokens when users first authenticate
    // 2. Handle token refresh
    // 3. Associate tokens with specific users
    
    throw new Error('OAuth2 access token management not yet implemented. Please use Service Account instead.');
  }

  async fetchSheetData() {
    try {
      // Set the access token
      const accessToken = await this.getAccessToken();
      this.oauth2Client.setCredentials({
        access_token: accessToken
      });

      const sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
      
      const response = await sheets.spreadsheets.values.get({
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
      console.error('Error fetching sheet data with OAuth2:', error);
      throw new Error(`Failed to fetch sheet data: ${error}`);
    }
  }
}