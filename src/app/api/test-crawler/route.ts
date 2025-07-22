import { NextRequest, NextResponse } from 'next/server'
import { simpleScrapeArticle } from '@/lib/simple-scraper'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: '請提供要爬取的 URL' },
        { status: 400 }
      )
    }

    console.log('開始爬取:', url)
    
    // 測試簡化版爬蟲
    const result = await simpleScrapeArticle(url)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('爬蟲錯誤:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}