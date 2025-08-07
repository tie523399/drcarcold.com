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
        crawlerInterval: status.settings?.crawlerInterval || 240, // 調整預設為4小時
        seoGeneratorEnabled: true,
        seoGeneratorInterval: status.settings?.seoGeneratorInterval || 720, // 調整預設為12小時
        seoGeneratorCount: 1, // 調整預設為1篇
        maxArticleCount: status.settings?.maxArticleCount || 15, // 調整預設為15篇
        cleanupInterval: status.settings?.cleanupInterval || 180, // 調整預設為3小時
        minViewCountToKeep: 0,
        autoScheduleEnabled: status.settings?.autoScheduleEnabled || false
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

      case 'reload':
        // 重新載入設定並重啟服務
        await autoServiceManager.updateConfig({})
        return NextResponse.json({
          success: true,
          message: '設定已重新載入並重啟服務'
        })

      case 'health':
        // 健康檢查
        const healthStatus = autoServiceManager.getDetailedStatus()
        return NextResponse.json({
          success: true,
          data: {
            healthy: healthStatus.isInitialized,
            services: healthStatus.services,
            timestamp: new Date().toISOString()
          }
        })

      case 'init':
        // 手動初始化應用（整合 startup API 功能）
        console.log('🚀 手動觸發應用初始化...')
        await autoServiceManager.start()
        return NextResponse.json({
          success: true,
          message: '應用初始化完成',
          data: { 
            status: 'running', 
            timestamp: new Date().toISOString(),
            services: autoServiceManager.getDetailedStatus()
          }
        })

      case 'test-full-workflow':
        // 一鍵測試：爬取+發布+AI改寫+SEO發布
        console.log('🎯 開始一鍵測試工作流程...')
        const workflowResult = await executeFullWorkflowTest()
        return NextResponse.json({
          success: true,
          message: '一鍵測試完成',
          data: workflowResult
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

async function executeFullWorkflowTest() {
  try {
    console.log('🎯 開始一鍵測試工作流程...')
    
    const results = {
      steps: [],
      summary: {
        success: true,
        totalSteps: 4,
        completedSteps: 0,
        errors: []
      }
    }

    // 步驟 1: 爬取新聞
    try {
      console.log('📰 步驟 1: 開始爬取新聞...')
      const crawlResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auto-crawler`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'crawl-now' })
      })
      
      const crawlResult = await crawlResponse.json()
      
      results.steps.push({
        step: 1,
        name: '爬取新聞',
        success: crawlResult.success,
        data: crawlResult.stats || {},
        message: crawlResult.message || '爬取完成'
      })
      
      if (crawlResult.success) {
        results.summary.completedSteps++
        console.log('✅ 步驟 1 完成: 爬取新聞成功')
      } else {
        throw new Error(crawlResult.error || '爬取失敗')
      }
    } catch (error) {
      console.error('❌ 步驟 1 失敗:', error)
      results.steps.push({
        step: 1,
        name: '爬取新聞',
        success: false,
        error: error.message
      })
      results.summary.errors.push(`步驟 1: ${error.message}`)
    }

    // 步驟 2 & 3: 生成 SEO 文章 (包含 AI 改寫和 SEO 優化)
    try {
      console.log('📝 步驟 2-3: 開始 AI 改寫和 SEO 優化...')
      const seoResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/seo-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 1 })
      })
      
      const seoResult = await seoResponse.json()
      
      results.steps.push({
        step: 2,
        name: 'AI 改寫',
        success: seoResult.success,
        data: seoResult.stats || {},
        message: 'AI 改寫完成'
      })
      
      results.steps.push({
        step: 3,
        name: 'SEO 優化',
        success: seoResult.success,
        data: seoResult.articles || [],
        message: 'SEO 優化完成'
      })
      
      if (seoResult.success) {
        results.summary.completedSteps += 2
        console.log('✅ 步驟 2-3 完成: AI 改寫和 SEO 優化成功')
      } else {
        throw new Error(seoResult.error || 'SEO 生成失敗')
      }
    } catch (error) {
      console.error('❌ 步驟 2-3 失敗:', error)
      results.steps.push({
        step: 2,
        name: 'AI 改寫',
        success: false,
        error: error.message
      })
      results.steps.push({
        step: 3,
        name: 'SEO 優化',
        success: false,
        error: error.message
      })
      results.summary.errors.push(`步驟 2-3: ${error.message}`)
    }

    // 步驟 4: 自動發布 (文章已經在 SEO 生成時發布)
    try {
      console.log('🚀 步驟 4: 確認自動發布...')
      
      // 檢查最近發布的文章
      const recentArticles = await prisma.news.findMany({
        where: {
          isPublished: true,
          createdAt: {
            gte: new Date(Date.now() - 10 * 60 * 1000) // 最近 10 分鐘
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
      
      results.steps.push({
        step: 4,
        name: '自動發布',
        success: true,
        data: {
          publishedArticles: recentArticles.length,
          titles: recentArticles.map(a => a.title)
        },
        message: `確認發布 ${recentArticles.length} 篇文章`
      })
      
      results.summary.completedSteps++
      console.log('✅ 步驟 4 完成: 自動發布確認')
      
    } catch (error) {
      console.error('❌ 步驟 4 失敗:', error)
      results.steps.push({
        step: 4,
        name: '自動發布',
        success: false,
        error: error.message
      })
      results.summary.errors.push(`步驟 4: ${error.message}`)
    }

    // 檢查整體成功狀態
    results.summary.success = results.summary.completedSteps === results.summary.totalSteps

    console.log(`🎯 一鍵測試完成! 成功 ${results.summary.completedSteps}/${results.summary.totalSteps} 步驟`)
    
    return results

  } catch (error) {
    console.error('❌ 一鍵測試失敗:', error)
    throw error
  }
} 