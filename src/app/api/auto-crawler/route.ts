import { NextRequest, NextResponse } from 'next/server'
import { getAutoCrawler, startAutoCrawl, stopAutoCrawl, getCrawlStats } from '@/lib/auto-news-crawler'

// GET /api/auto-crawler - 獲取爬蟲狀態
export async function GET(request: NextRequest) {
  try {
    const stats = await getCrawlStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('獲取爬蟲狀態失敗:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '獲取狀態失敗' 
      },
      { status: 500 }
    )
  }
}

// POST /api/auto-crawler - 控制爬蟲
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (!action) {
      return NextResponse.json(
        { error: '請提供操作類型 (start/stop)' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'start':
        await startAutoCrawl()
        result = {
          success: true,
          message: '自動爬取已啟動',
          action: 'start'
        }
        break

      case 'stop':
        stopAutoCrawl()
        result = {
          success: true,
          message: '自動爬取已停止',
          action: 'stop'
        }
        break

      case 'crawl-now':
        // 立即執行一次爬取
        const crawler = getAutoCrawler()
        const crawlResults = await crawler.performCrawl()
        
        // 計算爬取統計
        const totalArticles = crawlResults.reduce((sum, r) => sum + r.articlesProcessed, 0)
        const totalPublished = crawlResults.reduce((sum, r) => sum + r.articlesPublished, 0)
        const successCount = crawlResults.filter(r => r.success).length
        
        result = {
          success: true,
          message: '立即爬取完成',
          action: 'crawl-now',
          stats: {
            sources: crawlResults.length,
            successfulSources: successCount,
            articlesProcessed: totalArticles,
            articlesPublished: totalPublished
          }
        }
        break

      default:
        return NextResponse.json(
          { error: '無效的操作類型' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('控制爬蟲失敗:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '操作失敗' 
      },
      { status: 500 }
    )
  }
} 