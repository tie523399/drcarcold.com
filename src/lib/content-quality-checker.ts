// 內容品質檢查系統
// 用於評估爬取文章的品質和完整性

import { convertToTraditional, detectSimplifiedChinese, isTraditionalChinese } from '@/lib/chinese-converter'

// 內容品質評分
export interface QualityScore {
  overall: number // 0-100
  contentLength: number
  hasTitle: boolean
  hasAuthor: boolean
  hasDate: boolean
  hasImages: boolean
  hasTags: boolean
  isTraditionalChinese: boolean
  readability: number
  seoOptimization: number
  issues: string[]
  suggestions: string[]
}

// 文章內容介面
export interface ArticleData {
  title: string
  content: string
  author?: string
  publishDate?: string
  tags?: string[]
  coverImage?: string
  excerpt?: string
}

export class ContentQualityChecker {
  // 最小內容長度（字符）
  private readonly MIN_CONTENT_LENGTH = 200
  
  // 理想內容長度
  private readonly IDEAL_CONTENT_LENGTH = 800
  
  // SEO 關鍵字密度範圍
  private readonly KEYWORD_DENSITY_MIN = 0.01 // 1%
  private readonly KEYWORD_DENSITY_MAX = 0.03 // 3%
  
  /**
   * 檢查文章品質
   * @param article 文章資料
   * @param seoKeywords SEO 關鍵字
   * @returns 品質評分
   */
  checkQuality(article: ArticleData, seoKeywords: string[] = []): QualityScore {
    const score: QualityScore = {
      overall: 0,
      contentLength: article.content.length,
      hasTitle: false,
      hasAuthor: false,
      hasDate: false,
      hasImages: false,
      hasTags: false,
      isTraditionalChinese: false,
      readability: 0,
      seoOptimization: 0,
      issues: [],
      suggestions: []
    }
    
    // 1. 基本檢查
    this.checkBasicRequirements(article, score)
    
    // 2. 內容品質檢查
    this.checkContentQuality(article, score)
    
    // 3. 中文檢查
    this.checkChineseLanguage(article, score)
    
    // 4. SEO 優化檢查
    this.checkSEOOptimization(article, score, seoKeywords)
    
    // 5. 計算總分
    this.calculateOverallScore(score)
    
    // 6. 生成建議
    this.generateSuggestions(score)
    
    return score
  }
  
  /**
   * 檢查基本要求
   */
  private checkBasicRequirements(article: ArticleData, score: QualityScore): void {
    // 標題檢查
    if (article.title && article.title.trim().length > 0) {
      score.hasTitle = true
      if (article.title.length < 10) {
        score.issues.push('標題過短（少於10個字符）')
      } else if (article.title.length > 60) {
        score.issues.push('標題過長（超過60個字符）')
      }
    } else {
      score.issues.push('缺少標題')
    }
    
    // 作者檢查
    if (article.author && article.author.trim().length > 0) {
      score.hasAuthor = true
    }
    
    // 日期檢查
    if (article.publishDate && article.publishDate.trim().length > 0) {
      score.hasDate = true
    }
    
    // 圖片檢查
    if (article.coverImage && article.coverImage.trim().length > 0) {
      score.hasImages = true
    } else if (article.content.includes('<img') || article.content.includes('![')) {
      score.hasImages = true
    }
    
    // 標籤檢查
    if (article.tags && article.tags.length > 0) {
      score.hasTags = true
      if (article.tags.length < 3) {
        score.issues.push('標籤過少（建議至少3個）')
      }
    } else {
      score.issues.push('缺少標籤')
    }
  }
  
  /**
   * 檢查內容品質
   */
  private checkContentQuality(article: ArticleData, score: QualityScore): void {
    const content = article.content
    
    // 內容長度檢查
    if (content.length < this.MIN_CONTENT_LENGTH) {
      score.issues.push(`內容過短（少於${this.MIN_CONTENT_LENGTH}字符）`)
    } else if (content.length < this.IDEAL_CONTENT_LENGTH) {
      score.issues.push(`內容偏短（建議至少${this.IDEAL_CONTENT_LENGTH}字符）`)
    }
    
    // 段落結構檢查
    const paragraphs = this.countParagraphs(content)
    if (paragraphs < 3) {
      score.issues.push('段落過少（建議至少3個段落）')
    }
    
    // 可讀性評分
    score.readability = this.calculateReadability(content)
    if (score.readability < 60) {
      score.issues.push('內容可讀性較差')
    }
    
    // 檢查是否有亂碼
    if (this.hasGarbledText(content)) {
      score.issues.push('內容可能包含亂碼')
    }
    
    // 檢查是否有過多HTML標籤
    if (this.hasTooMuchHTML(content)) {
      score.issues.push('內容包含過多HTML標籤')
    }
  }
  
  /**
   * 檢查中文語言
   */
  private checkChineseLanguage(article: ArticleData, score: QualityScore): void {
    const fullText = `${article.title} ${article.content}`
    
    // 檢查是否為繁體中文
    score.isTraditionalChinese = isTraditionalChinese(fullText)
    
    if (!score.isTraditionalChinese) {
      const simplifiedChars = detectSimplifiedChinese(fullText)
      if (simplifiedChars.length > 0) {
        score.issues.push(`包含簡體字：${simplifiedChars.slice(0, 10).join(', ')}${simplifiedChars.length > 10 ? '...' : ''}`)
      }
    }
    
    // 檢查中文比例
    const chineseRatio = this.calculateChineseRatio(fullText)
    if (chineseRatio < 0.5) {
      score.issues.push('中文內容比例過低（少於50%）')
    }
  }
  
  /**
   * 檢查SEO優化
   */
  private checkSEOOptimization(article: ArticleData, score: QualityScore, keywords: string[]): void {
    if (keywords.length === 0) {
      score.seoOptimization = 50 // 沒有關鍵字時給予基本分數
      return
    }
    
    const content = `${article.title} ${article.content}`.toLowerCase()
    const contentWords = content.length
    let keywordCount = 0
    let keywordsFound = 0
    
    // 計算關鍵字密度
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword.toLowerCase(), 'g')
      const matches = content.match(regex)
      if (matches) {
        keywordCount += matches.length
        keywordsFound++
      }
    })
    
    const avgKeywordLength = keywords.reduce((sum, kw) => sum + kw.length, 0) / keywords.length
    const keywordDensity = keywordCount / (contentWords / avgKeywordLength)
    
    // 評分
    if (keywordsFound === 0) {
      score.seoOptimization = 0
      score.issues.push('未找到任何SEO關鍵字')
    } else if (keywordDensity < this.KEYWORD_DENSITY_MIN) {
      score.seoOptimization = 30
      score.issues.push('SEO關鍵字密度過低')
    } else if (keywordDensity > this.KEYWORD_DENSITY_MAX) {
      score.seoOptimization = 40
      score.issues.push('SEO關鍵字密度過高（可能過度優化）')
    } else {
      score.seoOptimization = 80 + (keywordsFound / keywords.length) * 20
    }
    
    // 檢查標題是否包含關鍵字
    const titleHasKeyword = keywords.some(keyword => 
      article.title.toLowerCase().includes(keyword.toLowerCase())
    )
    if (!titleHasKeyword) {
      score.issues.push('標題未包含SEO關鍵字')
    }
  }
  
  /**
   * 計算總分
   */
  private calculateOverallScore(score: QualityScore): void {
    let total = 0
    let weight = 0
    
    // 基本要求（40%）
    const basicScore = (
      (score.hasTitle ? 10 : 0) +
      (score.hasAuthor ? 5 : 0) +
      (score.hasDate ? 5 : 0) +
      (score.hasImages ? 10 : 0) +
      (score.hasTags ? 10 : 0)
    )
    total += basicScore
    weight += 40
    
    // 內容品質（30%）
    const contentScore = Math.min(100, (score.contentLength / this.IDEAL_CONTENT_LENGTH) * 100)
    total += contentScore * 0.3
    weight += 30
    
    // 可讀性（10%）
    total += score.readability * 0.1
    weight += 10
    
    // 語言品質（10%）
    total += (score.isTraditionalChinese ? 100 : 50) * 0.1
    weight += 10
    
    // SEO優化（10%）
    total += score.seoOptimization * 0.1
    weight += 10
    
    // 扣分項目
    const penalty = score.issues.length * 5
    score.overall = Math.max(0, Math.min(100, total - penalty))
  }
  
  /**
   * 生成建議
   */
  private generateSuggestions(score: QualityScore): void {
    if (!score.hasTitle) {
      score.suggestions.push('添加有吸引力的標題')
    }
    
    if (!score.hasAuthor) {
      score.suggestions.push('標註文章作者')
    }
    
    if (!score.hasDate) {
      score.suggestions.push('添加發布日期')
    }
    
    if (!score.hasImages) {
      score.suggestions.push('添加相關圖片以提高吸引力')
    }
    
    if (!score.hasTags || score.issues.includes('標籤過少')) {
      score.suggestions.push('添加更多相關標籤（建議3-5個）')
    }
    
    if (score.contentLength < this.IDEAL_CONTENT_LENGTH) {
      score.suggestions.push('擴充內容以提供更多價值')
    }
    
    if (!score.isTraditionalChinese) {
      score.suggestions.push('將簡體字轉換為繁體字')
    }
    
    if (score.readability < 70) {
      score.suggestions.push('簡化句子結構，使用更多段落分隔')
    }
    
    if (score.seoOptimization < 50) {
      score.suggestions.push('適當加入SEO關鍵字（但避免過度堆砌）')
    }
  }
  
  /**
   * 計算段落數量
   */
  private countParagraphs(content: string): number {
    // 移除HTML標籤
    const text = content.replace(/<[^>]*>/g, '')
    // 分割段落
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50)
    return paragraphs.length
  }
  
  /**
   * 計算可讀性分數
   */
  private calculateReadability(content: string): number {
    // 簡化的可讀性計算
    const text = content.replace(/<[^>]*>/g, '')
    const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0)
    const avgSentenceLength = text.length / Math.max(1, sentences.length)
    
    // 理想句子長度為20-40字符
    if (avgSentenceLength >= 20 && avgSentenceLength <= 40) {
      return 90
    } else if (avgSentenceLength < 20) {
      return 70 // 句子過短
    } else if (avgSentenceLength > 60) {
      return 50 // 句子過長
    } else {
      return 70
    }
  }
  
  /**
   * 檢查是否有亂碼
   */
  private hasGarbledText(content: string): boolean {
    // 檢查常見的亂碼模式
    const garbledPatterns = [
      /[\x00-\x1F\x7F-\x9F]/, // 控制字符
      /[�]/g, // 替換字符
      /[\uFFFD]/g, // 替換字符
      /(?:[\u4e00-\u9fa5]){1}(?:[a-zA-Z0-9]){3,}(?:[\u4e00-\u9fa5]){1}/g // 中英混雜
    ]
    
    return garbledPatterns.some(pattern => pattern.test(content))
  }
  
  /**
   * 檢查是否有過多HTML標籤
   */
  private hasTooMuchHTML(content: string): boolean {
    const htmlTags = content.match(/<[^>]+>/g) || []
    const textLength = content.replace(/<[^>]*>/g, '').length
    const tagRatio = htmlTags.length / Math.max(1, textLength / 100)
    
    return tagRatio > 5 // 每100字符超過5個標籤
  }
  
  /**
   * 計算中文字符比例
   */
  private calculateChineseRatio(text: string): number {
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
    const totalChars = text.replace(/\s/g, '').length
    return totalChars > 0 ? chineseChars.length / totalChars : 0
  }
  
  /**
   * 批量檢查文章品質
   */
  batchCheckQuality(articles: ArticleData[], seoKeywords: string[] = []): QualityScore[] {
    return articles.map(article => this.checkQuality(article, seoKeywords))
  }
  
  /**
   * 自動修復內容問題
   */
  autoFixContent(article: ArticleData): ArticleData {
    const fixed = { ...article }
    
    // 1. 轉換簡體字為繁體字
    if (!isTraditionalChinese(fixed.content)) {
      fixed.content = convertToTraditional(fixed.content)
      fixed.title = convertToTraditional(fixed.title)
    }
    
    // 2. 清理HTML標籤（保留基本格式）
    fixed.content = this.cleanHTML(fixed.content)
    
    // 3. 修復段落格式
    fixed.content = this.fixParagraphs(fixed.content)
    
    // 4. 生成摘要（如果沒有）
    if (!fixed.excerpt) {
      fixed.excerpt = this.generateExcerpt(fixed.content)
    }
    
    return fixed
  }
  
  /**
   * 清理HTML標籤
   */
  private cleanHTML(content: string): string {
    // 保留段落和換行
    let cleaned = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
      .replace(/<p>/gi, '\n\n')
      .replace(/<\/p>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
    
    return cleaned.trim()
  }
  
  /**
   * 修復段落格式
   */
  private fixParagraphs(content: string): string {
    // 將連續的空白行合併為兩個換行
    return content
      .split(/\n{3,}/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .join('\n\n')
  }
  
  /**
   * 生成摘要
   */
  private generateExcerpt(content: string, length: number = 150): string {
    const cleaned = this.cleanHTML(content)
    if (cleaned.length <= length) {
      return cleaned
    }
    
    // 在句子結尾處截斷
    const truncated = cleaned.substring(0, length)
    const lastPeriod = truncated.lastIndexOf('。')
    
    if (lastPeriod > length * 0.8) {
      return truncated.substring(0, lastPeriod + 1)
    }
    
    return truncated + '...'
  }
} 