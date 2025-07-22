// 網站特定的選擇器配置
export interface SiteSelectors {
  articleLinks?: string
  title?: string[]
  content?: string[]
  author?: string[]
  date?: string[]
  image?: string[]
  tags?: string[]
}

// 網站配置映射
export const SITE_SELECTORS: Record<string, SiteSelectors> = {
  'news.u-car.com.tw': {
    articleLinks: '.news-list-item, .channel__list a',
    title: [
      'h1.news-title',
      '.article-title h1',
      'h1'
    ],
    content: [
      '.news-content',
      '.article-content',
      '.news-body',
      'article'
    ],
    author: [
      '.news-byline',
      '.author-name',
      '.writer'
    ],
    date: [
      '.news-date',
      'time',
      '.publish-date'
    ],
    image: [
      '.news-content img',
      '.article-image img',
      'article img'
    ]
  },
  
  'www.carstuff.com.tw': {
    articleLinks: '.entry-title a, .post-title a, article h2 a',
    title: [
      'h1.entry-title',
      '.post-title h1',
      'h1'
    ],
    content: [
      '.entry-content',
      '.post-content',
      'article .content',
      'main article'
    ],
    author: [
      '.author-name',
      '.by-author',
      '.post-author'
    ],
    date: [
      'time',
      '.entry-date',
      '.post-date'
    ]
  },
  
  'www.cool3c.com': {
    articleLinks: '.postlist a, article h3 a',
    title: [
      'h1.post-title',
      '.article-title',
      'h1'
    ],
    content: [
      '.post-content',
      '.article-body',
      'article .content'
    ],
    author: [
      '.author',
      '.post-author'
    ],
    date: [
      '.post-date',
      'time'
    ]
  },
  
  // 車訊網
  'carnews.com': {
    articleLinks: '.item-title a, .entry-title a, .news-item a',
    title: [
      'h1.entry-title',
      'h1.article-title',
      '.main-title h1',
      'h1'
    ],
    content: [
      '.entry-content',
      '.article-content',
      '.news-content',
      'article .content'
    ],
    author: [
      '.author-name',
      '.article-author',
      '.by-author'
    ],
    date: [
      '.entry-date',
      '.publish-time',
      'time',
      '.date'
    ],
    image: [
      '.entry-content img',
      '.article-image img',
      '.featured-image img'
    ]
  },
  
  // 8891 汽車網
  'c.8891.com.tw': {
    articleLinks: '.news-list a, .article-item a',
    title: [
      'h1.article-title',
      '.news-title h1',
      'h1'
    ],
    content: [
      '.article-content',
      '.news-content',
      '.detail-content',
      'article'
    ],
    author: [
      '.author',
      '.editor',
      '.source'
    ],
    date: [
      '.publish-date',
      '.article-date',
      'time'
    ]
  },
  
  // CARTURE 車勢文化
  'www.carture.com.tw': {
    articleLinks: '.post-title a, article h3 a, .news-list a',
    title: [
      'h1.post-title',
      'h1.entry-title',
      '.article-title h1',
      'h1'
    ],
    content: [
      '.post-content',
      '.entry-content',
      '.article-body',
      'article .content'
    ],
    author: [
      '.author-name',
      '.post-author',
      '.article-author'
    ],
    date: [
      '.post-date',
      '.entry-date',
      'time.published'
    ],
    image: [
      '.post-content img',
      '.wp-post-image',
      'article img'
    ]
  },
  
  // AutoNet 汽車日報
  'www.autonet.com.tw': {
    articleLinks: '.news-list a, .article-link, .title a',
    title: [
      'h1.article-title',
      '.news-title',
      'h1'
    ],
    content: [
      '.article-content',
      '.news-body',
      '.content-area',
      'article'
    ],
    author: [
      '.author',
      '.reporter',
      '.writer'
    ],
    date: [
      '.publish-date',
      '.date-time',
      'time'
    ]
  },
  
  // 發燒車訊
  'autos.udn.com': {
    articleLinks: '.story-list a, .news-list a, article a',
    title: [
      'h1.article-content__title',
      'h1.story-art-title',
      'h1'
    ],
    content: [
      '.article-content__body',
      '.story-body',
      '.article-body',
      'article'
    ],
    author: [
      '.article-content__author',
      '.story-author',
      '.author'
    ],
    date: [
      '.article-content__time',
      '.story-publish-time',
      'time'
    ],
    image: [
      '.article-content__body img',
      '.story-body img',
      'figure img'
    ]
  },
  
  // 車主夢想網
  'www.carnews.tw': {
    articleLinks: '.news-item a, .article-list a',
    title: [
      'h1.news-title',
      'h1.article-title',
      'h1'
    ],
    content: [
      '.news-content',
      '.article-content',
      '.entry-content',
      'article'
    ],
    author: [
      '.news-author',
      '.author-name',
      '.writer'
    ],
    date: [
      '.news-date',
      '.publish-date',
      'time'
    ]
  },
  
  // 預設選擇器（適用於未知網站）
  'default': {
    title: [
      'h1',
      'h2.title',
      '.article-title',
      '.post-title',
      'title'
    ],
    content: [
      'article',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '.main-content'
    ],
    author: [
      '.author',
      '.byline',
      '[rel="author"]',
      '.writer'
    ],
    date: [
      'time',
      '.date',
      '.publish-date',
      '.post-date'
    ],
    image: [
      'article img',
      '.content img',
      'main img'
    ]
  }
}

// 獲取網站的選擇器配置
export function getSiteSelectors(url: string): SiteSelectors {
  try {
    const hostname = new URL(url).hostname
    
    // 尋找匹配的配置
    for (const [site, selectors] of Object.entries(SITE_SELECTORS)) {
      if (hostname.includes(site) || site === hostname) {
        console.log(`使用 ${site} 的選擇器配置`)
        return selectors
      }
    }
    
    console.log('使用預設選擇器配置')
    return SITE_SELECTORS.default
  } catch {
    return SITE_SELECTORS.default
  }
}

// 嘗試多個選擇器，返回第一個有結果的
export function trySelectors($: any, selectors: string[] | undefined): string {
  if (!selectors || selectors.length === 0) return ''
  
  for (const selector of selectors) {
    const element = $(selector).first()
    if (element.length > 0) {
      const text = element.text().trim()
      if (text) {
        console.log(`選擇器 "${selector}" 找到內容`)
        return text
      }
    }
  }
  
  return ''
}