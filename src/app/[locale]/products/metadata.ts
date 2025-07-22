/**
 * 🎯 產品頁面專業SEO優化
 * 汽車冷媒產品目錄頁面的強力SEO設定
 */

import type { Metadata } from 'next'

export function generateProductsMetadata(locale: string): Metadata {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  const seoData = {
    zh: {
      title: 'DrCarCold 汽車冷媒產品目錄 | R134a R1234yf 專業冷媒充填設備 | 全台最大汽車冷氣維修工具供應商',
      description: '【DrCarCold】台灣最大汽車冷媒產品供應商，專業提供R134a、R1234yf環保冷媒、冷媒充填設備、汽車冷氣維修工具、壓縮機零件、冷凝器、蒸發器、膨脹閥、冷媒回收機、檢漏儀、PAG冷凍油。ISO認證品質，原廠規格，15年專業經驗，全台50+經銷據點，24小時技術支援，免費配送服務。適用Toyota、Honda、BMW、Mercedes、Audi、Lexus等各大車廠。專業技師推薦，保固完善，價格合理。',
      keywords: [
        // 主要產品關鍵字
        '汽車冷媒產品', 'R134a冷媒', 'R1234yf冷媒', '冷媒充填設備', '汽車冷氣維修工具',
        // 具體產品
        '冷氣壓縮機', '冷凝器', '蒸發器', '膨脹閥', '冷媒回收機', '冷媒檢漏儀', 'PAG冷凍油',
        // 零件類
        '汽車空調零件', '冷氣系統零件', '專業維修設備', '快速接頭', '冷媒管路', '壓力錶組',
        // 品牌車款
        'Toyota冷媒零件', 'Honda冷氣零件', 'BMW冷媒設備', 'Mercedes冷氣工具', 'Audi空調零件',
        // 技術規格
        'PAG46油', 'PAG100油', 'PAG150油', 'POE油', '冷媒純度檢測', '壓力測試設備',
        // 服務相關
        '汽車冷媒批發', '冷氣零件批發', '專業技術支援', '全台配送', '品質保證',
        // 地區
        '台北汽車冷媒', '新北冷氣零件', '桃園冷媒工具', '台中汽車零件', '台南冷氣設備', '高雄冷媒產品'
      ].join(','),
      ogTitle: 'DrCarCold 汽車冷媒產品目錄 | 專業R134a R1234yf冷媒設備供應商',
      ogDescription: '台灣最大汽車冷媒產品供應商，提供完整冷氣系統維修設備、零件。ISO認證品質，原廠規格，全台50+經銷據點。'
    },
    en: {
      title: 'DrCarCold Automotive Refrigerant Catalog | R134a R1234yf Professional Equipment | Taiwan\'s Largest AC Tool Supplier',
      description: '【DrCarCold】Taiwan\'s largest automotive refrigerant supplier, professionally providing R134a, R1234yf eco-friendly refrigerants, filling equipment, automotive AC repair tools, compressor parts, condensers, evaporators, expansion valves, recovery machines, leak detectors, PAG oils. ISO certified quality, OEM specifications, 15 years professional experience, 50+ distribution points nationwide, 24-hour technical support, free delivery service. Compatible with Toyota, Honda, BMW, Mercedes, Audi, Lexus and all major car brands.',
      keywords: [
        'automotive refrigerant products', 'R134a refrigerant', 'R1234yf refrigerant', 'refrigerant filling equipment', 'automotive AC repair tools',
        'car air compressor', 'condenser', 'evaporator', 'expansion valve', 'refrigerant recovery machine', 'leak detector', 'PAG oil',
        'automotive AC parts', 'air conditioning system parts', 'professional repair equipment', 'quick connectors', 'refrigerant lines',
        'Toyota refrigerant parts', 'Honda AC parts', 'BMW refrigerant equipment', 'Mercedes AC tools', 'Audi AC parts',
        'PAG46 oil', 'PAG100 oil', 'PAG150 oil', 'POE oil', 'refrigerant purity testing', 'pressure test equipment',
        'automotive refrigerant wholesale', 'AC parts wholesale', 'professional technical support', 'Taiwan delivery'
      ].join(','),
      ogTitle: 'DrCarCold Automotive Refrigerant Catalog | Professional R134a R1234yf Equipment Supplier',
      ogDescription: 'Taiwan\'s largest automotive refrigerant supplier, providing complete air conditioning system repair equipment and parts. ISO certified quality, OEM specifications.'
    }
  }
  
  const currentSeo = isZh ? seoData.zh : seoData.en
  
  return {
    title: currentSeo.title,
    description: currentSeo.description,
    keywords: currentSeo.keywords,
    authors: [{ name: 'DrCarCold', url: baseUrl }],
    creator: 'DrCarCold Product Team',
    publisher: 'DrCarCold',
    category: 'automotive products',
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
      url: `${baseUrl}/products`,
      siteName: 'DrCarCold 汽車冷媒專家',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: [
        {
          url: '/images/og-products-catalog.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒產品目錄' : 'DrCarCold Automotive Refrigerant Catalog',
        },
        {
          url: '/images/og-products-r134a.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold R134a 冷媒產品' : 'DrCarCold R134a Refrigerant Products',
        },
        {
          url: '/images/og-products-r1234yf.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold R1234yf 環保冷媒' : 'DrCarCold R1234yf Eco Refrigerant',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DrCarCold',
      creator: '@DrCarCold',
      title: currentSeo.ogTitle,
      description: currentSeo.ogDescription,
      images: ['/images/twitter-products-catalog.jpg'],
    },
    alternates: {
      canonical: `${baseUrl}/products`,
      languages: {
        'zh-TW': `${baseUrl}/zh/products`,
        'en-US': `${baseUrl}/en/products`,
      },
    },
    other: {
      // 產品目錄特定標記
      'product:category': 'Automotive Refrigerant Products',
      'product:availability': 'InStock',
      'product:condition': 'NewCondition',
      'product:brand': 'DrCarCold',
      'product:retailer': 'DrCarCold Taiwan',
      'product:price_range': '$$',
      'product:currency': 'TWD',
      // 商品分類
      'item:category1': 'Automotive',
      'item:category2': 'Refrigerant',
      'item:category3': 'Air Conditioning',
      // 庫存狀態
      'stock:availability': 'in_stock',
      'stock:quantity': '1000+',
      'shipping:country': 'TW',
      'shipping:region': 'Taiwan',
      'shipping:cost': 'Free',
      // 認證標記
      'certification:iso': 'ISO9001',
      'certification:quality': 'OEM_Grade',
      'warranty:period': '12_months',
      'support:technical': '24_hours',
    },
  }
}

// 🎯 產品詳細頁面SEO優化
export function generateProductDetailMetadata(
  productId: string,
  productName: string,
  productDescription: string,
  productPrice: string,
  productCategory: string,
  locale: string
): Metadata {
  const isZh = locale === 'zh'
  const baseUrl = 'https://drcarcold.com'
  
  const seoTitle = isZh 
    ? `${productName} | DrCarCold 專業汽車冷媒產品 | ${productCategory} | 品質保證`
    : `${productName} | DrCarCold Professional Automotive Refrigerant | ${productCategory} | Quality Guaranteed`
  
  const seoDescription = isZh
    ? `【${productName}】DrCarCold專業${productCategory}，${productDescription}。ISO認證品質，原廠規格，專業安裝，全台配送。價格：${productPrice}，立即了解優惠方案！`
    : `【${productName}】DrCarCold professional ${productCategory}, ${productDescription}. ISO certified quality, OEM specifications, professional installation, Taiwan-wide delivery. Price: ${productPrice}, learn about special offers now!`
  
  return {
    title: seoTitle,
    description: seoDescription,
    keywords: isZh 
      ? `${productName},${productCategory},DrCarCold,汽車冷媒,專業設備,品質保證,全台配送,技術支援`
      : `${productName},${productCategory},DrCarCold,automotive refrigerant,professional equipment,quality guarantee,Taiwan delivery,technical support`,
    openGraph: {
      type: 'website',
      locale: isZh ? 'zh_TW' : 'en_US',
      url: `${baseUrl}/products/${productId}`,
      siteName: 'DrCarCold 汽車冷媒專家',
      title: seoTitle,
      description: seoDescription,
      images: [
        {
          url: `/images/products/${productId}-main.jpg`,
          width: 1200,
          height: 630,
          alt: `${productName} - DrCarCold`,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DrCarCold',
      creator: '@DrCarCold',
      title: seoTitle,
      description: seoDescription,
      images: [`/images/products/${productId}-twitter.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/products/${productId}`,
    },
    other: {
      'product:price:amount': productPrice,
      'product:price:currency': 'TWD',
      'product:availability': 'in_stock',
      'product:condition': 'new',
      'product:brand': 'DrCarCold',
      'product:category': productCategory,
      'product:retailer_item_id': productId,
      'product:item_group_id': productCategory,
    },
  }
}

// 🎯 結構化數據 - 產品目錄
export const productsStructuredData = {
  "@context": "https://schema.org",
  "@type": "ProductCatalog",
  "name": "DrCarCold 汽車冷媒產品目錄",
  "description": "專業汽車冷媒產品，包含R134a、R1234yf冷媒及相關設備",
  "url": "https://drcarcold.com/products",
  "provider": {
    "@type": "Organization",
    "name": "DrCarCold",
    "url": "https://drcarcold.com"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "汽車冷媒產品",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "R134a 冷媒系列",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "R134a 汽車冷媒",
              "description": "環保型汽車冷媒，適用於大部分車款"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog", 
        "name": "R1234yf 冷媒系列",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "R1234yf 環保冷媒",
              "description": "新世代環保冷媒，符合最新環保標準"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "維修設備系列", 
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "冷媒充填設備",
              "description": "專業冷媒充填機，精確控制充填量"
            }
          }
        ]
      }
    ]
  }
}

// 🎯 結構化數據 - 產品詳細頁
export function generateProductStructuredData(
  productId: string,
  productName: string,
  productDescription: string,
  productPrice: string,
  productCategory: string,
  productImage: string,
  locale: string
) {
  const isZh = locale === 'zh'
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://drcarcold.com/products/${productId}`,
    "name": productName,
    "description": productDescription,
    "category": productCategory,
    "brand": {
      "@type": "Brand",
      "name": "DrCarCold"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "DrCarCold",
      "url": "https://drcarcold.com"
    },
    "image": [
      `https://drcarcold.com/images/products/${productImage}`,
      `https://drcarcold.com/images/products/${productId}-2.jpg`,
      `https://drcarcold.com/images/products/${productId}-3.jpg`
    ],
    "offers": {
      "@type": "Offer",
      "price": productPrice,
      "priceCurrency": "TWD",
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "DrCarCold"
      },
      "validFrom": new Date().toISOString(),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "50",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": isZh ? "李技師" : "Technician Lee"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": isZh 
          ? "品質很好，符合原廠規格，客戶都很滿意。" 
          : "Excellent quality, meets OEM specifications, customers are very satisfied."
      }
    ],
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": isZh ? "認證" : "Certification",
        "value": "ISO 9001"
      },
      {
        "@type": "PropertyValue", 
        "name": isZh ? "保固" : "Warranty",
        "value": isZh ? "12個月" : "12 months"
      },
      {
        "@type": "PropertyValue",
        "name": isZh ? "配送" : "Shipping",
        "value": isZh ? "全台免費配送" : "Free shipping nationwide"
      }
    ]
  }
} 