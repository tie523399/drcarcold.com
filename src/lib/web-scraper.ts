// 網頁爬蟲服務
// 支援多種網站類型的智能內容提取

import axios from 'axios'
import * as cheerio from 'cheerio'
import { chromium, Browser, Page } from 'playwright'

// 文章內容介面
export interface ArticleContent {
  title: string
  content: string
  excerpt: string
  author?: string
  publishDate?: string
  tags?: string[]
  url: string
  source?: string
}

// 爬蟲配置
interface ScrapingConfig {
  timeout: number
  userAgent: string
  retries: number
  delay: number
}

const DEFAULT_CONFIG: ScrapingConfig = {
  timeout: 30000,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  retries: 3,
  delay: 2000,
}

// 常見新聞網站的選擇器配置
const SITE_SELECTORS: Record<string, {
  title: string[]
  content: string[]
  author: string[]
  publishDate: string[]
  excerpt: string[]
  removeElements: string[]
}> = {
  // 通用選擇器
  'default': {
    title: ['h1', '.title', '.headline', '[class*="title"]', '[class*="headline"]'],
    content: ['article', '.content', '.post-content', '.entry-content', '.article-content', '[class*="content"]', '[class*="article"]'],
    author: ['.author', '.byline', '[class*="author"]', '[rel="author"]'],
    publishDate: ['.date', '.publish-date', '.timestamp', '[class*="date"]', '[class*="time"]', 'time'],
    excerpt: ['.excerpt', '.summary', '.lead', '[class*="excerpt"]', '[class*="summary"]'],
    removeElements: ['script', 'style', 'nav', 'header', 'footer', '.ad', '.advertisement', '.social', '.share', '.related', '.sidebar']
  },
  // 中時新聞網
  'chinatimes.com': {
    title: ['h1.article-title', '.title'],
    content: ['.article-body', '.content'],
    author: ['.author', '.reporter'],
    publishDate: ['.date', '.publish-time'],
    excerpt: ['.summary'],
    removeElements: ['script', 'style', '.ad', '.advertisement', '.social-share', '.related-news']
  },
  // 自由時報
  'ltn.com.tw': {
    title: ['h1', '.news_title'],
    content: ['.text', '.content'],
    author: ['.reporter'],
    publishDate: ['.time'],
    excerpt: ['.summary'],
    removeElements: ['script', 'style', '.ad', '.boxTitle', '.related']
  },
  // 聯合新聞網
  'udn.com': {
    title: ['h1#story_art_title', '.story-head__title'],
    content: ['.story-body__inner', '.article-content__editor'],
    author: ['.story-head__author'],
    publishDate: ['.story-head__time'],
    excerpt: ['.story-head__summary'],
    removeElements: ['script', 'style', '.ad', '.story-list', '.social-share']
  },
  // ETtoday新聞雲
  'ettoday.net': {
    title: ['h1.title', '.subject'],
    content: ['.story', '.news-content'],
    author: ['.author'],
    publishDate: ['.date'],
    excerpt: ['.summary'],
    removeElements: ['script', 'style', '.ad', '.related-news', '.social-bar']
  },
  // 三立新聞網
  'setn.com': {
    title: ['h1.news-title'],
    content: ['.news-content'],
    author: ['.author'],
    publishDate: ['.news-time'],
    excerpt: ['.news-summary'],
    removeElements: ['script', 'style', '.ad', '.related-box']
  }
}

// 主要爬蟲類別
export class WebScraper {
  private config: ScrapingConfig
  private browser: Browser | null = null

  constructor(config: Partial<ScrapingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // 初始化瀏覽器
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
        ]
      })
    }
  }

  // 關閉瀏覽器
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  // 主要爬取方法
  async scrapeArticle(url: string): Promise<ArticleContent> {
    let retries = this.config.retries
    let lastError: Error | null = null

    while (retries > 0) {
      try {
        // 首先嘗試使用 axios + cheerio（更快）
        const staticContent = await this.scrapeStatic(url)
        if (staticContent && staticContent.content.length > 50) {
          return staticContent
        }

        // 如果靜態爬取失敗，使用 Playwright（處理動態內容）
        const dynamicContent = await this.scrapeDynamic(url)
        if (dynamicContent && dynamicContent.content.length > 50) {
          return dynamicContent
        }

        throw new Error('無法提取有效內容')
      } catch (error) {
        lastError = error as Error
        retries--
        
        if (retries > 0) {
          await this.delay(this.config.delay)
        }
      }
    }

    throw new Error(`爬取失敗: ${lastError?.message || '未知錯誤'}`)
  }

  // 靜態內容爬取（使用 axios + cheerio）
  private async scrapeStatic(url: string): Promise<ArticleContent | null> {
    try {
      // 添加隨機延遲以避免被偵測
      await this.delay(Math.random() * 1000 + 500)
      
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'DNT': '1',
        },
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // 接受 4xx 錯誤，讓動態爬取處理
      })

      if (response.status === 403 || response.status === 429) {
        return null
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const $ = cheerio.load(response.data)
      const domain = new URL(url).hostname
      
      return this.extractContent($, url, domain)
    } catch (error) {
      console.error('靜態爬取失敗:', error)
      return null
    }
  }

  // 動態內容爬取（使用 Playwright）
  private async scrapeDynamic(url: string): Promise<ArticleContent | null> {
    try {
      await this.initBrowser()
      if (!this.browser) throw new Error('瀏覽器初始化失敗')

      const context = await this.browser.newContext({
        userAgent: this.config.userAgent,
        viewport: { width: 1920, height: 1080 },
        locale: 'zh-TW',
        timezoneId: 'Asia/Taipei',
        // 模擬真實瀏覽器行為
        extraHTTPHeaders: {
          'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
        }
      })

      const page = await context.newPage()

      // 設定額外的反偵測措施
      await page.addInitScript(() => {
        // 移除 webdriver 標記
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        })
      })

      // 載入頁面
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout
      })

      // 等待內容載入
      await page.waitForTimeout(3000)

      // 模擬人類行為：隨機滾動
      await page.evaluate(() => {
        const scrollHeight = document.body.scrollHeight
        const viewportHeight = window.innerHeight
        const scrollSteps = Math.floor(scrollHeight / viewportHeight)
        
        for (let i = 0; i < scrollSteps; i++) {
          setTimeout(() => {
            window.scrollTo(0, i * viewportHeight)
          }, i * 200)
        }
      })
      
      await page.waitForTimeout(2000)

      // 獲取頁面內容
      const html = await page.content()
      await context.close()

      const $ = cheerio.load(html)
      const domain = new URL(url).hostname
      
      return this.extractContent($, url, domain)
    } catch (error) {
      console.error('動態爬取失敗:', error)
      return null
    }
  }

  // 內容提取核心邏輯
  private extractContent($: cheerio.Root, url: string, domain: string): ArticleContent {
    // 獲取網站特定的選擇器配置
    const siteConfig = SITE_SELECTORS[domain] || SITE_SELECTORS['default']
    
    // 移除不需要的元素
    siteConfig.removeElements.forEach(selector => {
      $(selector).remove()
    })

    // 提取標題
    const title = this.extractBySelectors($, siteConfig.title) || 
                  $('title').text().trim() || 
                  '未知標題'

    // 提取內容
    let content = this.extractBySelectors($, siteConfig.content)
    if (!content) {
      // 備用策略：尋找包含最多文字的元素
      content = this.extractMainContent($)
    }

    // 清理內容
    content = this.cleanContent(content)

    // 提取其他資訊
    const author = this.extractBySelectors($, siteConfig.author)
    const publishDate = this.extractBySelectors($, siteConfig.publishDate)
    const excerpt = this.extractBySelectors($, siteConfig.excerpt) || 
                   content.substring(0, 200) + '...'

    // 提取標籤（從 meta keywords 或內容中）
    const tags = this.extractTags($)

    // 獲取網站名稱
    const source = this.extractSource($, domain)

    return {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim(),
      author: author?.trim(),
      publishDate: publishDate?.trim(),
      tags,
      url,
      source
    }
  }

  // 使用選擇器提取文字
  private extractBySelectors($: cheerio.Root, selectors: string[]): string | null {
    for (const selector of selectors) {
      const element = $(selector).first()
      if (element.length > 0) {
        const text = element.text().trim()
        if (text.length > 0) {
          return text
        }
      }
    }
    return null
  }

  // 提取主要內容（備用策略）
  private extractMainContent($: cheerio.Root): string {
    let maxLength = 0
    let bestContent = ''

    // 檢查常見的內容容器
    const contentSelectors = [
      'article', 'main', '.content', '.post', '.entry', 
      '[class*="content"]', '[class*="article"]', '[class*="post"]'
    ]

    contentSelectors.forEach(selector => {
      $(selector).each((_, element) => {
        const text = $(element).text().trim()
        if (text.length > maxLength) {
          maxLength = text.length
          bestContent = text
        }
      })
    })

    // 如果還是沒有找到，檢查所有 p 標籤
    if (bestContent.length < 100) {
      const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
      bestContent = paragraphs.join('\n\n')
    }

    return bestContent
  }

  // 清理內容
  private cleanContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')                    // 合併多個空格
      .replace(/\n\s*\n/g, '\n\n')            // 合併多個換行
      .replace(/^\s+|\s+$/g, '')              // 移除首尾空格
      .replace(/【[^】]*】/g, '')               // 移除【】內容
      .replace(/\([^)]*記者[^)]*\)/g, '')      // 移除記者資訊
      .replace(/更多新聞.*$/g, '')             // 移除底部相關新聞
      .replace(/延伸閱讀.*$/g, '')             // 移除延伸閱讀
  }



  // 提取標籤
  private extractTags($: cheerio.Root): string[] {
    const tags: string[] = []

    // 從 meta keywords 提取
    const keywords = $('meta[name="keywords"]').attr('content')
    if (keywords) {
      tags.push(...keywords.split(',').map(tag => tag.trim()))
    }

    // 從文章標籤提取
    $('.tag, .tags, [class*="tag"]').each((_, element) => {
      const tagText = $(element).text().trim()
      if (tagText && tagText.length < 20) {
        tags.push(tagText)
      }
    })

    return [...new Set(tags)].slice(0, 10) // 去重並限制數量
  }

  // 提取來源網站名稱
  private extractSource($: cheerio.Root, domain: string): string {
    // 嘗試從 meta 標籤獲取
    const siteName = $('meta[property="og:site_name"]').attr('content') ||
                    $('meta[name="application-name"]').attr('content')
    
    if (siteName) return siteName

    // 從域名推測
    const siteNames: Record<string, string> = {
      'chinatimes.com': '中時新聞網',
      'ltn.com.tw': '自由時報',
      'udn.com': '聯合新聞網',
      'ettoday.net': 'ETtoday新聞雲',
      'setn.com': '三立新聞網',
      'tvbs.com.tw': 'TVBS新聞網',
      'cna.com.tw': '中央社',
      'storm.mg': '風傳媒'
    }

    return siteNames[domain] || domain
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 驗證 URL 是否有效
  static isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // 獲取網站域名
  static getDomain(url: string): string {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  }
}

// 便利函數：快速爬取文章
export async function scrapeArticle(url: string): Promise<ArticleContent> {
  if (!WebScraper.isValidUrl(url)) {
    throw new Error('無效的 URL')
  }

  const scraper = new WebScraper()
  try {
    const result = await scraper.scrapeArticle(url)
    return result
  } finally {
    await scraper.close()
  }
}

// 便利函數：批量爬取文章
export async function scrapeMultipleArticles(urls: string[]): Promise<ArticleContent[]> {
  const scraper = new WebScraper()
  const results: ArticleContent[] = []
  
  try {
    for (const url of urls) {
      if (WebScraper.isValidUrl(url)) {
        try {
          const result = await scraper.scrapeArticle(url)
          results.push(result)
          
          // 延遲以避免被封鎖
          await scraper['delay'](2000)
        } catch (error) {
          console.error(`爬取失敗 ${url}:`, error)
        }
      }
    }
  } finally {
    await scraper.close()
  }
  
  return results
} 