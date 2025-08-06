// 監控和通知服務
// 負責記錄爬取活動、分析結果並發送通知

import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram-bot-enhanced'

// 爬取結果統計
export interface CrawlStats {
  sourceId: string
  sourceName: string
  startTime: Date
  endTime: Date
  duration: number // 秒
  articlesFound: number
  articlesProcessed: number
  articlesPublished: number
  articlesFailed: number
  errors: string[]
  success: boolean
}

// 監控配置
export interface MonitoringConfig {
  enableTelegram: boolean
  telegramChatId?: string
  telegramBotToken?: string
  enableEmail: boolean
  emailTo?: string[]
  emailApiKey?: string
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  notifyOnPartialSuccess: boolean
}

// 爬取日誌級別
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

// 爬取日誌
export interface CrawlLog {
  level: LogLevel
  message: string
  timestamp: Date
  details?: any
}

export class MonitoringService {
  private config: MonitoringConfig
  private logs: CrawlLog[] = []
  private stats: Map<string, CrawlStats> = new Map()
  
  constructor(config: MonitoringConfig) {
    this.config = config
  }
  
  // 記錄日誌
  log(level: LogLevel, message: string, details?: any) {
    const log: CrawlLog = {
      level,
      message,
      timestamp: new Date(),
      details
    }
    
    this.logs.push(log)
    console.log(`[${level}] ${message}`, details || '')
  }
  
  // 開始監控爬取
  startCrawl(sourceId: string, sourceName: string): void {
    this.stats.set(sourceId, {
      sourceId,
      sourceName,
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPublished: 0,
      articlesFailed: 0,
      errors: [],
      success: false
    })
    
    this.log(LogLevel.INFO, `開始爬取 ${sourceName}`)
  }
  
  // 更新爬取統計
  updateStats(sourceId: string, updates: Partial<CrawlStats>): void {
    const current = this.stats.get(sourceId)
    if (current) {
      this.stats.set(sourceId, { ...current, ...updates })
    }
  }
  
  // 記錄錯誤
  recordError(sourceId: string, error: string): void {
    const current = this.stats.get(sourceId)
    if (current) {
      current.errors.push(error)
      this.log(LogLevel.ERROR, error, { sourceId })
    }
  }
  
  // 結束爬取
  async endCrawl(sourceId: string): Promise<void> {
    const stats = this.stats.get(sourceId)
    if (!stats) return
    
    stats.endTime = new Date()
    stats.duration = Math.round((stats.endTime.getTime() - stats.startTime.getTime()) / 1000)
    stats.success = stats.errors.length === 0 && stats.articlesProcessed > 0
    
    // 判斷結果類型
    const resultType = this.getResultType(stats)
    
    // 記錄到資料庫
    await this.saveCrawlRecord(stats)
    
    // 發送通知
    if (this.shouldNotify(resultType)) {
      await this.sendNotifications(stats, resultType)
    }
    
    this.log(LogLevel.INFO, `爬取結束 ${stats.sourceName}`, {
      duration: `${stats.duration}秒`,
      processed: stats.articlesProcessed,
      published: stats.articlesPublished
    })
  }
  
  // 判斷結果類型
  private getResultType(stats: CrawlStats): 'success' | 'partial' | 'failure' {
    if (stats.errors.length === 0 && stats.articlesProcessed > 0) {
      return 'success'
    } else if (stats.articlesProcessed > 0) {
      return 'partial'
    } else {
      return 'failure'
    }
  }
  
  // 是否需要發送通知
  private shouldNotify(resultType: 'success' | 'partial' | 'failure'): boolean {
    switch (resultType) {
      case 'success':
        return this.config.notifyOnSuccess
      case 'partial':
        return this.config.notifyOnPartialSuccess
      case 'failure':
        return this.config.notifyOnFailure
      default:
        return false
    }
  }
  
  // 發送通知
  private async sendNotifications(stats: CrawlStats, resultType: string): Promise<void> {
    const message = this.formatNotificationMessage(stats, resultType)
    
    // Telegram 通知
    if (this.config.enableTelegram && this.config.telegramBotToken && this.config.telegramChatId) {
      await this.sendTelegramNotification(message)
    }
    
    // Email 通知
    if (this.config.enableEmail && this.config.emailApiKey && this.config.emailTo?.length) {
      await this.sendEmailNotification(message, stats, resultType)
    }
  }
  
  // 格式化通知消息
  private formatNotificationMessage(stats: CrawlStats, resultType: string): string {
    const emoji = {
      success: '✅',
      partial: '⚠️',
      failure: '❌'
    }[resultType]
    
    let message = `${emoji} 爬取${resultType === 'success' ? '成功' : resultType === 'partial' ? '部分成功' : '失敗'}\n\n`
    message += `📰 來源：${stats.sourceName}\n`
    message += `⏱️ 耗時：${stats.duration} 秒\n`
    message += `🔍 找到文章：${stats.articlesFound} 篇\n`
    message += `✅ 處理成功：${stats.articlesProcessed} 篇\n`
    message += `📤 已發布：${stats.articlesPublished} 篇\n`
    
    if (stats.articlesFailed > 0) {
      message += `❌ 處理失敗：${stats.articlesFailed} 篇\n`
    }
    
    if (stats.errors.length > 0) {
      message += `\n❗ 錯誤訊息：\n`
      stats.errors.slice(0, 3).forEach(error => {
        message += `• ${error}\n`
      })
      if (stats.errors.length > 3) {
        message += `• ... 還有 ${stats.errors.length - 3} 個錯誤\n`
      }
    }
    
    return message
  }
  
  // 發送 Telegram 通知
  private async sendTelegramNotification(message: string): Promise<void> {
    try {
      await sendTelegramMessage(
        this.config.telegramChatId!,
        message,
        this.config.telegramBotToken!
      )
      this.log(LogLevel.INFO, 'Telegram 通知已發送')
    } catch (error) {
      this.log(LogLevel.ERROR, 'Telegram 通知發送失敗', error)
    }
  }
  
  // 發送 Email 通知
  private async sendEmailNotification(
    message: string,
    stats: CrawlStats,
    resultType: string
  ): Promise<void> {
    try {
      const subject = `[車冷博士] 新聞爬取${
        resultType === 'success' ? '成功' : resultType === 'partial' ? '部分成功' : '失敗'
      } - ${stats.sourceName}`
      
      // 生成 HTML 格式的郵件內容
      const html = this.generateEmailHtml(stats, resultType)
      
      // 使用 API 路由發送郵件
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: this.config.emailTo,
          subject,
          html,
          text: message,
          apiKey: this.config.emailApiKey
        })
      })
      
      if (response.ok) {
        this.log(LogLevel.INFO, 'Email 通知已發送')
      } else {
        throw new Error('Email API 回應失敗')
      }
    } catch (error) {
      this.log(LogLevel.ERROR, 'Email 通知發送失敗', error)
    }
  }
  
  // 生成 Email HTML
  private generateEmailHtml(stats: CrawlStats, resultType: string): string {
    const color = {
      success: '#10b981',
      partial: '#f59e0b',
      failure: '#ef4444'
    }[resultType]
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: ${color}; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: 0; }
          .stats-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .stats-table td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .stats-table td:first-child { font-weight: bold; width: 40%; }
          .error-list { background-color: #fee2e2; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>新聞爬取${resultType === 'success' ? '成功' : resultType === 'partial' ? '部分成功' : '失敗'}</h1>
          </div>
          <div class="content">
            <h2>${stats.sourceName}</h2>
            
            <table class="stats-table">
              <tr>
                <td>開始時間</td>
                <td>${stats.startTime.toLocaleString('zh-TW')}</td>
              </tr>
              <tr>
                <td>結束時間</td>
                <td>${stats.endTime.toLocaleString('zh-TW')}</td>
              </tr>
              <tr>
                <td>耗時</td>
                <td>${stats.duration} 秒</td>
              </tr>
              <tr>
                <td>找到文章數</td>
                <td>${stats.articlesFound} 篇</td>
              </tr>
              <tr>
                <td>處理成功</td>
                <td>${stats.articlesProcessed} 篇</td>
              </tr>
              <tr>
                <td>已發布</td>
                <td>${stats.articlesPublished} 篇</td>
              </tr>
              ${stats.articlesFailed > 0 ? `
              <tr>
                <td>處理失敗</td>
                <td style="color: #ef4444;">${stats.articlesFailed} 篇</td>
              </tr>
              ` : ''}
            </table>
            
            ${stats.errors.length > 0 ? `
            <div class="error-list">
              <h3>錯誤訊息</h3>
              <ul>
                ${stats.errors.map(error => `<li>${error}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p>此郵件由車冷博士新聞爬蟲系統自動發送</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
  
  // 儲存爬取記錄到資料庫
  private async saveCrawlRecord(stats: CrawlStats): Promise<void> {
    try {
      // @ts-ignore - Prisma client 需要重新生成
      await prisma.crawlLog.create({
        data: {
          sourceId: stats.sourceId,
          sourceName: stats.sourceName,
          startTime: stats.startTime,
          endTime: stats.endTime,
          duration: stats.duration,
          articlesFound: stats.articlesFound,
          articlesProcessed: stats.articlesProcessed,
          articlesPublished: stats.articlesPublished,
          articlesFailed: stats.articlesFailed,
          errors: stats.errors.length > 0 ? JSON.stringify(stats.errors) : null,
          success: stats.success
        }
      })
    } catch (error) {
      this.log(LogLevel.ERROR, '儲存爬取記錄失敗', error)
    }
  }
  
  // 獲取爬取歷史
  async getCrawlHistory(limit: number = 50): Promise<any[]> {
    try {
      // @ts-ignore - Prisma client 需要重新生成
      return await prisma.crawlLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error) {
      this.log(LogLevel.ERROR, '獲取爬取歷史失敗', error)
      return []
    }
  }
  
  // 獲取統計摘要
  async getStatsSummary(days: number = 7): Promise<any> {
    try {
      const since = new Date()
      since.setDate(since.getDate() - days)
      
      // @ts-ignore - Prisma client 需要重新生成
      const logs = await prisma.crawlLog.findMany({
        where: {
          createdAt: {
            gte: since
          }
        }
      })
      
      const stats = {
        total_crawls: logs.length,
        total_articles: logs.reduce((sum: number, log: any) => sum + log.articlesProcessed, 0),
        total_published: logs.reduce((sum: number, log: any) => sum + log.articlesPublished, 0),
        avg_duration: logs.length > 0 ? logs.reduce((sum: number, log: any) => sum + log.duration, 0) / logs.length : 0,
        successful_crawls: logs.filter((log: any) => log.success).length,
        failed_crawls: logs.filter((log: any) => !log.success).length
      }
      
      return stats
    } catch (error) {
      this.log(LogLevel.ERROR, '獲取統計摘要失敗', error)
      return null
    }
  }
} 