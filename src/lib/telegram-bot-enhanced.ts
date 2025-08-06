// 增強版 Telegram Bot - 整合爬蟲控制功能
// 提供更完整的爬蟲管理介面

import { prisma } from '@/lib/prisma'
import { AutoNewsCrawler } from '@/lib/auto-news-crawler'
// 移除對已刪除telegram-bot的引用
import { MonitoringService } from '@/lib/monitoring-service'
import * as cheerio from 'cheerio'

// 簡單的文章爬取函數
async function simpleScrapeArticle(url: string): Promise<any> {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)
  
  // 基本的文章內容提取
  const title = $('h1').first().text() || $('title').text() || '無標題'
  const content = $('article, .content, .post-content, .entry-content, main p').text().slice(0, 2000) || '無內容'
  const author = $('meta[name="author"]').attr('content') || $('.author').text() || '未知作者'
  
  return {
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    url,
    tags: []
  }
}

// Telegram 消息發送函數
export async function sendTelegramMessage(chatId: string, message: string, botToken?: string): Promise<void> {
  try {
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      console.error('Telegram Bot Token 未設置')
      return
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    })
  } catch (error) {
    console.error('發送 Telegram 消息失敗:', error)
  }
}

// Bot 指令列表
const COMMANDS = {
  START: '/start',
  HELP: '/help',
  STATUS: '/status',
  CRAWL_START: '/crawl_start',
  CRAWL_STOP: '/crawl_stop',
  CRAWL_NOW: '/crawl_now',
  CRAWL_SOURCES: '/crawl_sources',
  CRAWL_HISTORY: '/crawl_history',
  CRAWL_STATS: '/crawl_stats',
  ADD_SOURCE: '/add_source',
  REMOVE_SOURCE: '/remove_source',
  TOGGLE_SOURCE: '/toggle_source',
  SET_INTERVAL: '/set_interval',
  SET_KEYWORDS: '/set_keywords',
  QUALITY_CHECK: '/quality_check'
}

// Bot 控制器類別
export class TelegramBotController {
  private crawler: AutoNewsCrawler
  private monitor: MonitoringService | null = null
  private chatId: string
  private botToken: string
  
  constructor(chatId: string, botToken: string) {
    this.chatId = chatId
    this.botToken = botToken
    this.crawler = new AutoNewsCrawler()
  }
  
  /**
   * 處理 Telegram 更新
   */
  async handleUpdate(update: any): Promise<void> {
    if (!update.message?.text) return
    
    const message = update.message.text
    const command = message.split(' ')[0]
    const args = message.split(' ').slice(1)
    
    try {
      switch (command) {
        case COMMANDS.START:
        case COMMANDS.HELP:
          await this.sendHelpMessage()
          break
          
        case COMMANDS.STATUS:
          await this.sendStatusMessage()
          break
          
        case COMMANDS.CRAWL_START:
          await this.startAutoCrawl()
          break
          
        case COMMANDS.CRAWL_STOP:
          await this.stopAutoCrawl()
          break
          
        case COMMANDS.CRAWL_NOW:
          await this.crawlNow()
          break
          
        case COMMANDS.CRAWL_SOURCES:
          await this.listSources()
          break
          
        case COMMANDS.CRAWL_HISTORY:
          await this.showHistory(args[0] ? parseInt(args[0]) : 10)
          break
          
        case COMMANDS.CRAWL_STATS:
          await this.showStats(args[0] ? parseInt(args[0]) : 7)
          break
          
        case COMMANDS.ADD_SOURCE:
          await this.addSource(args)
          break
          
        case COMMANDS.REMOVE_SOURCE:
          await this.removeSource(args[0])
          break
          
        case COMMANDS.TOGGLE_SOURCE:
          await this.toggleSource(args[0])
          break
          
        case COMMANDS.SET_INTERVAL:
          await this.setInterval(args[0])
          break
          
        case COMMANDS.SET_KEYWORDS:
          await this.setKeywords(args.join(' '))
          break
          
        case COMMANDS.QUALITY_CHECK:
          await this.checkQuality(args.join(' '))
          break
          
        default:
          // 如果不是指令，檢查是否為 URL
          if (message.startsWith('http')) {
            await this.crawlSingleUrl(message)
          } else {
            await this.sendMessage('❓ 未知指令。請輸入 /help 查看可用指令。')
          }
      }
    } catch (error) {
      console.error('處理指令時發生錯誤:', error)
      await this.sendMessage(`❌ 執行指令時發生錯誤：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 發送幫助訊息
   */
  private async sendHelpMessage(): Promise<void> {
    const helpText = `
🤖 *車冷博士爬蟲機器人*

*基本指令：*
/help - 顯示此幫助訊息
/status - 查看爬蟲狀態

*爬蟲控制：*
/crawl\\_start - 啟動自動爬蟲
/crawl\\_stop - 停止自動爬蟲
/crawl\\_now - 立即執行一次爬取
[URL] - 爬取單一文章

*來源管理：*
/crawl\\_sources - 列出所有新聞來源
/add\\_source [名稱] [URL] - 新增來源
/remove\\_source [ID] - 移除來源
/toggle\\_source [ID] - 啟用/停用來源

*設定管理：*
/set\\_interval [分鐘] - 設定爬取間隔
/set\\_keywords [關鍵字] - 設定 SEO 關鍵字

*統計資訊：*
/crawl\\_history [數量] - 查看爬取歷史
/crawl\\_stats [天數] - 查看統計資料
/quality\\_check [URL] - 檢查文章品質

*使用範例：*
\`/add_source U-CAR https://news.u-car.com.tw/\`
\`/set_interval 120\`
\`/set_keywords 汽車冷媒,R134a,冷氣保養\`
    `
    
    await this.sendMessage(helpText, { parse_mode: 'Markdown' })
  }
  
  /**
   * 發送狀態訊息
   */
  private async sendStatusMessage(): Promise<void> {
    // TODO: 需要在 AutoNewsCrawler 中添加 getStatus 方法
    const settings = await this.getSettings()
    const sources = await prisma.newsSource.findMany({
      where: { enabled: true }
    })
    
    const statusText = `
📊 *爬蟲系統狀態*

⏱️ *爬取間隔*: ${settings.crawlInterval} 分鐘
📰 *啟用來源*: ${sources.length} 個
🤖 *AI 改寫*: ${settings.aiRewriteEnabled ? '✅ 啟用' : '❌ 停用'}
📝 *SEO 關鍵字*: ${settings.seoKeywords || '未設定'}

💾 *資料庫統計*:
- 總文章數: ${await prisma.news.count()}
- 已發布: ${await prisma.news.count({ where: { isPublished: true } })}
- 草稿: ${await prisma.news.count({ where: { isPublished: false } })}
    `
    
    await this.sendMessage(statusText, { parse_mode: 'Markdown' })
  }
  
  /**
   * 啟動自動爬蟲
   */
  private async startAutoCrawl(): Promise<void> {
    await this.sendMessage('⏳ 正在啟動自動爬蟲...')
    
    try {
      await this.crawler.startAutoCrawl()
      await this.sendMessage('✅ 自動爬蟲已啟動！')
    } catch (error) {
      await this.sendMessage(`❌ 啟動失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 停止自動爬蟲
   */
  private async stopAutoCrawl(): Promise<void> {
    await this.sendMessage('⏳ 正在停止自動爬蟲...')
    
    try {
      await this.crawler.stopAutoCrawl()
      await this.sendMessage('⏹️ 自動爬蟲已停止。')
    } catch (error) {
      await this.sendMessage(`❌ 停止失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 立即執行爬取
   */
  private async crawlNow(): Promise<void> {
    await this.sendMessage('🚀 開始執行爬取...')
    
    try {
      const results = await this.crawler.performCrawl()
      
      // 生成結果摘要
      let summary = '📊 *爬取完成摘要*\n\n'
      
      results.forEach(result => {
        const emoji = result.success ? '✅' : '❌'
        summary += `${emoji} *來源處理結果*\n`
        summary += `  • 找到: ${result.articlesFound} 篇\n`
        summary += `  • 處理: ${result.articlesProcessed} 篇\n`
        summary += `  • 發布: ${result.articlesPublished} 篇\n`
        
        if (result.errors.length > 0) {
          summary += `  • 錯誤: ${result.errors.length} 個\n`
        }
        summary += '\n'
      })
      
      await this.sendMessage(summary, { parse_mode: 'Markdown' })
    } catch (error) {
      await this.sendMessage(`❌ 爬取失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 列出新聞來源
   */
  private async listSources(): Promise<void> {
    const sources = await prisma.newsSource.findMany({
      orderBy: { createdAt: 'asc' }
    })
    
    if (sources.length === 0) {
      await this.sendMessage('📭 目前沒有設定任何新聞來源。')
      return
    }
    
    let message = '📰 *新聞來源列表*\n\n'
    
    sources.forEach(source => {
      const status = source.enabled ? '✅' : '⏸️'
      message += `${status} *${source.name}* (ID: ${source.id})\n`
      message += `   URL: ${source.url}\n`
      message += `   每次爬取: ${source.maxArticlesPerCrawl} 篇\n`
      message += `   間隔: ${source.crawlInterval} 分鐘\n`
      
      if (source.lastCrawl) {
        message += `   最後爬取: ${new Date(source.lastCrawl).toLocaleString('zh-TW')}\n`
      }
      message += '\n'
    })
    
    await this.sendMessage(message, { parse_mode: 'Markdown' })
  }
  
  /**
   * 顯示爬取歷史
   */
  private async showHistory(limit: number): Promise<void> {
    if (!this.monitor) {
      this.monitor = await this.initMonitor()
    }
    
    const history = await this.monitor.getCrawlHistory(limit)
    
    if (history.length === 0) {
      await this.sendMessage('📭 沒有爬取歷史記錄。')
      return
    }
    
    let message = `📜 *最近 ${limit} 筆爬取記錄*\n\n`
    
    history.forEach(record => {
      const emoji = record.success ? '✅' : '❌'
      const time = new Date(record.createdAt).toLocaleString('zh-TW')
      
      message += `${emoji} ${record.sourceName}\n`
      message += `   時間: ${time}\n`
      message += `   耗時: ${record.duration}秒\n`
      message += `   處理: ${record.articlesProcessed}/${record.articlesFound} 篇\n\n`
    })
    
    await this.sendMessage(message, { parse_mode: 'Markdown' })
  }
  
  /**
   * 顯示統計資料
   */
  private async showStats(days: number): Promise<void> {
    if (!this.monitor) {
      this.monitor = await this.initMonitor()
    }
    
    const stats = await this.monitor.getStatsSummary(days)
    
    if (!stats) {
      await this.sendMessage('📊 無法獲取統計資料。')
      return
    }
    
    const message = `
📈 *過去 ${days} 天統計*

📊 *爬取統計*:
• 總次數: ${stats.total_crawls}
• 成功: ${stats.successful_crawls}
• 失敗: ${stats.failed_crawls}
• 成功率: ${Math.round((stats.successful_crawls / stats.total_crawls) * 100)}%

📰 *文章統計*:
• 總處理: ${stats.total_articles}
• 總發布: ${stats.total_published}
• 平均耗時: ${Math.round(stats.avg_duration)}秒

📊 *效能指標*:
• 平均每次處理: ${Math.round(stats.total_articles / stats.total_crawls)} 篇
• 發布率: ${Math.round((stats.total_published / stats.total_articles) * 100)}%
    `
    
    await this.sendMessage(message, { parse_mode: 'Markdown' })
  }
  
  /**
   * 爬取單一 URL
   */
  private async crawlSingleUrl(url: string): Promise<void> {
    // 使用現有的 Telegram Bot 處理邏輯
    await this.sendMessage('⏳ 正在處理文章，請稍候...')
    
    try {
      // 使用本地的 simpleScrapeArticle 函數
      const articleData = await simpleScrapeArticle(url)
      
      // 處理文章...
      await this.sendMessage(`✅ 文章爬取成功：${articleData.title}`)
    } catch (error) {
      await this.sendMessage(`❌ 爬取失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 輔助方法：發送訊息
   */
  private async sendMessage(text: string, options?: any): Promise<void> {
    await sendTelegramMessage(this.chatId, text, this.botToken)
  }
  
  /**
   * 輔助方法：獲取設定
   */
  private async getSettings(): Promise<any> {
    // 從資料庫獲取設定
    const settings = await prisma.setting.findMany()
    const settingsMap = new Map(settings.map(s => [s.key, s.value]))
    
    return {
      crawlInterval: parseInt(settingsMap.get('auto_crawl_interval') || '60'),
      aiRewriteEnabled: settingsMap.get('ai_rewrite_enabled') === 'true',
      seoKeywords: settingsMap.get('seo_keywords') || ''
    }
  }
  
  /**
   * 輔助方法：初始化監控服務
   */
  private async initMonitor(): Promise<MonitoringService> {
    const settings = await this.getSettings()
    
    return new MonitoringService({
      enableTelegram: true,
      telegramBotToken: this.botToken,
      telegramChatId: this.chatId,
      enableEmail: false,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notifyOnPartialSuccess: true
    })
  }
  
  /**
   * 新增新聞來源
   */
  private async addSource(args: string[]): Promise<void> {
    if (args.length < 2) {
      await this.sendMessage('❌ 請提供來源名稱和 URL。例如：/add_source U-CAR https://news.u-car.com.tw/')
      return
    }
    
    const [name, ...urlParts] = args
    const url = urlParts.join(' ')
    
    try {
      const source = await prisma.newsSource.create({
        data: {
          name,
          url,
          enabled: true,
          maxArticlesPerCrawl: 10,
          crawlInterval: 60
        }
      })
      
      await this.sendMessage(`✅ 已新增新聞來源：${name} (ID: ${source.id})`)
    } catch (error) {
      await this.sendMessage(`❌ 新增失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 移除新聞來源
   */
  private async removeSource(sourceId: string): Promise<void> {
    if (!sourceId) {
      await this.sendMessage('❌ 請提供來源 ID。例如：/remove_source abc123')
      return
    }
    
    try {
      await prisma.newsSource.delete({
        where: { id: sourceId }
      })
      
      await this.sendMessage(`✅ 已移除新聞來源 (ID: ${sourceId})`)
    } catch (error) {
      await this.sendMessage(`❌ 移除失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 切換新聞來源狀態
   */
  private async toggleSource(sourceId: string): Promise<void> {
    if (!sourceId) {
      await this.sendMessage('❌ 請提供來源 ID。例如：/toggle_source abc123')
      return
    }
    
    try {
      const source = await prisma.newsSource.findUnique({
        where: { id: sourceId }
      })
      
      if (!source) {
        await this.sendMessage('❌ 找不到指定的新聞來源。')
        return
      }
      
      await prisma.newsSource.update({
        where: { id: sourceId },
        data: { enabled: !source.enabled }
      })
      
      const status = !source.enabled ? '啟用' : '停用'
      await this.sendMessage(`✅ 已${status}新聞來源：${source.name}`)
    } catch (error) {
      await this.sendMessage(`❌ 操作失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 設定爬取間隔
   */
  private async setInterval(minutes: string): Promise<void> {
    const interval = parseInt(minutes)
    
    if (isNaN(interval) || interval < 1) {
      await this.sendMessage('❌ 請提供有效的分鐘數（至少 1 分鐘）。例如：/set_interval 60')
      return
    }
    
    try {
      await prisma.setting.upsert({
        where: { key: 'auto_crawl_interval' },
        update: { value: interval.toString() },
        create: { key: 'auto_crawl_interval', value: interval.toString() }
      })
      
      await this.sendMessage(`✅ 已設定爬取間隔為 ${interval} 分鐘。`)
    } catch (error) {
      await this.sendMessage(`❌ 設定失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 設定 SEO 關鍵字
   */
  private async setKeywords(keywords: string): Promise<void> {
    if (!keywords) {
      await this.sendMessage('❌ 請提供關鍵字。例如：/set_keywords 汽車冷媒,R134a,冷氣保養')
      return
    }
    
    try {
      await prisma.setting.upsert({
        where: { key: 'seo_keywords' },
        update: { value: keywords },
        create: { key: 'seo_keywords', value: keywords }
      })
      
      await this.sendMessage(`✅ 已設定 SEO 關鍵字：${keywords}`)
    } catch (error) {
      await this.sendMessage(`❌ 設定失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
  
  /**
   * 檢查文章品質
   */
  private async checkQuality(url: string): Promise<void> {
    if (!url || !url.startsWith('http')) {
      await this.sendMessage('❌ 請提供有效的文章 URL。例如：/quality_check https://example.com/article')
      return
    }
    
    await this.sendMessage('⏳ 正在分析文章品質...')
    
    try {
      const { ContentQualityChecker } = await import('./content-quality-checker')
      
      const articleData = await simpleScrapeArticle(url)
      const qualityChecker = new ContentQualityChecker()
      const settings = await this.getSettings()
      const keywords = settings.seoKeywords ? settings.seoKeywords.split(',').map((k: string) => k.trim()) : []
      
      const qualityScore = qualityChecker.checkQuality({
        title: articleData.title,
        content: articleData.content,
        author: articleData.author,
        publishDate: articleData.publishDate,
        tags: articleData.tags || []
      }, keywords)
      
      let message = `📊 *文章品質分析結果*\n\n`
      message += `📰 標題: ${articleData.title}\n`
      message += `📈 總分: ${qualityScore.overall}/100\n\n`
      
      if (qualityScore.issues.length > 0) {
        message += `*發現問題:*\n`
        qualityScore.issues.forEach(issue => {
          message += `• ${issue}\n`
        })
        message += '\n'
      }
      
      if (qualityScore.suggestions.length > 0) {
        message += `*改善建議:*\n`
        qualityScore.suggestions.forEach(suggestion => {
          message += `• ${suggestion}\n`
        })
      }
      
      await this.sendMessage(message, { parse_mode: 'Markdown' })
    } catch (error) {
      await this.sendMessage(`❌ 分析失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
} 