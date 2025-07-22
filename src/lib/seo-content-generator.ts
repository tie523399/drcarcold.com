// SEO 內容自動生成服務
import { prisma } from '@/lib/prisma'
import { getAIProvider } from '@/lib/ai-service'

interface SEOArticleTopic {
  title: string
  keywords: string[]
  outline: string[]
}

// 預定義的 SEO 文章主題庫
const SEO_TOPICS: SEOArticleTopic[] = [
  {
    title: '汽車冷氣系統維修保養完整指南',
    keywords: ['汽車冷氣維修', '冷氣保養', '冷媒添加', 'R134a', 'R1234yf'],
    outline: [
      '汽車冷氣系統的基本組成',
      '常見的冷氣故障症狀',
      '定期保養的重要性',
      '專業維修 vs DIY',
      '選擇合適的維修廠'
    ]
  },
  {
    title: 'R134a vs R1234yf 冷媒比較分析',
    keywords: ['R134a', 'R1234yf', '冷媒種類', '環保冷媒', '冷媒更換'],
    outline: [
      '冷媒的演進歷史',
      'R134a 的特性與應用',
      'R1234yf 的環保優勢',
      '兩種冷媒的成本比較',
      '更換冷媒的注意事項'
    ]
  },
  {
    title: '夏季汽車冷氣效能提升秘訣',
    keywords: ['冷氣效能', '冷氣不冷', '冷氣保養', '夏季保養', '冷氣濾網'],
    outline: [
      '影響冷氣效能的因素',
      '日常使用的正確方法',
      '提升冷氣效能的技巧',
      '冷氣濾網的重要性',
      '專業檢測的時機'
    ]
  },
  {
    title: '電動車冷氣系統特點與保養',
    keywords: ['電動車冷氣', '熱泵系統', '電動車保養', '節能冷氣', '電池溫控'],
    outline: [
      '電動車冷氣系統原理',
      '與傳統汽車的差異',
      '電動車冷氣保養要點',
      '節能使用技巧',
      '未來發展趨勢'
    ]
  },
  {
    title: '汽車冷氣異味問題解決方案',
    keywords: ['冷氣異味', '冷氣清潔', '濾網更換', '除霉', '冷氣消毒'],
    outline: [
      '冷氣異味的常見原因',
      '預防異味的方法',
      '清潔冷氣系統的步驟',
      '專業除臭服務',
      '定期保養的重要性'
    ]
  },
  {
    title: '冷媒洩漏檢測與修復指南',
    keywords: ['冷媒洩漏', '洩漏檢測', '冷媒補充', '密封件更換', '冷氣維修'],
    outline: [
      '冷媒洩漏的症狀',
      '洩漏檢測的方法',
      '常見洩漏位置',
      '修復冷媒洩漏',
      '預防洩漏的措施'
    ]
  },
  {
    title: '汽車冷氣壓縮機保養維修詳解',
    keywords: ['冷氣壓縮機', '壓縮機維修', '壓縮機更換', '冷氣核心', '壓縮機保養'],
    outline: [
      '壓縮機的工作原理',
      '壓縮機故障的症狀',
      '延長壓縮機壽命的方法',
      '壓縮機維修 vs 更換',
      '選擇優質壓縮機的標準'
    ]
  },
  {
    title: '車輛冷氣系統升級改造指南',
    keywords: ['冷氣升級', '冷氣改裝', '冷氣效能提升', '後座冷氣', '獨立冷氣'],
    outline: [
      '冷氣系統升級的必要性',
      '常見的升級方案',
      '後座獨立冷氣安裝',
      '升級後的保養重點',
      '成本效益分析'
    ]
  }
]

export class SEOContentGenerator {
  private cohereApiKey: string
  private usedTopics: Set<string> = new Set()

  constructor(cohereApiKey: string) {
    this.cohereApiKey = cohereApiKey
  }

  // 載入已使用的主題
  async loadUsedTopics() {
    const existingArticles = await prisma.news.findMany({
      where: {
        sourceName: 'AI Generated - SEO'
      },
      select: {
        title: true
      }
    })

    this.usedTopics = new Set(existingArticles.map(article => article.title))
  }

  // 獲取下一個未使用的主題
  private getNextTopic(): SEOArticleTopic | null {
    const availableTopics = SEO_TOPICS.filter(topic => !this.usedTopics.has(topic.title))
    
    if (availableTopics.length === 0) {
      // 如果所有主題都用過了，重置使用記錄
      this.usedTopics.clear()
      return SEO_TOPICS[0]
    }
    
    return availableTopics[Math.floor(Math.random() * availableTopics.length)]
  }

  // 生成文章內容
  private async generateArticleContent(topic: SEOArticleTopic): Promise<string> {
    const prompt = `請撰寫一篇關於「${topic.title}」的專業文章，這是一篇針對台灣汽車冷氣維修市場的 SEO 優化文章。

文章大綱：
${topic.outline.map((item, index) => `${index + 1}. ${item}`).join('\n')}

SEO 關鍵字（請自然地融入文章中）：${topic.keywords.join('、')}

要求：
1. 使用繁體中文撰寫
2. 文章長度約 1000-1500 字
3. 包含實用的資訊和建議
4. 語氣專業但親切
5. 適當使用標題層級（使用 Markdown 格式）
6. 自然地融入 SEO 關鍵字
7. 包含具體的例子和數據（可以是一般性的市場數據）
8. 文章結尾包含行動呼籲（聯繫專業維修服務）

請直接輸出文章內容，不需要額外的說明。`

    const provider = getAIProvider('cohere')
    const content = await provider.rewriteArticle(prompt, topic.keywords.join('、'), this.cohereApiKey)
    
    return content
  }

  // 生成 SEO 描述
  private generateSEODescription(content: string, keywords: string[]): string {
    // 提取文章開頭作為描述
    const firstParagraph = content.split('\n').find(p => p.trim().length > 50) || ''
    let description = firstParagraph.replace(/[#*]/g, '').trim()
    
    // 限制長度
    if (description.length > 160) {
      description = description.substring(0, 157) + '...'
    }
    
    return description
  }

  // 生成 URL slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\u4e00-\u9fff\w\s-]/g, '') // 保留中文、英文、數字、空格、連字符
      .replace(/\s+/g, '-') // 空格轉連字符
      .replace(/-+/g, '-') // 多個連字符合併
      .trim()
  }

  // 檢查是否存在重複文章
  private async isDuplicateArticle(title: string, content: string): Promise<boolean> {
    const existing = await prisma.news.findFirst({
      where: {
        OR: [
          { title: title },
          { slug: this.generateSlug(title) }
        ]
      }
    })

    return !!existing
  }

  // 生成單篇 SEO 文章
  async generateSEOArticle(): Promise<any | null> {
    try {
      await this.loadUsedTopics()
      const topic = this.getNextTopic()
      
      if (!topic) {
        console.log('沒有可用的 SEO 文章主題')
        return null
      }

      console.log(`正在生成 SEO 文章: ${topic.title}`)

      // 生成文章內容
      const content = await this.generateArticleContent(topic)
      const description = this.generateSEODescription(content, topic.keywords)
      const slug = this.generateSlug(topic.title)

      // 檢查重複
      if (await this.isDuplicateArticle(topic.title, content)) {
        console.log(`文章已存在，跳過: ${topic.title}`)
        this.usedTopics.add(topic.title)
        return await this.generateSEOArticle() // 遞歸生成下一篇
      }

      // 保存文章
      const article = await this.saveArticle({
        title: topic.title,
        content: content,
        description: description,
        keywords: topic.keywords,
        slug: slug
      })

      this.usedTopics.add(topic.title)
      console.log(`SEO 文章生成完成: ${topic.title}`)
      
      return article

    } catch (error) {
      console.error('生成 SEO 文章失敗:', error)
      throw error
    }
  }

  // 保存文章到資料庫
  async saveArticle(article: {
    title: string
    content: string
    description: string
    keywords: string[]
    slug: string
  }) {
    try {
      const news = await prisma.news.create({
        data: {
          title: article.title,
          content: article.content,
          excerpt: article.description,
          slug: article.slug,
          sourceName: 'AI Generated - SEO',
          sourceUrl: '',
          author: 'DrCarCold 編輯部',
          coverImage: '/images/logo.png',
          isPublished: true,
          publishedAt: new Date(),
          seoKeywords: article.keywords.join(', '),
          seoTitle: article.title,
          seoDescription: article.description,
          tags: JSON.stringify(['教育性內容', 'SEO優化'])
        }
      })

      console.log(`SEO 文章已保存: ${news.title}`)
      return news
    } catch (error) {
      console.error('保存 SEO 文章失敗:', error)
      throw error
    }
  }

  // 批量生成多篇文章
  async generateMultipleSEOArticles(count: number = 3): Promise<any[]> {
    const articles = []
    
    for (let i = 0; i < count; i++) {
      try {
        const article = await this.generateSEOArticle()
        if (article) {
          articles.push(article)
          // 延遲避免 API 限制
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 篇文章失敗:`, error)
      }
    }
    
    return articles
  }

  // 獲取統計資訊
  async getStats() {
    const totalSEOArticles = await prisma.news.count({
      where: {
        sourceName: 'AI Generated - SEO'
      }
    })

    const publishedSEOArticles = await prisma.news.count({
      where: {
        sourceName: 'AI Generated - SEO',
        isPublished: true
      }
    })

    const availableTopics = SEO_TOPICS.length - this.usedTopics.size

    return {
      totalSEOArticles,
      publishedSEOArticles,
      totalTopics: SEO_TOPICS.length,
      usedTopics: this.usedTopics.size,
      availableTopics
    }
  }
}

// 導出便利函數
export async function generateSEOContent(cohereApiKey: string, count: number = 1) {
  const generator = new SEOContentGenerator(cohereApiKey)
  
  if (count === 1) {
    return await generator.generateSEOArticle()
  } else {
    return await generator.generateMultipleSEOArticles(count)
  }
} 