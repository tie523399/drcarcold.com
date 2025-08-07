// URL驗證和404檢測工具
import { prisma } from './prisma'

interface URLValidationResult {
  isValid: boolean
  statusCode: number
  error?: string
  redirectUrl?: string
  contentType?: string
  responseTime?: number
}

interface URLHealth {
  url: string
  isHealthy: boolean
  lastChecked: Date
  statusCode: number
  errorCount: number
  lastError?: string
}

export class URLValidator {
  private static instance: URLValidator
  private cache = new Map<string, URLValidationResult>()
  private cacheTimeout = 60000 * 5 // 5分鐘緩存

  public static getInstance(): URLValidator {
    if (!URLValidator.instance) {
      URLValidator.instance = new URLValidator()
    }
    return URLValidator.instance
  }

  /**
   * 驗證URL是否可訪問，檢查404等錯誤
   */
  async validateURL(url: string): Promise<URLValidationResult> {
    const startTime = Date.now()
    
    try {
      // 檢查緩存
      const cached = this.cache.get(url)
      if (cached && Date.now() - startTime < this.cacheTimeout) {
        return cached
      }

      console.log(`🔍 驗證URL: ${url}`)

      // 創建帶超時的fetch請求
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超時

      const response = await fetch(url, {
        method: 'HEAD', // 使用HEAD請求減少流量
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-TW,zh;q=0.8,en;q=0.6',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        signal: controller.signal,
        redirect: 'follow'
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      const result: URLValidationResult = {
        isValid: response.ok,
        statusCode: response.status,
        contentType: response.headers.get('content-type') || undefined,
        responseTime,
        redirectUrl: response.url !== url ? response.url : undefined
      }

      // 詳細的狀態檢查
      if (!response.ok) {
        if (response.status === 404) {
          result.error = 'URL不存在 (404 Not Found)'
        } else if (response.status === 403) {
          result.error = '禁止訪問 (403 Forbidden)'
        } else if (response.status === 500) {
          result.error = '服務器錯誤 (500 Internal Server Error)'
        } else if (response.status === 503) {
          result.error = '服務不可用 (503 Service Unavailable)'
        } else {
          result.error = `HTTP錯誤: ${response.status} ${response.statusText}`
        }
      }

      // 檢查內容類型
      const contentType = response.headers.get('content-type')
      if (contentType && !contentType.includes('text/html')) {
        result.isValid = false
        result.error = `不是HTML內容: ${contentType}`
      }

      // 更新緩存
      this.cache.set(url, result)

      // 記錄到資料庫
      await this.recordURLHealth(url, result)

      console.log(`${result.isValid ? '✅' : '❌'} URL驗證結果: ${url} (${result.statusCode}) ${result.error || 'OK'}`)
      
      return result

    } catch (error: any) {
      const responseTime = Date.now() - startTime
      
      let errorMessage = 'URL驗證失敗'
      if (error.name === 'AbortError') {
        errorMessage = 'URL驗證超時 (10秒)'
      } else if (error.code === 'ENOTFOUND') {
        errorMessage = 'DNS解析失敗'
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = '連接被拒絕'
      } else if (error.code === 'ECONNRESET') {
        errorMessage = '連接被重置'
      } else {
        errorMessage = error.message || '未知錯誤'
      }

      const result: URLValidationResult = {
        isValid: false,
        statusCode: 0,
        error: errorMessage,
        responseTime
      }

      // 記錄錯誤
      await this.recordURLHealth(url, result)

      console.log(`❌ URL驗證失敗: ${url} - ${errorMessage}`)
      
      return result
    }
  }

  /**
   * 批量驗證URL
   */
  async validateURLs(urls: string[]): Promise<URLValidationResult[]> {
    console.log(`🔍 批量驗證 ${urls.length} 個URL...`)
    
    const results: URLValidationResult[] = []
    
    // 分批處理避免過多並發請求
    const batchSize = 5
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize)
      
      const batchResults = await Promise.allSettled(
        batch.map(url => this.validateURL(url))
      )
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({
            isValid: false,
            statusCode: 0,
            error: `批量驗證失敗: ${result.reason}`
          })
        }
      }
      
      // 添加延遲避免過快請求
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const validCount = results.filter(r => r.isValid).length
    console.log(`✅ 批量驗證完成: ${validCount}/${urls.length} 個URL有效`)
    
    return results
  }

  /**
   * 記錄URL健康狀況到資料庫
   */
  private async recordURLHealth(url: string, result: URLValidationResult): Promise<void> {
    try {
      const existing = await prisma.setting.findUnique({
        where: { key: `url_health_${Buffer.from(url).toString('base64').slice(0, 50)}` }
      })

      const healthData: URLHealth = {
        url,
        isHealthy: result.isValid,
        lastChecked: new Date(),
        statusCode: result.statusCode,
        errorCount: existing ? 
          (JSON.parse(existing.value).errorCount + (result.isValid ? 0 : 1)) : 
          (result.isValid ? 0 : 1),
        lastError: result.error
      }

      await prisma.setting.upsert({
        where: { key: `url_health_${Buffer.from(url).toString('base64').slice(0, 50)}` },
        create: {
          key: `url_health_${Buffer.from(url).toString('base64').slice(0, 50)}`,
          value: JSON.stringify(healthData)
        },
        update: {
          value: JSON.stringify(healthData)
        }
      })
    } catch (error) {
      console.error('記錄URL健康狀況失敗:', error)
    }
  }

  /**
   * 獲取URL健康報告
   */
  async getURLHealthReport(): Promise<URLHealth[]> {
    try {
      const healthRecords = await prisma.setting.findMany({
        where: {
          key: {
            startsWith: 'url_health_'
          }
        }
      })

      return healthRecords.map(record => {
        try {
          return JSON.parse(record.value) as URLHealth
        } catch {
          return {
            url: '解析失敗',
            isHealthy: false,
            lastChecked: new Date(),
            statusCode: 0,
            errorCount: 999
          }
        }
      }).sort((a, b) => b.errorCount - a.errorCount)

    } catch (error) {
      console.error('獲取URL健康報告失敗:', error)
      return []
    }
  }

  /**
   * 清理過期的URL健康記錄
   */
  async cleanupOldHealthRecords(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const healthRecords = await prisma.setting.findMany({
        where: {
          key: {
            startsWith: 'url_health_'
          }
        }
      })

      for (const record of healthRecords) {
        try {
          const health: URLHealth = JSON.parse(record.value)
          if (health.lastChecked < cutoffDate) {
            await prisma.setting.delete({
              where: { id: record.id }
            })
          }
        } catch {
          // 刪除無法解析的記錄
          await prisma.setting.delete({
            where: { id: record.id }
          })
        }
      }

      console.log('✅ URL健康記錄清理完成')
    } catch (error) {
      console.error('清理URL健康記錄失敗:', error)
    }
  }

  /**
   * 測試爬取URL的內容品質
   */
  async testContentQuality(url: string): Promise<{
    isValidContent: boolean
    issues: string[]
    contentLength: number
    hasTitle: boolean
    hasContent: boolean
  }> {
    const result = {
      isValidContent: false,
      issues: [],
      contentLength: 0,
      hasTitle: false,
      hasContent: false
    }

    try {
      // 首先驗證URL
      const urlResult = await this.validateURL(url)
      if (!urlResult.isValid) {
        result.issues.push(`URL驗證失敗: ${urlResult.error}`)
        return result
      }

      // 如果URL有效，測試實際抓取內容
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        result.issues.push(`HTTP錯誤: ${response.status}`)
        return result
      }

      const html = await response.text()
      const cheerio = await import('cheerio')
      const $ = cheerio.load(html)

      // 檢查標題
      const title = $('h1').first().text() || $('title').text()
      result.hasTitle = !!title && title.trim().length > 5
      if (!result.hasTitle) {
        result.issues.push('缺少有效標題')
      }

      // 檢查內容
      const content = $('article, .content, .post-content, .entry-content, main p').text()
      result.contentLength = content.length
      result.hasContent = content.length > 100
      if (!result.hasContent) {
        result.issues.push('內容過短或無法提取')
      }

      // 檢查是否為404頁面
      if (html.includes('404') || html.includes('Not Found') || 
          html.includes('頁面不存在') || html.includes('找不到頁面')) {
        result.issues.push('疑似404錯誤頁面')
      }

      result.isValidContent = result.hasTitle && result.hasContent && result.issues.length === 0

      return result

    } catch (error: any) {
      result.issues.push(`內容測試失敗: ${error.message}`)
      return result
    }
  }
}

// 導出單例
export const urlValidator = URLValidator.getInstance()
