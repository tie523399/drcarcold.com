import { NextRequest, NextResponse } from 'next/server'
import { autoServiceManager } from '@/lib/auto-service-manager'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status' // 預設為 status

    if (action === 'status') {
      const status = autoServiceManager.getStatus()
      
      // 獲取文章統計
      const articleStats = await prisma.news.groupBy({
        by: ['isPublished'],
        _count: {
          id: true
        }
      })

      const totalArticles = await prisma.news.count()
      const publishedArticles = articleStats.find(stat => stat.isPublished)?._count.id || 0
      const draftArticles = articleStats.find(stat => !stat.isPublished)?._count.id || 0

      // 確保配置結構完整
      const config = {
        crawlerEnabled: true,
        crawlerInterval: status.settings?.crawlerInterval || 60,
        seoGeneratorEnabled: true,
        seoGeneratorInterval: status.settings?.seoGeneratorInterval || 6,
        seoGeneratorCount: 2,
        maxArticleCount: status.settings?.maxArticleCount || 20,
        cleanupInterval: status.settings?.cleanupInterval || 1,
        minViewCountToKeep: 0
      }

      const response = NextResponse.json({
        success: true,
        data: {
          isRunning: status.isRunning,
          config: config,
          services: {
            crawler: {
              enabled: true,
              running: status.services?.crawler?.running || false,
              interval: status.services?.crawler?.interval || `${config.crawlerInterval} 分鐘`
            },
            seoGenerator: {
              enabled: true,
              running: status.services?.seoGenerator?.running || false,
              interval: status.services?.seoGenerator?.interval || `${config.seoGeneratorInterval} 小時`
            },
            cleanup: {
              enabled: true,
              running: status.services?.cleanup?.running || false,
              interval: status.services?.cleanup?.interval || `${config.cleanupInterval} 小時`,
              maxArticles: config.maxArticleCount
            }
          },
          statistics: {
            totalArticles,
            publishedArticles,
            draftArticles,
            maxArticleCount: config.maxArticleCount,
            articlesNeedCleanup: Math.max(0, publishedArticles - config.maxArticleCount)
          }
        }
      })
      
      // 設置緩存頭 - 服務狀態變化頻繁，緩存30秒
      response.headers.set('Cache-Control', 'public, max-age=30, s-maxage=30')
      response.headers.set('X-Content-Type-Options', 'nosniff')
      
      return response
    }

    return NextResponse.json({
      success: false,
      error: '無效的操作'
    }, { status: 400 })

  } catch (error) {
    console.error('自動化服務 API 錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '內部服務器錯誤'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'start':
        await autoServiceManager.start()
        return NextResponse.json({
          success: true,
          message: '自動化服務已啟動'
        })

      case 'stop':
        await autoServiceManager.stop()
        return NextResponse.json({
          success: true,
          message: '自動化服務已停止'
        })

      case 'restart':
        await autoServiceManager.stop()
        await autoServiceManager.start()
        return NextResponse.json({
          success: true,
          message: '自動化服務已重新啟動'
        })

      case 'update-config':
        if (!config) {
          return NextResponse.json({
            success: false,
            error: '缺少配置參數'
          }, { status: 400 })
        }

        await autoServiceManager.updateConfig(config)
        return NextResponse.json({
          success: true,
          message: '配置已更新'
        })

      case 'cleanup-now':
        // 立即執行清理
        const cleanupResult = await executeImmediateCleanup()
        return NextResponse.json({
          success: true,
          message: '清理完成',
          data: cleanupResult
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('自動化服務 API 錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '內部服務器錯誤'
    }, { status: 500 })
  }
}

async function executeImmediateCleanup() {
  try {
    const maxArticleCount = 20 // 可以從配置中獲取
    
    const totalCount = await prisma.news.count({
      where: { isPublished: true }
    })

    if (totalCount <= maxArticleCount) {
      return {
        totalArticles: totalCount,
        deletedArticles: 0,
        message: '文章數量在允許範圍內，無需清理'
      }
    }

    const excessCount = totalCount - maxArticleCount
    
    // 按照瀏覽量從低到高排序，優先刪除無流量文章
    const articlesToDelete = await prisma.news.findMany({
      where: { isPublished: true },
      orderBy: [
        { viewCount: 'asc' },
        { createdAt: 'asc' }
      ],
      take: excessCount,
      select: {
        id: true,
        title: true,
        viewCount: true,
        createdAt: true
      }
    })

    const deletedTitles = []
    
    for (const article of articlesToDelete) {
      await prisma.news.delete({
        where: { id: article.id }
      })
      
      deletedTitles.push({
        title: article.title,
        viewCount: article.viewCount,
        createdAt: article.createdAt
      })
    }

    return {
      totalArticles: totalCount,
      deletedArticles: deletedTitles.length,
      deletedTitles,
      message: `成功刪除 ${deletedTitles.length} 篇文章`
    }
  } catch (error) {
    console.error('立即清理失敗:', error)
    throw error
  }
} 