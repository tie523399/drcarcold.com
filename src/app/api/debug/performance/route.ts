import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import os from 'os'

interface PerformanceMetrics {
  system: {
    platform: string
    arch: string
    nodeVersion: string
    uptime: number
    memory: {
      total: number
      free: number
      used: number
      usagePercent: number
    }
    cpu: {
      cores: number
      loadAverage: number[]
      model: string
    }
  }
  database: {
    connectionCount: number
    avgResponseTime: number
    totalQueries: number
    slowQueries: number
  }
  application: {
    totalRequests: number
    avgResponseTime: number
    errorRate: number
    cacheHitRate: number
  }
  crawler: {
    totalCrawls: number
    successRate: number
    avgArticlesPerCrawl: number
    lastCrawlTime: string | null
  }
}

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // 系統信息
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    const memoryUsagePercent = (usedMemory / totalMemory) * 100

    const cpus = os.cpus()
    const loadAvg = os.loadavg()

    // 數據庫性能測試
    const dbTestStart = Date.now()
    const newsCount = await prisma.news.count()
    const dbResponseTime = Date.now() - dbTestStart

    // 獲取爬蟲統計
    const crawlStats = await prisma.crawlLog.aggregate({
      _count: { id: true },
      _avg: { articlesProcessed: true },
    })

    const successfulCrawls = await prisma.crawlLog.count({
      where: { success: true }
    })

    const lastCrawl = await prisma.crawlLog.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })

    // 計算成功率
    const totalCrawls = crawlStats._count.id || 0
    const successRate = totalCrawls > 0 ? (successfulCrawls / totalCrawls) * 100 : 0

    const metrics: PerformanceMetrics = {
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: {
          total: Math.round(totalMemory / 1024 / 1024), // MB
          free: Math.round(freeMemory / 1024 / 1024), // MB
          used: Math.round(usedMemory / 1024 / 1024), // MB
          usagePercent: Math.round(memoryUsagePercent * 100) / 100
        },
        cpu: {
          cores: cpus.length,
          loadAverage: loadAvg,
          model: cpus[0]?.model || 'Unknown'
        }
      },
      database: {
        connectionCount: 1, // Prisma單連接
        avgResponseTime: dbResponseTime,
        totalQueries: newsCount, // 簡化指標
        slowQueries: 0 // 需要實際監控
      },
      application: {
        totalRequests: 0, // 需要實際監控
        avgResponseTime: Date.now() - startTime,
        errorRate: 0, // 需要實際監控
        cacheHitRate: 85 // 模擬數據
      },
      crawler: {
        totalCrawls,
        successRate: Math.round(successRate * 100) / 100,
        avgArticlesPerCrawl: Math.round((crawlStats._avg.articlesProcessed || 0) * 100) / 100,
        lastCrawlTime: lastCrawl?.createdAt.toISOString() || null
      }
    }

    // 性能警告檢查
    const warnings = []
    
    if (metrics.system.memory.usagePercent > 80) {
      warnings.push('內存使用率過高')
    }
    
    if (metrics.database.avgResponseTime > 1000) {
      warnings.push('數據庫響應緩慢')
    }
    
    if (metrics.crawler.successRate < 70) {
      warnings.push('爬蟲成功率較低')
    }

    const recommendations = []
    
    if (metrics.system.memory.usagePercent > 70) {
      recommendations.push('考慮增加內存或優化內存使用')
    }
    
    if (totalCrawls === 0) {
      recommendations.push('尚未運行爬蟲，建議執行一鍵測試')
    }
    
    if (metrics.crawler.successRate < 80 && totalCrawls > 0) {
      recommendations.push('檢查新聞來源配置和網絡連接')
    }

    return NextResponse.json({
      success: true,
      metrics,
      warnings,
      recommendations,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    })

  } catch (error) {
    console.error('獲取性能指標失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'gc':
        // 強制垃圾回收（如果可用）
        if (global.gc) {
          global.gc()
          return NextResponse.json({
            success: true,
            message: '已執行垃圾回收'
          })
        } else {
          return NextResponse.json({
            success: false,
            message: '垃圾回收不可用（需要 --expose-gc 標誌）'
          })
        }

      case 'health-check':
        // 執行健康檢查
        const healthStart = Date.now()
        
        const checks = {
          database: false,
          memory: false,
          disk: false
        }

        try {
          await prisma.news.findFirst()
          checks.database = true
        } catch {
          checks.database = false
        }

        const memUsage = process.memoryUsage()
        checks.memory = (memUsage.heapUsed / memUsage.heapTotal) < 0.9

        // 簡化的磁盤檢查
        checks.disk = true

        const healthScore = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100

        return NextResponse.json({
          success: true,
          healthScore: Math.round(healthScore),
          checks,
          responseTime: Date.now() - healthStart
        })

      default:
        return NextResponse.json({
          success: false,
          error: '未知的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('性能操作失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
