// SEO 優化的新聞爬蟲系統
import { prisma } from '@/lib/prisma'
import { simpleScrapeArticle } from '@/lib/simple-scraper'
import { rewriteWithAI, rewriteTitleWithAI } from '@/lib/ai-service'

interface SEOContent {
  title: string
  content: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  ogTitle: string
  ogDescription: string
  structuredData: any
  readingTime: number
  relatedKeywords: string[]
}

export class SEONewsCrawler {
  private seoKeywords: string[] = []
  private aiProvider: string = 'openai'
  private apiKey: string = ''

  constructor() {
    this.loadSettings()
  }

  private async loadSettings() {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['seo_keywords', 'ai_provider', 'openai_api_key'] }
      }
    })

    const settingsMap = new Map(settings.map(s => [s.key, s.value]))
    this.seoKeywords = (settingsMap.get('seo_keywords') || '').split(',').map(k => k.trim())
    this.aiProvider = settingsMap.get('ai_provider') || 'openai'
    this.apiKey = settingsMap.get('openai_api_key') || ''
  }

  // 主要處理方法
  async processArticleForSEO(articleUrl: string, sourceName: string): Promise<any> {
    try {
      // 1. 爬取原始文章
      const rawArticle = await simpleScrapeArticle(articleUrl)
      
      // 2. SEO 分析和優化
      const seoContent = await this.optimizeForSEO(rawArticle)
      
      // 3. 生成結構化資料
      const structuredData = this.generateStructuredData(seoContent, articleUrl, sourceName)
      
      // 4. 找出相關文章
      const relatedArticles = await this.findRelatedArticles(seoContent.seoKeywords)
      
      // 5. 生成最終文章資料
      return {
        title: seoContent.title,
        slug: this.generateSEOSlug(seoContent.title),
        content: seoContent.content,
        excerpt: seoContent.excerpt,
        author: rawArticle.author || sourceName,
        tags: JSON.stringify(seoContent.seoKeywords),
        seoTitle: seoContent.seoTitle,
        seoDescription: seoContent.seoDescription,
        seoKeywords: seoContent.seoKeywords.join(', '),
        ogTitle: seoContent.ogTitle,
        ogDescription: seoContent.ogDescription,
        structuredData: JSON.stringify(structuredData),
        readingTime: seoContent.readingTime,
        sourceUrl: articleUrl,
        sourceName: sourceName,
        relatedNews: JSON.stringify(relatedArticles.map(a => a.id)),
        coverImage: await this.generateOrFindCoverImage(rawArticle)
      }
    } catch (error) {
      console.error('SEO 處理失敗:', error)
      throw error
    }
  }

  // SEO 優化核心方法
  private async optimizeForSEO(article: any): Promise<SEOContent> {
    // 計算閱讀時間
    const readingTime = Math.ceil(article.content.length / 300)
    
    // 提取和擴展關鍵字
    const extractedKeywords = this.extractKeywords(article.content)
    const allKeywords = [...new Set([...this.seoKeywords, ...extractedKeywords])]
    
    // AI 改寫並優化內容
    let optimizedContent = article.content
    let optimizedTitle = article.title
    
    if (this.apiKey) {
      // 改寫內容，加入 SEO 關鍵字
      optimizedContent = await rewriteWithAI(
        article.content,
        allKeywords.join(', '),
        this.aiProvider,
        this.apiKey
      )
      
      // 改寫標題
      optimizedTitle = await rewriteTitleWithAI(
        article.title,
        this.seoKeywords.slice(0, 3).join(', '),
        this.aiProvider,
        this.apiKey
      )
    }
    
    // 生成 SEO 優化的描述
    const seoDescription = this.generateSEODescription(optimizedContent, allKeywords)
    
    return {
      title: optimizedTitle,
      content: optimizedContent,
      excerpt: seoDescription,
      seoTitle: this.optimizeTitleLength(optimizedTitle, 60),
      seoDescription: this.optimizeTitleLength(seoDescription, 160),
      seoKeywords: allKeywords,
      ogTitle: this.optimizeTitleLength(optimizedTitle, 60),
      ogDescription: this.optimizeTitleLength(seoDescription, 160),
      structuredData: {},
      readingTime,
      relatedKeywords: extractedKeywords
    }
  }

  // 提取關鍵字
  private extractKeywords(content: string): string[] {
    // 汽車冷媒相關關鍵字庫
    const keywordPatterns = [
      /汽車冷媒/g, /冷氣系統/g, /R-?134a/gi, /R-?1234yf/gi,
      /冷凍油/g, /壓縮機/g, /冷凝器/g, /蒸發器/g,
      /冷媒回收/g, /環保冷媒/g, /冷媒充填/g, /冷媒檢測/g,
      /車用空調/g, /汽車空調/g, /冷氣維修/g, /冷氣保養/g
    ]
    
    const foundKeywords = new Set<string>()
    
    keywordPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => foundKeywords.add(match))
      }
    })
    
    return Array.from(foundKeywords).slice(0, 10)
  }

  // 生成 SEO 描述
  private generateSEODescription(content: string, keywords: string[]): string {
    // 提取第一段或前200字
    let description = content.substring(0, 200).replace(/\n/g, ' ').trim()
    
    // 確保包含關鍵字
    const primaryKeyword = keywords[0]
    if (primaryKeyword && !description.includes(primaryKeyword)) {
      description = `${primaryKeyword} - ${description}`
    }
    
    return description + '...'
  }

  // 生成結構化資料
  private generateStructuredData(seo: SEOContent, url: string, source: string): any {
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": seo.title,
      "description": seo.seoDescription,
      "url": url,
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": source
      },
      "publisher": {
        "@type": "Organization",
        "name": "車冷博士",
        "logo": {
          "@type": "ImageObject",
          "url": "https://your-domain.com/logo.png"
        }
      },
      "keywords": seo.seoKeywords.join(", "),
      "articleSection": "汽車冷氣資訊",
      "wordCount": seo.content.length,
      "timeRequired": `PT${seo.readingTime}M`
    }
  }

  // 尋找相關文章
  private async findRelatedArticles(keywords: string[]): Promise<any[]> {
    try {
      // 使用標籤搜尋相關文章
      const relatedNews = await prisma.news.findMany({
        where: {
          isPublished: true,
          tags: {
            contains: keywords[0]
          }
        },
        select: {
          id: true,
          title: true,
          slug: true
        },
        take: 5,
        orderBy: {
          publishedAt: 'desc'
        }
      })
      
      return relatedNews
    } catch (error) {
      console.error('尋找相關文章失敗:', error)
      return []
    }
  }

  // 生成 SEO 友好的 slug
  private generateSEOSlug(title: string): string {
    // 移除中文字符，只保留英文和數字
    let slug = title
      .toLowerCase()
      .trim()
      // 移除中文字符
      .replace(/[\u4e00-\u9fa5]/g, '')
      // 移除特殊字符
      .replace(/[^\w\s-]/g, '')
      // 替換空格為連字符
      .replace(/[\s_]+/g, '-')
      // 移除首尾的連字符
      .replace(/^-+|-+$/g, '')
    
    // 如果 slug 太短或為空，使用預設值
    if (!slug || slug.length < 3) {
      slug = 'news-article'
    }
    
    // 限制長度
    slug = slug.substring(0, 50)
    
    // 加上時間戳的後 8 位確保唯一性
    return `${slug}-${Date.now().toString().slice(-8)}`
  }

  // 優化標題長度
  private optimizeTitleLength(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  // 生成或尋找封面圖片
  private async generateOrFindCoverImage(article: any): Promise<string | null> {
    // TODO: 實現圖片處理邏輯
    // 1. 從文章中提取圖片
    // 2. 或使用 AI 生成相關圖片
    // 3. 或使用預設圖片
    return null
  }
}