import { prisma } from './prisma'
import { AutoNewsCrawler } from './auto-news-crawler'
import { SEOContentGenerator } from './seo-content-generator'

export class AutoStartupService {
  private crawler: AutoNewsCrawler
  private seoGenerator: SEOContentGenerator
  private isRunning = false
  private crawlerInterval: NodeJS.Timeout | null = null
  private seoInterval: NodeJS.Timeout | null = null
  private cleanupInterval: NodeJS.Timeout | null = null
  
  // 配置設定
  private settings = {
    crawlerInterval: 60, // 分鐘
    seoGeneratorInterval: 6, // 小時
    maxArticleCount: 20,
    cleanupInterval: 1 // 小時
  }

  constructor() {
    this.crawler = new AutoNewsCrawler()
    // SEOContentGenerator 需要在實際使用時才初始化（需要 API key）
    this.seoGenerator = null as any
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('自動服務已經在運行中...')
      return
    }

    console.log('🚀 啟動自動服務...')
    this.isRunning = true

    try {
      // 載入後台設定
      await this.loadSettings()
      
      // 啟動爬蟲 - 使用設定的時間間隔
      await this.startCrawler()
      
      // 啟動SEO文章生成 - 使用設定的時間間隔
      await this.startSEOGenerator()
      
      // 啟動文章清理 - 使用設定的時間間隔
      await this.startArticleCleanup()

      console.log('✅ 所有自動服務已啟動')
    } catch (error) {
      console.error('❌ 啟動自動服務失敗:', error)
      this.isRunning = false
      throw error
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 停止自動服務...')
    this.isRunning = false

    if (this.crawlerInterval) {
      clearInterval(this.crawlerInterval)
      this.crawlerInterval = null
    }

    if (this.seoInterval) {
      clearInterval(this.seoInterval)
      this.seoInterval = null
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    console.log('✅ 所有自動服務已停止')
  }

  private async loadSettings(): Promise<void> {
    try {
      console.log('⚙️ 載入後台設定...')
      
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['crawlerInterval', 'seoGeneratorInterval', 'maxArticleCount', 'cleanupInterval']
          }
        }
      })

      settings.forEach(setting => {
        const value = parseInt(setting.value) || this.getDefaultValue(setting.key)
        switch (setting.key) {
          case 'crawlerInterval':
            this.settings.crawlerInterval = value
            break
          case 'seoGeneratorInterval':
            this.settings.seoGeneratorInterval = value
            break
          case 'maxArticleCount':
            this.settings.maxArticleCount = value
            break
          case 'cleanupInterval':
            this.settings.cleanupInterval = value
            break
        }
      })

      console.log('✅ 設定載入完成:', this.settings)
    } catch (error) {
      console.error('載入設定失敗，使用預設值:', error)
    }
  }

  private getDefaultValue(key: string): number {
    const defaults: Record<string, number> = {
      crawlerInterval: 60, // 60分鐘
      seoGeneratorInterval: 6, // 6小時
      maxArticleCount: 20,
      cleanupInterval: 1 // 1小時
    }
    return defaults[key] || 60
  }

  private async startCrawler(): Promise<void> {
    const intervalMinutes = this.settings.crawlerInterval
    console.log(`📰 啟動自動爬蟲服務 - 間隔: ${intervalMinutes} 分鐘`)
    
    // 立即執行一次
    await this.runCrawler()
    
    // 設定定時執行 - 使用後台設定的時間間隔
    this.crawlerInterval = setInterval(async () => {
      if (this.isRunning) {
        await this.runCrawler()
      }
    }, intervalMinutes * 60 * 1000) // 轉換為毫秒
  }

  private async startSEOGenerator(): Promise<void> {
    const intervalHours = this.settings.seoGeneratorInterval
    console.log(`🎯 啟動SEO文章生成服務 - 間隔: ${intervalHours} 小時`)
    
    // 延遲10分鐘後開始，避免與爬蟲衝突
    setTimeout(async () => {
      if (this.isRunning) {
        await this.runSEOGenerator()
        
        // 設定定時執行 - 使用後台設定的時間間隔
        this.seoInterval = setInterval(async () => {
          if (this.isRunning) {
            await this.runSEOGenerator()
          }
        }, intervalHours * 60 * 60 * 1000) // 轉換為毫秒
      }
    }, 10 * 60 * 1000) // 延遲10分鐘
  }

  private async startArticleCleanup(): Promise<void> {
    const intervalHours = this.settings.cleanupInterval
    console.log(`🧹 啟動文章清理服務 - 間隔: ${intervalHours} 小時`)
    
    // 延遲5分鐘後開始
    setTimeout(async () => {
      if (this.isRunning) {
        await this.cleanupArticles()
        
        // 設定定時執行 - 使用後台設定的時間間隔
        this.cleanupInterval = setInterval(async () => {
          if (this.isRunning) {
            await this.cleanupArticles()
          }
        }, intervalHours * 60 * 60 * 1000) // 轉換為毫秒
      }
    }, 5 * 60 * 1000) // 延遲5分鐘
  }

  private async runCrawler(): Promise<void> {
    try {
      console.log('🔄 執行自動爬蟲...')
      await this.crawler.performCrawl()
      console.log('✅ 爬蟲執行完成')
    } catch (error) {
      console.error('❌ 爬蟲執行失敗:', error)
    }
  }

  private async runSEOGenerator(): Promise<void> {
    try {
      console.log('🔄 執行SEO文章生成...')
      
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
      
      const result = await this.seoGenerator.generateSEOArticle()
      console.log('✅ SEO文章生成完成:', result)
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

  private async cleanupArticles(): Promise<void> {
    try {
      console.log('🔄 檢查文章數量...')
      
      const articleCount = await prisma.news.count({
        where: { isPublished: true }
      })

      const maxCount = this.settings.maxArticleCount

      if (articleCount > maxCount) {
        const deleteCount = articleCount - maxCount
        console.log(`📊 文章數量: ${articleCount}, 上限: ${maxCount}, 需要刪除: ${deleteCount} 篇`)
        
        // 找出流量最低的文章（依照 viewCount 排序）
        const articlesToDelete = await prisma.news.findMany({
          where: { isPublished: true },
          orderBy: [
            { viewCount: 'asc' },
            { createdAt: 'asc' } // 如果流量相同，刪除較舊的
          ],
          take: deleteCount,
          select: { id: true, title: true, viewCount: true }
        })

        // 刪除選中的文章
        for (const article of articlesToDelete) {
          await prisma.news.delete({
            where: { id: article.id }
          })
          console.log(`🗑️ 已刪除文章: "${article.title}" (流量: ${article.viewCount})`)
        }

        console.log(`✅ 已清理 ${deleteCount} 篇低流量文章`)
      } else {
        console.log(`📊 文章數量: ${articleCount}/${maxCount} - 無需清理`)
      }
    } catch (error) {
      console.error('❌ 文章清理失敗:', error)
    }
  }

  // 重新載入設定並重啟服務
  async reloadSettings(): Promise<void> {
    console.log('🔄 重新載入設定並重啟服務...')
    await this.stop()
    await new Promise(resolve => setTimeout(resolve, 1000)) // 等待1秒
    await this.start()
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      settings: this.settings,
      services: {
        crawler: {
          running: this.crawlerInterval !== null,
          interval: `${this.settings.crawlerInterval} 分鐘`
        },
        seoGenerator: {
          running: this.seoInterval !== null,
          interval: `${this.settings.seoGeneratorInterval} 小時`
        },
        cleanup: {
          running: this.cleanupInterval !== null,
          interval: `${this.settings.cleanupInterval} 小時`,
          maxArticles: this.settings.maxArticleCount
        }
      }
    }
  }
}

// 單例實例
let autoStartupService: AutoStartupService | null = null

export function getAutoStartupService(): AutoStartupService {
  if (!autoStartupService) {
    autoStartupService = new AutoStartupService()
  }
  return autoStartupService
}

// 自動啟動
export async function initializeAutoServices(): Promise<void> {
  try {
    const service = getAutoStartupService()
    await service.start()
  } catch (error) {
    console.error('自動服務初始化失敗:', error)
  }
} 