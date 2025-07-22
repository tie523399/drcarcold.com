/**
 * 🎯 內部連結SEO優化組件
 * 智能生成相關內部連結，提升頁面權重分佈和用戶體驗
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// 🎯 汽車冷媒相關內部連結配置
const INTERNAL_LINKS_CONFIG = {
  // 首頁連結
  homepage: [
    {
      href: '/products',
      text: '汽車冷媒產品',
      keywords: ['產品', '冷媒', 'R134a', 'R1234yf'],
      priority: 0.9
    },
    {
      href: '/refrigerant-lookup', 
      text: '冷媒規格查詢',
      keywords: ['查詢', '規格', '車型'],
      priority: 0.9
    },
    {
      href: '/news',
      text: '技術資訊',
      keywords: ['技術', '維修', '保養'],
      priority: 0.8
    }
  ],
  
  // 產品頁連結
  products: [
    {
      href: '/refrigerant-lookup',
      text: '查詢您的車型適用冷媒',
      keywords: ['查詢', '適用', '車型'],
      priority: 0.9
    },
    {
      href: '/news/refrigerant-guide',
      text: '冷媒選擇指南',
      keywords: ['指南', '選擇', '冷媒'],
      priority: 0.8
    },
    {
      href: '/r134a-refrigerant',
      text: 'R134a冷媒詳細介紹',
      keywords: ['R134a', '介紹', '詳細'],
      priority: 0.8
    },
    {
      href: '/r1234yf-refrigerant',
      text: 'R1234yf環保冷媒',
      keywords: ['R1234yf', '環保', '冷媒'],
      priority: 0.8
    }
  ],
  
  // 新聞頁連結
  news: [
    {
      href: '/products',
      text: '專業冷媒產品',
      keywords: ['專業', '產品', '冷媒'],
      priority: 0.8
    },
    {
      href: '/refrigerant-lookup',
      text: '車型冷媒查詢工具',
      keywords: ['車型', '查詢', '工具'],
      priority: 0.8
    },
    {
      href: '/about',
      text: '關於DrCarCold',
      keywords: ['關於', 'DrCarCold', '公司'],
      priority: 0.6
    }
  ],
  
  // 技術文章相關連結
  technical: [
    {
      href: '/ac-repair-guide',
      text: '汽車冷氣維修指南',
      keywords: ['冷氣', '維修', '指南'],
      priority: 0.8
    },
    {
      href: '/maintenance-tips',
      text: '保養維護技巧',
      keywords: ['保養', '維護', '技巧'],
      priority: 0.7
    },
    {
      href: '/toyota-refrigerant',
      text: 'Toyota車款冷媒規格',
      keywords: ['Toyota', '車款', '規格'],
      priority: 0.7
    },
    {
      href: '/honda-refrigerant',
      text: 'Honda冷媒服務',
      keywords: ['Honda', '冷媒', '服務'],
      priority: 0.7
    }
  ],
  
  // 文章頁面相關連結
  article: [
    {
      href: '/products',
      text: '專業冷媒產品',
      keywords: ['專業', '產品', '冷媒'],
      priority: 0.8
    },
    {
      href: '/refrigerant-lookup',
      text: '車型冷媒查詢',
      keywords: ['車型', '查詢', '冷媒'],
      priority: 0.8
    },
    {
      href: '/news',
      text: '更多技術文章',
      keywords: ['技術', '文章', '資訊'],
      priority: 0.7
    },
    {
      href: '/about',
      text: '專業團隊介紹',
      keywords: ['專業', '團隊', '介紹'],
      priority: 0.6
    }
  ],
  
  // 產品詳情頁面相關連結
  'product-detail': [
    {
      href: '/products',
      text: '更多冷媒產品',
      keywords: ['更多', '冷媒', '產品'],
      priority: 0.9
    },
    {
      href: '/refrigerant-lookup',
      text: '查詢適用車型',
      keywords: ['查詢', '適用', '車型'],
      priority: 0.9
    },
    {
      href: '/news/installation-guide',
      text: '安裝使用指南',
      keywords: ['安裝', '使用', '指南'],
      priority: 0.8
    },
    {
      href: '/contact',
      text: '技術支援聯絡',
      keywords: ['技術', '支援', '聯絡'],
      priority: 0.7
    }
  ]
}

// 🎯 相關產品連結
const RELATED_PRODUCT_LINKS = [
  {
    href: '/products/r134a-refrigerant',
    text: 'R134a汽車冷媒',
    description: '適用於2017年前車款的環保冷媒',
    priority: 0.9
  },
  {
    href: '/products/r1234yf-refrigerant',
    text: 'R1234yf環保冷媒',
    description: '新世代超低GWP環保冷媒',
    priority: 0.9
  },
  {
    href: '/products/pag-oil',
    text: 'PAG冷凍油',
    description: '專業壓縮機潤滑油',
    priority: 0.8
  },
  {
    href: '/products/ac-tools',
    text: '冷氣維修工具',
    description: '專業維修設備和工具',
    priority: 0.8
  }
]

// 🎯 車廠專門頁面連結
const BRAND_SPECIFIC_LINKS = [
  {
    href: '/toyota-refrigerant',
    text: 'Toyota冷媒服務',
    brands: ['toyota', 'lexus'],
    priority: 0.8
  },
  {
    href: '/honda-refrigerant', 
    text: 'Honda冷媒規格',
    brands: ['honda', 'acura'],
    priority: 0.8
  },
  {
    href: '/bmw-refrigerant',
    text: 'BMW冷媒系統',
    brands: ['bmw', 'mini'],
    priority: 0.8
  },
  {
    href: '/mercedes-refrigerant',
    text: 'Mercedes冷媒服務',
    brands: ['mercedes', 'smart'],
    priority: 0.8
  }
]

// 🎯 智能內部連結組件
export function SmartInternalLinks({ 
  pageType, 
  currentPath,
  maxLinks = 5,
  className = ''
}: {
  pageType: 'homepage' | 'products' | 'news' | 'technical' | 'product-detail' | 'article'
  currentPath?: string
  maxLinks?: number
  className?: string
}) {
  const pathname = usePathname()
  
  // 根據頁面類型獲取相關連結
  const getRelevantLinks = () => {
    let links = INTERNAL_LINKS_CONFIG[pageType] || INTERNAL_LINKS_CONFIG.homepage
    
    // 過濾掉當前頁面
    links = links.filter(link => link.href !== pathname && link.href !== currentPath)
    
    // 根據優先級排序並限制數量
    return links
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxLinks)
  }
  
  const relevantLinks = getRelevantLinks()
  
  if (relevantLinks.length === 0) return null
  
  return (
    <div className={`smart-internal-links ${className}`}>
      <div className="border-t border-gray-200 pt-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔗 相關資訊
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="block p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
            >
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                  {link.text}
                </span>
                <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🎯 相關產品推薦組件
export function RelatedProductLinks({ 
  currentProductId,
  maxProducts = 4,
  className = ''
}: {
  currentProductId?: string
  maxProducts?: number
  className?: string
}) {
  // 過濾掉當前產品
  const products = RELATED_PRODUCT_LINKS
    .filter(product => !product.href.includes(currentProductId || ''))
    .slice(0, maxProducts)
  
  if (products.length === 0) return null
  
  return (
    <div className={`related-products ${className}`}>
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          🛍️ 相關產品推薦
        </h3>
        <div className="space-y-4">
          {products.map((product, index) => (
            <Link
              key={product.href}
              href={product.href}
              className="block group"
            >
              <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {product.text}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {product.description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🎯 車廠專用連結組件
export function BrandSpecificLinks({ 
  detectedBrand,
  className = ''
}: {
  detectedBrand?: string
  className?: string
}) {
  if (!detectedBrand) return null
  
  const brandLinks = BRAND_SPECIFIC_LINKS.filter(link =>
    link.brands.some(brand => 
      brand.toLowerCase() === detectedBrand.toLowerCase()
    )
  )
  
  if (brandLinks.length === 0) return null
  
  return (
    <div className={`brand-specific-links ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚗 {detectedBrand.toUpperCase()} 專門服務
        </h3>
        <div className="space-y-3">
          {brandLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center space-x-3 text-blue-700 hover:text-blue-900 font-medium group"
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-blue-700"></span>
              <span>{link.text}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🎯 麵包屑導航組件
export function SEOBreadcrumbs({ 
  items,
  className = ''
}: {
  items: Array<{ name: string; href?: string }>
  className?: string
}) {
  return (
    <nav className={`seo-breadcrumbs ${className}`} aria-label="麵包屑導航">
      <ol className="flex items-center space-x-2 text-sm text-gray-600">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href ? (
              <Link 
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

// 🎯 相關文章連結組件
export function RelatedArticleLinks({ 
  currentArticleId,
  relatedTags = [],
  maxArticles = 3,
  className = ''
}: {
  currentArticleId?: string
  relatedTags?: string[]
  maxArticles?: number
  className?: string
}) {
  // 這裡可以根據標籤或分類動態生成相關文章
  // 目前使用靜態示例
  const relatedArticles = [
    {
      href: '/news/r134a-vs-r1234yf',
      title: 'R134a vs R1234yf 冷媒比較',
      excerpt: '深入比較兩種冷媒的特性、適用性和環保性能',
      readTime: '5 分鐘'
    },
    {
      href: '/news/ac-maintenance-guide',
      title: '汽車冷氣保養完整指南',
      excerpt: '專業技師分享冷氣系統保養的關鍵要點',
      readTime: '8 分鐘'
    },
    {
      href: '/news/summer-ac-tips',
      title: '夏季冷氣使用技巧',
      excerpt: '如何在炎熱夏天有效使用汽車冷氣，延長系統壽命',
      readTime: '6 分鐘'
    }
  ]
  
  const filteredArticles = relatedArticles
    .filter(article => !article.href.includes(currentArticleId || ''))
    .slice(0, maxArticles)
  
  if (filteredArticles.length === 0) return null
  
  return (
    <div className={`related-articles ${className}`}>
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          📚 延伸閱讀
        </h3>
        <div className="space-y-6">
          {filteredArticles.map((article, index) => (
            <Link
              key={article.href}
              href={article.href}
              className="block group"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {article.title}
                </h4>
                <p className="text-gray-600 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    ⏱️ 閱讀時間：{article.readTime}
                  </span>
                  <span className="text-blue-600 group-hover:text-blue-800 font-medium">
                    閱讀更多 →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// 🎯 全站內部連結權重分佈組件
export function SiteWideInternalLinks({ className = '' }: { className?: string }) {
  const importantPages = [
    {
      href: '/',
      text: 'DrCarCold 首頁',
      description: '台灣專業汽車冷媒服務',
      weight: 1.0
    },
    {
      href: '/products',
      text: '冷媒產品目錄',
      description: 'R134a、R1234yf專業產品',
      weight: 0.9
    },
    {
      href: '/refrigerant-lookup',
      text: '冷媒規格查詢',
      description: '免費車型冷媒查詢工具',
      weight: 0.9
    },
    {
      href: '/news',
      text: '技術資訊',
      description: '專業維修保養知識',
      weight: 0.8
    }
  ]
  
  return (
    <div className={`site-wide-links ${className}`}>
      <div className="bg-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🌟 熱門頁面
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {importantPages.map((page, index) => (
            <Link
              key={page.href}
              href={page.href}
              className="text-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                {page.text}
              </div>
              <div className="text-xs text-gray-600">
                {page.description}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
} 