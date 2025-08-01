import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { newsSchema } from '@/lib/validations'

// GET /api/news
export async function GET(request: NextRequest) {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(news)
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