import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/news/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.news.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: '文章已刪除' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json(
      { error: '刪除文章失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/news/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // 處理 JSON 格式的欄位
    if (body.tags && typeof body.tags !== 'string') {
      body.tags = JSON.stringify(body.tags)
    }
    
    // 更新發布時間
    if (body.isPublished && !body.publishedAt) {
      body.publishedAt = new Date()
    } else if (!body.isPublished) {
      body.publishedAt = null
    }
    
    const news = await prisma.news.update({
      where: { id: params.id },
      data: body,
    })
    
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error updating news:', error)
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    )
  }
}

// GET /api/news/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
    })
    
    if (!news) {
      return NextResponse.json(
        { error: '找不到文章' },
        { status: 404 }
      )
    }
    
    // 增加瀏覽次數
    await prisma.news.update({
      where: { id: params.id },
      data: { viewCount: news.viewCount + 1 },
    })
    
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: '獲取文章失敗' },
      { status: 500 }
    )
  }
} 