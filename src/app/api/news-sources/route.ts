import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/news-sources - 獲取所有新聞來源
export async function GET() {
  try {
    const sources = await prisma.newsSource.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sources)
  } catch (error) {
    console.error('獲取新聞來源失敗:', error)
    return NextResponse.json(
      { error: '獲取新聞來源失敗' },
      { status: 500 }
    )
  }
}

// POST /api/news-sources - 創建新的新聞來源
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證必要欄位
    if (!body.name || !body.url) {
      return NextResponse.json(
        { error: '請提供必要欄位：name, url' },
        { status: 400 }
      )
    }

    // 創建新的新聞來源
    const newSource = await prisma.newsSource.create({
      data: {
        name: body.name,
        url: body.url,
        rssUrl: body.rssUrl || null,
        enabled: body.enabled !== false,
        maxArticlesPerCrawl: body.maxArticlesPerCrawl || 5,
        crawlInterval: body.crawlInterval || 60,
        selectors: body.selectors ? JSON.stringify(body.selectors) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: newSource
    }, { status: 201 })
  } catch (error) {
    console.error('創建新聞來源失敗:', error)
    return NextResponse.json(
      { error: '創建新聞來源失敗' },
      { status: 500 }
    )
  }
}

 