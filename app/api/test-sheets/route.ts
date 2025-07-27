import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const config = {
      googleClientId: !!process.env.GOOGLE_CLIENT_ID,
      googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      googleSheetId: !!process.env.GOOGLE_SHEET_ID,
      googleSheetName: process.env.GOOGLE_SHEET_NAME || 'Sheet1',
      serviceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64,
      redisUrl: !!process.env.REDIS_URL,
    };

    return NextResponse.json({
      message: 'Configuration check',
      config,
      recommendations: {
        forGoogleSheets: 'For best results, set up a Service Account in Google Cloud Console and download the JSON key file',
        steps: [
          '1. Go to Google Cloud Console',
          '2. Enable Google Sheets API',
          '3. Create a Service Account',
          '4. Download the JSON key file',
          '5. Set GOOGLE_SERVICE_ACCOUNT_KEY_PATH or GOOGLE_SERVICE_ACCOUNT_KEY_BASE64',
          '6. Share your Google Sheet with the service account email'
        ]
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}