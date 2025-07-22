import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/articles/stats - 獲取文章統計
export async function GET(request: NextRequest) {
  try {
    // 獲取一週前的日期
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // 並行查詢所有統計數據
    const [
      totalCount,
      publishedCount,
      draftCount,
      thisWeekCount
    ] = await Promise.all([
      // 總文章數
      prisma.news.count(),
      
      // 已發布文章數
      prisma.news.count({
        where: { isPublished: true }
      }),
      
      // 草稿文章數
      prisma.news.count({
        where: { isPublished: false }
      }),
      
      // 本週新增文章數
      prisma.news.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      })
    ])

    const stats = {
      total: totalCount,
      published: publishedCount,
      drafts: draftCount,
      thisWeek: thisWeekCount
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('獲取文章統計失敗:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '獲取統計失敗' 
      },
      { status: 500 }
    )
  }
} 