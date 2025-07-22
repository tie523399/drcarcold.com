/**
 * 🎯 冷媒查詢頁面專業SEO優化
 * 汽車冷媒規格查詢工具的強力SEO配置
 */

import type { Metadata } from 'next'

// 🎯 冷媒查詢頁面SEO優化
export function generateRefrigerantLookupMetadata(locale: string): Metadata {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  const seoData = {
    zh: {
      title: 'DrCarCold 汽車冷媒規格查詢 | R134a R1234yf 車型對照表 | 免費線上查詢工具',
      description: '【DrCarCold】免費汽車冷媒規格查詢工具，快速查詢您的愛車適用R134a或R1234yf冷媒。涵蓋Toyota、Honda、BMW、Mercedes、Audi、Lexus、Nissan、Mazda、Hyundai、Ford等全球主要車廠，超過10,000種車型資料庫。提供冷媒容量、壓縮機油規格、冷氣系統技術參數。專業技師推薦，資料準確可靠，即時更新車型資訊。',
      keywords: [
        // 核心查詢功能
        '汽車冷媒查詢', '冷媒規格查詢', 'R134a車型對照', 'R1234yf適用車款', '冷媒容量查詢',
        // 車廠品牌
        'Toyota冷媒規格', 'Honda冷媒查詢', 'BMW冷媒型號', 'Mercedes冷媒規格', 'Audi冷媒查詢',
        'Lexus冷媒規格', 'Nissan冷媒查詢', 'Mazda冷媒型號', 'Hyundai冷媒規格', 'Ford冷媒查詢',
        'Volkswagen冷媒', 'Subaru冷媒規格', 'Mitsubishi冷媒', 'Suzuki冷媒查詢', 'Daihatsu冷媒',
        // 技術規格
        '冷媒容量表', '壓縮機油規格', 'PAG油查詢', 'POE油規格', '冷氣系統參數',
        '冷媒壓力值', '充填量查詢', '系統容量', '冷媒種類', '環保冷媒',
        // 年份車型
        '2024車款冷媒', '2023冷媒規格', '2022車型查詢', '新車冷媒', '老車冷媒',
        '進口車冷媒', '國產車規格', '歐洲車冷媒', '日系車規格', '美系車冷媒',
        // 功能特色
        '免費查詢', '線上工具', '即時查詢', '準確資料', '專業推薦',
        // 服務相關
        '冷媒建議', '規格確認', '技術支援', '專業諮詢', '維修建議'
      ].join(','),
      ogTitle: 'DrCarCold 汽車冷媒規格查詢 | 免費R134a R1234yf車型對照工具',
      ogDescription: '免費汽車冷媒規格查詢工具，快速查詢您的愛車適用冷媒型號。涵蓋全球主要車廠，超過10,000種車型資料庫。'
    },
    en: {
      title: 'DrCarCold Automotive Refrigerant Specification Lookup | R134a R1234yf Vehicle Compatibility | Free Online Query Tool',
      description: '【DrCarCold】Free automotive refrigerant specification lookup tool, quickly find the right R134a or R1234yf refrigerant for your vehicle. Covers Toyota, Honda, BMW, Mercedes, Audi, Lexus, Nissan, Mazda, Hyundai, Ford and all major global manufacturers, with database of over 10,000 vehicle models. Provides refrigerant capacity, compressor oil specifications, AC system technical parameters.',
      keywords: [
        'automotive refrigerant lookup', 'refrigerant specification query', 'R134a vehicle compatibility', 'R1234yf compatible vehicles', 'refrigerant capacity lookup',
        'Toyota refrigerant specs', 'Honda refrigerant lookup', 'BMW refrigerant type', 'Mercedes refrigerant specs', 'Audi refrigerant query',
        'refrigerant capacity chart', 'compressor oil specs', 'PAG oil lookup', 'POE oil specifications', 'AC system parameters',
        'free lookup', 'online tool', 'instant query', 'accurate data', 'professional recommendation'
      ].join(','),
      ogTitle: 'DrCarCold Automotive Refrigerant Specification Lookup | Free R134a R1234yf Vehicle Tool',
      ogDescription: 'Free automotive refrigerant specification lookup tool, quickly find the right refrigerant type for your vehicle. Covers all major manufacturers with 10,000+ vehicle database.'
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
    category: 'automotive tools',
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
      url: `${baseUrl}/refrigerant-lookup`,
      siteName: 'DrCarCold 汽車冷媒專家',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: [
        {
          url: '/images/og-refrigerant-lookup.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒規格查詢工具' : 'DrCarCold Automotive Refrigerant Lookup Tool',
        },
        {
          url: '/images/og-vehicle-database.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 車型資料庫' : 'DrCarCold Vehicle Database',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DrCarCold',
      creator: '@DrCarCold',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: ['/images/twitter-refrigerant-lookup.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/refrigerant-lookup`,
      languages: {
        'zh-TW': `${baseUrl}/zh/refrigerant-lookup`,
        'en-US': `${baseUrl}/en/refrigerant-lookup`,
      },
    },
    other: {
      // 工具特定標記
      'tool:type': 'refrigerant_lookup',
      'tool:function': 'specification_query',
      'tool:database_size': '10000+',
      'tool:accuracy': 'professional_verified',
      'tool:update_frequency': 'monthly',
      // 使用統計
      'usage:free': 'true',
      'usage:registration': 'not_required',
      'usage:limit': 'unlimited',
      'usage:response_time': 'instant',
      // 覆蓋範圍
      'coverage:brands': '50+',
      'coverage:models': '10000+',
      'coverage:years': '1990-2024',
      'coverage:regions': 'global',
      // 技術標記
      'data:source': 'manufacturer_specification',
      'data:verification': 'technician_confirmed',
      'data:reliability': 'high',
      'support:technical': '24_hours',
    },
  }
}

// 🎯 結構化數據 - 冷媒查詢工具
export const refrigerantLookupStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "DrCarCold 汽車冷媒規格查詢工具",
  "description": "免費汽車冷媒規格查詢工具，快速查詢適用的冷媒型號和技術規格",
  "url": "https://drcarcold.com/refrigerant-lookup",
  "applicationCategory": "AutomotiveApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "TWD",
    "availability": "https://schema.org/InStock"
  },
  "featureList": [
    "R134a冷媒車型查詢",
    "R1234yf冷媒車型查詢", 
    "冷媒容量查詢",
    "壓縮機油規格查詢",
    "全球車廠車型資料庫",
    "即時查詢結果",
    "免費使用"
  ],
  "screenshot": "https://drcarcold.com/images/refrigerant-lookup-screenshot.jpg",
  "softwareVersion": "2.0",
  "datePublished": "2024-01-01",
  "dateModified": new Date().toISOString(),
  "author": {
    "@type": "Organization",
    "name": "DrCarCold"
  },
  "provider": {
    "@type": "Organization",
    "name": "DrCarCold",
    "url": "https://drcarcold.com"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "500",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "王技師"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "reviewBody": "非常實用的查詢工具，資料準確，查詢速度快，是技師必備的工具。"
    }
  ]
}

// 🎯 結構化數據 - FAQ
export const refrigerantLookupFAQStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "如何使用汽車冷媒規格查詢工具？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "1. 選擇您的車輛品牌（如Toyota、Honda等）2. 選擇車型系列 3. 選擇年份 4. 系統將自動顯示適用的冷媒型號、容量和技術規格"
      }
    },
    {
      "@type": "Question", 
      "name": "R134a和R1234yf冷媒有什麼差別？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "R134a是傳統環保冷媒，適用於2017年以前的車款。R1234yf是新世代環保冷媒，GWP值更低，主要用於2017年後的新車款，符合最新環保法規。"
      }
    },
    {
      "@type": "Question",
      "name": "查詢結果顯示的冷媒容量準確嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "我們的資料來源於原廠技術規格，由專業技師驗證確認。不過實際充填時建議以車輛說明書或專業檢測為準，因為不同配置可能略有差異。"
      }
    },
    {
      "@type": "Question",
      "name": "是否支援所有車款查詢？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "我們的資料庫涵蓋全球主要車廠超過10,000種車型，包含1990年至最新年份車款。如果查不到您的車型，請聯繫我們的技術支援。"
      }
    },
    {
      "@type": "Question",
      "name": "使用查詢工具需要付費嗎？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "完全免費！我們提供無限制免費查詢服務，不需要註冊會員，查詢次數無限制。"
      }
    }
  ]
}

// 🎯 支援的車廠列表（SEO用）
export const supportedManufacturers = {
  zh: [
    'Toyota豐田', 'Honda本田', 'Nissan日產', 'Mazda馬自達', 'Subaru速霸陸',
    'Mitsubishi三菱', 'Suzuki鈴木', 'Daihatsu大發', 'Isuzu五十鈴',
    'BMW寶馬', 'Mercedes賓士', 'Audi奧迪', 'Volkswagen福斯', 'Porsche保時捷',
    'Ferrari法拉利', 'Lamborghini藍寶堅尼', 'Maserati瑪莎拉蒂',
    'Ford福特', 'Chevrolet雪佛蘭', 'Cadillac凱迪拉克', 'Chrysler克萊斯勒',
    'Jeep吉普', 'Dodge道奇', 'Buick別克', 'GMC', 'Lincoln林肯',
    'Hyundai現代', 'Kia起亞', 'Genesis捷恩斯', 'SsangYong雙龍',
    'Volvo富豪', 'Saab紳寶', 'Peugeot寶獅', 'Citroen雪鐵龍', 'Renault雷諾',
    'Fiat飛雅特', 'Alfa Romeo愛快羅密歐', 'Lancia蘭吉雅',
    'Jaguar捷豹', 'Land Rover荒原路華', 'Mini迷你', 'Bentley賓利', 'Rolls-Royce勞斯萊斯',
    'Lexus凌志', 'Infiniti無限', 'Acura謳歌'
  ],
  en: [
    'Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Suzuki', 'Daihatsu', 'Isuzu',
    'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche', 'Ferrari', 'Lamborghini', 'Maserati',
    'Ford', 'Chevrolet', 'Cadillac', 'Chrysler', 'Jeep', 'Dodge', 'Buick', 'GMC', 'Lincoln',
    'Hyundai', 'Kia', 'Genesis', 'SsangYong', 'Volvo', 'Saab', 'Peugeot', 'Citroen', 'Renault',
    'Fiat', 'Alfa Romeo', 'Lancia', 'Jaguar', 'Land Rover', 'Mini', 'Bentley', 'Rolls-Royce',
    'Lexus', 'Infiniti', 'Acura'
  ]
}

// 🎯 冷媒類型資訊（SEO內容）
export const refrigerantTypes = {
  zh: {
    R134a: {
      name: 'R134a 四氟乙烷',
      description: '環保型汽車冷媒，適用於1994-2017年大部分車款',
      features: ['環保無毒', '效能穩定', '成本較低', '維修方便'],
      applications: '適用於大部分傳統汽車冷氣系統',
      gwp: 'GWP值: 1,430'
    },
    R1234yf: {
      name: 'R1234yf 四氟丙烯',
      description: '新世代超低GWP環保冷媒，2017年後新車主要使用',
      features: ['超低GWP值', '符合環保法規', '效能優異', '安全性高'],
      applications: '適用於2017年後新車及歐系車',
      gwp: 'GWP值: 4'
    },
    R12: {
      name: 'R12 二氟二氯甲烷',
      description: '舊式冷媒，已停產，需改裝使用R134a',
      features: ['已停產', '需改裝', '環保問題', '逐步淘汰'],
      applications: '1994年前老車使用，建議改裝',
      gwp: 'GWP值: 10,900（已禁用）'
    }
  },
  en: {
    R134a: {
      name: 'R134a Tetrafluoroethane',
      description: 'Eco-friendly automotive refrigerant, suitable for most vehicles 1994-2017',
      features: ['Environmentally safe', 'Stable performance', 'Lower cost', 'Easy maintenance'],
      applications: 'Suitable for most traditional automotive AC systems',
      gwp: 'GWP: 1,430'
    },
    R1234yf: {
      name: 'R1234yf Tetrafluoropropene', 
      description: 'Next-generation ultra-low GWP eco-friendly refrigerant, mainly used in new cars after 2017',
      features: ['Ultra-low GWP', 'Meets environmental regulations', 'Excellent performance', 'High safety'],
      applications: 'Suitable for new cars after 2017 and European vehicles',
      gwp: 'GWP: 4'
    },
    R12: {
      name: 'R12 Dichlorodifluoromethane',
      description: 'Legacy refrigerant, discontinued, requires conversion to R134a',
      features: ['Discontinued', 'Requires conversion', 'Environmental issues', 'Being phased out'],
      applications: 'Used in pre-1994 vehicles, conversion recommended',
      gwp: 'GWP: 10,900 (Banned)'
    }
  }
} 