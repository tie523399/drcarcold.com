import { NextRequest, NextResponse } from 'next/server'

// 完全獨立的測試端點
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test vehicle upload API working',
    timestamp: new Date().toISOString()
  })
}

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'POST test - no file provided'
  }, { status: 400 })
}