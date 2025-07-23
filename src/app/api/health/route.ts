import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 簡單的健康檢查
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'DrCarCold',
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Service unavailable' },
      { status: 500 }
    );
  }
} 