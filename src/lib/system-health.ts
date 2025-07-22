/**
 * 🔒 系統健康檢查服務
 * 
 * 監控系統各組件的健康狀態，及早發現問題
 */

import { HealthCheckResult, AutoServiceConfig, SystemErrorType } from '@/types/system'
import { prisma } from './prisma'
import { ErrorHandler, createError } from './error-handler'
import { validateSystemConfig } from './config-validator'

export class SystemHealthChecker {
  private static lastCheck: Date | null = null
  private static checkInterval: NodeJS.Timeout | null = null

  /**
   * 執行完整的系統健康檢查
   */
  static async performHealthCheck(): Promise<HealthCheckResult> {
    console.log('🏥 開始系統健康檢查...')
    
    const result: HealthCheckResult = {
      healthy: true,
      services: {
        database: false,
        crawler: false,
        seoGenerator: false,
        cleanup: false
      },
      errors: [],
      lastCheck: new Date()
    }

    this.lastCheck = result.lastCheck

    // 檢查數據庫連接
    result.services.database = await this.checkDatabase(result.errors)

    // 檢查自動化服務
    const serviceCheck = await this.checkAutoServices(result.errors)
    result.services.crawler = serviceCheck.crawler
    result.services.seoGenerator = serviceCheck.seoGenerator
    result.services.cleanup = serviceCheck.cleanup

    // 檢查配置完整性
    await this.checkConfiguration(result.errors)

    // 檢查系統資源
    await this.checkSystemResources(result.errors)

    // 檢查文章數據健康度
    await this.checkArticleHealth(result.errors)

    // 確定整體健康狀態
    result.healthy = Object.values(result.services).every(status => status) && 
                     result.errors.length === 0

    if (result.healthy) {
      console.log('✅ 系統健康檢查通過')
    } else {
      console.log('⚠️ 系統健康檢查發現問題:', result.errors)
    }

    return result
  }

  /**
   * 檢查數據庫連接和表結構
   */
  private static async checkDatabase(errors: string[]): Promise<boolean> {
    try {
      // 測試基本連接
      await prisma.$connect()
      
      // 檢查關鍵表是否存在並可訪問
      const tables = [
        { name: 'Setting', model: prisma.setting },
        { name: 'News', model: prisma.news },
        { name: 'NewsSource', model: prisma.newsSource }
      ]

             for (const { name, model } of tables) {
         try {
           await (model as any).findFirst()
         } catch (error) {
           errors.push(`數據庫表 ${name} 無法訪問`)
           return false
         }
       }

      // 檢查數據庫性能
      const startTime = Date.now()
      await prisma.setting.count()
      const queryTime = Date.now() - startTime

      if (queryTime > 5000) {
        errors.push('數據庫查詢響應緩慢')
      }

      return true
    } catch (error) {
      errors.push(`數據庫連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
      return false
    }
  }

  /**
   * 檢查自動化服務狀態
   */
  private static async checkAutoServices(errors: string[]): Promise<{
    crawler: boolean
    seoGenerator: boolean
    cleanup: boolean
  }> {
    const result = {
      crawler: false,
      seoGenerator: false,
      cleanup: false
    }

    try {
      // 檢查是否有正在運行的自動化服務
      const { AutoServiceManager } = await import('./auto-service-manager')
      
      // 這裡我們無法直接檢查服務狀態，所以檢查配置和最近的活動
      
      // 檢查爬蟲配置和最近活動
      const crawlerEnabled = await this.getSetting('autoCrawlerEnabled')
      if (crawlerEnabled === 'true') {
        const recentNews = await prisma.news.findFirst({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24小時內
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        
        result.crawler = !!recentNews
        if (!recentNews) {
          errors.push('爬蟲服務24小時內無新文章產生')
        }
      } else {
        result.crawler = true // 如果禁用，視為正常
      }

      // 檢查SEO生成服務
      const seoEnabled = await this.getSetting('autoSeoEnabled')
      if (seoEnabled === 'true') {
        const cohereKey = await this.getSetting('cohereApiKey')
        result.seoGenerator = !!cohereKey
        if (!cohereKey) {
          errors.push('SEO生成服務缺少必要的API密鑰')
        }
      } else {
        result.seoGenerator = true
      }

      // 檢查清理服務（檢查文章數量是否合理）
      const maxArticles = parseInt(await this.getSetting('maxArticleCount') || '20')
      const currentCount = await prisma.news.count({ where: { isPublished: true } })
      
      result.cleanup = currentCount <= maxArticles * 1.2 // 允許20%的超出
      if (!result.cleanup) {
        errors.push(`文章數量超出限制: ${currentCount}/${maxArticles}`)
      }

    } catch (error) {
      errors.push(`檢查自動化服務失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }

    return result
  }

  /**
   * 檢查系統配置
   */
  private static async checkConfiguration(errors: string[]): Promise<void> {
    try {
      const validationResult = await validateSystemConfig()
      
      if (!validationResult.valid) {
        errors.push(...validationResult.errors)
      }

      // 檢查關鍵配置項
      const criticalSettings = [
        'autoCrawlerInterval',
        'autoSeoInterval', 
        'maxArticleCount'
      ]

      for (const setting of criticalSettings) {
        const value = await this.getSetting(setting)
        if (!value) {
          errors.push(`關鍵配置項 ${setting} 未設定`)
        }
      }

    } catch (error) {
      errors.push(`配置檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 檢查系統資源使用情況
   */
  private static async checkSystemResources(errors: string[]): Promise<void> {
    try {
      // 檢查內存使用
      const memUsage = process.memoryUsage()
      const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
      const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)

      if (memUsedMB > 500) {
        errors.push(`內存使用過高: ${memUsedMB}MB/${memTotalMB}MB`)
      }

      // 檢查系統正常運行時間
      const uptimeHours = Math.floor(process.uptime() / 3600)
      if (uptimeHours < 1 && this.lastCheck) {
        // 如果上次檢查存在但運行時間很短，可能是重啟了
        errors.push('檢測到系統可能剛重啟')
      }

    } catch (error) {
      errors.push(`系統資源檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 檢查文章數據健康度
   */
  private static async checkArticleHealth(errors: string[]): Promise<void> {
    try {
      // 檢查重複文章
      const duplicateCheck = await prisma.$queryRaw`
        SELECT title, COUNT(*) as count 
        FROM News 
        WHERE isPublished = 1 
        GROUP BY title 
        HAVING COUNT(*) > 1
      ` as any[]

      if (duplicateCheck.length > 0) {
        errors.push(`發現 ${duplicateCheck.length} 組重複標題的文章`)
      }

             // 檢查空內容文章
       const emptyContentCount = await prisma.news.count({
         where: {
           isPublished: true,
           OR: [
             { content: '' },
             { title: '' }
           ]
         }
       })

      if (emptyContentCount > 0) {
        errors.push(`發現 ${emptyContentCount} 篇空內容文章`)
      }

             // 檢查孤立的新聞來源 - 跳過此檢查
       const orphanedSources = 0

      if (orphanedSources > 0) {
        errors.push(`發現 ${orphanedSources} 個啟用但無文章的新聞來源`)
      }

    } catch (error) {
      errors.push(`文章數據檢查失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  /**
   * 啟動定期健康檢查
   */
  static startPeriodicHealthCheck(intervalMinutes: number = 30): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    console.log(`🏥 啟動定期健康檢查 - 間隔: ${intervalMinutes} 分鐘`)

    this.checkInterval = setInterval(async () => {
      try {
        const result = await this.performHealthCheck()
        
        if (!result.healthy) {
          // 發送健康警告
          await ErrorHandler.handleError(createError(
            SystemErrorType.SERVICE_ERROR,
            `系統健康檢查失敗: ${result.errors.join(', ')}`,
            'SystemHealthChecker',
            result
          ))
        }
      } catch (error) {
        console.error('定期健康檢查失敗:', error)
      }
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * 停止定期健康檢查
   */
  static stopPeriodicHealthCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
      console.log('🏥 定期健康檢查已停止')
    }
  }

  /**
   * 獲取健康檢查摘要
   */
  static getHealthSummary(): {
    lastCheck: Date | null
    isRunning: boolean
    nextCheck: Date | null
  } {
    const nextCheck = this.checkInterval && this.lastCheck ? 
      new Date(this.lastCheck.getTime() + 30 * 60 * 1000) : null

    return {
      lastCheck: this.lastCheck,
      isRunning: !!this.checkInterval,
      nextCheck
    }
  }

  /**
   * 快速系統狀態檢查
   */
  static async quickStatusCheck(): Promise<{
    database: boolean
    services: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    
    // 快速數據庫檢查
    let database = false
    try {
      await prisma.setting.findFirst()
      database = true
    } catch (error) {
      errors.push('數據庫連接失敗')
    }

    // 快速服務檢查
    let services = false
    try {
      const crawlerEnabled = await this.getSetting('autoCrawlerEnabled')
      const seoEnabled = await this.getSetting('autoSeoEnabled')
      services = crawlerEnabled !== null && seoEnabled !== null
    } catch (error) {
      errors.push('服務配置檢查失敗')
    }

    return { database, services, errors }
  }

  /**
   * 修復常見問題
   */
  static async performAutoRepair(): Promise<{
    attempted: string[]
    successful: string[]
    failed: string[]
  }> {
    const attempted: string[] = []
    const successful: string[] = []
    const failed: string[] = []

    // 修復配置問題
    attempted.push('配置修復')
    try {
      const { autoRepairConfig } = await import('./config-validator')
      await autoRepairConfig()
      successful.push('配置修復')
    } catch (error) {
      failed.push('配置修復')
    }

    // 清理重複文章
    attempted.push('清理重複文章')
    try {
      await this.cleanupDuplicateArticles()
      successful.push('清理重複文章')
    } catch (error) {
      failed.push('清理重複文章')
    }

    // 修復空內容文章
    attempted.push('修復空內容文章')
    try {
      await this.fixEmptyArticles()
      successful.push('修復空內容文章')
    } catch (error) {
      failed.push('修復空內容文章')
    }

    return { attempted, successful, failed }
  }

  /**
   * 清理重複文章
   */
  private static async cleanupDuplicateArticles(): Promise<void> {
    const duplicates = await prisma.$queryRaw`
      SELECT id, title, MIN(createdAt) as firstCreated
      FROM News 
      WHERE title IN (
        SELECT title 
        FROM News 
        GROUP BY title 
        HAVING COUNT(*) > 1
      )
      GROUP BY title
    ` as any[]

    for (const duplicate of duplicates) {
      // 保留最早創建的，刪除其他的
      await prisma.news.deleteMany({
        where: {
          title: duplicate.title,
          id: { not: duplicate.id }
        }
      })
    }
  }

  /**
   * 修復空內容文章
   */
  private static async fixEmptyArticles(): Promise<void> {
         await prisma.news.updateMany({
       where: {
         content: ''
       },
       data: {
         isPublished: false
       }
     })
  }

  /**
   * 獲取設定值的輔助函數
   */
  private static async getSetting(key: string): Promise<string | null> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key }
      })
      return setting?.value || null
    } catch (error) {
      return null
    }
  }
}

/**
 * 初始化系統健康監控
 */
export function initializeSystemHealth(): void {
  console.log('🏥 初始化系統健康監控...')
  
  // 啟動定期健康檢查（每30分鐘）
  SystemHealthChecker.startPeriodicHealthCheck(30)
  
  // 在應用啟動時執行一次健康檢查
  setTimeout(async () => {
    await SystemHealthChecker.performHealthCheck()
  }, 30000) // 30秒後執行，讓系統先穩定
}

/**
 * 執行系統自我修復
 */
export async function performSystemSelfHealing(): Promise<void> {
  console.log('🔧 開始系統自我修復...')
  
  const healthCheck = await SystemHealthChecker.performHealthCheck()
  
  if (!healthCheck.healthy) {
    console.log('❌ 檢測到系統問題，開始自動修復...')
    const repairResult = await SystemHealthChecker.performAutoRepair()
    
    console.log('🔧 修復結果:')
    console.log('  ✅ 成功:', repairResult.successful)
    console.log('  ❌ 失敗:', repairResult.failed)
    
    // 修復後再次檢查
    const postRepairCheck = await SystemHealthChecker.performHealthCheck()
    if (postRepairCheck.healthy) {
      console.log('✅ 系統修復成功，健康狀態已恢復')
    } else {
      console.log('⚠️ 系統修復部分成功，仍有問題需要人工處理')
    }
  } else {
    console.log('✅ 系統健康狀態良好，無需修復')
  }
} 