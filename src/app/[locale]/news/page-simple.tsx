import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Eye, Tag } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  publishedAt?: string
  createdAt?: string
  viewCount: number
  tags: string[]
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '汽車冷媒技術資訊 | R134a R1234yf 專業知識庫 - 車冷博士'
      : 'Automotive Refrigerant Technical Information - Dr. Car Cold',
    description: isZh 
      ? '車冷博士專業汽車冷媒技術資訊！R134a、R1234yf冷媒深度解析，維修技術分享，設備使用教學。'
      : 'Professional automotive refrigerant technical information by Dr. Car Cold!',
  }
}

async function getNews() {
  try {
    const response = await fetch('http://localhost:3000/api/news', {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }
    
    const data = await response.json()
    
    if (data.success && data.data) {
      return data.data
    }
    
    return []
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const news = await getNews()
  const isZh = locale === 'zh'

  // 預設新聞資料（如果API失敗）
  const defaultNews = [
    {
      id: '1',
      title: '車冷博士專業R134a冷媒充填服務',
      slug: 'r134a-refrigerant-service',
      excerpt: '車冷博士提供專業R134a冷媒充填服務，台中龍井15年經驗，專業認證技師，透明收費，完善保固。',
      coverImage: '/images/news/default-1.jpg',
      publishedAt: '2024-01-15',
      viewCount: 156,
      tags: ['R134a冷媒', '汽車冷氣', '專業服務']
    },
    {
      id: '2', 
      title: 'R1234yf環保冷媒導入指南',
      slug: 'r1234yf-eco-refrigerant-guide',
      excerpt: 'R1234yf環保冷媒完整導入指南，了解新世代汽車冷氣系統的環保升級，車冷博士專業服務。',
      coverImage: '/images/news/default-2.jpg',
      publishedAt: '2024-01-10',
      viewCount: 203,
      tags: ['R1234yf', '環保冷媒', '技術指南']
    },
    {
      id: '3',
      title: '汽車冷氣不冷原因分析',
      slug: 'car-ac-not-cooling-solutions', 
      excerpt: '汽車冷氣不冷怎麼辦？車冷博士分析5大常見原因，提供專業解決方案與預防保養建議。',
      coverImage: '/images/news/default-3.jpg',
      publishedAt: '2024-01-05',
      viewCount: 342,
      tags: ['汽車冷氣', '故障診斷', '維修指南']
    }
  ]

  const displayNews = news.length > 0 ? news : defaultNews

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {isZh ? (
              <>
                <span className="text-blue-600">汽車冷媒技術資訊</span> | 
                專業知識分享
              </>
            ) : (
              'Automotive Refrigerant Technical Information'
            )}
          </h1>
          
          <div className="text-lg text-gray-600 mb-6">
            {isZh ? (
              <p>
                車冷博士為您提供最新的汽車冷媒技術資訊，包括R134a、R1234yf等環保冷媒的深度解析，
                以及實用的汽車冷氣維修教學和故障排除指南。
              </p>
            ) : (
              <p>
                Dr. Car Cold provides the latest automotive refrigerant technical information, 
                including R134a, R1234yf analysis and practical repair tutorials.
              </p>
            )}
          </div>
        </div>

        {/* 新聞列表 */}
        {displayNews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayNews.map((article: NewsArticle) => (
              <Link key={article.id} href={`/${locale}/news/${article.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    {/* 圖片 */}
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                      <SafeImage
                        src={article.coverImage || '/images/news/default-1.jpg'}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        fallbackSrc="/images/news/default-1.jpg"
                        fill={true}
                      />
                    </div>
                    
                    <CardTitle className="line-clamp-2 text-lg">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                    
                    {/* 標籤 */}
                    {article.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(Array.isArray(article.tags) ? article.tags : 
                          (typeof article.tags === 'string' ? 
                            (() => {
                              try {
                                return JSON.parse(article.tags)
                              } catch {
                                return [article.tags]
                              }
                            })() : []
                          )
                        ).slice(0, 3).map((tag: string, index: number) => (
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
                  
                  <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.publishedAt || article.createdAt || new Date()).toLocaleDateString('zh-TW')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{article.viewCount || 0}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              {isZh ? '暫無新聞文章' : 'No news articles available'}
            </h3>
            <p className="text-gray-500">
              {isZh 
                ? '我們正在努力為您準備精彩的汽車冷媒知識內容，請稍後再來查看！'
                : 'We are working hard to prepare exciting automotive refrigerant knowledge content for you. Please check back later!'
              }
            </p>
          </div>
        )}

        {/* 聯絡資訊 */}
        <div className="mt-16 bg-blue-50 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            {isZh ? '需要專業汽車冷媒服務？' : 'Need Professional Refrigerant Service?'}
          </h2>
          <p className="text-blue-700 mb-4">
            {isZh 
              ? '車冷博士提供專業的汽車冷媒充填與維修服務'
              : 'Dr. Car Cold provides professional automotive refrigerant services'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="text-blue-800">
              📍 台中市龍井區中和村海尾路278巷33弄8號
            </div>
            <div className="text-blue-800">
              📞 04-26301915
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}