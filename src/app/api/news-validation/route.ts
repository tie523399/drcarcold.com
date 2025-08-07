// 新聞文章驗證API - 檢查前端顯示的文章是否真的存在於數據庫
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ValidationResult {
  articleId: string
  slug: string
  exists: boolean
  accessible: boolean
  issues: string[]
}

export async function POST(request: NextRequest) {
  try {
    const { articles } = await request.json()
    
    if (!Array.isArray(articles)) {
      return NextResponse.json(
        { error: '請提供文章列表' },
        { status: 400 }
      )
    }

    console.log(`🔍 驗證 ${articles.length} 篇文章的數據庫存在性...`)
    
    const results: ValidationResult[] = []
    
    for (const article of articles) {
      const result: ValidationResult = {
        articleId: article.id || 'unknown',
        slug: article.slug || 'unknown',
        exists: false,
        accessible: false,
        issues: []
      }
      
      try {
        // 通過ID查找
        let dbArticle = null
        if (article.id) {
          dbArticle = await prisma.news.findUnique({
            where: { id: article.id }
          })
        }
        
        // 如果通過ID找不到，嘗試通過slug查找
        if (!dbArticle && article.slug) {
          dbArticle = await prisma.news.findUnique({
            where: { slug: article.slug }
          })
        }
        
        if (dbArticle) {
          result.exists = true
          
          // 檢查文章是否可訪問
          if (dbArticle.isPublished || dbArticle.status === 'published') {
            result.accessible = true
          } else {
            result.accessible = false
            result.issues.push('文章未發布')
          }
          
          // 檢查內容完整性
          if (!dbArticle.title || dbArticle.title.length < 5) {
            result.issues.push('標題無效或過短')
          }
          
          if (!dbArticle.content || dbArticle.content.length < 100) {
            result.issues.push('內容無效或過短')
          }
          
          if (!dbArticle.slug || dbArticle.slug.length < 3) {
            result.issues.push('Slug無效')
          }
          
        } else {
          result.exists = false
          result.issues.push('文章在數據庫中不存在')
        }
        
      } catch (error) {
        result.issues.push(`查詢失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
      }
      
      results.push(result)
    }
    
    const existsCount = results.filter(r => r.exists).length
    const accessibleCount = results.filter(r => r.accessible).length
    const problematicCount = results.filter(r => r.issues.length > 0).length
    
    console.log(`✅ 驗證完成: ${existsCount}/${articles.length} 存在, ${accessibleCount}/${articles.length} 可訪問, ${problematicCount} 有問題`)
    
    return NextResponse.json({
      success: true,
      total: articles.length,
      exists: existsCount,
      accessible: accessibleCount,
      problematic: problematicCount,
      results
    })
    
  } catch (error: any) {
    console.error('文章驗證失敗:', error)
    return NextResponse.json(
      { error: '文章驗證失敗', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 檢查所有發布文章的完整性...')
    
    // 獲取所有已發布的文章
    const publishedArticles = await prisma.news.findMany({
      where: {
        OR: [
          { isPublished: true },
          { status: 'published' }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    const results: ValidationResult[] = []
    
    for (const article of publishedArticles) {
      const result: ValidationResult = {
        articleId: article.id,
        slug: article.slug,
        exists: true,
        accessible: true,
        issues: []
      }
      
      // 檢查內容完整性
      if (!article.title || article.title.length < 5) {
        result.accessible = false
        result.issues.push('標題無效或過短')
      }
      
      if (!article.content || article.content.length < 100) {
        result.accessible = false
        result.issues.push('內容無效或過短')
      }
      
      if (!article.slug || article.slug.length < 3) {
        result.accessible = false
        result.issues.push('Slug無效')
      }
      
      // 檢查發布狀態一致性
      if (article.isPublished && !article.publishedAt) {
        result.issues.push('發布狀態不一致（已發布但無發布時間）')
      }
      
      results.push(result)
    }
    
    const accessibleCount = results.filter(r => r.accessible).length
    const problematicCount = results.filter(r => r.issues.length > 0).length
    
    console.log(`✅ 發布文章檢查完成: ${accessibleCount}/${publishedArticles.length} 可正常訪問, ${problematicCount} 有問題`)
    
    return NextResponse.json({
      success: true,
      total: publishedArticles.length,
      accessible: accessibleCount,
      problematic: problematicCount,
      results: results.filter(r => r.issues.length > 0) // 只返回有問題的文章
    })
    
  } catch (error: any) {
    console.error('文章完整性檢查失敗:', error)
    return NextResponse.json(
      { error: '文章完整性檢查失敗', details: error.message },
      { status: 500 }
    )
  }
}
