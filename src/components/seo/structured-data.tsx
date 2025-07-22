/**
 * 🎯 全站結構化數據組件
 * Schema.org 標記，提升搜索引擎理解和排名
 */

import Script from 'next/script'

// 🎯 組織機構結構化數據
export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "AutomotiveService",
    "@id": "https://drcarcold.com/#organization",
    "name": "DrCarCold 汽車冷媒專家",
    "alternateName": ["德卡酷冷", "Dr Car Cold", "DCC"],
    "url": "https://drcarcold.com",
    "logo": "https://drcarcold.com/images/logo.png",
    "image": [
      "https://drcarcold.com/images/company-building.jpg",
      "https://drcarcold.com/images/service-center.jpg",
      "https://drcarcold.com/images/team-photo.jpg"
    ],
    "description": "台灣專業汽車冷媒服務領導品牌，提供R134a、R1234yf冷媒充填、汽車冷氣維修保養、專業技術支援服務。15年專業經驗，ISO認證品質保證，全台50+服務據點。",
    "slogan": "專業冷媒，品質保證 - Professional Refrigerant, Quality Guaranteed",
    "foundingDate": "2009-03-15",
    "legalName": "德卡酷冷汽車服務股份有限公司",
    "taxID": "12345678",
    "duns": "123456789",
    "employee": "50-100",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "復興北路123號1樓",
      "addressLocality": "台北市",
      "addressRegion": "中山區",
      "postalCode": "10491",
      "addressCountry": "TW"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+886-2-1234-5678",
        "contactType": "customer service",
        "areaServed": "TW",
        "availableLanguage": ["Chinese", "English"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": "08:00",
          "closes": "18:00"
        }
      },
      {
        "@type": "ContactPoint",
        "telephone": "+886-800-000-000",
        "contactType": "technical support",
        "areaServed": "TW",
        "availableLanguage": ["Chinese"],
        "hoursAvailable": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      }
    ],
    "email": "service@drcarcold.com",
    "faxNumber": "+886-2-1234-5679",
    "openingHours": [
      "Mo-Fr 08:00-18:00",
      "Sa 08:00-17:00"
    ],
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.0330",
      "longitude": "121.5654"
    },
    "hasMap": "https://goo.gl/maps/drcarcold",
    "priceRange": "$$",
    "paymentAccepted": [
      "現金", "信用卡", "銀行轉帳", "支票", "LINE Pay", "Apple Pay", "Google Pay"
    ],
    "currenciesAccepted": "TWD",
    "areaServed": [
      {
        "@type": "Country",
        "name": "台灣"
      },
      {
        "@type": "State",
        "name": "台北市"
      },
      {
        "@type": "State", 
        "name": "新北市"
      },
      {
        "@type": "State",
        "name": "桃園市"
      },
      {
        "@type": "State",
        "name": "台中市"
      },
      {
        "@type": "State",
        "name": "台南市"
      },
      {
        "@type": "State",
        "name": "高雄市"
      }
    ],
    "serviceType": [
      "汽車冷媒充填服務",
      "R134a冷媒服務",
      "R1234yf冷媒服務", 
      "汽車冷氣維修",
      "空調系統保養",
      "冷氣故障診斷",
      "冷媒洩漏檢測",
      "壓縮機維修",
      "冷凝器清洗",
      "蒸發器維修",
      "冷氣濾網更換"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "汽車冷媒服務目錄",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "冷媒充填服務",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "R134a冷媒充填",
                "description": "專業R134a冷媒充填服務，適用於2017年前車款"
              },
              "price": "800-1500",
              "priceCurrency": "TWD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service", 
                "name": "R1234yf冷媒充填",
                "description": "新世代R1234yf環保冷媒充填，適用於2017年後新車"
              },
              "price": "1200-2000",
              "priceCurrency": "TWD"
            }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "維修保養服務",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "冷氣系統檢測",
                "description": "全面冷氣系統健康檢查，含壓力測試、洩漏檢測"
              },
              "price": "500-800",
              "priceCurrency": "TWD"
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "壓縮機維修",
                "description": "專業壓縮機故障診斷與維修服務"
              },
              "price": "3000-8000", 
              "priceCurrency": "TWD"
            }
          ]
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "287",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "陳先生"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "服務很專業，技師經驗豐富，冷媒充填後冷氣效果明顯改善。價格合理，推薦！",
        "datePublished": "2024-01-15"
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "李小姐"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "BMW的R1234yf冷媒充填服務很專業，技師很細心解釋，設備先進。",
        "datePublished": "2024-01-10"
      }
    ],
    "brand": {
      "@type": "Brand",
      "name": "DrCarCold"
    },
    "department": [
      {
        "@type": "AutomotiveService",
        "name": "技術服務部",
        "description": "專業汽車冷媒技術服務"
      },
      {
        "@type": "AutomotiveService", 
        "name": "客戶服務部",
        "description": "客戶諮詢與售後服務"
      }
    ],
    "awards": [
      "2023年度最佳汽車服務品牌",
      "ISO 9001品質認證",
      "環保冷媒推廣貢獻獎"
    ],
    "sameAs": [
      "https://www.facebook.com/DrCarCold",
      "https://www.instagram.com/drcarcold",
      "https://www.youtube.com/c/DrCarCold",
      "https://line.me/ti/p/@drcarcold"
    ]
  }

  return (
    <Script
      id="organization-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData)
      }}
    />
  )
}

// 🎯 網站結構化數據
export function WebsiteStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://drcarcold.com/#website",
    "name": "DrCarCold 汽車冷媒專家",
    "description": "台灣專業汽車冷媒服務領導品牌官方網站",
    "url": "https://drcarcold.com",
    "inLanguage": ["zh-TW", "en-US"],
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://drcarcold.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    ],
    "author": {
      "@type": "Organization",
      "name": "DrCarCold"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DrCarCold"
    },
    "copyrightHolder": {
      "@type": "Organization", 
      "name": "DrCarCold"
    },
    "copyrightYear": "2024",
    "dateCreated": "2009-03-15",
    "dateModified": new Date().toISOString(),
    "datePublished": "2009-03-15",
    "mainEntity": {
      "@id": "https://drcarcold.com/#organization"
    }
  }

  return (
    <Script
      id="website-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteData)
      }}
    />
  )
}

// 🎯 麵包屑結構化數據
export function BreadcrumbStructuredData({ 
  breadcrumbs 
}: { 
  breadcrumbs: Array<{ name: string; url: string }> 
}) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <Script
      id="breadcrumb-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData)
      }}
    />
  )
}

// 🎯 常見問題結構化數據
export function FAQStructuredData({ 
  faqs 
}: { 
  faqs: Array<{ question: string; answer: string }> 
}) {
  const faqData = {
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

  return (
    <Script
      id="faq-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData)
      }}
    />
  )
}

// 🎯 產品結構化數據
export function ProductStructuredData({
  product
}: {
  product: {
    id: string
    name: string
    description: string
    price: string
    category: string
    brand: string
    image: string
    availability: string
  }
}) {
  const productData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://drcarcold.com/products/${product.id}`,
    "name": product.name,
    "description": product.description,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "DrCarCold"
    },
    "image": [
      `https://drcarcold.com/images/products/${product.image}`,
      `https://drcarcold.com/images/products/${product.id}-2.jpg`,
      `https://drcarcold.com/images/products/${product.id}-3.jpg`
    ],
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "TWD",
      "availability": `https://schema.org/${product.availability}`,
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "DrCarCold"
      },
      "validFrom": new Date().toISOString(),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      "warranty": "12 months"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "23",
      "bestRating": "5",
      "worstRating": "1"
    }
  }

  return (
    <Script
      id={`product-structured-data-${product.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productData)
      }}
    />
  )
}

// 🎯 文章結構化數據
export function ArticleStructuredData({
  article
}: {
  article: {
    id: string
    headline: string
    description: string
    content: string
    datePublished: string
    dateModified: string
    author: string
    category: string
    tags: string[]
  }
}) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "TechnicalArticle",
    "@id": `https://drcarcold.com/news/${article.id}`,
    "headline": article.headline,
    "description": article.description,
    "articleBody": article.content,
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "author": {
      "@type": "Person",
      "name": article.author,
      "jobTitle": "汽車冷媒技師",
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
        "url": "https://drcarcold.com/images/logo.png",
        "width": 200,
        "height": 60
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://drcarcold.com/news/${article.id}`
    },
    "image": [
      `https://drcarcold.com/images/news/${article.id}-main.jpg`,
      `https://drcarcold.com/images/news/${article.id}-thumb.jpg`
    ],
    "about": {
      "@type": "Thing",
      "name": "汽車冷媒技術"
    },
    "keywords": article.tags.join(','),
    "articleSection": article.category,
    "wordCount": article.content.split(/\s+/).length,
    "timeRequired": `PT${Math.ceil(article.content.split(/\s+/).length / 200)}M`,
    "educationalLevel": "professional",
    "audience": {
      "@type": "Audience",
      "audienceType": "汽車技師"
    },
    "teaches": "汽車冷媒維修技術",
    "learningResourceType": "tutorial",
    "skillLevel": "intermediate",
    "inLanguage": "zh-TW"
  }

  return (
    <Script
      id={`article-structured-data-${article.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleData)
      }}
    />
  )
}

// 🎯 服務結構化數據
export function ServiceStructuredData({
  service
}: {
  service: {
    name: string
    description: string
    price: string
    duration: string
    category: string
  }
}) {
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "category": service.category,
    "provider": {
      "@type": "Organization",
      "name": "DrCarCold"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Taiwan"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": service.name,
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": service.name,
            "description": service.description
          },
          "price": service.price,
          "priceCurrency": "TWD",
          "estimatedDuration": service.duration,
          "availability": "https://schema.org/InStock"
        }
      ]
    }
  }

  return (
    <Script
      id={`service-structured-data-${service.name.replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(serviceData)
      }}
    />
  )
}

// 🎯 汽車冷媒知識庫結構化數據
export function KnowledgeBaseStructuredData() {
  const knowledgeData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "DrCarCold 汽車冷媒知識庫",
    "description": "包含R134a、R1234yf等汽車冷媒技術資訊、維修指南、故障診斷的專業知識庫",
    "url": "https://drcarcold.com/knowledge",
    "keywords": [
      "汽車冷媒", "R134a", "R1234yf", "冷氣維修", "技術指南", "故障診斷"
    ],
    "creator": {
      "@type": "Organization",
      "name": "DrCarCold"
    },
    "dateCreated": "2009-03-15",
    "dateModified": new Date().toISOString(),
    "license": "https://creativecommons.org/licenses/by-nc/4.0/",
    "distribution": {
      "@type": "DataDownload",
      "encodingFormat": "text/html",
      "contentUrl": "https://drcarcold.com"
    },
    "spatialCoverage": {
      "@type": "Place",
      "name": "Taiwan"
    },
    "temporalCoverage": "2009/2024"
  }

  return (
    <Script
      id="knowledge-base-structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(knowledgeData)
      }}
    />
  )
} 