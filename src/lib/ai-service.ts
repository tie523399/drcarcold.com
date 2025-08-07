// AI 服務統一介面
// 支援 OpenAI, Groq, Gemini, Cohere 等多個提供商

import { ensureTraditionalChinese, isTraditionalChinese, generateConversionReport } from '@/lib/chinese-converter'

/**
 * 處理AI回應，確保輸出是繁體中文
 * @param content AI回應的內容
 * @param provider AI提供商名稱
 * @returns 處理後的繁體中文內容
 */
function processAIResponse(content: string, provider: string): string {
  const result = ensureTraditionalChinese(content)
  if (result.hasSimplified) {
    console.log(`[${provider}] 檢測到簡體字：${result.simplifiedChars.join(', ')}，已自動轉換為繁體`)
  }
  return result.text
}

export interface AIProvider {
  name: string
  rewriteArticle: (content: string, keywords: string, apiKey: string) => Promise<string>
  rewriteTitle: (title: string, keywords: string, apiKey: string) => Promise<string>
}

// 延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 重試配置
const AI_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000
}

// 通用重試包裝器
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  provider: string
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= AI_RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`[${provider}] 嘗試 ${attempt}/${AI_RETRY_CONFIG.maxRetries}`)
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.error(`[${provider}] 嘗試 ${attempt} 失敗:`, error)
      
      if (attempt < AI_RETRY_CONFIG.maxRetries) {
        const delayTime = Math.min(
          AI_RETRY_CONFIG.initialDelay * Math.pow(2, attempt - 1),
          AI_RETRY_CONFIG.maxDelay
        )
        console.log(`[${provider}] 等待 ${delayTime}ms 後重試...`)
        await delay(delayTime)
      }
    }
  }
  
  throw new Error(`[${provider}] 所有嘗試都失敗: ${lastError?.message || '未知錯誤'}`)
}

// OpenAI 提供商
const openaiProvider: AIProvider = {
  name: 'OpenAI',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。`
          },
          {
            role: 'user',
            content: `請將以下內容改寫為繁體中文，並融入相關關鍵字：\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    const rewrittenContent = data.choices[0].message.content
    return processAIResponse(rewrittenContent, 'OpenAI')
    }, 'OpenAI')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。`
          },
          {
            role: 'user',
            content: `請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    const rewrittenTitle = data.choices[0].message.content.trim()
    return processAIResponse(rewrittenTitle, 'OpenAI Title')
    }, 'OpenAI Title')
  }
}

// Groq 提供商
const groqProvider: AIProvider = {
  name: 'Groq',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。`
          },
          {
            role: 'user',
            content: `請將以下內容改寫為繁體中文，並融入相關關鍵字：\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    const rewrittenContent = data.choices[0].message.content
    return processAIResponse(rewrittenContent, 'Groq')
    }, 'Groq')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。`
          },
          {
            role: 'user',
            content: `請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    return processAIResponse(data.choices[0].message.content.trim(), 'Groq Title')
    }, 'Groq Title')
  }
}

// Google Gemini 提供商
const geminiProvider: AIProvider = {
  name: 'Google Gemini',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const prompt = `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。

請將以下內容改寫為繁體中文，並融入相關關鍵字：

${content}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    return processAIResponse(data.candidates[0].content.parts[0].text, 'Gemini')
    }, 'Gemini')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
    const prompt = `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。

請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`Gemini API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    return processAIResponse(data.candidates[0].content.parts[0].text.trim(), 'Gemini Title')
    }, 'Gemini Title')
  }
}

// Cohere 提供商
const cohereProvider: AIProvider = {
  name: 'Cohere',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const prompt = `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。

請將以下內容改寫為繁體中文，並融入相關關鍵字：

${content}`

      // 創建一個帶超時的 fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超時

      try {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'command-r-plus',
            prompt: prompt,
            max_tokens: 2000,
            temperature: 0.7,
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Cohere API 請求失敗: ${response.status}`)
        }

        const data = await response.json()
        return processAIResponse(data.generations[0].text.trim(), 'Cohere')
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          throw new Error('Cohere API 請求超時 (30秒)')
        }
        throw error
      }
    }, 'Cohere')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const prompt = `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。

請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`

      // 創建一個帶超時的 fetch
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超時（標題較短）

      try {
        const response = await fetch('https://api.cohere.ai/v1/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'command-r-plus',
            prompt: prompt,
            max_tokens: 100,
            temperature: 0.7,
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Cohere API 請求失敗: ${response.status}`)
        }

        const data = await response.json()
        return processAIResponse(data.generations[0].text.trim(), 'Cohere Title')
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          throw new Error('Cohere API 標題生成請求超時 (15秒)')
        }
        throw error
      }
    }, 'Cohere Title')
  }
}

// DeepSeek 提供商（免費額度最大）
const deepseekProvider: AIProvider = {
  name: 'DeepSeek',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。`
            },
            {
              role: 'user',
              content: `請將以下內容改寫為繁體中文，並融入相關關鍵字：\n\n${content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DeepSeek API 請求失敗: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return processAIResponse(data.choices[0].message.content, 'DeepSeek')
    }, 'DeepSeek')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。`
            },
            {
              role: 'user',
              content: `請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`
            }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`DeepSeek API 請求失敗: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return processAIResponse(data.choices[0].message.content.trim(), 'DeepSeek Title')
    }, 'DeepSeek Title')
  }
}

// Zhipu AI 提供商
const zhipuProvider: AIProvider = {
  name: 'Zhipu AI',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            {
              role: 'system',
              content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下文章，並確保包含這些 SEO 關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持專業性和可讀性
4. 確保內容流暢自然
5. 適當融入 SEO 關鍵字
6. 保持原文的核心意思

請確認你的回應完全使用繁體中文。`
            },
            {
              role: 'user',
              content: `請將以下內容改寫為繁體中文，並融入相關關鍵字：\n\n${content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Zhipu API 請求失敗: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return processAIResponse(data.choices[0].message.content, 'Zhipu')
    }, 'Zhipu')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    return retryWithBackoff(async () => {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4-flash',
          messages: [
            {
              role: 'system',
              content: `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。`
            },
            {
              role: 'user',
              content: `請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`
            }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Zhipu API 請求失敗: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return processAIResponse(data.choices[0].message.content.trim(), 'Zhipu Title')
    }, 'Zhipu Title')
  }
}

// 提供商映射
const providers: Record<string, AIProvider> = {
  deepseek: deepseekProvider,
  groq: groqProvider,
  gemini: geminiProvider,
  cohere: cohereProvider,
  zhipu: zhipuProvider,
  openai: openaiProvider,
}

// 獲取 AI 提供商
export function getAIProvider(providerName: string): AIProvider {
  const provider = providers[providerName]
  if (!provider) {
    throw new Error(`不支援的 AI 提供商: ${providerName}`)
  }
  return provider
}

// 統一的 AI 改寫介面
export async function rewriteWithAI(
  content: string,
  keywords: string,
  providerName: string,
  apiKey: string
): Promise<string> {
  const provider = getAIProvider(providerName)
  return await provider.rewriteArticle(content, keywords, apiKey)
}

// 統一的標題改寫介面
export async function rewriteTitleWithAI(
  title: string,
  keywords: string,
  providerName: string,
  apiKey: string
): Promise<string> {
  const provider = getAIProvider(providerName)
  return await provider.rewriteTitle(title, keywords, apiKey)
}

// 導入智能調度管理器
import { smartScheduleManager } from './smart-schedule-manager'
import { prisma } from './prisma'

/**
 * 智能AI調用 - 自動選擇最佳提供商並處理fallback
 */
export async function rewriteArticleWithAI(content: string, keywords: string): Promise<string> {
  console.log('🧠 開始智能AI改寫文章...')
  
  // 獲取推薦的AI提供商
  const recommendedProvider = await smartScheduleManager.getRecommendedProvider()
  
  if (!recommendedProvider) {
    console.warn('⚠️ 沒有可用的AI提供商，使用原始內容')
    return content
  }

  // 獲取可用的提供商列表（按優先級排序）
  const availableProviders = ['deepseek', 'groq', 'gemini', 'cohere', 'zhipu', 'openai']
  
  for (const providerName of availableProviders) {
    try {
      // 檢查是否可以調用
      const canCall = await smartScheduleManager.canMakeAPICall(providerName)
      if (!canCall) {
        console.log(`⏳ ${providerName} 已達到限制，跳過`)
        continue
      }

      // 獲取API Key
      const apiKeySetting = await prisma.setting.findUnique({
        where: { key: `${providerName}ApiKey` }
      })

      if (!apiKeySetting?.value) {
        console.log(`❌ ${providerName} 沒有配置API Key，跳過`)
        continue
      }

      console.log(`🚀 嘗試使用 ${providerName} 改寫文章...`)
      
      // 調用AI改寫
      const result = await rewriteWithAI(content, keywords, providerName, apiKeySetting.value)
      
      // 記錄成功
      await smartScheduleManager.recordAPIUsage(providerName, true)
      
      console.log(`✅ ${providerName} 改寫成功`)
      return result

    } catch (error) {
      console.error(`❌ ${providerName} 改寫失敗:`, error)
      
      // 記錄失敗
      await smartScheduleManager.recordAPIUsage(providerName, false)
      
      // 繼續嘗試下一個提供商
      continue
    }
  }

  console.warn('⚠️ 所有AI提供商都失敗，使用原始內容')
  return content
}

/**
 * 智能標題改寫
 */
export async function rewriteTitleWithSmartAI(title: string, keywords: string): Promise<string> {
  console.log('🧠 開始智能AI改寫標題...')
  
  // 獲取可用的提供商列表（按優先級排序）
  const availableProviders = ['deepseek', 'groq', 'gemini', 'cohere', 'zhipu', 'openai']
  
  for (const providerName of availableProviders) {
    try {
      // 檢查是否可以調用
      const canCall = await smartScheduleManager.canMakeAPICall(providerName)
      if (!canCall) {
        console.log(`⏳ ${providerName} 已達到限制，跳過`)
        continue
      }

      // 獲取API Key
      const apiKeySetting = await prisma.setting.findUnique({
        where: { key: `${providerName}ApiKey` }
      })

      if (!apiKeySetting?.value) {
        console.log(`❌ ${providerName} 沒有配置API Key，跳過`)
        continue
      }

      console.log(`🚀 嘗試使用 ${providerName} 改寫標題...`)
      
      // 調用AI改寫
      const result = await rewriteTitleWithAI(title, keywords, providerName, apiKeySetting.value)
      
      // 記錄成功
      await smartScheduleManager.recordAPIUsage(providerName, true)
      
      console.log(`✅ ${providerName} 標題改寫成功`)
      return result

    } catch (error) {
      console.error(`❌ ${providerName} 標題改寫失敗:`, error)
      
      // 記錄失敗
      await smartScheduleManager.recordAPIUsage(providerName, false)
      
      // 繼續嘗試下一個提供商
      continue
    }
  }

  console.warn('⚠️ 所有AI提供商都失敗，使用原始標題')
  return title
} 