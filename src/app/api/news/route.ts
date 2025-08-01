import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'

// GET /api/news
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const published = searchParams.get('published')
    
    // 構建查詢條件
    const where: any = {}
    if (published === 'true') {
      where.isPublished = true
      where.publishedAt = {
        lte: new Date()
      }
    }
    
    // 構建查詢選項
    const queryOptions: any = {
      where,
      orderBy: { publishedAt: 'desc' },
    }
    
    // 添加限制條件
    if (limit) {
      const limitNum = parseInt(limit, 10)
      if (!isNaN(limitNum) && limitNum > 0) {
        queryOptions.take = limitNum
      }
    }
    
    const news = await prisma.news.findMany(queryOptions)
    
    const response = NextResponse.json(news)
    
    // 設置緩存頭 - 新聞內容經常更新，緩存1分鐘
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    
    return response
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: '獲取新聞失敗' },
      { status: 500 }
    )
  }
}

// POST /api/news
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = newsSchema.parse(body)
    
    // 生成 slug - 如果沒有提供slug或為空，則根據title生成
    const slug = validatedData.slug && validatedData.slug.trim() !== '' 
      ? validatedData.slug 
      : validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
          .replace(/^-+|-+$/g, '')
    
    const news = await prisma.news.create({
      data: {
        ...validatedData,
        slug,
        tags: JSON.stringify(validatedData.tags),
        publishedAt: validatedData.isPublished ? new Date() : null,
      },
    })
    
    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('Error creating news:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '創建新聞失敗' },
      { status: 500 }
    )
  }
} 