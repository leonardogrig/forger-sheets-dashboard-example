import { NextRequest, NextResponse } from 'next/server';
import { dataSyncService } from '@/lib/data-sync';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'your-cron-secret-here';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Automatic sync triggered by cron job');
    
    const result = await dataSyncService.syncData();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Cron sync completed: ${result.rowsUpdated} rows updated`,
        rowsUpdated: result.rowsUpdated,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cron sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Cron sync endpoint is active',
    timestamp: new Date().toISOString(),
  });
}