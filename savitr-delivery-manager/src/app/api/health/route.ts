import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/mongodb';

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    
    if (health.status === 'unhealthy') {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database health check failed',
          details: health
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'success',
      message: 'Database is healthy',
      details: health
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error.message
      },
      { status: 500 }
    );
  }
} 