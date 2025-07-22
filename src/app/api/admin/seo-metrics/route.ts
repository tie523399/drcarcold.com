import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'
    
    // 計算日期範圍
    const daysMap: { [key: string]: number } = {
      '7days': 7,
      '30days': 30,
      '90days': 90
    }
    const days = daysMap[period] || 7
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // 獲取文章統計
    const [totalArticles, publishedArticles] = await Promise.all([
      prisma.news.count(),
      prisma.news.count({
        where: {
          isPublished: true,
          publishedAt: { gte: startDate }
        }
      })
    ])
    
    // 獲取最近的文章進行分析
    const recentArticles = await prisma.news.findMany({
      where: {
        publishedAt: { gte: startDate }
      },
      orderBy: { publishedAt: 'desc' },
      take: 20
    })
    
    // 計算平均閱讀時間
    const avgReadingTime = recentArticles.reduce((sum, article) => 
      sum + (article.readingTime || 0), 0
    ) / (recentArticles.length || 1)
    
    // 統計關鍵字
    const keywordMap = new Map<string, number>()
    let totalKeywords = 0
    let articlesWithStructuredData = 0
    let articlesWithOgTags = 0
    
    recentArticles.forEach(article => {
      // 統計關鍵字
      try {
        const tags = JSON.parse(article.tags || '[]')
        tags.forEach((tag: string) => {
          keywordMap.set(tag, (keywordMap.get(tag) || 0) + 1)
          totalKeywords++
        })
      } catch (e) {}
      
      // 檢查結構化資料
      if (article.structuredData) articlesWithStructuredData++
      if (article.ogTitle && article.ogDescription) articlesWithOgTags++
    })
    
    // 排序熱門關鍵字
    const topKeywords = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    const avgKeywordsPerArticle = totalKeywords / (recentArticles.length || 1)
    
    return NextResponse.json({
      totalArticles,
      publishedArticles,
      avgReadingTime,
      avgKeywordsPerArticle,
      articlesWithStructuredData,
      articlesWithOgTags,
      topKeywords,
      recentArticles: recentArticles.slice(0, 10)
    })
  } catch (error) {
    console.error('Error fetching SEO metrics:', error)
    return NextResponse.json(
      { error: '獲取 SEO 指標失敗' },
      { status: 500 }
    )
  }
}