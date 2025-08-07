// SEO排名檢測系統 - Google搜索排名監控
import { prisma } from '@/lib/prisma'

interface RankingResult {
  keyword: string
  position: number | null
  url: string
  title: string | null
  checkedAt: Date
  found: boolean
  error?: string
}

interface RankingHistory {
  id: string
  keyword: string
  position: number | null
  url: string
  title: string | null
  checkedAt: Date
  found: boolean
}

interface RankingStats {
  totalKeywords: number
  rankedKeywords: number
  averagePosition: number
  topRankings: number // 前10名數量
  improvements: number // 排名提升數量
  declines: number // 排名下降數量
}

export class SEORankingDetector {
  private domain: string
  private userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  private maxResults: number = 100 // 檢查前100個結果

  constructor(domain: string) {
    this.domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  /**
   * 檢測關鍵字在Google的排名
   */
  async checkKeywordRanking(keyword: string): Promise<RankingResult> {
    console.log(`🔍 檢測關鍵字排名: "${keyword}"`)
    
    try {
      // 使用多個搜索方法提高準確性
      const searchMethods = [
        () => this.searchWithGoogleAPI(keyword),
        () => this.searchWithScraping(keyword),
        () => this.searchWithProxy(keyword)
      ]

      let result: RankingResult | null = null
      let lastError: string = ''

      // 嘗試不同的搜索方法
      for (const method of searchMethods) {
        try {
          result = await method()
          if (result.found) break
        } catch (error: any) {
          lastError = error.message
          console.log(`搜索方法失敗: ${error.message}`)
          continue
        }
      }

      if (!result) {
        result = {
          keyword,
          position: null,
          url: '',
          title: null,
          checkedAt: new Date(),
          found: false,
          error: lastError || '所有搜索方法都失敗'
        }
      }

      // 保存結果到資料庫
      await this.saveRankingResult(result)
      
      return result

    } catch (error: any) {
      console.error(`排名檢測失敗: ${error.message}`)
      
      const errorResult: RankingResult = {
        keyword,
        position: null,
        url: '',
        title: null,
        checkedAt: new Date(),
        found: false,
        error: error.message
      }
      
      await this.saveRankingResult(errorResult)
      return errorResult
    }
  }

  /**
   * 使用Google Custom Search API (如果有配置)
   */
  private async searchWithGoogleAPI(keyword: string): Promise<RankingResult> {
    // 檢查是否有Google API配置
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'google_search_api_key' }
    })
    
    const cseIdSetting = await prisma.setting.findUnique({
      where: { key: 'google_cse_id' }
    })

    if (!apiKeySetting?.value || !cseIdSetting?.value) {
      throw new Error('Google Search API未配置')
    }

    const apiKey = apiKeySetting.value
    const cseId = cseIdSetting.value
    
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(keyword)}&num=50`
    
    const response = await fetch(searchUrl)
    
    if (!response.ok) {
      throw new Error(`Google API請求失敗: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.items) {
      for (let i = 0; i < data.items.length; i++) {
        const item = data.items[i]
        const itemUrl = new URL(item.link).hostname.replace('www.', '')
        
        if (itemUrl === this.domain) {
          return {
            keyword,
            position: i + 1,
            url: item.link,
            title: item.title,
            checkedAt: new Date(),
            found: true
          }
        }
      }
    }
    
    return {
      keyword,
      position: null,
      url: '',
      title: null,
      checkedAt: new Date(),
      found: false
    }
  }

  /**
   * 使用網頁抓取方式 (備用方法)
   */
  private async searchWithScraping(keyword: string): Promise<RankingResult> {
    // 使用代理搜索 - 這是一個簡化版本
    // 實際使用時可能需要更複雜的處理來避免被封鎖
    
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&num=100&hl=zh-TW`
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.8,en;q=0.6',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      throw new Error(`搜索請求失敗: ${response.status}`)
    }

    const html = await response.text()
    
    // 簡單的HTML解析來找到排名
    // 注意：這是一個基本實現，實際使用時可能需要更強的解析
    const urlPattern = new RegExp(`https?://[^/]*${this.domain.replace('.', '\\.')}[^\\s"'<>]*`, 'gi')
    const matches = html.match(urlPattern)
    
    if (matches && matches.length > 0) {
      // 估算排名位置（這是一個簡化方法）
      const firstMatch = matches[0]
      const position = Math.floor(html.indexOf(firstMatch) / 1000) + 1 // 粗略估算
      
      return {
        keyword,
        position: Math.min(position, 100),
        url: firstMatch,
        title: null, // 從HTML中提取標題會更複雜
        checkedAt: new Date(),
        found: true
      }
    }
    
    return {
      keyword,
      position: null,
      url: '',
      title: null,
      checkedAt: new Date(),
      found: false
    }
  }

  /**
   * 使用代理服務 (可選)
   */
  private async searchWithProxy(keyword: string): Promise<RankingResult> {
    // 這裡可以整合第三方SEO排名檢測服務
    // 例如: SerpAPI, ScrapingBee等
    throw new Error('代理搜索服務未配置')
  }

  /**
   * 批量檢測多個關鍵字
   */
  async checkMultipleKeywords(keywords: string[]): Promise<RankingResult[]> {
    console.log(`🔍 開始批量檢測 ${keywords.length} 個關鍵字...`)
    
    const results: RankingResult[] = []
    
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i].trim()
      if (!keyword) continue
      
      console.log(`進度: ${i + 1}/${keywords.length} - ${keyword}`)
      
      try {
        const result = await this.checkKeywordRanking(keyword)
        results.push(result)
        
        // 添加延遲避免被限制
        if (i < keywords.length - 1) {
          await this.delay(2000 + Math.random() * 3000) // 2-5秒隨機延遲
        }
        
      } catch (error: any) {
        console.error(`檢測 "${keyword}" 失敗:`, error.message)
        results.push({
          keyword,
          position: null,
          url: '',
          title: null,
          checkedAt: new Date(),
          found: false,
          error: error.message
        })
      }
    }
    
    console.log(`✅ 批量檢測完成，成功檢測 ${results.filter(r => r.found).length}/${results.length} 個關鍵字`)
    
    return results
  }

  /**
   * 保存排名結果到資料庫
   */
  private async saveRankingResult(result: RankingResult): Promise<void> {
    try {
      // 使用原始SQL查詢來保存結果（暫時解決方案）
      await (prisma as any).seoRanking.create({
        data: {
          keyword: result.keyword,
          position: result.position,
          url: result.url,
          title: result.title,
          found: result.found,
          error: result.error,
          checkedAt: result.checkedAt,
          domain: this.domain
        }
      })
    } catch (error) {
      console.error('保存排名結果失敗:', error)
      // 作為fallback，使用原始SQL
      try {
        await prisma.$executeRaw`
          INSERT INTO seo_rankings (id, keyword, position, url, title, found, error, domain, checkedAt)
          VALUES (${Math.random().toString(36)}, ${result.keyword}, ${result.position}, ${result.url}, ${result.title}, ${result.found}, ${result.error}, ${this.domain}, ${result.checkedAt.toISOString()})
        `
      } catch (rawError) {
        console.error('原始SQL保存也失敗:', rawError)
      }
    }
  }

  /**
   * 獲取關鍵字排名歷史
   */
  async getRankingHistory(keyword: string, days: number = 30): Promise<RankingHistory[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    try {
      const history = await (prisma as any).seoRanking.findMany({
        where: {
          keyword,
          domain: this.domain,
          checkedAt: {
            gte: startDate
          }
        },
        orderBy: {
          checkedAt: 'desc'
        },
        select: {
          id: true,
          keyword: true,
          position: true,
          url: true,
          title: true,
          checkedAt: true,
          found: true
        }
      })
      
      return history
    } catch (error) {
      console.error('獲取排名歷史失敗:', error)
      return []
    }
  }

  /**
   * 獲取排名統計
   */
  async getRankingStats(): Promise<RankingStats> {
    try {
      // 獲取最新的排名數據
      const latestRankings = await (prisma as any).seoRanking.groupBy({
        by: ['keyword'],
        where: {
          domain: this.domain,
          found: true
        },
        _max: {
          checkedAt: true
        }
      })

    const totalKeywords = latestRankings.length
    
    if (totalKeywords === 0) {
      return {
        totalKeywords: 0,
        rankedKeywords: 0,
        averagePosition: 0,
        topRankings: 0,
        improvements: 0,
        declines: 0
      }
    }

      // 獲取最新排名詳情
      const rankingDetails = await Promise.all(
        latestRankings.map(async (ranking: any) => {
          return await (prisma as any).seoRanking.findFirst({
            where: {
              keyword: ranking.keyword,
              domain: this.domain,
              checkedAt: ranking._max.checkedAt!
            }
          })
        })
      )

    const validRankings = rankingDetails.filter((r: any) => r && r.position)
    const rankedKeywords = validRankings.length
    
    if (rankedKeywords === 0) {
      return {
        totalKeywords,
        rankedKeywords: 0,
        averagePosition: 0,
        topRankings: 0,
        improvements: 0,
        declines: 0
      }
    }

    const positions = validRankings.map((r: any) => r!.position!).filter((p: number) => p > 0)
    const averagePosition = positions.reduce((sum: number, pos: number) => sum + pos, 0) / positions.length
    const topRankings = positions.filter((pos: number) => pos <= 10).length

    // 計算變化趨勢（與前一次檢測比較）
    let improvements = 0
    let declines = 0

    for (const ranking of validRankings as any[]) {
      if (!ranking) continue
      
        const previousRanking = await (prisma as any).seoRanking.findFirst({
          where: {
            keyword: ranking.keyword,
            domain: this.domain,
            checkedAt: {
              lt: ranking.checkedAt
            }
          },
          orderBy: {
            checkedAt: 'desc'
          }
        })

      if (previousRanking && previousRanking.position && ranking.position) {
        if (ranking.position < previousRanking.position) {
          improvements++
        } else if (ranking.position > previousRanking.position) {
          declines++
        }
      }
    }

      return {
        totalKeywords,
        rankedKeywords,
        averagePosition: Math.round(averagePosition * 10) / 10,
        topRankings,
        improvements,
        declines
      }
    } catch (error) {
      console.error('獲取排名統計失敗:', error)
      return {
        totalKeywords: 0,
        rankedKeywords: 0,
        averagePosition: 0,
        topRankings: 0,
        improvements: 0,
        declines: 0
      }
    }
  }

  /**
   * 獲取建議的關鍵字（基於現有排名）
   */
  async getSuggestedKeywords(): Promise<string[]> {
    try {
      // 這裡可以實現基於現有排名的關鍵字建議邏輯
      // 例如：長尾關鍵字、相關關鍵字等
      
      const existingKeywords = await (prisma as any).seoRanking.groupBy({
        by: ['keyword'],
        where: {
          domain: this.domain
        }
      })

    // 基於現有關鍵字生成建議（簡化版本）
    const suggestions: string[] = []
    
    for (const { keyword } of existingKeywords) {
      // 添加長尾關鍵字建議
      suggestions.push(`${keyword} 推薦`)
      suggestions.push(`${keyword} 價格`)
      suggestions.push(`${keyword} 教學`)
      suggestions.push(`最佳 ${keyword}`)
    }

      return [...new Set(suggestions)].slice(0, 20) // 去重並限制數量
    } catch (error) {
      console.error('獲取關鍵字建議失敗:', error)
      return []
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * 獲取或創建SEO排名檢測器實例
 */
export function createSEORankingDetector(domain?: string): SEORankingDetector {
  const siteDomain = domain || process.env.NEXT_PUBLIC_SITE_DOMAIN || 'drcarcold.com'
  return new SEORankingDetector(siteDomain)
}
