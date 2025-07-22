// 內容去重檢查器
// 使用多種策略來檢測重複內容

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// 相似度閾值配置
const SIMILARITY_THRESHOLDS = {
  URL_SIMILARITY: 0.9,      // URL 相似度閾值
  TITLE_SIMILARITY: 0.85,   // 標題相似度閾值
  CONTENT_SIMILARITY: 0.8,  // 內容相似度閾值
  HASH_MATCH: 1.0          // 完全匹配
}

// 去重檢查結果
export interface DuplicateCheckResult {
  isDuplicate: boolean
  confidence: number  // 0-1 的置信度
  duplicateType?: 'url' | 'title' | 'content' | 'hash'
  existingArticleId?: string
  existingArticleTitle?: string
  reason?: string
}

export class DuplicateChecker {
  // 檢查文章是否重複
  async checkDuplicate(
    url: string,
    title: string,
    content: string,
    sourceId?: string
  ): Promise<DuplicateCheckResult> {
    // 1. 檢查 URL 是否完全相同
    const urlCheck = await this.checkByUrl(url)
    if (urlCheck.isDuplicate) {
      return urlCheck
    }

    // 2. 檢查標題相似度
    const titleCheck = await this.checkByTitle(title, sourceId)
    if (titleCheck.isDuplicate) {
      return titleCheck
    }

    // 3. 檢查內容哈希
    const hashCheck = await this.checkByContentHash(content)
    if (hashCheck.isDuplicate) {
      return hashCheck
    }

    // 4. 檢查內容相似度（較耗時，最後檢查）
    const contentCheck = await this.checkByContentSimilarity(content, title)
    if (contentCheck.isDuplicate) {
      return contentCheck
    }

    return {
      isDuplicate: false,
      confidence: 0
    }
  }

  // 通過 URL 檢查
  private async checkByUrl(url: string): Promise<DuplicateCheckResult> {
    // 規範化 URL（移除查詢參數、錨點等）
    const normalizedUrl = this.normalizeUrl(url)
    
    const existing = await prisma.news.findFirst({
      where: {
        OR: [
          { sourceUrl: url },
          { sourceUrl: normalizedUrl }
        ]
      }
    })

    if (existing) {
      return {
        isDuplicate: true,
        confidence: 1.0,
        duplicateType: 'url',
        existingArticleId: existing.id,
        existingArticleTitle: existing.title,
        reason: 'URL 完全相同'
      }
    }

    return { isDuplicate: false, confidence: 0 }
  }

  // 通過標題檢查
  private async checkByTitle(title: string, sourceId?: string): Promise<DuplicateCheckResult> {
    // 清理標題（移除特殊字符、空格等）
    const cleanTitle = this.cleanText(title)
    
    // 查找最近 7 天的文章
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 7)
    
    const recentArticles = await prisma.news.findMany({
      where: {
        createdAt: {
          gte: recentDate
        }
      },
      select: {
        id: true,
        title: true,
        // @ts-ignore - sourceId 欄位需要 prisma generate
        sourceId: true
      }
    })

    for (const article of recentArticles) {
      const cleanExistingTitle = this.cleanText(article.title)
      const similarity = this.calculateSimilarity(cleanTitle, cleanExistingTitle)
      
      if (similarity >= SIMILARITY_THRESHOLDS.TITLE_SIMILARITY) {
        // 如果是同一個來源的文章，降低相似度要求
        // @ts-ignore - sourceId 欄位需要 prisma generate
        const threshold = article.sourceId === sourceId 
          ? SIMILARITY_THRESHOLDS.TITLE_SIMILARITY - 0.1 
          : SIMILARITY_THRESHOLDS.TITLE_SIMILARITY
          
        if (similarity >= threshold) {
          return {
            isDuplicate: true,
            confidence: similarity,
            duplicateType: 'title',
            existingArticleId: article.id,
            existingArticleTitle: article.title,
            reason: `標題相似度過高 (${Math.round(similarity * 100)}%)`
          }
        }
      }
    }

    return { isDuplicate: false, confidence: 0 }
  }

  // 通過內容哈希檢查
  private async checkByContentHash(content: string): Promise<DuplicateCheckResult> {
    const contentHash = this.generateContentHash(content)
    
    // @ts-ignore - contentHash 欄位需要 prisma generate
    const existing = await prisma.news.findFirst({
      where: {
        contentHash: contentHash
      }
    })

    if (existing) {
      return {
        isDuplicate: true,
        confidence: 1.0,
        duplicateType: 'hash',
        existingArticleId: existing.id,
        existingArticleTitle: existing.title,
        reason: '內容完全相同'
      }
    }

    return { isDuplicate: false, confidence: 0 }
  }

  // 通過內容相似度檢查
  private async checkByContentSimilarity(
    content: string, 
    title: string
  ): Promise<DuplicateCheckResult> {
    // 提取內容特徵
    const contentFeatures = this.extractContentFeatures(content)
    
    // 查找最近 3 天的文章
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 3)
    
    const recentArticles = await prisma.news.findMany({
      where: {
        createdAt: {
          gte: recentDate
        },
        content: {
          not: ""
        }
      },
      select: {
        id: true,
        title: true,
        content: true
      },
      take: 100 // 限制數量以提高性能
    })

    for (const article of recentArticles) {
      if (!article.content) continue
      
      const existingFeatures = this.extractContentFeatures(article.content)
      const similarity = this.compareContentFeatures(contentFeatures, existingFeatures)
      
      if (similarity >= SIMILARITY_THRESHOLDS.CONTENT_SIMILARITY) {
        return {
          isDuplicate: true,
          confidence: similarity,
          duplicateType: 'content',
          existingArticleId: article.id,
          existingArticleTitle: article.title,
          reason: `內容相似度過高 (${Math.round(similarity * 100)}%)`
        }
      }
    }

    return { isDuplicate: false, confidence: 0 }
  }

  // 規範化 URL
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      // 移除查詢參數和錨點
      urlObj.search = ''
      urlObj.hash = ''
      // 統一使用小寫
      return urlObj.toString().toLowerCase()
    } catch {
      return url.toLowerCase()
    }
  }

  // 清理文本
  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, '') // 只保留中文、英文和數字
      .trim()
  }

  // 計算字符串相似度（使用 Jaccard 相似度）
  private calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0
    
    // 將字符串轉換為字符集合
    const set1 = new Set(str1.split(''))
    const set2 = new Set(str2.split(''))
    
    // 計算交集
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    
    // 計算並集
    const union = new Set([...set1, ...set2])
    
    // Jaccard 相似度
    return intersection.size / union.size
  }

  // 生成內容哈希
  generateContentHash(content: string): string {
    const cleanContent = this.cleanText(content)
    return crypto.createHash('md5').update(cleanContent).digest('hex')
  }

  // 提取內容特徵（用於相似度比較）
  private extractContentFeatures(content: string): string[] {
    const cleanContent = this.cleanText(content)
    
    // 提取關鍵詞（簡單實現，可以改進）
    const words = cleanContent.match(/[\u4e00-\u9fa5]+|[a-z]+/g) || []
    
    // 過濾掉太短的詞
    const keywords = words.filter(word => word.length > 2)
    
    // 計算詞頻，選擇前 20 個高頻詞作為特徵
    const wordFreq = new Map<string, number>()
    keywords.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word)
  }

  // 比較內容特徵
  private compareContentFeatures(features1: string[], features2: string[]): number {
    if (features1.length === 0 || features2.length === 0) return 0
    
    const set1 = new Set(features1)
    const set2 = new Set(features2)
    
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }

  // 批量檢查去重（優化性能）
  async batchCheckDuplicates(
    articles: Array<{ url: string; title: string; content: string; sourceId?: string }>
  ): Promise<Map<number, DuplicateCheckResult>> {
    const results = new Map<number, DuplicateCheckResult>()
    
    // 並行檢查，但限制並發數
    const batchSize = 5
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      const batchResults = await Promise.all(
        batch.map((article, index) => 
          this.checkDuplicate(article.url, article.title, article.content, article.sourceId)
        )
      )
      
      batchResults.forEach((result, index) => {
        results.set(i + index, result)
      })
    }
    
    return results
  }

  // 更新文章的內容哈希（用於現有文章）
  async updateContentHash(articleId: string, content: string): Promise<void> {
    const contentHash = this.generateContentHash(content)
    
    // @ts-ignore - contentHash 欄位需要 prisma generate
    await prisma.news.update({
      where: { id: articleId },
      data: { contentHash }
    })
  }
} 