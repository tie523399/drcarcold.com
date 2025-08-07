// 智能調度管理系統 - 根據API限制自動調整時間間隔
import { prisma } from '@/lib/prisma'

interface AIServiceLimits {
  provider: string
  name: string
  freeRequestsPerDay: number
  freeRequestsPerHour: number
  freeRequestsPerMinute: number
  resetTime: string // 'daily' | 'hourly' | 'minute'
  priority: number // 越小越優先
  estimatedTokensPerRequest: number
}

interface APIUsageRecord {
  provider: string
  date: string
  hour: number
  minute: number
  requestCount: number
  successCount: number
  errorCount: number
}

interface SmartScheduleConfig {
  crawlerInterval: number
  seoGeneratorInterval: number
  seoGeneratorCount: number
  maxArticleCount: number
  cleanupInterval: number
  lastOptimized: Date
  activeProvider: string
  backupProviders: string[]
}

export class SmartScheduleManager {
  private static instance: SmartScheduleManager
  private aiLimits: AIServiceLimits[] = [
    {
      provider: 'deepseek',
      name: 'DeepSeek',
      freeRequestsPerDay: 10000, // 非常慷慨的免費額度
      freeRequestsPerHour: 500,
      freeRequestsPerMinute: 10,
      resetTime: 'daily',
      priority: 1,
      estimatedTokensPerRequest: 2000
    },
    {
      provider: 'groq',
      name: 'Groq',
      freeRequestsPerDay: 14400, // 每分鐘30個請求 * 60 * 24 / 3
      freeRequestsPerHour: 600,
      freeRequestsPerMinute: 30,
      resetTime: 'daily',
      priority: 2,
      estimatedTokensPerRequest: 1500
    },
    {
      provider: 'gemini',
      name: 'Google Gemini',
      freeRequestsPerDay: 1500, // 每分鐘15個請求
      freeRequestsPerHour: 60,
      freeRequestsPerMinute: 15,
      resetTime: 'daily',
      priority: 3,
      estimatedTokensPerRequest: 2000
    },
    {
      provider: 'cohere',
      name: 'Cohere',
      freeRequestsPerDay: 100, // 免費版限制較嚴格
      freeRequestsPerHour: 10,
      freeRequestsPerMinute: 1,
      resetTime: 'daily',
      priority: 4,
      estimatedTokensPerRequest: 1000
    },
    {
      provider: 'zhipu',
      name: '智譜AI',
      freeRequestsPerDay: 1000,
      freeRequestsPerHour: 50,
      freeRequestsPerMinute: 5,
      resetTime: 'daily',
      priority: 5,
      estimatedTokensPerRequest: 1500
    },
    {
      provider: 'moonshot',
      name: 'Moonshot',
      freeRequestsPerDay: 500,
      freeRequestsPerHour: 25,
      freeRequestsPerMinute: 3,
      resetTime: 'daily',
      priority: 6,
      estimatedTokensPerRequest: 2000
    }
  ]

  public static getInstance(): SmartScheduleManager {
    if (!SmartScheduleManager.instance) {
      SmartScheduleManager.instance = new SmartScheduleManager()
    }
    return SmartScheduleManager.instance
  }

  /**
   * 智能計算最佳時間間隔
   */
  async calculateOptimalSchedule(): Promise<SmartScheduleConfig> {
    console.log('🧠 開始計算智能調度配置...')

    // 檢查當前可用的API Keys
    const availableProviders = await this.getAvailableProviders()
    
    if (availableProviders.length === 0) {
      console.warn('⚠️ 沒有可用的AI服務提供商')
      return this.getDefaultSchedule()
    }

    // 獲取最佳提供商
    const bestProvider = await this.getBestProvider(availableProviders)
    const providerLimits = this.aiLimits.find(l => l.provider === bestProvider)
    
    if (!providerLimits) {
      return this.getDefaultSchedule()
    }

    // 獲取當前使用量
    const currentUsage = await this.getCurrentUsage(bestProvider)
    
    // 計算可用額度
    const availableRequests = this.calculateAvailableRequests(providerLimits, currentUsage)
    
    // 智能計算間隔時間
    const schedule = this.calculateIntervals(providerLimits, availableRequests, availableProviders)
    
    console.log(`✅ 智能調度配置完成，主要使用: ${providerLimits.name}`)
    console.log(`📊 可用請求數: ${availableRequests.daily}天/${availableRequests.hourly}小時`)
    console.log(`⏰ 建議間隔: 爬蟲${schedule.crawlerInterval}分鐘, SEO${schedule.seoGeneratorInterval}分鐘`)

    // 保存配置
    await this.saveScheduleConfig(schedule)
    
    return schedule
  }

  /**
   * 獲取可用的AI服務提供商
   */
  private async getAvailableProviders(): Promise<string[]> {
    const providers: string[] = []
    
    for (const limit of this.aiLimits) {
      const apiKeySetting = await prisma.setting.findUnique({
        where: { key: `${limit.provider}ApiKey` }
      })
      
      if (apiKeySetting?.value && apiKeySetting.value.trim() !== '') {
        providers.push(limit.provider)
      }
    }
    
    return providers.sort((a, b) => {
      const priorityA = this.aiLimits.find(l => l.provider === a)?.priority || 999
      const priorityB = this.aiLimits.find(l => l.provider === b)?.priority || 999
      return priorityA - priorityB
    })
  }

  /**
   * 獲取最佳提供商（基於使用量和優先級）
   */
  private async getBestProvider(availableProviders: string[]): Promise<string> {
    let bestProvider = availableProviders[0]
    let bestScore = 0

    for (const provider of availableProviders) {
      const limits = this.aiLimits.find(l => l.provider === provider)
      if (!limits) continue

      const usage = await this.getCurrentUsage(provider)
      const available = this.calculateAvailableRequests(limits, usage)
      
      // 計算評分：可用請求數 / 優先級
      const score = available.daily / limits.priority
      
      if (score > bestScore) {
        bestScore = score
        bestProvider = provider
      }
    }

    return bestProvider
  }

  /**
   * 獲取當前使用量
   */
  private async getCurrentUsage(provider: string): Promise<APIUsageRecord> {
    const today = new Date().toISOString().split('T')[0]
    const currentHour = new Date().getHours()
    const currentMinute = new Date().getMinutes()

    // 嘗試從資料庫獲取今日使用量
    try {
      const usage = await prisma.setting.findUnique({
        where: { key: `api_usage_${provider}_${today}` }
      })

      if (usage?.value) {
        return JSON.parse(usage.value)
      }
    } catch (error) {
      console.log('無法獲取API使用記錄，使用預設值')
    }

    return {
      provider,
      date: today,
      hour: currentHour,
      minute: currentMinute,
      requestCount: 0,
      successCount: 0,
      errorCount: 0
    }
  }

  /**
   * 計算可用請求數
   */
  private calculateAvailableRequests(limits: AIServiceLimits, usage: APIUsageRecord) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // 計算剩餘的每日額度
    const dailyRemaining = Math.max(0, limits.freeRequestsPerDay - usage.requestCount)
    
    // 計算剩餘的每小時額度（如果是同一小時）
    const hourlyRemaining = usage.hour === currentHour 
      ? Math.max(0, limits.freeRequestsPerHour - usage.requestCount)
      : limits.freeRequestsPerHour

    // 計算剩餘的每分鐘額度
    const minuteRemaining = usage.minute === currentMinute
      ? Math.max(0, limits.freeRequestsPerMinute - usage.requestCount)
      : limits.freeRequestsPerMinute

    return {
      daily: dailyRemaining,
      hourly: hourlyRemaining,
      minute: minuteRemaining
    }
  }

  /**
   * 智能計算時間間隔
   */
  private calculateIntervals(
    limits: AIServiceLimits, 
    available: { daily: number, hourly: number, minute: number },
    backupProviders: string[]
  ): SmartScheduleConfig {
    
    // 基本策略：確保不超出任何限制
    const safetyMargin = 0.8 // 80%安全邊際
    
    // 計算每小時可安全使用的請求數
    const safeHourlyRequests = Math.floor(available.hourly * safetyMargin)
    const safeDailyRequests = Math.floor(available.daily * safetyMargin)
    
    // 估算每次操作需要的API調用數
    const callsPerCrawl = 2 // 標題重寫 + 內容重寫
    const callsPerSEO = 1 // SEO文章生成
    
    // 計算理想的操作頻率（每小時）
    const maxCrawlsPerHour = Math.floor(safeHourlyRequests / callsPerCrawl)
    const maxSEOsPerHour = Math.floor(safeHourlyRequests / callsPerSEO)
    
    // 計算間隔時間（分鐘）
    let crawlerInterval = maxCrawlsPerHour > 0 ? Math.ceil(60 / maxCrawlsPerHour) : 240
    let seoGeneratorInterval = maxSEOsPerHour > 0 ? Math.ceil(60 / maxSEOsPerHour) : 360
    
    // 確保最小間隔（避免過於頻繁）
    crawlerInterval = Math.max(crawlerInterval, 30) // 最少30分鐘
    seoGeneratorInterval = Math.max(seoGeneratorInterval, 60) // 最少60分鐘
    
    // 如果限制太嚴格，增加間隔
    if (available.daily < 50) {
      crawlerInterval = Math.max(crawlerInterval, 180) // 3小時
      seoGeneratorInterval = Math.max(seoGeneratorInterval, 360) // 6小時
    }
    
    // 如果有多個備用提供商，可以更激進一些
    if (backupProviders.length > 2) {
      crawlerInterval = Math.max(30, Math.floor(crawlerInterval * 0.7))
      seoGeneratorInterval = Math.max(60, Math.floor(seoGeneratorInterval * 0.7))
    }

    return {
      crawlerInterval,
      seoGeneratorInterval,
      seoGeneratorCount: Math.min(3, Math.floor(safeHourlyRequests / 10)), // 每次生成的文章數
      maxArticleCount: Math.min(10, Math.floor(safeDailyRequests / 5)), // 每日最大文章數
      cleanupInterval: 1440, // 24小時清理一次
      lastOptimized: new Date(),
      activeProvider: limits.provider,
      backupProviders: backupProviders.filter(p => p !== limits.provider)
    }
  }

  /**
   * 記錄API使用量
   */
  async recordAPIUsage(provider: string, success: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const usageKey = `api_usage_${provider}_${today}`
    
    try {
      const currentUsage = await this.getCurrentUsage(provider)
      
      currentUsage.requestCount++
      if (success) {
        currentUsage.successCount++
      } else {
        currentUsage.errorCount++
      }
      
      await prisma.setting.upsert({
        where: { key: usageKey },
        create: {
          key: usageKey,
          value: JSON.stringify(currentUsage)
        },
        update: {
          value: JSON.stringify(currentUsage)
        }
      })
      
      // 如果錯誤率過高，觸發重新計算
      if (currentUsage.errorCount > 5 && currentUsage.errorCount / currentUsage.requestCount > 0.3) {
        console.log(`⚠️ ${provider} 錯誤率過高，重新計算調度...`)
        await this.calculateOptimalSchedule()
      }
      
    } catch (error) {
      console.error('記錄API使用量失敗:', error)
    }
  }

  /**
   * 檢查是否可以執行API調用
   */
  async canMakeAPICall(provider: string): Promise<boolean> {
    const limits = this.aiLimits.find(l => l.provider === provider)
    if (!limits) return false

    const usage = await this.getCurrentUsage(provider)
    const available = this.calculateAvailableRequests(limits, usage)
    
    return available.minute > 0 && available.hourly > 0 && available.daily > 0
  }

  /**
   * 獲取當前推薦的AI提供商
   */
  async getRecommendedProvider(): Promise<string | null> {
    const availableProviders = await this.getAvailableProviders()
    
    for (const provider of availableProviders) {
      if (await this.canMakeAPICall(provider)) {
        return provider
      }
    }
    
    return null
  }

  /**
   * 保存調度配置
   */
  private async saveScheduleConfig(config: SmartScheduleConfig): Promise<void> {
    try {
      await prisma.setting.upsert({
        where: { key: 'smart_schedule_config' },
        create: {
          key: 'smart_schedule_config',
          value: JSON.stringify(config)
        },
        update: {
          value: JSON.stringify(config)
        }
      })
    } catch (error) {
      console.error('保存調度配置失敗:', error)
    }
  }

  /**
   * 獲取保存的調度配置
   */
  async getSavedScheduleConfig(): Promise<SmartScheduleConfig | null> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'smart_schedule_config' }
      })
      
      if (setting?.value) {
        return JSON.parse(setting.value)
      }
    } catch (error) {
      console.error('獲取調度配置失敗:', error)
    }
    
    return null
  }

  /**
   * 預設調度配置
   */
  private getDefaultSchedule(): SmartScheduleConfig {
    return {
      crawlerInterval: 240, // 4小時
      seoGeneratorInterval: 360, // 6小時
      seoGeneratorCount: 1,
      maxArticleCount: 3,
      cleanupInterval: 1440,
      lastOptimized: new Date(),
      activeProvider: 'deepseek',
      backupProviders: ['groq', 'gemini']
    }
  }

  /**
   * 重置每日使用量計數器
   */
  async resetDailyCounters(): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    try {
      // 清理昨天的記錄
      for (const limit of this.aiLimits) {
        const oldKey = `api_usage_${limit.provider}_${yesterday}`
        await prisma.setting.deleteMany({
          where: { key: oldKey }
        })
      }
      
      console.log('✅ 每日API使用量計數器已重置')
    } catch (error) {
      console.error('重置計數器失敗:', error)
    }
  }

  /**
   * 獲取API使用量報告
   */
  async getUsageReport(): Promise<any> {
    const today = new Date().toISOString().split('T')[0]
    const report: any = {}
    
    for (const limit of this.aiLimits) {
      const usage = await this.getCurrentUsage(limit.provider)
      const available = this.calculateAvailableRequests(limit, usage)
      
      report[limit.provider] = {
        name: limit.name,
        used: usage.requestCount,
        available: available.daily,
        total: limit.freeRequestsPerDay,
        successRate: usage.requestCount > 0 ? (usage.successCount / usage.requestCount * 100).toFixed(1) : '0.0',
        canCall: available.minute > 0 && available.hourly > 0 && available.daily > 0
      }
    }
    
    return report
  }
}

// 導出單例
export const smartScheduleManager = SmartScheduleManager.getInstance()
