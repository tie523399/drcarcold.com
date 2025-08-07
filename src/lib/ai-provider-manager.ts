// 智能AI提供商管理器 - 自動故障切換系統
// 支援多AI提供商自動輪換，充分利用免費額度

import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/lib/ai-service'

interface AIProviderConfig {
  name: string
  key: string
  enabled: boolean
  priority: number
  rateLimit?: {
    requests: number
    period: number // 秒
  }
  lastUsed?: Date
  failureCount: number
  maxFailures: number
}

interface AIProviderResult {
  success: boolean
  content?: string
  provider: string
  error?: string
  retryAfter?: number
}

export class AIProviderManager {
  private providers: AIProviderConfig[] = []
  private maxRetries: number = 3
  private retryDelay: number = 1000 // 1秒

  constructor() {
    this.initializeProviders()
  }

  private async initializeProviders() {
    try {
      // 從資料庫載入AI提供商配置
      const settings = await this.loadSettings()
      
      this.providers = [
        {
          name: 'deepseek',
          key: settings.deepseekApiKey || '',
          enabled: !!settings.deepseekApiKey,
          priority: 1,
          rateLimit: { requests: 1000000, period: 86400 }, // 無限制
          failureCount: 0,
          maxFailures: 3
        },
        {
          name: 'groq',
          key: settings.groqApiKey || '',
          enabled: !!settings.groqApiKey,
          priority: 2,
          rateLimit: { requests: 14400, period: 86400 }, // 每天14,400次
          failureCount: 0,
          maxFailures: 3
        },
        {
          name: 'gemini',
          key: settings.geminiApiKey || '',
          enabled: !!settings.geminiApiKey,
          priority: 3,
          rateLimit: { requests: 15, period: 60 }, // 每分鐘15次
          failureCount: 0,
          maxFailures: 3
        },
        {
          name: 'cohere',
          key: settings.cohereApiKey || '',
          enabled: !!settings.cohereApiKey,
          priority: 4,
          rateLimit: { requests: 1000, period: 2592000 }, // 每月1000次
          failureCount: 0,
          maxFailures: 3
        },
        {
          name: 'openai',
          key: settings.openaiApiKey || '',
          enabled: !!settings.openaiApiKey,
          priority: 10, // 最低優先級（付費）
          failureCount: 0,
          maxFailures: 2
        }
      ].filter(p => p.enabled) // 只保留已配置的提供商
       .sort((a, b) => a.priority - b.priority) // 按優先級排序

      console.log(`🤖 AI提供商管理器初始化完成，可用提供商: ${this.providers.map(p => p.name).join(', ')}`)
    } catch (error) {
      console.error('❌ AI提供商管理器初始化失敗:', error)
    }
  }

  private async loadSettings(): Promise<any> {
    try {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'deepseekApiKey',
              'groqApiKey', 
              'geminiApiKey',
              'cohereApiKey',
              'openaiApiKey',
              'aiAutoFallback',
              'aiFailoverRetries'
            ]
          }
        }
      })

      const settingsObj: any = {}
      settings.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })

      this.maxRetries = parseInt(settingsObj.aiFailoverRetries) || 3
      
      return settingsObj
    } catch (error) {
      console.error('載入AI設定失敗:', error)
      return {}
    }
  }

  // 獲取下一個可用的AI提供商
  private getNextProvider(excludeProviders: string[] = []): AIProviderConfig | null {
    const availableProviders = this.providers.filter(p => 
      p.enabled && 
      p.failureCount < p.maxFailures &&
      !excludeProviders.includes(p.name)
    )

    if (availableProviders.length === 0) {
      return null
    }

    // 返回優先級最高的可用提供商
    return availableProviders[0]
  }

  // 智能AI文章改寫（自動故障切換）
  async rewriteArticleWithFallback(
    content: string, 
    keywords: string
  ): Promise<AIProviderResult> {
    const attemptedProviders: string[] = []
    let lastError: string = ''

    console.log('🤖 開始智能AI改寫，自動故障切換已啟用')

    while (attemptedProviders.length < this.providers.length) {
      const provider = this.getNextProvider(attemptedProviders)
      
      if (!provider) {
        console.log('❌ 所有AI提供商都已嘗試失敗')
        break
      }

      attemptedProviders.push(provider.name)
      console.log(`🔄 嘗試使用 ${provider.name} (優先級 ${provider.priority})`)

      try {
        const aiProvider = getAIProvider(provider.name)
        const result = await aiProvider.rewriteArticle(content, keywords, provider.key)
        
        // 成功時重置失敗計數
        provider.failureCount = 0
        provider.lastUsed = new Date()
        
        console.log(`✅ ${provider.name} 成功完成AI改寫`)
        
        return {
          success: true,
          content: result,
          provider: provider.name
        }
        
      } catch (error: any) {
        const errorMsg = error.message || '未知錯誤'
        lastError = errorMsg
        provider.failureCount++
        
        console.log(`❌ ${provider.name} 失敗 (${provider.failureCount}/${provider.maxFailures}): ${errorMsg}`)

        // 如果是配額限制，暫時禁用該提供商
        if (errorMsg.includes('quota') || errorMsg.includes('rate limit') || errorMsg.includes('exceeded')) {
          console.log(`⏸️ ${provider.name} 因配額限制暫時禁用`)
          provider.failureCount = provider.maxFailures
        }

        // 等待一段時間再嘗試下一個
        if (attemptedProviders.length < this.providers.length) {
          await this.delay(this.retryDelay)
        }
      }
    }

    return {
      success: false,
      provider: 'none',
      error: `所有AI提供商都失敗了。最後錯誤: ${lastError}`
    }
  }

  // 智能標題改寫（自動故障切換）
  async rewriteTitleWithFallback(
    title: string, 
    keywords: string
  ): Promise<AIProviderResult> {
    const attemptedProviders: string[] = []
    let lastError: string = ''

    console.log('🤖 開始智能標題改寫，自動故障切換已啟用')

    while (attemptedProviders.length < this.providers.length) {
      const provider = this.getNextProvider(attemptedProviders)
      
      if (!provider) {
        console.log('❌ 所有AI提供商都已嘗試失敗')
        break
      }

      attemptedProviders.push(provider.name)
      console.log(`🔄 嘗試使用 ${provider.name} 改寫標題`)

      try {
        const aiProvider = getAIProvider(provider.name)
        const result = await aiProvider.rewriteTitle(title, keywords, provider.key)
        
        // 成功時重置失敗計數
        provider.failureCount = 0
        provider.lastUsed = new Date()
        
        console.log(`✅ ${provider.name} 成功完成標題改寫`)
        
        return {
          success: true,
          content: result,
          provider: provider.name
        }
        
      } catch (error: any) {
        const errorMsg = error.message || '未知錯誤'
        lastError = errorMsg
        provider.failureCount++
        
        console.log(`❌ ${provider.name} 標題改寫失敗: ${errorMsg}`)

        // 如果是配額限制，暫時禁用該提供商
        if (errorMsg.includes('quota') || errorMsg.includes('rate limit')) {
          provider.failureCount = provider.maxFailures
        }

        // 等待後嘗試下一個
        if (attemptedProviders.length < this.providers.length) {
          await this.delay(this.retryDelay)
        }
      }
    }

    return {
      success: false,
      provider: 'none',
      error: `所有AI提供商標題改寫都失敗了。最後錯誤: ${lastError}`
    }
  }

  // 獲取提供商狀態
  getProviderStatus() {
    return this.providers.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      failureCount: p.failureCount,
      maxFailures: p.maxFailures,
      available: p.failureCount < p.maxFailures,
      lastUsed: p.lastUsed
    }))
  }

  // 重置提供商失敗計數
  resetFailureCount(providerName?: string) {
    if (providerName) {
      const provider = this.providers.find(p => p.name === providerName)
      if (provider) {
        provider.failureCount = 0
        console.log(`🔄 已重置 ${providerName} 失敗計數`)
      }
    } else {
      this.providers.forEach(p => p.failureCount = 0)
      console.log('🔄 已重置所有AI提供商失敗計數')
    }
  }

  // 重新初始化提供商（當設定更新時）
  async reload() {
    console.log('🔄 重新載入AI提供商配置...')
    await this.initializeProviders()
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 獲取推薦的提供商順序
  getRecommendedOrder(): string[] {
    return this.providers
      .filter(p => p.enabled)
      .sort((a, b) => a.priority - b.priority)
      .map(p => p.name)
  }
}

// 單例實例
let aiProviderManagerInstance: AIProviderManager | null = null

export function getAIProviderManager(): AIProviderManager {
  if (!aiProviderManagerInstance) {
    aiProviderManagerInstance = new AIProviderManager()
  }
  return aiProviderManagerInstance
}

// 導出單例實例
export const aiProviderManager = getAIProviderManager()

// 向後相容的函數（用於現有代碼）
export async function rewriteArticleWithAI(
  content: string,
  keywords: string,
  apiKey?: string,
  providerName?: string
): Promise<string> {
  // 檢查是否啟用自動切換
  const autoFallbackSetting = await prisma.setting.findUnique({
    where: { key: 'aiAutoFallback' }
  })

  if (autoFallbackSetting?.value === 'true') {
    // 使用智能故障切換
    const result = await aiProviderManager.rewriteArticleWithFallback(content, keywords)
    
    if (result.success && result.content) {
      return result.content
    } else {
      throw new Error(result.error || '所有AI提供商都失敗了')
    }
  } else {
    // 使用傳統單一提供商模式
    if (!providerName || !apiKey) {
      throw new Error('未啟用自動切換時需要提供 providerName 和 apiKey')
    }
    
    const aiProvider = getAIProvider(providerName)
    return await aiProvider.rewriteArticle(content, keywords, apiKey)
  }
}
