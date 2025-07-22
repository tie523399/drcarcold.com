import { AutoNewsCrawler } from './auto-news-crawler'
import { SEOContentGenerator } from './seo-content-generator'
import { prisma } from './prisma'
import * as cron from 'node-cron'

export interface AutoServiceConfig {
  // 爬蟲設定
  crawlerEnabled: boolean
  crawlerInterval: number // 分鐘
  
  // SEO 文章生成設定
  seoGeneratorEnabled: boolean
  seoGeneratorInterval: number // 小時
  seoGeneratorCount: number // 每次生成數量
  
  // 文章管理設定
  maxArticleCount: number // 最大文章數量
  cleanupInterval: number // 清理檢查間隔 (小時)
  minViewCountToKeep: number // 保留文章的最低瀏覽量
}

export class AutoServiceManager {
  private crawler: AutoNewsCrawler
  private seoGenerator: SEOContentGenerator
  private config: AutoServiceConfig
  private crawlerCronJob: cron.ScheduledTask | null = null
  private seoGeneratorCronJob: cron.ScheduledTask | null = null
  private cleanupCronJob: cron.ScheduledTask | null = null
  private isRunning = false

  constructor() {
    this.crawler = new AutoNewsCrawler()
    // SEOContentGenerator 需要在實際使用時才初始化（需要 API key）
    this.seoGenerator = null as any
    this.config = {
      crawlerEnabled: true,
      crawlerInterval: 60, // 每60分鐘執行一次爬蟲
      seoGeneratorEnabled: true,
      seoGeneratorInterval: 6, // 每6小時生成一次SEO文章
      seoGeneratorCount: 2, // 每次生成2篇文章
      maxArticleCount: 20, // 最多保持20篇文章
      cleanupInterval: 1, // 每小時檢查一次是否需要清理
      minViewCountToKeep: 0 // 瀏覽量為0的文章會被優先刪除
    }
  }

  async loadConfig(): Promise<void> {
    try {
      // 從數據庫載入配置
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'autoCrawlerEnabled',
              'autoCrawlerInterval',
              'autoSeoEnabled',
              'autoSeoInterval',
              'autoSeoCount',
              'maxArticleCount',
              'cleanupInterval',
              'minViewCountToKeep'
            ]
          }
        }
      })

      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, any>)

      this.config = {
        crawlerEnabled: settingsMap.autoCrawlerEnabled ?? true,
        crawlerInterval: settingsMap.autoCrawlerInterval ?? 60,
        seoGeneratorEnabled: settingsMap.autoSeoEnabled ?? true,
        seoGeneratorInterval: settingsMap.autoSeoInterval ?? 6,
        seoGeneratorCount: settingsMap.autoSeoCount ?? 2,
        maxArticleCount: settingsMap.maxArticleCount ?? 20,
        cleanupInterval: settingsMap.cleanupInterval ?? 1,
        minViewCountToKeep: settingsMap.minViewCountToKeep ?? 0
      }

      console.log('🔧 自動化服務配置已載入:', this.config)
    } catch (error) {
      console.error('載入配置失敗，使用預設配置:', error)
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ 自動化服務已在運行中')
      return
    }

    console.log('🚀 啟動自動化服務管理器...')
    
    await this.loadConfig()
    this.isRunning = true

    // 啟動爬蟲服務
    if (this.config.crawlerEnabled) {
      await this.startCrawlerService()
    }

    // 啟動SEO文章生成服務
    if (this.config.seoGeneratorEnabled) {
      await this.startSEOGeneratorService()
    }

    // 啟動文章清理服務
    await this.startCleanupService()

    console.log('✅ 所有自動化服務已啟動')
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('⚠️ 自動化服務未在運行')
      return
    }

    console.log('🛑 停止自動化服務...')

    if (this.crawlerCronJob) {
      this.crawlerCronJob.stop()
      this.crawlerCronJob = null
    }

    if (this.seoGeneratorCronJob) {
      this.seoGeneratorCronJob.stop()
      this.seoGeneratorCronJob = null
    }

    if (this.cleanupCronJob) {
      this.cleanupCronJob.stop()
      this.cleanupCronJob = null
    }

    this.isRunning = false
    console.log('✅ 所有自動化服務已停止')
  }

  private async startCrawlerService(): Promise<void> {
    const cronExpression = `*/${this.config.crawlerInterval} * * * *`
    
    console.log(`🕷️ 啟動爬蟲服務 - 間隔: ${this.config.crawlerInterval} 分鐘`)

    // 立即執行一次
    this.executeCrawler()

    // 設定定時任務
    this.crawlerCronJob = cron.schedule(cronExpression, () => {
      this.executeCrawler()
    })
  }

  private async startSEOGeneratorService(): Promise<void> {
    const cronExpression = `0 */${this.config.seoGeneratorInterval} * * *`
    
    console.log(`📝 啟動SEO文章生成服務 - 間隔: ${this.config.seoGeneratorInterval} 小時`)

    // 延遲5分鐘後執行第一次（讓爬蟲先執行）
    setTimeout(() => {
      this.executeSEOGenerator()
    }, 5 * 60 * 1000)

    // 設定定時任務
    this.seoGeneratorCronJob = cron.schedule(cronExpression, () => {
      this.executeSEOGenerator()
    })
  }

  private async startCleanupService(): Promise<void> {
    const cronExpression = `0 */${this.config.cleanupInterval} * * *`
    
    console.log(`🧹 啟動文章清理服務 - 間隔: ${this.config.cleanupInterval} 小時`)

    // 延遲10分鐘後執行第一次檢查
    setTimeout(() => {
      this.executeCleanup()
    }, 10 * 60 * 1000)

    // 設定定時任務
    this.cleanupCronJob = cron.schedule(cronExpression, () => {
      this.executeCleanup()
    })
  }

  private async executeCrawler(): Promise<void> {
    try {
      console.log('🕷️ 執行自動爬蟲...')
      await this.crawler.performCrawl()
      console.log('✅ 爬蟲執行完成')
      
      // 爬蟲執行後檢查文章數量
      setTimeout(() => {
        this.executeCleanup()
      }, 2 * 60 * 1000) // 2分鐘後檢查
      
    } catch (error) {
      console.error('❌ 爬蟲執行失敗:', error)
    }
  }

  private async executeSEOGenerator(): Promise<void> {
    try {
      console.log('📝 執行SEO文章生成...')
      
      // 動態初始化 SEOContentGenerator
      const cohereApiKey = await this.getSetting('cohereApiKey')
      if (!cohereApiKey) {
        console.log('⚠️ 缺少 Cohere API Key，跳過SEO生成')
        return
      }
      
      if (!this.seoGenerator) {
        const { SEOContentGenerator } = await import('./seo-content-generator')
        this.seoGenerator = new SEOContentGenerator(cohereApiKey)
      }
      
      for (let i = 0; i < this.config.seoGeneratorCount; i++) {
        await this.seoGenerator.generateSEOArticle()
        console.log(`✅ SEO文章 ${i + 1}/${this.config.seoGeneratorCount} 生成完成`)
        
        // 避免API頻率限制
        if (i < this.config.seoGeneratorCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 30000)) // 等待30秒
        }
      }
      
      console.log('✅ SEO文章生成完成')
      
      // 生成文章後檢查數量
      setTimeout(() => {
        this.executeCleanup()
      }, 1 * 60 * 1000) // 1分鐘後檢查
      
    } catch (error) {
      console.error('❌ SEO文章生成失敗:', error)
    }
  }

  private async getSetting(key: string): Promise<string | null> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key }
      })
      return setting?.value || null
    } catch (error) {
      console.error(`獲取設定 ${key} 失敗:`, error)
      return null
    }
  }

  private async executeCleanup(): Promise<void> {
    try {
      console.log('🧹 檢查文章數量管理...')
      
      const totalCount = await prisma.news.count({
        where: { isPublished: true }
      })

      console.log(`📊 當前文章總數: ${totalCount}, 上限: ${this.config.maxArticleCount}`)

      if (totalCount > this.config.maxArticleCount) {
        const excessCount = totalCount - this.config.maxArticleCount
        console.log(`🗑️ 需要刪除 ${excessCount} 篇文章`)

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

        for (const article of articlesToDelete) {
          await prisma.news.delete({
            where: { id: article.id }
          })
          
          console.log(`🗑️ 已刪除文章: "${article.title}" (瀏覽量: ${article.viewCount})`)
        }

        console.log(`✅ 文章清理完成，刪除了 ${articlesToDelete.length} 篇文章`)
      } else {
        console.log('✅ 文章數量在允許範圍內，無需清理')
      }
    } catch (error) {
      console.error('❌ 文章清理失敗:', error)
    }
  }

  async updateConfig(newConfig: Partial<AutoServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig }
    
    // 保存到數據庫
    for (const [key, value] of Object.entries(newConfig)) {
      const settingKey = this.getSettingKey(key)
      if (settingKey) {
        await prisma.setting.upsert({
          where: { key: settingKey },
          update: { value: String(value) },
          create: { key: settingKey, value: String(value) }
        })
      }
    }

    // 如果服務正在運行，重新啟動以應用新配置
    if (this.isRunning) {
      console.log('🔄 配置已更新，重新啟動服務...')
      await this.stop()
      await this.start()
    }
  }

  private getSettingKey(configKey: string): string | null {
    const keyMap: Record<string, string> = {
      crawlerEnabled: 'autoCrawlerEnabled',
      crawlerInterval: 'autoCrawlerInterval',
      seoGeneratorEnabled: 'autoSeoEnabled',
      seoGeneratorInterval: 'autoSeoInterval',
      seoGeneratorCount: 'autoSeoCount',
      maxArticleCount: 'maxArticleCount',
      cleanupInterval: 'cleanupInterval',
      minViewCountToKeep: 'minViewCountToKeep'
    }
    return keyMap[configKey] || null
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      services: {
        crawler: {
          enabled: this.config.crawlerEnabled,
          running: !!this.crawlerCronJob,
          interval: `${this.config.crawlerInterval} 分鐘`
        },
        seoGenerator: {
          enabled: this.config.seoGeneratorEnabled,
          running: !!this.seoGeneratorCronJob,
          interval: `${this.config.seoGeneratorInterval} 小時`
        },
        cleanup: {
          enabled: true,
          running: !!this.cleanupCronJob,
          interval: `${this.config.cleanupInterval} 小時`
        }
      }
    }
  }
}

// 全域實例
export const autoServiceManager = new AutoServiceManager() 