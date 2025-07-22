import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Eye, Tag } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale })
  
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '汽車冷媒知識新聞 | R134a R1234yf 冷氣保養教學 維修案例分享 - DrCarCold'
      : 'Automotive Refrigerant News | R134a R1234yf AC Maintenance Tutorials & Case Studies - DrCarCold',
    
    description: isZh 
      ? '🔥最新汽車冷媒資訊！R134a、R1234yf冷媒知識，汽車冷氣保養教學，維修案例分享，業界動態，技術指南。專業汽車冷氣維修師傅經驗分享，讓您成為汽車冷氣達人！免費學習汽車冷媒專業知識。'
      : '🔥Latest automotive refrigerant information! R134a, R1234yf refrigerant knowledge, car AC maintenance tutorials, repair case studies, industry news, technical guides. Professional automotive AC technician experience sharing!',
    
    keywords: isZh ? [
      // 新聞內容關鍵字
      '汽車冷媒新聞', '冷氣保養教學', 'R134a知識', 'R1234yf資訊',
      '汽車冷氣維修案例', '冷媒技術指南', '汽車冷氣故障排除',
      
      // 教學相關關鍵字
      '汽車冷氣DIY', '冷媒充填教學', '汽車冷氣檢修', '冷氣不冷原因',
      '汽車冷氣保養秘訣', '冷媒洩漏檢測', '汽車冷氣系統清洗',
      
      // 專業知識關鍵字
      '汽車冷氣原理', '冷媒循環系統', '壓縮機保養', '冷凝器清潔',
      '蒸發器維護', '膨脹閥調整', '冷氣濾網更換', '冷氣管路檢查',
      
      // 問題解決關鍵字
      '汽車冷氣異音', '冷氣有異味', '冷氣風量小', '冷氣溫度不夠',
      '冷氣壓縮機不轉', '冷媒壓力異常', '汽車冷氣漏水',
      
      // 季節性關鍵字
      '夏季汽車冷氣', '冬季冷氣保養', '汽車冷氣準備', '冷氣季前檢查',
      
      // 品牌車型關鍵字
      'Toyota冷氣維修', 'Honda冷氣保養', 'Nissan冷氣問題',
      'BMW冷氣系統', 'Benz冷氣維修', 'Audi冷氣保養',
      
      // 新技術關鍵字
      '環保冷媒趨勢', '汽車冷氣新技術', 'CO2冷媒', '變頻冷氣',
      '智能冷氣控制', '節能冷氣系統'
    ] : [
      'automotive refrigerant news', 'car AC maintenance tutorial', 'R134a knowledge',
      'R1234yf information', 'automotive AC repair cases', 'refrigerant technical guide',
      'car AC troubleshooting', 'automotive AC DIY', 'refrigerant filling tutorial'
    ],
    
    openGraph: {
      title: isZh 
        ? '汽車冷媒知識新聞 - 專業教學與維修案例分享 | DrCarCold'
        : 'Automotive Refrigerant Knowledge News - Professional Tutorials & Repair Cases | DrCarCold',
      description: isZh 
        ? '最新汽車冷媒資訊，專業維修教學，R134a R1234yf 知識分享'
        : 'Latest automotive refrigerant information, professional repair tutorials, R134a R1234yf knowledge sharing',
      url: 'https://drcarcold.com/news',
      images: [
        {
          url: '/images/og-news.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒知識新聞' : 'DrCarCold Automotive Refrigerant News',
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? '汽車冷媒知識新聞 - 專業教學與維修案例'
        : 'Automotive Refrigerant Knowledge News',
      description: isZh 
        ? '最新汽車冷媒資訊，專業維修教學分享'
        : 'Latest automotive refrigerant information and professional tutorials',
      images: ['/images/twitter-news.jpg'],
    },
    
    alternates: {
      canonical: `https://drcarcold.com/${locale}/news`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/news',
        'en': 'https://drcarcold.com/en/news',
      },
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    category: 'automotive knowledge',
    classification: 'Educational Content',
    
    other: {
      'content-type': 'automotive-education',
      'target-audience': 'automotive-professionals',
      'knowledge-level': 'beginner-to-expert',
    },
  }
}

async function getNews() {
  return await prisma.news.findMany({
    where: {
      isPublished: true,
      publishedAt: {
        lte: new Date(),
      },
    },
    orderBy: { publishedAt: 'desc' },
    take: 20, // 限制數量以提升頁面載入速度
  })
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const news = await getNews()
  const isZh = locale === 'zh'
  
  // 生成新聞列表的結構化資料
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: isZh ? 'DrCarCold 汽車冷媒知識新聞' : 'DrCarCold Automotive Refrigerant News',
    description: isZh 
      ? '專業汽車冷媒知識分享，R134a R1234yf 教學，維修案例'
      : 'Professional automotive refrigerant knowledge sharing, R134a R1234yf tutorials, repair cases',
    url: 'https://drcarcold.com/news',
    publisher: {
      '@type': 'Organization',
      '@id': 'https://drcarcold.com/#organization',
      name: 'DrCarCold',
      logo: {
        '@type': 'ImageObject',
        url: 'https://drcarcold.com/images/logo.png'
      }
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: news.length,
      itemListElement: news.slice(0, 10).map((article, index) => ({
        '@type': 'Article',
        position: index + 1,
        headline: article.title,
        description: article.excerpt || article.title,
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt.toISOString(),
        author: {
          '@type': 'Organization',
          name: 'DrCarCold 編輯團隊'
        },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://drcarcold.com/#organization'
        },
        url: `https://drcarcold.com/news/${article.slug}`,
        image: article.coverImage || 'https://drcarcold.com/images/default-news.jpg',
        articleSection: '汽車冷媒知識',
        keywords: ['汽車冷媒', 'R134a', 'R1234yf', '冷氣維修', '汽車保養']
      }))
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isZh ? '首頁' : 'Home',
          item: 'https://drcarcold.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isZh ? '新聞知識' : 'News',
          item: 'https://drcarcold.com/news'
        }
      ]
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* JSON-LD 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* SEO 優化的頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {isZh ? (
            <>
              <span className="text-blue-600">汽車冷媒知識新聞</span> | 
              專業教學與維修案例分享
            </>
          ) : (
            'Automotive Refrigerant Knowledge News'
          )}
        </h1>
        
        {/* SEO 優化的描述段落 */}
        <div className="text-lg text-gray-600 mb-6 leading-relaxed">
          {isZh ? (
            <p>
              🔥 <strong>最專業的汽車冷媒知識平台</strong>！提供最新
              <strong className="text-blue-600">R134a、R1234yf冷媒資訊</strong>、
              <strong className="text-blue-600">汽車冷氣保養教學</strong>、
              <strong className="text-blue-600">維修案例分享</strong>、
              業界動態與技術指南。30年專業維修師傅經驗傳承，
              讓您快速掌握汽車冷氣維修技巧，成為汽車冷氣達人！
            </p>
          ) : (
            <p>
              🔥 <strong>The most professional automotive refrigerant knowledge platform</strong>! 
              Latest R134a, R1234yf refrigerant information, car AC maintenance tutorials, 
              repair case studies, industry news and technical guides. 30 years of professional 
              technician experience sharing!
            </p>
          )}
        </div>
        
        {/* 知識分類標籤 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {isZh ? [
            'R134a知識', 'R1234yf資訊', '冷氣保養', '維修教學', 
            '故障排除', '案例分享', '業界動態', '新技術'
          ] : [
            'R134a Knowledge', 'R1234yf Info', 'AC Maintenance', 'Repair Tutorial',
            'Troubleshooting', 'Case Study', 'Industry News', 'New Technology'
          ].map((tag, index) => (
            <span 
              key={index}
              className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        
        {/* 統計資訊 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{news.length}+</div>
            <div className="text-sm text-gray-600">專業文章</div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">維修案例</div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">30+</div>
            <div className="text-sm text-gray-600">年經驗</div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">知識更新</div>
          </div>
        </div>
      </div>

      {/* 新聞列表 */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {isZh ? '暫無新聞內容' : 'No news content available'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <article key={article.id}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    <Link 
                      href={`/${locale}/news/${article.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {article.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                  )}
                  
                  {article.tags && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {JSON.parse(article.tags).slice(0, 3).map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(article.publishedAt || article.createdAt)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {article.viewCount || 0}
                  </div>
                </CardFooter>
              </Card>
            </article>
          ))}
        </div>
      )}
      
      {/* SEO 優化的底部內容 */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          {isZh ? '為什麼選擇 DrCarCold 汽車冷媒知識?' : 'Why Choose DrCarCold Refrigerant Knowledge?'}
        </h2>
        <div className="grid md:grid-cols-2 gap-4 text-gray-600">
          <div>
            <h3 className="font-medium mb-2 text-blue-600">
              {isZh ? '專業權威' : 'Professional Authority'}
            </h3>
            <p className="text-sm">
              {isZh 
                ? '30年汽車冷氣維修經驗，專業技師團隊撰寫，確保內容準確可靠'
                : '30 years of automotive AC repair experience, written by professional technicians'
              }
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-green-600">
              {isZh ? '實用性強' : 'Highly Practical'}
            </h3>
            <p className="text-sm">
              {isZh 
                ? '真實維修案例分享，step-by-step教學，讓您快速上手'
                : 'Real repair case studies, step-by-step tutorials for quick learning'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 