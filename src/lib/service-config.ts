/**
 * 🔧 統一服務配置管理
 * 
 * 標準化所有自動化服務的配置
 */

export interface ServiceConfig {
  // 爬蟲服務配置
  crawler: {
    enabled: boolean
    interval: number // 分鐘
    maxArticles: number
    sources: string[]
  }
  
  // SEO生成器配置
  seoGenerator: {
    enabled: boolean
    interval: number // 小時
    count: number
    maxDailyGeneration: number
  }
  
  // 文章清理配置
  articleCleanup: {
    enabled: boolean
    interval: number // 小時
    maxArticleCount: number
    minViewCountToKeep: number
  }
  
  // 系統健康檢查配置
  systemHealth: {
    enabled: boolean
    interval: number // 分鐘
    alertThreshold: number
  }
  
  // 錯誤處理配置
  errorHandling: {
    maxRetryAttempts: number
    retryDelay: number // 秒
    enableAutoRestart: boolean
  }
}

// 預設配置
export const DEFAULT_SERVICE_CONFIG: ServiceConfig = {
  crawler: {
    enabled: true,
    interval: 60, // 60分鐘
    maxArticles: 20,
    sources: ['汽車新聞', '冷媒技術', '環保法規']
  },
  
  seoGenerator: {
    enabled: true,
    interval: 6, // 6小時
    count: 2,
    maxDailyGeneration: 8
  },
  
  articleCleanup: {
    enabled: true,
    interval: 1, // 1小時
    maxArticleCount: 20,
    minViewCountToKeep: 0
  },
  
  systemHealth: {
    enabled: true,
    interval: 15, // 15分鐘
    alertThreshold: 5
  },
  
  errorHandling: {
    maxRetryAttempts: 3,
    retryDelay: 2, // 2秒
    enableAutoRestart: true
  }
}

/**
 * 服務狀態接口
 */
export interface ServiceStatus {
  name: string
  running: boolean
  lastRun?: Date
  nextRun?: Date
  errorCount: number
  lastError?: string
}

/**
 * 服務管理器接口
 */
export interface IServiceManager {
  // 基本操作
  start(): Promise<void>
  stop(): Promise<void>
  restart(): Promise<void>
  
  // 狀態管理
  getStatus(): ServiceStatus[]
  getConfig(): ServiceConfig
  updateConfig(config: Partial<ServiceConfig>): Promise<void>
  
  // 健康檢查
  healthCheck(): Promise<boolean>
  
  // 錯誤處理
  handleError(error: Error, context: string): Promise<void>
}

/**
 * 配置驗證
 */
export function validateServiceConfig(config: Partial<ServiceConfig>): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 驗證爬蟲配置
  if (config.crawler) {
    if (config.crawler.interval && config.crawler.interval < 1) {
      errors.push('爬蟲間隔不能小於1分鐘')
    }
    if (config.crawler.maxArticles && config.crawler.maxArticles < 1) {
      errors.push('最大文章數不能小於1')
    }
  }
  
  // 驗證SEO生成器配置
  if (config.seoGenerator) {
    if (config.seoGenerator.interval && config.seoGenerator.interval < 1) {
      errors.push('SEO生成間隔不能小於1小時')
    }
    if (config.seoGenerator.count && config.seoGenerator.count < 1) {
      errors.push('SEO生成數量不能小於1')
    }
  }
  
  // 驗證清理配置
  if (config.articleCleanup) {
    if (config.articleCleanup.interval && config.articleCleanup.interval < 1) {
      errors.push('清理間隔不能小於1小時')
    }
    if (config.articleCleanup.maxArticleCount && config.articleCleanup.maxArticleCount < 1) {
      errors.push('最大文章數不能小於1')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 合併配置
 */
export function mergeServiceConfig(baseConfig: ServiceConfig, updates: Partial<ServiceConfig>): ServiceConfig {
  return {
    crawler: { ...baseConfig.crawler, ...updates.crawler },
    seoGenerator: { ...baseConfig.seoGenerator, ...updates.seoGenerator },
    articleCleanup: { ...baseConfig.articleCleanup, ...updates.articleCleanup },
    systemHealth: { ...baseConfig.systemHealth, ...updates.systemHealth },
    errorHandling: { ...baseConfig.errorHandling, ...updates.errorHandling }
  }
}

/**
 * 配置持久化
 */
export class ConfigManager {
  private static readonly CONFIG_FILE = 'service-config.json'
  
  static async saveConfig(config: ServiceConfig): Promise<void> {
    try {
      const fs = await import('fs/promises')
      await fs.writeFile(this.CONFIG_FILE, JSON.stringify(config, null, 2))
      console.log('✅ 服務配置已保存')
    } catch (error) {
      console.error('❌ 保存配置失敗:', error)
      throw error
    }
  }
  
  static async loadConfig(): Promise<ServiceConfig> {
    try {
      const fs = await import('fs/promises')
      const content = await fs.readFile(this.CONFIG_FILE, 'utf-8')
      const loadedConfig = JSON.parse(content)
      
      // 合併預設配置以確保所有欄位都存在
      return mergeServiceConfig(DEFAULT_SERVICE_CONFIG, loadedConfig)
    } catch (error) {
      console.warn('⚠️ 載入配置失敗，使用預設配置:', error)
      return DEFAULT_SERVICE_CONFIG
    }
  }
  
  static async resetConfig(): Promise<ServiceConfig> {
    await this.saveConfig(DEFAULT_SERVICE_CONFIG)
    return DEFAULT_SERVICE_CONFIG
  }
}