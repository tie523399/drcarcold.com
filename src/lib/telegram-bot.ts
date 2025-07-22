// Telegram Bot 服務
// 使用 Telegram Bot API 和多個 AI API 實現自動新聞抓取和改寫

import { prisma } from '@/lib/prisma'
import { rewriteWithAI, rewriteTitleWithAI } from '@/lib/ai-service'

interface BotSettings {
  telegramBotToken: string
  telegramChatId: string
  openaiApiKey: string
  autoNewsEnabled: boolean
  aiRewriteEnabled: boolean
  seoKeywords: string
  aiProvider: string
  groqApiKey: string
  geminiApiKey: string
  cohereApiKey: string
}

// 獲取設定值
async function getSettings(): Promise<BotSettings> {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'telegram_bot_token',
          'telegram_chat_id',
          'openai_api_key',
          'auto_news_enabled',
          'ai_rewrite_enabled',
          'seo_keywords',
          'ai_provider',
          'groq_api_key',
          'gemini_api_key',
          'cohere_api_key'
        ]
      }
    }
  })

  const settingsMap = new Map<string, string>(
    settings.map((s: { key: string; value: string }) => [s.key, s.value])
  )
  
  return {
    telegramBotToken: settingsMap.get('telegram_bot_token') || '',
    telegramChatId: settingsMap.get('telegram_chat_id') || '',
    openaiApiKey: settingsMap.get('openai_api_key') || '',
    autoNewsEnabled: settingsMap.get('auto_news_enabled') === 'true',
    aiRewriteEnabled: settingsMap.get('ai_rewrite_enabled') === 'true',
    seoKeywords: settingsMap.get('seo_keywords') || '',
    aiProvider: settingsMap.get('ai_provider') || 'openai',
    groqApiKey: settingsMap.get('groq_api_key') || '',
    geminiApiKey: settingsMap.get('gemini_api_key') || '',
    cohereApiKey: settingsMap.get('cohere_api_key') || '',
  }
}

// 獲取對應的 API Key
function getApiKey(settings: BotSettings): string {
  switch (settings.aiProvider) {
    case 'groq':
      return settings.groqApiKey
    case 'gemini':
      return settings.geminiApiKey
    case 'cohere':
      return settings.cohereApiKey
    case 'openai':
    default:
      return settings.openaiApiKey
  }
}

// 使用 AI 改寫文章（支援多個提供商）
export async function rewriteArticleWithAI(
  content: string,
  keywords: string,
  openaiApiKey: string
): Promise<string> {
  // 為了保持向後相容性，這個函數仍然使用 OpenAI
  // 新的系統會使用 rewriteArticleWithProvider
  if (!openaiApiKey) {
    throw new Error('OpenAI API Key 未設定')
  }

  return await rewriteWithAI(content, keywords, 'openai', openaiApiKey)
}

// 使用指定提供商改寫文章
export async function rewriteArticleWithProvider(
  content: string,
  keywords: string,
  provider: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error(`${provider} API Key 未設定`)
  }

  return await rewriteWithAI(content, keywords, provider, apiKey)
}

// 使用指定提供商改寫標題
export async function rewriteTitleWithProvider(
  title: string,
  keywords: string,
  provider: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error(`${provider} API Key 未設定`)
  }

  return await rewriteTitleWithAI(title, keywords, provider, apiKey)
}

// 處理 Telegram Bot 更新
export async function handleTelegramUpdate(update: any) {
  const settings = await getSettings()
  
  if (!settings.autoNewsEnabled) {
    return
  }

  if (!settings.telegramBotToken) {
    console.error('Telegram Bot Token 未設定')
    return
  }

  // 驗證訊息來源
  if (update.message && update.message.chat) {
    const chatId = String(update.message.chat.id)
    
    // 檢查是否為授權的用戶
    if (settings.telegramChatId && chatId !== settings.telegramChatId) {
      await sendTelegramMessage(
        update.message.chat.id,
        '❌ 您未被授權使用此機器人',
        settings.telegramBotToken
      )
      return
    }
    
    const messageText = update.message.text
    
    // 檢查是否為新聞連結
    if (messageText && messageText.startsWith('http')) {
      try {
        // 發送處理中訊息
        await sendTelegramMessage(
          update.message.chat.id,
          '⏳ 正在處理文章，請稍候...',
          settings.telegramBotToken
        )
        
        // 1. 爬取文章內容和詳細資訊（使用簡化版爬蟲）
        const { simpleScrapeArticle } = await import('./simple-scraper')
        const articleData = await simpleScrapeArticle(messageText)
        
        // 2. 如果啟用了 AI 改寫
        let finalContent = articleData.content
        let finalTitle = articleData.title
        
        if (settings.aiRewriteEnabled && getApiKey(settings)) {
          await sendTelegramMessage(
            update.message.chat.id,
            '🤖 正在使用 AI 改寫文章...',
            settings.telegramBotToken
          )
          
          finalContent = await rewriteArticleWithProvider(
            articleData.content,
            settings.seoKeywords,
            settings.aiProvider,
            getApiKey(settings)
          )
          
          // 也可以改寫標題
          try {
            finalTitle = await rewriteTitleWithProvider(
              articleData.title,
              settings.seoKeywords,
              settings.aiProvider,
              getApiKey(settings)
            )
          } catch (error) {
            // 標題改寫失敗，使用原標題
          }
        }
        
        // 3. 儲存到資料庫
        const news = await prisma.news.create({
          data: {
            title: finalTitle,
            slug: generateSlug(finalTitle),
            content: finalContent,
            excerpt: articleData.excerpt || finalContent.substring(0, 200),
            author: articleData.author || 'Telegram Bot',
            tags: JSON.stringify([
              ...(articleData.tags || []),
              ...settings.seoKeywords.split(',').map((k) => k.trim())
            ]),
            coverImage: null,
            isPublished: false,
          }
        })
        
        // 4. 回覆成功訊息
        await sendTelegramMessage(
          update.message.chat.id,
          `✅ 文章已成功處理並儲存為草稿！\n\n📝 文章標題: ${finalTitle}\n📝 文章 ID: ${news.id}\n👤 作者: ${articleData.author || 'Telegram Bot'}\n🏷️ 標籤: ${(articleData.tags || []).slice(0, 3).join(', ')}\n📊 內容長度: ${finalContent.length} 字\n${settings.aiRewriteEnabled ? '🤖 已使用 AI 改寫' : '📄 原始內容'}\n\n📌 請到後台編輯後發布`,
          settings.telegramBotToken
        )
        
      } catch (error) {
        console.error('處理文章失敗:', error)
        await sendTelegramMessage(
          update.message.chat.id,
          '❌ 處理文章時發生錯誤，請稍後再試',
          settings.telegramBotToken
        )
      }
    } else if (messageText === '/start') {
      // 回覆歡迎訊息
      await sendTelegramMessage(
        update.message.chat.id,
        `👋 歡迎使用車冷博士新聞機器人！\n\n📝 使用方式：\n直接發送新聞連結，我會自動抓取並處理文章\n\n🆔 您的 Chat ID: ${chatId}`,
        settings.telegramBotToken
      )
    } else if (messageText === '/help') {
      // 回覆幫助訊息
      await sendTelegramMessage(
        update.message.chat.id,
        `📖 使用指南：\n\n1. 發送新聞連結：我會自動爬取內容\n2. AI 改寫：如果啟用，會自動改寫文章\n3. 儲存草稿：文章會儲存到後台\n4. 手動發布：請到後台編輯後發布\n\n💡 指令：\n/start - 顯示歡迎訊息\n/help - 顯示此幫助\n/status - 查看機器人狀態`,
        settings.telegramBotToken
      )
    } else if (messageText === '/status') {
      // 回覆狀態訊息
      const providerNames = {
        openai: 'OpenAI',
        groq: 'Groq (免費)',
        gemini: 'Google Gemini (免費)',
        cohere: 'Cohere (免費)'
      }
      const currentProvider = providerNames[settings.aiProvider as keyof typeof providerNames] || settings.aiProvider
      
      await sendTelegramMessage(
        update.message.chat.id,
        `🤖 機器人狀態：\n\n✅ 自動新聞更新：${settings.autoNewsEnabled ? '已啟用' : '已停用'}\n✅ AI 改寫：${settings.aiRewriteEnabled ? '已啟用' : '已停用'}\n🔧 AI 提供商：${currentProvider}\n🔑 API Key：${getApiKey(settings) ? '已設定' : '未設定'}\n📝 SEO 關鍵字：${settings.seoKeywords || '未設定'}`,
        settings.telegramBotToken
      )
    }
  }
}

// 發送 Telegram 訊息
export async function sendTelegramMessage(chatId: number | string, text: string, botToken: string) {
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('發送 Telegram 訊息失敗:', error)
  }
}

// 爬取文章內容（使用簡化版爬蟲系統）
async function fetchArticleContent(url: string): Promise<string> {
  const { simpleScrapeArticle } = await import('./simple-scraper')
  
  try {
    console.log(`開始爬取文章: ${url}`)
    const articleData = await simpleScrapeArticle(url)
    
    // 格式化文章內容
    let formattedContent = `# ${articleData.title}\n\n`
    
    if (articleData.author) {
      formattedContent += `**作者**: ${articleData.author}\n`
    }
    
    if (articleData.publishDate) {
      formattedContent += `**發布時間**: ${articleData.publishDate}\n`
    }
    
    if (articleData.source) {
      formattedContent += `**來源**: ${articleData.source}\n`
    }
    
    formattedContent += `**原文連結**: ${articleData.url}\n\n`
    
    if (articleData.excerpt) {
      formattedContent += `## 摘要\n${articleData.excerpt}\n\n`
    }
    
    formattedContent += `## 內容\n${articleData.content}\n\n`
    
    if (articleData.tags && articleData.tags.length > 0) {
      formattedContent += `**標籤**: ${articleData.tags.join(', ')}\n\n`
    }
    
    console.log(`文章爬取成功: ${articleData.title}`)
    return formattedContent
  } catch (error) {
    console.error('文章爬取失敗:', error)
    throw new Error(`無法爬取文章內容: ${error instanceof Error ? error.message : '未知錯誤'}`)
  }
}

// 生成 slug
function generateSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .trim()
    // 移除中文字符
    .replace(/[\u4e00-\u9fa5]/g, '')
    // 移除特殊字符，只保留英文、數字
    .replace(/[^\w\s-]/g, '')
    // 替換空格為連字符
    .replace(/[\s_]+/g, '-')
    // 移除首尾連字符
    .replace(/^-+|-+$/g, '')
  
  // 如果 slug 太短，使用預設值
  if (!slug || slug.length < 3) {
    slug = 'article'
  }
  
  // 限制長度
  slug = slug.substring(0, 50)
  
  // 加上時間戳後 8 位
  return slug + '-' + Date.now().toString().slice(-8)
} 