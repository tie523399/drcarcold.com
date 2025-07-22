/**
 * 🔒 配置驗證器
 * 
 * 確保系統配置的正確性和完整性
 * 防止因配置錯誤導致的系統故障
 */

import { 
  AutoServiceConfig, 
  ConfigValidationResult, 
  CONFIG_LIMITS, 
  DEFAULT_AUTO_SERVICE_CONFIG,
  SETTING_KEYS,
  SystemError,
  SystemErrorType
} from '@/types/system'
import { prisma } from './prisma'

export class ConfigValidator {
  
  /**
   * 驗證自動化服務配置
   */
  static validateAutoServiceConfig(config: Partial<AutoServiceConfig>): ConfigValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 驗證必需欄位
    if (typeof config.crawlerEnabled !== 'boolean') {
      errors.push('crawlerEnabled 必須是布林值')
    }

    if (typeof config.crawlerInterval !== 'number') {
      errors.push('crawlerInterval 必須是數字')
    } else {
      // 驗證爬蟲間隔範圍
      const { min, max } = CONFIG_LIMITS.CRAWLER_INTERVAL
      if (config.crawlerInterval < min || config.crawlerInterval > max) {
        errors.push(`爬蟲間隔必須在 ${min}-${max} 分鐘之間`)
      }
      if (config.crawlerInterval < 30) {
        warnings.push('爬蟲間隔低於30分鐘可能會增加服務器負載')
      }
    }

    if (typeof config.seoGeneratorEnabled !== 'boolean') {
      errors.push('seoGeneratorEnabled 必須是布林值')
    }

    if (typeof config.seoGeneratorInterval !== 'number') {
      errors.push('seoGeneratorInterval 必須是數字')
    } else {
      const { min, max } = CONFIG_LIMITS.SEO_INTERVAL
      if (config.seoGeneratorInterval < min || config.seoGeneratorInterval > max) {
        errors.push(`SEO生成間隔必須在 ${min}-${max} 小時之間`)
      }
    }

    if (typeof config.seoGeneratorCount !== 'number') {
      errors.push('seoGeneratorCount 必須是數字')
    } else {
      const { min, max } = CONFIG_LIMITS.SEO_COUNT
      if (config.seoGeneratorCount < min || config.seoGeneratorCount > max) {
        errors.push(`SEO生成數量必須在 ${min}-${max} 篇之間`)
      }
    }

    if (typeof config.maxArticleCount !== 'number') {
      errors.push('maxArticleCount 必須是數字')
    } else {
      const { min, max } = CONFIG_LIMITS.MAX_ARTICLES
      if (config.maxArticleCount < min || config.maxArticleCount > max) {
        errors.push(`最大文章數量必須在 ${min}-${max} 篇之間`)
      }
    }

    if (typeof config.cleanupInterval !== 'number') {
      errors.push('cleanupInterval 必須是數字')
    } else {
      const { min, max } = CONFIG_LIMITS.CLEANUP_INTERVAL
      if (config.cleanupInterval < min || config.cleanupInterval > max) {
        errors.push(`清理間隔必須在 ${min}-${max} 小時之間`)
      }
    }

    if (typeof config.minViewCountToKeep !== 'number') {
      errors.push('minViewCountToKeep 必須是數字')
    } else if (config.minViewCountToKeep < 0) {
      errors.push('保留文章的最低瀏覽量不能為負數')
    }

    // 邏輯驗證
    if (config.seoGeneratorCount && config.maxArticleCount) {
      if (config.seoGeneratorCount > config.maxArticleCount / 2) {
        warnings.push('SEO生成數量過高，可能導致頻繁的文章清理')
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 驗證API金鑰配置
   */
  static async validateApiKeys(): Promise<ConfigValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      const apiKeys = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              SETTING_KEYS.COHERE_API_KEY,
              SETTING_KEYS.OPENAI_API_KEY,
              SETTING_KEYS.GROQ_API_KEY,
              SETTING_KEYS.GEMINI_API_KEY
            ]
          }
        }
      })

      const keyMap = apiKeys.reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      // 檢查 Cohere API Key（SEO生成必需）
      if (!keyMap[SETTING_KEYS.COHERE_API_KEY]) {
        warnings.push('未設定 Cohere API Key，SEO文章生成功能將無法使用')
      }

      // 檢查至少有一個 AI API Key
      const hasAnyAIKey = [
        SETTING_KEYS.OPENAI_API_KEY,
        SETTING_KEYS.GROQ_API_KEY,
        SETTING_KEYS.GEMINI_API_KEY
      ].some(key => keyMap[key])

      if (!hasAnyAIKey) {
        warnings.push('未設定任何 AI API Key，AI改寫功能將無法使用')
      }

      // 驗證 API Key 格式
      Object.entries(keyMap).forEach(([key, value]) => {
        if (value && value.length < 10) {
          warnings.push(`${key} 看起來格式不正確`)
        }
      })

    } catch (error) {
      errors.push('無法驗證API金鑰配置：數據庫連接失敗')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 驗證數據庫配置完整性
   */
  static async validateDatabaseConfig(): Promise<ConfigValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 檢查必需的設定項是否存在
      const requiredSettings = [
        SETTING_KEYS.AUTO_CRAWLER_ENABLED,
        SETTING_KEYS.AUTO_CRAWLER_INTERVAL,
        SETTING_KEYS.AUTO_SEO_ENABLED,
        SETTING_KEYS.AUTO_SEO_INTERVAL,
        SETTING_KEYS.MAX_ARTICLE_COUNT
      ]

      const existingSettings = await prisma.setting.findMany({
        where: {
          key: { in: requiredSettings }
        }
      })

      const existingKeys = existingSettings.map(s => s.key)
      const missingKeys = requiredSettings.filter(key => !existingKeys.includes(key))

      if (missingKeys.length > 0) {
        warnings.push(`缺少以下配置項：${missingKeys.join(', ')}`)
      }

      // 檢查數據庫表是否存在
      const tables = ['Setting', 'News', 'NewsSource']
      for (const table of tables) {
        try {
          await (prisma as any)[table.toLowerCase()].findFirst()
        } catch (error) {
          errors.push(`數據庫表 ${table} 不存在或無法訪問`)
        }
      }

    } catch (error) {
      errors.push('數據庫連接失敗')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * 修復配置（添加缺失的設定項）
   */
  static async repairConfig(): Promise<void> {
    const defaultSettings = [
      { key: SETTING_KEYS.AUTO_CRAWLER_ENABLED, value: 'true' },
      { key: SETTING_KEYS.AUTO_CRAWLER_INTERVAL, value: '60' },
      { key: SETTING_KEYS.AUTO_SEO_ENABLED, value: 'true' },
      { key: SETTING_KEYS.AUTO_SEO_INTERVAL, value: '6' },
      { key: SETTING_KEYS.AUTO_SEO_COUNT, value: '2' },
      { key: SETTING_KEYS.MAX_ARTICLE_COUNT, value: '20' },
      { key: SETTING_KEYS.CLEANUP_INTERVAL, value: '1' },
      { key: SETTING_KEYS.MIN_VIEW_COUNT_TO_KEEP, value: '0' },
      { key: SETTING_KEYS.COHERE_API_KEY, value: '' },
      { key: SETTING_KEYS.OPENAI_API_KEY, value: '' },
      { key: SETTING_KEYS.GROQ_API_KEY, value: '' },
      { key: SETTING_KEYS.GEMINI_API_KEY, value: '' }
    ]

    for (const setting of defaultSettings) {
      try {
        await prisma.setting.upsert({
          where: { key: setting.key },
          update: {}, // 不覆蓋現有值
          create: setting
        })
      } catch (error) {
        console.error(`修復設定項 ${setting.key} 失敗:`, error)
      }
    }
  }

  /**
   * 生成系統錯誤
   */
  static createSystemError(
    type: SystemErrorType,
    message: string,
    component: string,
    details?: any
  ): SystemError {
    return {
      type,
      message,
      details,
      timestamp: new Date(),
      component
    }
  }

  /**
   * 驗證配置值的範圍
   */
  static validateRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): string[] {
    const errors: string[] = []
    
    if (value < min) {
      errors.push(`${fieldName} 不能小於 ${min}`)
    }
    
    if (value > max) {
      errors.push(`${fieldName} 不能大於 ${max}`)
    }
    
    return errors
  }

  /**
   * 清理和標準化配置值
   */
  static sanitizeConfig(config: Partial<AutoServiceConfig>): AutoServiceConfig {
    const sanitized: AutoServiceConfig = { ...DEFAULT_AUTO_SERVICE_CONFIG }

    // 清理和驗證每個欄位
    if (typeof config.crawlerEnabled === 'boolean') {
      sanitized.crawlerEnabled = config.crawlerEnabled
    }

    if (typeof config.crawlerInterval === 'number') {
      sanitized.crawlerInterval = Math.max(
        CONFIG_LIMITS.CRAWLER_INTERVAL.min,
        Math.min(CONFIG_LIMITS.CRAWLER_INTERVAL.max, Math.floor(config.crawlerInterval))
      )
    }

    if (typeof config.seoGeneratorEnabled === 'boolean') {
      sanitized.seoGeneratorEnabled = config.seoGeneratorEnabled
    }

    if (typeof config.seoGeneratorInterval === 'number') {
      sanitized.seoGeneratorInterval = Math.max(
        CONFIG_LIMITS.SEO_INTERVAL.min,
        Math.min(CONFIG_LIMITS.SEO_INTERVAL.max, Math.floor(config.seoGeneratorInterval))
      )
    }

    if (typeof config.seoGeneratorCount === 'number') {
      sanitized.seoGeneratorCount = Math.max(
        CONFIG_LIMITS.SEO_COUNT.min,
        Math.min(CONFIG_LIMITS.SEO_COUNT.max, Math.floor(config.seoGeneratorCount))
      )
    }

    if (typeof config.maxArticleCount === 'number') {
      sanitized.maxArticleCount = Math.max(
        CONFIG_LIMITS.MAX_ARTICLES.min,
        Math.min(CONFIG_LIMITS.MAX_ARTICLES.max, Math.floor(config.maxArticleCount))
      )
    }

    if (typeof config.cleanupInterval === 'number') {
      sanitized.cleanupInterval = Math.max(
        CONFIG_LIMITS.CLEANUP_INTERVAL.min,
        Math.min(CONFIG_LIMITS.CLEANUP_INTERVAL.max, Math.floor(config.cleanupInterval))
      )
    }

    if (typeof config.minViewCountToKeep === 'number') {
      sanitized.minViewCountToKeep = Math.max(0, Math.floor(config.minViewCountToKeep))
    }

    return sanitized
  }
}

/**
 * 快速配置驗證函數
 */
export async function validateSystemConfig(): Promise<ConfigValidationResult> {
  const results = await Promise.all([
    ConfigValidator.validateDatabaseConfig(),
    ConfigValidator.validateApiKeys()
  ])

  const allErrors = results.flatMap(r => r.errors)
  const allWarnings = results.flatMap(r => r.warnings)

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

/**
 * 自動修復系統配置
 */
export async function autoRepairConfig(): Promise<void> {
  console.log('🔧 開始自動修復系統配置...')
  
  try {
    await ConfigValidator.repairConfig()
    console.log('✅ 系統配置修復完成')
  } catch (error) {
    console.error('❌ 系統配置修復失敗:', error)
    throw error
  }
} 