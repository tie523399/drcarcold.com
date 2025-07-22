/**
 * 🎯 新聞頁面專業SEO優化
 * 汽車冷媒技術資訊、維修指南的強力SEO配置
 */

import type { Metadata } from 'next'

// 🎯 新聞列表頁SEO優化
export function generateNewsListMetadata(locale: string): Metadata {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  const seoData = {
    zh: {
      title: 'DrCarCold 汽車冷媒技術資訊 | R134a R1234yf 維修指南 | 專業冷氣保養知識庫',
      description: '【DrCarCold】專業汽車冷媒技術資訊平台，提供R134a、R1234yf冷媒維修指南、汽車冷氣保養教學、故障診斷技巧、最新冷媒技術趨勢。15年技師經驗分享，圖文詳解維修步驟，免費技術諮詢。涵蓋Toyota、Honda、BMW、Mercedes等各大車廠冷氣系統維修知識。',
      keywords: [
        // 技術關鍵字
        '汽車冷媒技術', 'R134a維修指南', 'R1234yf技術資訊', '冷氣系統維修', '汽車空調保養',
        // 維修相關
        '冷媒充填教學', '冷氣故障診斷', '壓縮機維修', '冷凝器清洗', '蒸發器維修',
        // 問題解決
        '冷氣不冷原因', '冷媒漏氣檢測', '冷氣異味處理', '冷氣噪音維修', '冷氣效能提升',
        // 保養知識
        '汽車冷氣保養週期', '夏季冷氣使用', '冷媒更換時機', '冷氣濾網更換', '冷氣系統清潔',
        // 技術趨勢
        '環保冷媒發展', '電動車冷氣', '新能源車空調', '智能冷氣控制', '節能冷氣技術',
        // 品牌專業
        'Toyota冷氣維修', 'Honda空調保養', 'BMW冷媒服務', 'Mercedes冷氣技術', 'Lexus空調維修',
        // 工具設備
        '冷媒檢測工具', '壓力測試設備', '冷媒回收機使用', '真空泵操作', '檢漏儀使用',
        // 專業服務
        '專業技師分享', '維修案例分析', '技術問題解答', '免費技術諮詢', '維修技巧教學'
      ].join(','),
      ogTitle: 'DrCarCold 汽車冷媒技術資訊 | 專業R134a R1234yf維修指南',
      ogDescription: '專業汽車冷媒技術資訊平台，提供完整維修指南、保養教學、故障診斷。15年技師經驗分享，免費技術諮詢。'
    },
    en: {
      title: 'DrCarCold Automotive Refrigerant Technical Information | R134a R1234yf Repair Guide | Professional AC Maintenance Knowledge',
      description: '【DrCarCold】Professional automotive refrigerant technical information platform, providing R134a, R1234yf refrigerant repair guides, automotive AC maintenance tutorials, troubleshooting techniques, latest refrigerant technology trends. 15 years technician experience sharing, detailed repair procedures with illustrations, free technical consultation.',
      keywords: [
        'automotive refrigerant technology', 'R134a repair guide', 'R1234yf technical info', 'AC system repair', 'automotive air conditioning maintenance',
        'refrigerant filling tutorial', 'AC troubleshooting', 'compressor repair', 'condenser cleaning', 'evaporator maintenance',
        'AC not cooling causes', 'refrigerant leak detection', 'AC odor treatment', 'AC noise repair', 'AC performance improvement',
        'automotive AC maintenance cycle', 'summer AC usage', 'refrigerant replacement timing', 'AC filter replacement', 'AC system cleaning',
        'eco-friendly refrigerant development', 'electric vehicle AC', 'new energy vehicle air conditioning', 'smart AC control', 'energy-saving AC technology'
      ].join(','),
      ogTitle: 'DrCarCold Automotive Refrigerant Technical Information | Professional R134a R1234yf Repair Guide',
      ogDescription: 'Professional automotive refrigerant technical information platform, providing complete repair guides, maintenance tutorials, troubleshooting. 15 years technician experience sharing.'
    }
  }
  
  const currentSeo = isZh ? seoData.zh : seoData.en
  
  return {
    title: currentSeo.title,
    description: currentSeo.description,
    keywords: currentSeo.keywords,
    authors: [{ name: 'DrCarCold Technical Team', url: baseUrl }],
    creator: 'DrCarCold Technical Team',
    publisher: 'DrCarCold',
    category: 'automotive technical information',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_TW' : 'en_US',
      url: `${baseUrl}/news`,
      siteName: 'DrCarCold 汽車冷媒專家',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: [
        {
          url: '/images/og-news-technical.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒技術資訊' : 'DrCarCold Automotive Refrigerant Technical Information',
        },
        {
          url: '/images/og-news-repair-guide.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 冷氣維修指南' : 'DrCarCold AC Repair Guide',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DrCarCold',
      creator: '@DrCarCold',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: ['/images/twitter-news-technical.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/news`,
      languages: {
        'zh-TW': `${baseUrl}/zh/news`,
        'en-US': `${baseUrl}/en/news`,
      },
    },
    other: {
      // 內容類型標記
      'article:section': 'Automotive Technical Information',
      'article:tag': 'automotive,refrigerant,AC,repair,maintenance',
      'article:publisher': 'DrCarCold',
      // 更新頻率
      'news:frequency': 'weekly',
      'news:category': 'automotive_technical',
      'content:type': 'technical_guide',
      'content:level': 'professional',
      'content:audience': 'technicians,car_owners',
    },
  }
}

// 🎯 新聞文章詳細頁SEO優化
export function generateNewsArticleMetadata(
  articleId: string,
  title: string,
  excerpt: string,
  content: string,
  publishDate: string,
  author: string,
  tags: string[],
  locale: string
): Metadata {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  // 動態生成SEO標題
  const seoTitle = isZh 
    ? `${title} | DrCarCold 汽車冷媒專業技術 | 維修保養指南`
    : `${title} | DrCarCold Automotive Refrigerant Technical | Repair Maintenance Guide`
  
  // 動態生成描述（從摘要或內容前150字）
  const seoDescription = excerpt || content.substring(0, 150) + '...'
  
  // 從內容中提取關鍵字
  const contentKeywords = extractKeywordsFromContent(content, isZh)
  const allKeywords = [...tags, ...contentKeywords].join(',')
  
  return {
    title: seoTitle,
    description: `${seoDescription} | DrCarCold專業技師分享，提供詳細技術指導和實用維修技巧。`,
    keywords: allKeywords,
    authors: [{ name: author || 'DrCarCold Technical Team', url: baseUrl }],
    creator: author || 'DrCarCold Technical Team',
    publisher: 'DrCarCold',
    category: 'automotive technical article',
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: isZh ? 'zh_TW' : 'en_US',
      url: `${baseUrl}/news/${articleId}`,
      siteName: 'DrCarCold 汽車冷媒專家',
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: `/images/news/${articleId}-main.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
        {
          url: `/images/news/${articleId}-thumb.jpg`,
          width: 800,
          height: 600,
          alt: title,
        }
      ],
      publishedTime: publishDate,
      modifiedTime: new Date().toISOString(),
      authors: [author || 'DrCarCold Technical Team'],
      section: isZh ? '汽車冷媒技術' : 'Automotive Refrigerant Technology',
      tags: tags,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DrCarCold',
      creator: '@DrCarCold',
      title: seoTitle,
      description: seoDescription,
      images: [`/images/news/${articleId}-twitter.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/news/${articleId}`,
    },
    other: {
      // 文章特定標記
      'article:published_time': publishDate,
      'article:modified_time': new Date().toISOString(),
      'article:author': author || 'DrCarCold Technical Team',
      'article:section': isZh ? '汽車冷媒技術' : 'Automotive Refrigerant Technology',
      'article:tag': tags.join(','),
      'article:word_count': content.split(/\s+/).length.toString(),
      'article:reading_time': Math.ceil(content.split(/\s+/).length / 200).toString(),
      // 技術文章標記
      'technical:difficulty': 'intermediate',
      'technical:tools_required': 'basic_automotive_tools',
      'technical:time_required': '30-60_minutes',
      'technical:skill_level': 'professional',
    },
  }
}

// 🎯 從內容中提取關鍵字
function extractKeywordsFromContent(content: string, isZh: boolean): string[] {
  const keywords: string[] = []
  
  // 中文關鍵字模式
  const zhPatterns = [
    /R134a/gi, /R1234yf/gi, /冷媒/g, /冷氣/g, /空調/g, /維修/g, /保養/g,
    /壓縮機/g, /冷凝器/g, /蒸發器/g, /膨脹閥/g, /PAG/gi, /POE/gi,
    /Toyota/gi, /Honda/gi, /BMW/gi, /Mercedes/gi, /Audi/gi, /Lexus/gi,
    /漏氣/g, /故障/g, /診斷/g, /檢測/g, /更換/g, /清洗/g
  ]
  
  // 英文關鍵字模式
  const enPatterns = [
    /R134a/gi, /R1234yf/gi, /refrigerant/gi, /AC/gi, /air\s+conditioning/gi,
    /repair/gi, /maintenance/gi, /compressor/gi, /condenser/gi, /evaporator/gi,
    /expansion\s+valve/gi, /PAG/gi, /POE/gi, /leak/gi, /diagnosis/gi
  ]
  
  const patterns = isZh ? zhPatterns : enPatterns
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      keywords.push(...matches.map(match => match.toLowerCase()))
    }
  })
  
  // 去重並限制數量
  return [...new Set(keywords)].slice(0, 10)
}

// 🎯 結構化數據 - 技術文章
export function generateArticleStructuredData(
  articleId: string,
  title: string,
  excerpt: string,
  content: string,
  publishDate: string,
  author: string,
  locale: string
) {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  return {
    "@context": "https://schema.org",
    "@type": "TechnicalArticle",
    "@id": `${baseUrl}/news/${articleId}`,
    "headline": title,
    "description": excerpt,
    "articleBody": content,
    "datePublished": publishDate,
    "dateModified": new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": author || 'DrCarCold Technical Team',
      "jobTitle": isZh ? '汽車冷媒技師' : 'Automotive Refrigerant Technician',
      "worksFor": {
        "@type": "Organization",
        "name": "DrCarCold"
      }
    },
    "publisher": {
      "@type": "Organization",
      "name": "DrCarCold",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`,
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${articleId}`
    },
    "image": [
      `${baseUrl}/images/news/${articleId}-main.jpg`,
      `${baseUrl}/images/news/${articleId}-thumb.jpg`
    ],
    "about": {
      "@type": "Thing",
      "name": isZh ? "汽車冷媒技術" : "Automotive Refrigerant Technology"
    },
    "keywords": extractKeywordsFromContent(content, isZh).join(','),
    "articleSection": isZh ? "技術指南" : "Technical Guide",
    "wordCount": content.split(/\s+/).length,
    "timeRequired": `PT${Math.ceil(content.split(/\s+/).length / 200)}M`,
    "educationalLevel": "professional",
    "audience": {
      "@type": "Audience",
      "audienceType": isZh ? "汽車技師" : "Automotive Technicians"
    },
    "teaches": isZh ? "汽車冷媒維修技術" : "Automotive Refrigerant Repair Techniques",
    "learningResourceType": "tutorial",
    "skillLevel": "intermediate",
    "inLanguage": isZh ? "zh-TW" : "en-US"
  }
}

// 🎯 結構化數據 - 技術常見問題
export function generateTechnicalFAQStructuredData(
  faqs: Array<{ question: string; answer: string }>,
  locale: string
) {
  const isZh = locale === 'zh'
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
        "author": {
          "@type": "Organization",
          "name": "DrCarCold"
        }
      }
    }))
  }
}

// 🎯 新聞分類頁面SEO模板
export const newsCategoryTemplates = {
  zh: {
    'repair-guide': {
      title: 'DrCarCold 汽車冷氣維修指南 | 專業維修技術教學',
      description: '專業汽車冷氣維修指南，包含故障診斷、零件更換、系統檢測等詳細教學。',
      keywords: '汽車冷氣維修,維修指南,故障診斷,零件更換,系統檢測'
    },
    'maintenance-tips': {
      title: 'DrCarCold 汽車冷氣保養技巧 | 延長冷氣壽命秘訣',
      description: '專業汽車冷氣保養技巧分享，教您如何正確保養冷氣系統，延長使用壽命。',
      keywords: '汽車冷氣保養,保養技巧,冷氣壽命,系統保養,預防維修'
    },
    'technical-analysis': {
      title: 'DrCarCold 冷媒技術分析 | R134a R1234yf 專業解析',
      description: '深度分析R134a、R1234yf等冷媒技術特性，提供專業技術見解。',
      keywords: 'R134a,R1234yf,冷媒技術,技術分析,專業解析'
    }
  },
  en: {
    'repair-guide': {
      title: 'DrCarCold Automotive AC Repair Guide | Professional Repair Tutorials',
      description: 'Professional automotive AC repair guides including troubleshooting, parts replacement, system testing.',
      keywords: 'automotive AC repair,repair guide,troubleshooting,parts replacement,system testing'
    },
    'maintenance-tips': {
      title: 'DrCarCold Automotive AC Maintenance Tips | Extend AC Lifespan',
      description: 'Professional automotive AC maintenance tips to help you properly maintain your AC system and extend its lifespan.',
      keywords: 'automotive AC maintenance,maintenance tips,AC lifespan,system maintenance,preventive repair'
    },
    'technical-analysis': {
      title: 'DrCarCold Refrigerant Technical Analysis | R134a R1234yf Professional Insights',
      description: 'In-depth analysis of R134a, R1234yf and other refrigerant technologies, providing professional technical insights.',
      keywords: 'R134a,R1234yf,refrigerant technology,technical analysis,professional insights'
    }
  }
} 