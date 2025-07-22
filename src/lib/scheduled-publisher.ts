// 定時發布系統
// 根據設定的時間自動發布草稿文章和生成 SEO 文章

import { prisma } from './prisma'
import * as cron from 'node-cron'

// 定時發布管理器
export class ScheduledPublisher {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map()
  private isRunning = false

  // 啟動定時發布
  async startScheduledPublishing(): Promise<void> {
    if (this.isRunning) {
      return
    }

    this.isRunning = true

    // 載入發布時間設定
    await this.loadPublishSchedule()
    
    // 載入 SEO 生成排程
    await this.loadSEOGenerationSchedule()

    // 設定每分鐘檢查一次是否有新的設定變更
    const checkScheduleJob = cron.schedule('* * * * *', async () => {
      await this.checkScheduleUpdates()
    })

    this.scheduledJobs.set('schedule-checker', checkScheduleJob)
  }

  // 停止定時發布
  stopScheduledPublishing(): void {
    // 停止所有排程任務
    this.scheduledJobs.forEach((job, key) => {
      job.destroy()
    })
    
    this.scheduledJobs.clear()
    this.isRunning = false
  }

  // 載入發布時間設定
  private async loadPublishSchedule(): Promise<void> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'publish_schedule' }
      })

      const scheduleStr = setting?.value || '09:00,15:00,21:00'
      const times = scheduleStr.split(',').map(t => t.trim())

      // 清除現有的發布排程
      this.scheduledJobs.forEach((job, key) => {
        if (key.startsWith('publish-')) {
          job.destroy()
          this.scheduledJobs.delete(key)
        }
      })

      // 設定新的發布排程
      times.forEach((time, index) => {
        if (this.isValidTime(time)) {
          const [hour, minute] = time.split(':').map(Number)
          const cronExpression = `${minute} ${hour} * * *` // 每天的指定時間
          
          const job = cron.schedule(cronExpression, async () => {
            await this.publishScheduledArticles()
          })

          this.scheduledJobs.set(`publish-${index}`, job)
          console.log(`已設定發布排程: ${time} (${cronExpression})`)
        }
      })

    } catch (error) {
      console.error('載入發布排程失敗:', error)
    }
  }

  // 載入 SEO 生成排程
  private async loadSEOGenerationSchedule(): Promise<void> {
    try {
      const [enabledSetting, scheduleSetting, countSetting] = await Promise.all([
        prisma.setting.findUnique({ where: { key: 'auto_seo_enabled' } }),
        prisma.setting.findUnique({ where: { key: 'seo_generation_schedule' } }),
        prisma.setting.findUnique({ where: { key: 'seo_daily_count' } })
      ])

      const isEnabled = enabledSetting?.value === 'true'
      const scheduleTime = scheduleSetting?.value || '10:00'
      const dailyCount = parseInt(countSetting?.value || '1')

      // 清除現有的 SEO 生成排程
      this.scheduledJobs.forEach((job, key) => {
        if (key.startsWith('seo-generation-')) {
          job.destroy()
          this.scheduledJobs.delete(key)
        }
      })

      if (!isEnabled) {
        console.log('SEO 文章自動生成未啟用')
        return
      }

      if (this.isValidTime(scheduleTime)) {
        const [hour, minute] = scheduleTime.split(':').map(Number)
        const cronExpression = `${minute} ${hour} * * *` // 每天的指定時間
        
        const job = cron.schedule(cronExpression, async () => {
          await this.generateSEOArticles(dailyCount)
        })

        this.scheduledJobs.set('seo-generation-daily', job)
        console.log(`已設定 SEO 文章生成排程: ${scheduleTime} (每日 ${dailyCount} 篇)`)
      }

    } catch (error) {
      console.error('載入 SEO 生成排程失敗:', error)
    }
  }

  // 檢查排程更新
  private async checkScheduleUpdates(): Promise<void> {
    try {
      const setting = await prisma.setting.findUnique({
        where: { key: 'publish_schedule' }
      })

      const newSchedule = setting?.value || '09:00,15:00,21:00'
      
      // 檢查是否有變更
      const currentSchedules = Array.from(this.scheduledJobs.keys())
        .filter(key => key.startsWith('publish-'))
        .length

      const newTimes = newSchedule.split(',').map(t => t.trim()).filter(this.isValidTime)

      if (currentSchedules !== newTimes.length) {
        console.log('偵測到發布排程變更，重新載入...')
        await this.loadPublishSchedule()
      }

      // 檢查 SEO 生成排程變更
      const seoEnabledSetting = await prisma.setting.findUnique({
        where: { key: 'auto_seo_enabled' }
      })
      
      const seoScheduleSetting = await prisma.setting.findUnique({
        where: { key: 'seo_generation_schedule' }
      })

      const isCurrentlyEnabled = this.scheduledJobs.has('seo-generation-daily')
      const shouldBeEnabled = seoEnabledSetting?.value === 'true'
      const currentSeoSchedule = seoScheduleSetting?.value || '10:00'

      if (isCurrentlyEnabled !== shouldBeEnabled) {
        console.log('偵測到 SEO 生成排程變更，重新載入...')
        await this.loadSEOGenerationSchedule()
      }

    } catch (error) {
      console.error('檢查排程更新失敗:', error)
    }
  }

  // 驗證時間格式
  private isValidTime(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }

  // 生成 SEO 文章
  private async generateSEOArticles(count: number): Promise<void> {
    try {
      console.log(`開始自動生成 ${count} 篇 SEO 文章...`)

      // 檢查是否啟用 AI 改寫
      const aiEnabledSetting = await prisma.setting.findUnique({
        where: { key: 'ai_rewrite_enabled' }
      })

      if (aiEnabledSetting?.value !== 'true') {
        console.log('AI 改寫功能未啟用，跳過 SEO 文章生成')
        return
      }

      // 獲取 Cohere API Key
      const cohereKeySetting = await prisma.setting.findUnique({
        where: { key: 'cohere_api_key' }
      })

      if (!cohereKeySetting?.value) {
        console.log('Cohere API Key 未設定，跳過 SEO 文章生成')
        return
      }

      // 動態導入 SEO 生成器
      const { SEOContentGenerator } = await import('./seo-content-generator')
      const generator = new SEOContentGenerator(cohereKeySetting.value)

      let generatedCount = 0
      for (let i = 0; i < count; i++) {
        try {
          const article = await generator.generateSEOArticle()
          if (article) {
            generatedCount++
            console.log(`SEO 文章生成成功: ${article.title}`)
            // 延遲避免 API 限制
            await this.delay(3000)
          }
        } catch (error) {
          console.error(`生成第 ${i + 1} 篇 SEO 文章失敗:`, error)
        }
      }

      console.log(`SEO 文章自動生成完成，成功生成 ${generatedCount}/${count} 篇`)

      // 記錄生成統計
      await this.recordSEOGenerationStats(generatedCount)

    } catch (error) {
      console.error('自動生成 SEO 文章失敗:', error)
    }
  }

  // 記錄 SEO 生成統計
  private async recordSEOGenerationStats(count: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const key = `seo_generation_stats_${today}`

      const existing = await prisma.setting.findUnique({
        where: { key }
      })

      const currentCount = existing ? parseInt(existing.value) : 0
      const newCount = currentCount + count

      await prisma.setting.upsert({
        where: { key },
        update: { value: String(newCount) },
        create: { key, value: String(newCount) }
      })

    } catch (error) {
      console.error('記錄 SEO 生成統計失敗:', error)
    }
  }

  // 發布排程文章
  private async publishScheduledArticles(): Promise<void> {
    try {
      console.log('開始發布排程文章...')

      // 檢查是否啟用自動發布
      const autoPublishSetting = await prisma.setting.findUnique({
        where: { key: 'auto_publish_enabled' }
      })

      if (autoPublishSetting?.value !== 'true') {
        console.log('自動發布未啟用，跳過')
        return
      }

      // 獲取未發布的文章（草稿）
      const draftArticles = await prisma.news.findMany({
        where: {
          isPublished: false,
          publishedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 3 // 每次最多發布3篇
      })

      if (draftArticles.length === 0) {
        console.log('沒有待發布的文章')
        return
      }

      // 發布文章
      const publishedCount = await this.publishArticles(draftArticles)

      // 記錄發布統計
      await this.recordPublishStats(publishedCount)

      // 發布後執行智能新聞清理（保持20篇）
      if (publishedCount > 0) {
        try {
          const cleanupResult = await this.performSmartCleanup()
          if (cleanupResult.deletedCount > 0) {
            await this.recordCleanupStats(cleanupResult.deletedCount, cleanupResult.deletedNews)
          }
        } catch (error) {
          console.error('新聞清理失敗:', error)
        }
      }

    } catch (error) {
      console.error('發布排程文章失敗:', error)
    }
  }

  // 發布文章
  private async publishArticles(articles: any[]): Promise<number> {
    let publishedCount = 0

    for (const article of articles) {
      try {
        // 更新文章狀態為已發布
        await prisma.news.update({
          where: { id: article.id },
          data: {
            isPublished: true,
            publishedAt: new Date()
          }
        })

        publishedCount++
        console.log(`已發布文章: ${article.title}`)

        // 延遲以避免過快操作
        await this.delay(1000)

      } catch (error) {
        console.error(`發布文章失敗 ${article.title}:`, error)
      }
    }

    return publishedCount
  }

  // 記錄發布統計
  private async recordPublishStats(count: number): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const key = `publish_stats_${today}`

      const existing = await prisma.setting.findUnique({
        where: { key }
      })

      const currentCount = existing ? parseInt(existing.value) : 0
      const newCount = currentCount + count

      await prisma.setting.upsert({
        where: { key },
        update: { value: String(newCount) },
        create: { key, value: String(newCount) }
      })

    } catch (error) {
      console.error('記錄發布統計失敗:', error)
    }
  }

  // 執行智能新聞清理
  private async performSmartCleanup() {
    const maxNewsCount = 20
    const minViewsThreshold = 10

    const allNews = await prisma.news.findMany({
      where: { 
        isPublished: true,
        publishedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true
      },
      orderBy: [
        { publishedAt: 'desc' }
      ]
    })

    if (allNews.length <= maxNewsCount) {
      return {
        totalNews: allNews.length,
        deletedCount: 0,
        keptNews: allNews,
        deletedNews: []
      }
    }

    // 計算評分
    const newsWithScores = allNews.map(news => {
      const daysOld = Math.floor((new Date().getTime() - news.publishedAt!.getTime()) / (1000 * 60 * 60 * 24))
      const trafficScore = Math.min(news.viewCount * 2, 100)
      const freshnessScore = Math.max(50 - daysOld, 0)
      const qualityBonus = news.viewCount >= minViewsThreshold ? 20 : 0
      const score = (trafficScore * 0.6) + (freshnessScore * 0.3) + (qualityBonus * 0.1)
      
      return {
        ...news,
        daysOld,
        score: Math.round(score * 100) / 100
      }
    })

    newsWithScores.sort((a, b) => b.score - a.score)

    const newsToKeep = newsWithScores.slice(0, maxNewsCount)
    const newsToDelete = newsWithScores.slice(maxNewsCount)

    const deletedIds = newsToDelete.map(news => news.id)
    
    if (deletedIds.length > 0) {
      await prisma.news.deleteMany({
        where: {
          id: { in: deletedIds }
        }
      })
    }

    return {
      totalNews: allNews.length,
      deletedCount: deletedIds.length,
      keptNews: newsToKeep,
      deletedNews: newsToDelete
    }
  }

  // 記錄清理統計
  private async recordCleanupStats(deletedCount: number, deletedNews: any[]): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const cleanupKey = `cleanup_stats_${today}`
      const deletedTitles = deletedNews.map(news => news.title).join(', ')
      
      await prisma.setting.upsert({
        where: { key: cleanupKey },
        update: { 
          value: JSON.stringify({
            count: deletedCount,
            titles: deletedTitles,
            timestamp: new Date().toISOString()
          })
        },
        create: { 
          key: cleanupKey, 
          value: JSON.stringify({
            count: deletedCount,
            titles: deletedTitles,
            timestamp: new Date().toISOString()
          })
        }
      })
    } catch (error) {
      console.error('記錄清理統計失敗:', error)
    }
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 獲取發布統計
  async getPublishStats(): Promise<any> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const [todayStats, yesterdayStats] = await Promise.all([
        prisma.setting.findUnique({ where: { key: `publish_stats_${today}` } }),
        prisma.setting.findUnique({ where: { key: `publish_stats_${yesterday}` } })
      ])

      // 獲取總發布數
      const totalPublished = await prisma.news.count({
        where: { isPublished: true }
      })

      // 獲取草稿數
      const draftCount = await prisma.news.count({
        where: { isPublished: false }
      })

      return {
        todayPublished: parseInt(todayStats?.value || '0'),
        yesterdayPublished: parseInt(yesterdayStats?.value || '0'),
        totalPublished,
        draftCount,
        isRunning: this.isRunning,
        scheduleCount: this.scheduledJobs.size
      }

    } catch (error) {
      console.error('獲取發布統計失敗:', error)
      return null
    }
  }

  // 手動觸發發布
  async triggerManualPublish(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      console.log('手動觸發發布...')

      const draftArticles = await prisma.news.findMany({
        where: {
          isPublished: false,
          publishedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        },
        take: 5 // 手動發布最多5篇
      })

      if (draftArticles.length === 0) {
        return {
          success: false,
          message: '沒有待發布的文章'
        }
      }

      const publishedCount = await this.publishArticles(draftArticles)
      
      return {
        success: true,
        message: `已發布 ${publishedCount} 篇文章`,
        count: publishedCount
      }

    } catch (error) {
      console.error('手動發布失敗:', error)
      return {
        success: false,
        message: '發布失敗'
      }
    }
  }
}

// 全域實例
let publisherInstance: ScheduledPublisher | null = null

// 獲取發布器實例
export function getScheduledPublisher(): ScheduledPublisher {
  if (!publisherInstance) {
    publisherInstance = new ScheduledPublisher()
  }
  return publisherInstance
}

// 便利函數
export async function startScheduledPublishing(): Promise<void> {
  const publisher = getScheduledPublisher()
  await publisher.startScheduledPublishing()
}

export function stopScheduledPublishing(): void {
  const publisher = getScheduledPublisher()
  publisher.stopScheduledPublishing()
}

export async function getPublishStats(): Promise<any> {
  const publisher = getScheduledPublisher()
  return await publisher.getPublishStats()
}

export async function triggerManualPublish(): Promise<{ success: boolean; message: string; count?: number }> {
  const publisher = getScheduledPublisher()
  return await publisher.triggerManualPublish()
} 