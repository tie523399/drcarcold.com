// 自動新聞爬蟲系統
// 定期爬取指定新聞來源，並自動處理、改寫和發布文章

import { prisma } from '@/lib/prisma'
import { rewriteWithAI } from '@/lib/ai-service'
import { MonitoringService, MonitoringConfig, LogLevel } from '@/lib/monitoring-service'
import { ContentQualityChecker, ArticleData } from '@/lib/content-quality-checker'
import { DuplicateChecker } from '@/lib/duplicate-checker'
import { generateNewsImages } from '@/lib/news-image-generator'
import * as cheerio from 'cheerio'

// 文章內容介面
interface ArticleContent {
  title: string
  content: string
  author?: string
  publishDate?: string
  url: string
  tags?: string[]
}

// 爬取結果介面
interface CrawlResult {
  sourceId: string
  success: boolean
  articlesFound: number
  articlesProcessed: number
  articlesPublished: number
  errors: string[]
  crawlTime: Date
}

// 新聞來源介面
export interface NewsSource {
  id: string
  name: string
  url: string
  rssUrl?: string
  enabled: boolean
  maxArticlesPerCrawl: number
  crawlInterval: number
  lastCrawl?: Date
  selectors?: {
    articleLinks?: string
    title?: string
    content?: string
    author?: string
    date?: string
  }
}

// 系統設定介面
interface SystemSettings {
  autoPublish: boolean
  aiRewriteEnabled: boolean
  openaiApiKey: string
  seoKeywords: string
  crawlInterval: number
}

// 強化的文章爬取函數 - 完全排除404問題
async function simpleScrapeArticle(url: string): Promise<ArticleContent> {
  console.log(`🔍 開始爬取文章: ${url}`)
  
  try {
    // 第一步：驗證URL
    const { urlValidator } = await import('./url-validator')
    const validation = await urlValidator.validateURL(url)
    
    if (!validation.isValid) {
      throw new Error(`URL驗證失敗: ${validation.error} (狀態碼: ${validation.statusCode})`)
    }
    
    // 第二步：獲取內容
    console.log(`✅ URL驗證通過，開始獲取內容...`)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超時
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.8,en;q=0.6',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    // 第三步：檢查響應狀態
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`文章不存在 (404): ${url}`)
      } else if (response.status === 403) {
        throw new Error(`訪問被拒絕 (403): ${url}`)
      } else if (response.status === 500) {
        throw new Error(`服務器錯誤 (500): ${url}`)
      } else {
        throw new Error(`HTTP錯誤 ${response.status}: ${response.statusText}`)
      }
    }
    
    // 第四步：檢查內容類型
    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.includes('text/html')) {
      throw new Error(`不是HTML內容: ${contentType}`)
    }
    
    // 第五步：解析HTML
    const html = await response.text()
    
    // 第六步：檢查是否為錯誤頁面
    if (html.includes('404') || html.includes('Not Found') || 
        html.includes('頁面不存在') || html.includes('找不到頁面') ||
        html.includes('Page Not Found') || html.includes('File not found') ||
        html.length < 500) {
      throw new Error(`檢測到404錯誤頁面或內容過短: ${url}`)
    }
    
    const $ = cheerio.load(html)
    
    // 第七步：提取和驗證內容
    let title = $('h1').first().text().trim()
    if (!title) {
      title = $('title').text().trim()
    }
    if (!title) {
      title = $('meta[property="og:title"]').attr('content')?.trim() || ''
    }
    
    // 驗證標題
    if (!title || title.length < 5) {
      throw new Error(`無法提取有效標題: ${url}`)
    }
    
    // 提取內容
    let content = ''
    
    // 嘗試多種內容選擇器
    const contentSelectors = [
      'article',
      '.content',
      '.post-content', 
      '.entry-content',
      '.article-content',
      '.news-content',
      'main p',
      '.story-body',
      '.article-body'
    ]
    
    for (const selector of contentSelectors) {
      const extracted = $(selector).text().trim()
      if (extracted && extracted.length > content.length) {
        content = extracted
      }
    }
    
    // 清理內容
    content = content
      .replace(/\s+/g, ' ')  // 合併空白
      .replace(/\n\s*\n/g, '\n')  // 合併空行
      .slice(0, 3000)  // 限制長度
      .trim()
    
    // 驗證內容
    if (!content || content.length < 100) {
      throw new Error(`內容過短或無法提取: ${url} (長度: ${content.length})`)
    }
    
    // 提取作者
    let author = $('meta[name="author"]').attr('content') || 
                $('.author').text() || 
                $('.byline').text() || 
                $('[class*="author"]').first().text() || 
                '未知作者'
    author = author.trim().slice(0, 50)
    
    const result: ArticleContent = {
      title: title.slice(0, 200),
      content,
      author,
      url,
      tags: []
    }
    
    console.log(`✅ 文章爬取成功: ${title.slice(0, 50)}... (內容長度: ${content.length})`)
    
    return result
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error(`爬取超時: ${url}`)
    }
    
    console.error(`❌ 文章爬取失敗: ${url}`, error.message)
    throw new Error(`爬取失敗: ${error.message}`)
  }
}

export class AutoNewsCrawler {
  private settings: SystemSettings | null = null
  private isRunning = false
  private crawlInterval: NodeJS.Timeout | null = null
  private monitor: MonitoringService | null = null
  private qualityChecker: ContentQualityChecker
  private duplicateChecker: DuplicateChecker

  constructor() {
    this.loadSettings()
    this.qualityChecker = new ContentQualityChecker()
    this.duplicateChecker = new DuplicateChecker()
  }

  // 獲取運行狀態
  public getRunningStatus(): boolean {
    return this.isRunning
  }

  // 載入系統設定
  private async loadSettings(): Promise<void> {
    try {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: [
              'auto_publish_enabled',
              'ai_rewrite_enabled',
              'openai_api_key',
              'seo_keywords',
              'auto_crawl_interval',
              'telegram_bot_token',
              'telegram_chat_id',
              'email_api_key',
              'notification_emails',
              'notify_on_success',
              'notify_on_failure',
              'notify_on_partial'
            ]
          }
        }
      })

      const settingsMap = new Map<string, string>(
        settings.map((s: { key: string; value: string }) => [s.key, s.value])
      )

      this.settings = {
        autoPublish: settingsMap.get('auto_publish_enabled') === 'true',
        aiRewriteEnabled: settingsMap.get('ai_rewrite_enabled') === 'true',
        openaiApiKey: settingsMap.get('openai_api_key') || '',
        seoKeywords: settingsMap.get('seo_keywords') || '',
        crawlInterval: parseInt(settingsMap.get('auto_crawl_interval') || '60') * 60 * 1000 // 轉換為毫秒
      }

      // 初始化監控服務
      const monitorConfig: MonitoringConfig = {
        enableTelegram: !!settingsMap.get('telegram_bot_token'),
        telegramBotToken: settingsMap.get('telegram_bot_token'),
        telegramChatId: settingsMap.get('telegram_chat_id'),
        enableEmail: !!settingsMap.get('email_api_key'),
        emailApiKey: settingsMap.get('email_api_key'),
        emailTo: settingsMap.get('notification_emails')?.split(',').map((e: string) => e.trim()) || [],
        notifyOnSuccess: settingsMap.get('notify_on_success') === 'true',
        notifyOnFailure: settingsMap.get('notify_on_failure') !== 'false', // 預設為 true
        notifyOnPartialSuccess: settingsMap.get('notify_on_partial') === 'true'
      }
      
      this.monitor = new MonitoringService(monitorConfig)

      // 系統設定載入完成
    } catch (error) {
      console.error('載入系統設定失敗:', error)
      this.settings = {
        autoPublish: false,
        aiRewriteEnabled: false,
        openaiApiKey: '',
        seoKeywords: '',
        crawlInterval: 60 * 60 * 1000 // 預設 1 小時
      }
      
      // 使用預設監控設定
      this.monitor = new MonitoringService({
        enableTelegram: false,
        enableEmail: false,
        notifyOnSuccess: false,
        notifyOnFailure: true,
        notifyOnPartialSuccess: false
      })
    }
  }

  // 開始自動爬取
  async startAutoCrawl(): Promise<void> {
    if (this.isRunning) {
      console.log('自動爬取已在運行中')
      return
    }

    console.log('開始自動爬取...')
    this.isRunning = true

    // 獲取並行爬取設定
    const parallelSettings = await this.getParallelSettings()

    // 立即執行一次
    await this.performCrawl(parallelSettings)

    // 設定定期執行
    this.crawlInterval = setInterval(async () => {
      if (this.isRunning) {
        console.log('執行定期爬取...')
        const currentSettings = await this.getParallelSettings()
        await this.performCrawl(currentSettings)
      }
    }, this.settings?.crawlInterval || 60 * 60 * 1000)
    
    console.log(`自動爬取已啟動，間隔: ${(this.settings?.crawlInterval || 60 * 60 * 1000) / 1000 / 60} 分鐘`)
  }
  
  // 獲取並行爬取設定
  private async getParallelSettings(): Promise<{ parallel: boolean; concurrentLimit: number }> {
    try {
      const settings = await prisma.setting.findMany({
        where: {
          key: {
            in: ['parallel_crawling', 'concurrent_limit']
          }
        }
      })
      
      const settingsMap = new Map(settings.map(s => [s.key, s.value]))
      
      return {
        parallel: settingsMap.get('parallel_crawling') !== 'false', // 預設為 true
        concurrentLimit: parseInt(settingsMap.get('concurrent_limit') || '3')
      }
    } catch (error) {
      console.error('獲取並行爬取設定失敗:', error)
      return { parallel: true, concurrentLimit: 3 }
    }
  }

  // 停止自動爬取
  stopAutoCrawl(): void {
    console.log('停止自動爬取...')
    this.isRunning = false
    
    if (this.crawlInterval) {
      clearInterval(this.crawlInterval)
      this.crawlInterval = null
    }
  }

  // 執行一次完整的爬取（優化並行處理）
  async performCrawl(options: { parallel?: boolean; concurrentLimit?: number } = {}): Promise<CrawlResult[]> {
    const { parallel = true, concurrentLimit = 3 } = options
    
    try {
      // 重新載入設定
      await this.loadSettings()

      // 獲取啟用的新聞來源
      const sources = await this.getEnabledSources()
      
      if (sources.length === 0) {
        return []
      }

      let results: CrawlResult[] = []

      if (!parallel || sources.length === 1) {
        // 序列處理
        console.log(`開始序列爬取 ${sources.length} 個新聞來源...`)
        for (const source of sources) {
          try {
            const result = await this.crawlSource(source)
            results.push(result)
          } catch (error) {
            console.error(`爬取 ${source.name} 時發生錯誤:`, error)
            results.push({
              sourceId: source.id,
              success: false,
              articlesFound: 0,
              articlesProcessed: 0,
              articlesPublished: 0,
              errors: [error instanceof Error ? error.message : '未知錯誤'],
              crawlTime: new Date()
            })
          }
        }
      } else {
        // 並行處理（含批次控制）
        console.log(`開始並行爬取 ${sources.length} 個新聞來源（並發限制：${concurrentLimit}）...`)
        
        // 將來源分批處理
        const batches: NewsSource[][] = []
        for (let i = 0; i < sources.length; i += concurrentLimit) {
          batches.push(sources.slice(i, i + concurrentLimit))
        }
        
        // 批次並行處理
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i]
          console.log(`處理第 ${i + 1}/${batches.length} 批次：${batch.map(s => s.name).join(', ')}`)
          
          const batchStartTime = Date.now()
          const batchPromises = batch.map(source => 
            this.crawlSource(source).catch(error => {
              console.error(`爬取 ${source.name} 時發生錯誤:`, error)
              return {
                sourceId: source.id,
                success: false,
                articlesFound: 0,
                articlesProcessed: 0,
                articlesPublished: 0,
                errors: [error instanceof Error ? error.message : '未知錯誤'],
                crawlTime: new Date()
              }
            })
          )
          
          const batchResults = await Promise.all(batchPromises)
          const batchDuration = Math.round((Date.now() - batchStartTime) / 1000)
          console.log(`批次 ${i + 1} 完成，耗時 ${batchDuration} 秒`)
          
          results.push(...batchResults)
          
          // 批次間稍作延遲，避免過載
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // 2秒延遲
          }
        }
      }

      // 記錄爬取結果
      await this.logCrawlResults(results)
      
      // 顯示總結
      const totalArticles = results.reduce((sum, r) => sum + r.articlesProcessed, 0)
      const totalPublished = results.reduce((sum, r) => sum + r.articlesPublished, 0)
      const successCount = results.filter(r => r.success).length
      
      console.log(`
爬取完成總結：
- 成功來源：${successCount}/${sources.length}
- 總處理文章：${totalArticles} 篇
- 總發布文章：${totalPublished} 篇
      `)
      
      return results

    } catch (error) {
      console.error('執行新聞爬取失敗:', error)
      return []
    }
  }

  // 獲取啟用的新聞來源
  private async getEnabledSources(): Promise<NewsSource[]> {
    try {
      // 從資料庫獲取新聞來源配置
      const dbSources = await prisma.newsSource.findMany({
        where: { enabled: true }
      })

      if (dbSources.length > 0) {
        // 將資料庫來源轉換為 NewsSource 格式
        return dbSources.map((source: any) => ({
          id: source.id,
          name: source.name,
          url: source.url,
          rssUrl: source.rssUrl || undefined,
          enabled: source.enabled,
          maxArticlesPerCrawl: source.maxArticlesPerCrawl,
          crawlInterval: source.crawlInterval,
          lastCrawl: source.lastCrawl || undefined,
          selectors: source.selectors ? JSON.parse(source.selectors as string) : undefined
        }))
      }

      // 如果資料庫沒有配置，使用預設的汽車相關新聞來源
      console.log('使用預設新聞來源')
      return await this.initializeDefaultSources()

    } catch (error) {
      console.error('獲取新聞來源失敗:', error)
      return []
    }
  }

  // 爬取單個來源
  private async crawlSource(source: NewsSource): Promise<CrawlResult> {
    // 開始監控
    if (this.monitor) {
      this.monitor.startCrawl(source.id, source.name)
    }
    
    const result: CrawlResult = {
      sourceId: source.id,
      success: false,
      articlesFound: 0,
      articlesProcessed: 0,
      articlesPublished: 0,
      errors: [],
      crawlTime: new Date()
    }

    try {
      // 1. 獲取文章列表
      const articleUrls = await this.getArticleUrls(source)
      result.articlesFound = articleUrls.length

      // 更新監控統計
      if (this.monitor) {
        this.monitor.updateStats(source.id, { articlesFound: articleUrls.length })
      }

      if (articleUrls.length === 0) {
        const error = '未找到文章連結'
        result.errors.push(error)
        if (this.monitor) {
          this.monitor.recordError(source.id, error)
        }
        return result
      }

      console.log(`找到 ${articleUrls.length} 篇文章`)
      if (this.monitor) {
        this.monitor.log(LogLevel.INFO, `找到 ${articleUrls.length} 篇文章`, { source: source.name })
      }

      // 2. 處理文章（限制數量）
      const urlsToProcess = articleUrls.slice(0, source.maxArticlesPerCrawl)

      for (const url of urlsToProcess) {
        try {
          // 檢查是否已存在
          if (await this.isDuplicateArticle(url)) {
            console.log(`跳過重複文章: ${url}`)
            continue
          }

          // 爬取文章內容（使用簡化版爬蟲）
          const articleData = await simpleScrapeArticle(url)
          
          // AI 改寫
          const processedArticle = await this.processArticle(articleData, source)
          
          // 儲存並發布
          if (processedArticle) {
            console.log(`📝 處理完成，開始保存文章: ${processedArticle.title}`)
            const saveResult = await this.saveAndPublishArticle(processedArticle, source)
            
            if (saveResult.success) {
              result.articlesProcessed++
              result.articlesPublished++
              console.log(`✅ 文章成功處理並保存: ${processedArticle.title}`)
              
              // 更新監控統計
              if (this.monitor) {
                this.monitor.updateStats(source.id, {
                  articlesProcessed: result.articlesProcessed,
                  articlesPublished: result.articlesPublished
                })
              }
            } else {
              console.log(`❌ 文章保存失敗: ${processedArticle.title} - ${saveResult.error}`)
              result.errors.push(`文章保存失敗: ${processedArticle.title} - ${saveResult.error}`)
              
              // 記錄保存失敗到監控
              if (this.monitor) {
                this.monitor.recordError(source.id, `文章保存失敗: ${processedArticle.title} - ${saveResult.error}`)
              }
            }
          } else {
            console.log(`❌ 文章處理失敗，跳過保存: ${url}`)
            result.errors.push(`文章處理失敗: ${url}`)
          }

          // 延遲避免過快請求
          await this.delay(3000)

        } catch (error) {
          console.error(`處理文章失敗 ${url}:`, error)
          const errorMsg = `處理文章失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
          result.errors.push(errorMsg)
          
          // 記錄錯誤到監控
          if (this.monitor) {
            this.monitor.recordError(source.id, errorMsg)
          }
        }
      }

      result.success = result.articlesProcessed > 0

    } catch (error) {
      console.error(`爬取來源失敗 ${source.name}:`, error)
      const errorMsg = `爬取來源失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
      result.errors.push(errorMsg)
      
      if (this.monitor) {
        this.monitor.recordError(source.id, errorMsg)
      }
    }

    // 結束監控並發送通知
    if (this.monitor) {
      await this.monitor.endCrawl(source.id)
    }

    return result
  }

  // 獲取文章 URL 列表
  private async getArticleUrls(source: NewsSource): Promise<string[]> {
    try {
      console.log(`開始獲取 ${source.name} 的文章列表...`)
      
      // 使用簡單的 HTTP 請求獲取文章列表
      const axios = require('axios')
      const cheerio = require('cheerio')
      
      const response = await axios.get(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 30000,
        maxRedirects: 5
      })
      
      const $ = cheerio.load(response.data)
      const links: string[] = []
      
      // 嘗試多種選擇器策略
      const selectors = [
        // 優先使用自定義選擇器
        source.selectors?.articleLinks,
        // 通用新聞網站選擇器
        'article a[href]',
        '.article-list a[href]',
        '.news-list a[href]',
        '.post-list a[href]',
        '.entry-title a[href]',
        '.post-title a[href]',
        'h2 a[href]',
        'h3 a[href]',
        '.title a[href]',
        '.headline a[href]',
        // 最後使用最通用的選擇器
        'a[href]'
      ].filter(Boolean)
      
      // 收集所有可能的連結
      const allHrefs = new Set<string>()
      
      for (const selector of selectors) {
        $(selector).each((_: any, elem: any) => {
          const href = $(elem).attr('href')
          if (href && href.trim()) {
            try {
              // 轉換為絕對 URL
              const absoluteUrl = new URL(href, source.url).toString()
              allHrefs.add(absoluteUrl)
            } catch (e) {
              // 忽略無效的 URL
            }
          }
        })
      }
      
      // 過濾文章連結
      const articlePatterns = [
        /\/article\//i,
        /\/news\//i,
        /\/post\//i,
        /\/story\//i,
        /\/content\//i,
        /\/\d{4}\/\d{2}\//,  // 日期格式 /2024/01/
        /\d{6,}/,            // 包含至少6位數字（文章ID）
        /\.html?$/i,         // .html 或 .htm 結尾
        /\/p\/\d+/,          // /p/12345 格式
        /\?id=\d+/           // ?id=12345 格式
      ]
      
      // 排除模式
      const excludePatterns = [
        /\/tag\//i,
        /\/category\//i,
        /\/author\//i,
        /\/page\//i,
        /\/search/i,
        /\/login/i,
        /\/register/i,
        /\.(jpg|jpeg|png|gif|pdf|zip)$/i,
        /#/,  // 錨點連結
        /javascript:/i,
        /mailto:/i
      ]
      
      for (const href of allHrefs) {
        // 排除特定模式
        if (excludePatterns.some(pattern => pattern.test(href))) {
          continue
        }
        
        // 排除與來源 URL 相同的連結
        if (href === source.url || href === source.url + '/') {
          continue
        }
        
        // 確保是同域名或子域名
        try {
          const sourceHost = new URL(source.url).hostname
          const linkHost = new URL(href).hostname
          if (!linkHost.endsWith(sourceHost.replace('www.', ''))) {
            continue
          }
        } catch (e) {
          continue
        }
        
        // 檢查是否符合文章模式
        if (articlePatterns.some(pattern => pattern.test(href))) {
          links.push(href)
        }
      }
      
      // 如果沒有找到符合模式的連結，嘗試更寬鬆的策略
      if (links.length === 0 && allHrefs.size > 0) {
        console.log(`使用寬鬆策略尋找文章連結...`)
        for (const href of allHrefs) {
          // 排除明顯不是文章的連結
          if (excludePatterns.some(pattern => pattern.test(href))) {
            continue
          }
          
          // 檢查連結文字是否像文章標題（中文字符較多）
          const linkText = $(`a[href="${href}"]`).first().text().trim()
          if (linkText && linkText.match(/[\u4e00-\u9fa5]/g)?.length > 5) {
            links.push(href)
          }
        }
      }
      
      // 去重並限制數量
      const uniqueLinks = [...new Set(links)]
        .slice(0, source.maxArticlesPerCrawl || 5)

      console.log(`從 ${source.name} 獲取到 ${uniqueLinks.length} 個連結`)
      if (uniqueLinks.length > 0) {
        console.log('文章連結範例:', uniqueLinks[0])
      }
      
      return uniqueLinks

    } catch (error) {
      console.error(`獲取文章連結失敗 ${source.name}:`, error)
      return []
    }
  }

  // 檢查是否為重複文章
  private async isDuplicateArticle(url: string): Promise<boolean> {
    try {
      const existing = await prisma.news.findFirst({
        where: {
          OR: [
            { slug: { contains: url.split('/').pop() } },
            { content: { contains: url } }
          ]
        }
      })

      return existing !== null
    } catch (error) {
      console.error('檢查重複文章失敗:', error)
      return false
    }
  }

  // 處理文章（去重檢查 + AI 改寫）
  private async processArticle(articleData: ArticleContent, source: NewsSource): Promise<ArticleContent | null> {
    try {
      // 先進行去重檢查
      const duplicateCheck = await this.duplicateChecker.checkDuplicate(
        articleData.url,
        articleData.title,
        articleData.content,
        source.id
      )
      
      if (duplicateCheck.isDuplicate) {
        console.log(`文章重複: ${articleData.title}`)
        console.log(`重複類型: ${duplicateCheck.duplicateType}, 置信度: ${Math.round(duplicateCheck.confidence * 100)}%`)
        console.log(`原因: ${duplicateCheck.reason}`)
        
        if (this.monitor) {
          this.monitor.log(LogLevel.INFO, `跳過重複文章: ${articleData.title}`, {
            duplicateType: duplicateCheck.duplicateType,
            confidence: duplicateCheck.confidence,
            existingArticleId: duplicateCheck.existingArticleId
          })
        }
        
        return null
      }
      
      let processedContent = articleData.content
      let processedTitle = articleData.title

      // 如果啟用 AI 改寫
      if (this.settings?.aiRewriteEnabled) {
        console.log(`🤖 使用智能AI改寫文章: ${articleData.title}`)
        
        try {
          // 使用AI改寫內容
          processedContent = await rewriteWithAI(
            articleData.content,
            this.settings.seoKeywords,
            this.settings.openaiApiKey
          )

          // 改寫標題
          processedTitle = await this.rewriteTitle(
            articleData.title,
            this.settings.seoKeywords,
            this.settings.openaiApiKey
          )
        } catch (error) {
          console.error('AI 改寫失敗，使用原始內容:', error)
        }
      }

      // 建構處理後的文章
      const processedArticle: ArticleContent = {
        ...articleData,
        title: processedTitle,
        content: processedContent,
        tags: [
          ...(articleData.tags || []),
          ...this.settings?.seoKeywords.split(',').map(k => k.trim()) || []
        ]
      }
      
      // 執行品質檢查
      const articleForQualityCheck: ArticleData = {
        title: processedArticle.title,
        content: processedArticle.content,
        author: processedArticle.author,
        publishDate: processedArticle.publishDate,
        tags: processedArticle.tags,
        coverImage: processedArticle.url,
        excerpt: processedArticle.content.substring(0, 200) + '...'
      }
      
      const qualityScore = this.qualityChecker.checkQuality(
        articleForQualityCheck,
        this.settings?.seoKeywords.split(',').map(k => k.trim()) || []
      )
      
      // 記錄品質檢查結果
      if (this.monitor) {
        this.monitor.log(LogLevel.INFO, `文章品質檢查完成: ${processedTitle}`, {
          overall: qualityScore.overall,
          issues: qualityScore.issues.length,
          suggestions: qualityScore.suggestions.length
        })
      }
      
      // 如果品質分數太低，嘗試自動修復
      if (qualityScore.overall < 60) {
        console.log(`文章品質過低（${qualityScore.overall}分），嘗試自動修復...`)
        const fixedArticle = this.qualityChecker.autoFixContent(articleForQualityCheck)
        
        // 更新處理後的文章
        processedArticle.title = fixedArticle.title
        processedArticle.content = fixedArticle.content
        
        // 重新檢查品質
        const newScore = this.qualityChecker.checkQuality(fixedArticle, this.settings?.seoKeywords.split(',').map(k => k.trim()) || [])
        console.log(`修復後品質分數: ${newScore.overall}`)
      }
      
      // 如果品質仍然太低，可能拒絕發布
      if (qualityScore.overall < 40) {
        console.warn(`文章品質過低（${qualityScore.overall}分），建議不發布`)
        if (this.monitor) {
          this.monitor.recordError(source.id, `文章品質過低: ${processedTitle} (${qualityScore.overall}分)`)
        }
      }

      return processedArticle

    } catch (error) {
      console.error('處理文章失敗:', error)
      return null
    }
  }

  // 改寫標題
  private async rewriteTitle(title: string, keywords: string, apiKey: string): Promise<string> {
    try {
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
        throw new Error('OpenAI API 請求失敗')
      }

      const data = await response.json()
      return data.choices[0].message.content.trim()
    } catch (error) {
      console.error('標題改寫失敗:', error)
      return title
    }
  }

  // 生成SEO優化的文章資料
  private async generateSEOArticle(articleData: ArticleContent, source: NewsSource): Promise<any> {
    // 生成SEO友好的slug
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 100)
    
    // 計算閱讀時間
    const readingTime = Math.ceil(articleData.content.length / 300)
    
    // 生成摘要
    const excerpt = articleData.content.substring(0, 200) + '...'
    
    // 生成SEO關鍵字
    const seoKeywords = this.settings?.seoKeywords || '汽車冷媒,空調維修,冷凍空調'
    
    // 生成動態圖片
    const imageData = await generateNewsImages(
      articleData.title,
      articleData.content,
      articleData.tags || [],
      source.name
    )
    
    return {
      title: articleData.title,
      slug,
      content: articleData.content,
      excerpt,
      author: articleData.author || source.name,
      tags: JSON.stringify(articleData.tags || []),
      coverImage: imageData.coverImage,
      ogImage: imageData.ogImage,
      seoTitle: articleData.title,
      seoDescription: excerpt,
      seoKeywords,
      ogTitle: articleData.title,
      ogDescription: excerpt,
      structuredData: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": articleData.title,
        "author": { "@type": "Person", "name": articleData.author || source.name },
        "datePublished": new Date().toISOString(),
        "publisher": { "@type": "Organization", "name": "車冷博士" }
      }),
      readingTime,
      sourceUrl: articleData.url,
      sourceName: source.name
    }
  }

  // 儲存並發布文章
  private async saveAndPublishArticle(articleData: ArticleContent, source: NewsSource): Promise<{ success: boolean; newsId?: string; error?: string }> {
    let retryCount = 0
    const maxRetries = 3
    
    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 嘗試保存文章 (第 ${retryCount + 1}/${maxRetries} 次): ${articleData.title}`)
        
        // 生成SEO優化的文章資料
        const seoArticle = await this.generateSEOArticle(articleData, source)
        
        // 檢查設定是否自動發布
        const autoPublish = await this.shouldAutoPublish()
        
        // 生成內容哈希
        const contentHash = this.duplicateChecker.generateContentHash(seoArticle.content)
        
        // 檢查重複標題
        const existingByTitle = await prisma.news.findFirst({
          where: { title: seoArticle.title }
        })
        
        if (existingByTitle) {
          console.log(`⚠️ 發現重複標題，跳過保存: ${seoArticle.title}`)
          return { success: false, error: '標題重複' }
        }
        
        // 檢查重複內容哈希
        const existingByHash = await prisma.news.findFirst({
          where: { contentHash: contentHash }
        })
        
        if (existingByHash) {
          console.log(`⚠️ 發現重複內容，跳過保存: ${seoArticle.title}`)
          return { success: false, error: '內容重複' }
        }
        
        // 驗證必要欄位
        if (!seoArticle.title || seoArticle.title.length < 5) {
          console.log(`❌ 標題無效: ${seoArticle.title}`)
          return { success: false, error: '標題過短或無效' }
        }
        
        if (!seoArticle.content || seoArticle.content.length < 100) {
          console.log(`❌ 內容無效，長度: ${seoArticle.content?.length || 0}`)
          return { success: false, error: '內容過短或無效' }
        }
        
        if (!seoArticle.slug || seoArticle.slug.length < 3) {
          console.log(`❌ Slug無效: ${seoArticle.slug}`)
          return { success: false, error: 'Slug無效' }
        }
        
        // 檢查slug唯一性
        const existingBySlug = await prisma.news.findFirst({
          where: { slug: seoArticle.slug }
        })
        
        if (existingBySlug) {
          // 生成新的唯一slug
          const timestamp = Date.now()
          seoArticle.slug = `${seoArticle.slug}-${timestamp}`.substring(0, 100)
          console.log(`🔧 Slug重複，生成新slug: ${seoArticle.slug}`)
        }
        
        console.log(`💾 開始保存文章到數據庫...`)
        console.log(`   標題: ${seoArticle.title}`)
        console.log(`   Slug: ${seoArticle.slug}`)
        console.log(`   內容長度: ${seoArticle.content.length}`)
        console.log(`   作者: ${seoArticle.author}`)
        console.log(`   自動發布: ${autoPublish}`)
        
        // @ts-ignore - contentHash 和 sourceId 欄位需要 prisma generate
        const news = await prisma.news.create({
          data: {
            ...seoArticle,
            isPublished: autoPublish,
            publishedAt: autoPublish ? new Date() : null,
            sourceId: source.id,
            contentHash: contentHash,
            status: autoPublish ? 'published' : 'draft'
          }
        })
        
        // 驗證保存成功
        const savedNews = await prisma.news.findUnique({
          where: { id: news.id }
        })
        
        if (!savedNews) {
          throw new Error('文章保存後無法查詢到，可能保存失敗')
        }
        
        console.log(`✅ 文章已成功${autoPublish ? '發布' : '儲存為草稿'}: ${seoArticle.title}`)
        console.log(`   數據庫ID: ${news.id}`)
        console.log(`   訪問URL: /${savedNews.slug}`)
        console.log(`   SEO關鍵字: ${seoArticle.seoKeywords}`)
        console.log(`   閱讀時間: ${seoArticle.readingTime} 分鐘`)
        
        // 記錄成功到監控系統
        if (this.monitor) {
          this.monitor.log(LogLevel.INFO, `文章保存成功: ${seoArticle.title}`, {
            newsId: news.id,
            slug: savedNews.slug,
            autoPublish,
            contentLength: seoArticle.content.length
          })
        }
        
        return { success: true, newsId: news.id }
        
      } catch (error: any) {
        retryCount++
        const errorMsg = error instanceof Error ? error.message : '未知錯誤'
        console.error(`❌ 保存文章失敗 (第 ${retryCount}/${maxRetries} 次):`, errorMsg)
        
        // 記錄詳細錯誤信息
        if (error.code === 'P2002') {
          console.error('   原因: 數據庫唯一性約束違反 (可能是slug或其他唯一欄位重複)')
        } else if (error.code === 'P2003') {
          console.error('   原因: 外鍵約束違反')
        } else if (error.message?.includes('required')) {
          console.error('   原因: 必要欄位缺失')
        }
        
        // 記錄錯誤到監控系統
        if (this.monitor) {
          this.monitor.recordError(source.id, `文章保存失敗: ${articleData.title} - ${errorMsg}`)
        }
        
        // 如果還有重試機會，等待後重試
        if (retryCount < maxRetries) {
          const waitTime = retryCount * 2000 // 遞增等待時間
          console.log(`⏳ ${waitTime/1000}秒後重試...`)
          await this.delay(waitTime)
        } else {
          // 所有重試都失敗了
          console.error(`💥 文章保存完全失敗: ${articleData.title}`)
          return { success: false, error: errorMsg }
        }
      }
    }
    
    return { success: false, error: '重試次數用盡' }
  }

  // 檢查是否應該自動發布
  private async shouldAutoPublish(): Promise<boolean> {
    return this.settings?.autoPublish || false
  }

  // 生成 URL 友好的 slug
  private generateSlug(title: string, id?: string): string {
    if (!title) return `news-${id || Date.now()}`
    
    // 只保留英文字母、數字，移除所有其他字符
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // 只保留英文字母、數字和空格
      .replace(/\s+/g, '-') // 將空格轉為連字符
      .replace(/-+/g, '-') // 合並多個連字符
      .replace(/^-+|-+$/g, '') // 移除開頭和結尾的連字符
    
    // 如果清理後為空或太短，使用時間戳
    if (!slug || slug.length < 3) {
      slug = `news-${Date.now()}`
    } else {
      // 限制長度並添加時間戳確保唯一性
      slug = slug.substring(0, 30) + '-' + Date.now()
    }
    
    return slug.replace(/-+$/, '') // 確保不以連字符結尾
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 初始化預設新聞來源
  private async initializeDefaultSources(): Promise<NewsSource[]> {
    try {
      // 預設的汽車和冷媒相關新聞來源
      const defaultSources = [
        {
          name: 'U-CAR 汽車新聞',
          url: 'https://news.u-car.com.tw/',
          enabled: true,
          maxArticlesPerCrawl: 3,
          crawlInterval: 120, // 2小時
          selectors: JSON.stringify({
            articleLinks: '.news-list a.news-list-item',
            title: 'h1.article-title',
            content: '.article-content',
            author: '.article-author',
            date: '.article-date'
          })
        },
        {
          name: 'CarStuff 人車事',
          url: 'https://www.carstuff.com.tw/',
          enabled: true,
          maxArticlesPerCrawl: 3,
          crawlInterval: 120,
          selectors: JSON.stringify({
            articleLinks: 'article h2 a',
            title: 'h1.entry-title',
            content: '.entry-content',
            author: '.author-name',
            date: 'time'
          })
        },
        {
          name: '癮車報',
          url: 'https://www.cool3c.com/tag/car',
          enabled: true,
          maxArticlesPerCrawl: 3,
          crawlInterval: 120,
          selectors: JSON.stringify({
            articleLinks: '.postlist h3 a',
            title: 'h1.post-title',
            content: '.post-content',
            author: '.author',
            date: '.post-date'
          })
        },
        {
          name: '車訊網',
          url: 'https://carnews.com/category/news',
          enabled: true,
          maxArticlesPerCrawl: 3,
          crawlInterval: 120,
          selectors: JSON.stringify({
            articleLinks: '.item-title a',
            title: 'h1.entry-title',
            content: '.entry-content',
            author: '.author-name',
            date: '.entry-date'
          })
        },
        {
          name: '8891 汽車新聞',
          url: 'https://c.8891.com.tw/news',
          enabled: true,
          maxArticlesPerCrawl: 3,
          crawlInterval: 180, // 3小時
          selectors: JSON.stringify({
            articleLinks: '.news-list a',
            title: 'h1.article-title',
            content: '.article-content',
            author: '.author',
            date: '.publish-date'
          })
        },
        {
          name: 'CARTURE 車勢文化',
          url: 'https://www.carture.com.tw/articles/news',
          enabled: false, // 預設關閉，需要時再啟用
          maxArticlesPerCrawl: 3,
          crawlInterval: 180,
          selectors: JSON.stringify({
            articleLinks: '.post-title a',
            title: 'h1.post-title',
            content: '.post-content',
            author: '.author-name',
            date: '.post-date'
          })
        },
        {
          name: 'AutoNet 汽車日報',
          url: 'https://www.autonet.com.tw/news',
          enabled: false,
          maxArticlesPerCrawl: 3,
          crawlInterval: 180,
          selectors: JSON.stringify({
            articleLinks: '.news-list a',
            title: 'h1.article-title',
            content: '.article-content',
            author: '.author',
            date: '.publish-date'
          })
        },
        {
          name: '發燒車訊',
          url: 'https://autos.udn.com/autos/cate/6715',
          enabled: false,
          maxArticlesPerCrawl: 3,
          crawlInterval: 240, // 4小時
          selectors: JSON.stringify({
            articleLinks: '.story-list a',
            title: 'h1.article-content__title',
            content: '.article-content__body',
            author: '.article-content__author',
            date: '.article-content__time'
          })
        }
      ]

      // 將預設來源儲存到資料庫
      for (const source of defaultSources) {
        await prisma.newsSource.create({
          data: source
        })
      }

      console.log('已初始化預設新聞來源')
      
      // 返回新聞來源
      const sources = await prisma.newsSource.findMany({
        where: { enabled: true }
      })

      return sources.map((source: any) => ({
        id: source.id,
        name: source.name,
        url: source.url,
        rssUrl: source.rssUrl || undefined,
        enabled: source.enabled,
        maxArticlesPerCrawl: source.maxArticlesPerCrawl,
        crawlInterval: source.crawlInterval,
        lastCrawl: source.lastCrawl || undefined,
        selectors: source.selectors ? JSON.parse(source.selectors as string) : undefined
      }))

    } catch (error) {
      console.error('初始化預設新聞來源失敗:', error)
      return []
    }
  }

  // 記錄爬取結果
  private async logCrawlResults(results: CrawlResult[]): Promise<void> {
    try {
      const summary = {
        totalSources: results.length,
        successfulSources: results.filter(r => r.success).length,
        totalArticlesFound: results.reduce((sum, r) => sum + r.articlesFound, 0),
        totalArticlesProcessed: results.reduce((sum, r) => sum + r.articlesProcessed, 0),
        totalArticlesPublished: results.reduce((sum, r) => sum + r.articlesPublished, 0),
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0)
      }

      console.log('爬取結果摘要:', summary)

      // 可以將結果儲存到資料庫或發送通知
      if (summary.totalErrors > 0) {
        console.warn('爬取過程中發生錯誤:', results.flatMap(r => r.errors))
      }

    } catch (error) {
      console.error('記錄爬取結果失敗:', error)
    }
  }
}

// 導出爬蟲實例
export const autoNewsCrawler = new AutoNewsCrawler()

// 便利函數
export function getAutoCrawler(): AutoNewsCrawler {
  return autoNewsCrawler
}

export async function startAutoCrawl(): Promise<void> {
  return await autoNewsCrawler.startAutoCrawl()
}

export function stopAutoCrawl(): void {
  autoNewsCrawler.stopAutoCrawl()
}

export async function getCrawlStats(): Promise<any> {
  return {
    isRunning: autoNewsCrawler['isRunning'], // 存取私有屬性
    totalSources: 2, // 硬編碼的來源數量
    activeSources: 2,
    lastCrawl: new Date(),
    status: 'ready'
  }
} 