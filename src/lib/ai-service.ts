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
  }
}

// Groq 提供商
const groqProvider: AIProvider = {
  name: 'Groq',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
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
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
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
  }
}

// Google Gemini 提供商
const geminiProvider: AIProvider = {
  name: 'Google Gemini',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
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
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
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
  }
}

// Cohere 提供商
const cohereProvider: AIProvider = {
  name: 'Cohere',
  async rewriteArticle(content: string, keywords: string, apiKey: string): Promise<string> {
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
    })

    if (!response.ok) {
      throw new Error(`Cohere API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    return processAIResponse(data.generations[0].text.trim(), 'Cohere')
  },

  async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    const prompt = `你是一個專業的汽車冷氣和冷媒領域的內容編輯。請改寫以下標題，讓它更適合SEO並包含這些關鍵字：${keywords}。

重要要求：
1. 必須使用繁體中文（Traditional Chinese）
2. 禁止使用簡體中文字符
3. 保持標題簡潔有力，不超過50個字
4. 適當融入 SEO 關鍵字
5. 確保標題吸引人且專業

請確認你的回應完全使用繁體中文。

請將以下標題改寫為繁體中文，並融入相關關鍵字：${title}`

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
    })

    if (!response.ok) {
      throw new Error(`Cohere API 請求失敗: ${response.status}`)
    }

    const data = await response.json()
    return processAIResponse(data.generations[0].text.trim(), 'Cohere Title')
  }
}

// 提供商映射
const providers: Record<string, AIProvider> = {
  openai: openaiProvider,
  groq: groqProvider,
  gemini: geminiProvider,
  cohere: cohereProvider,
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