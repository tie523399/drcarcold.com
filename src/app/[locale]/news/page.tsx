import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SEOBanner } from '@/components/seo/seo-banner'
import { Calendar, Eye, Tag } from 'lucide-react'

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

export default function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === 'zh'

  // 靜態新聞資料
  const news = [
    {
      id: '1',
      title: '車冷博士專業R134a冷媒充填服務',
      slug: 'r134a-refrigerant-service',
      excerpt: '車冷博士提供專業R134a冷媒充填服務，台中龍井15年經驗，專業認證技師，透明收費，完善保固。歡迎聯絡04-26301915。',
      coverImage: '/images/news/default-1.jpg',
      publishedAt: '2024-01-15',
      viewCount: 156,
      tags: ['R134a冷媒', '汽車冷氣', '專業服務', '台中龍井']
    },
    {
      id: '2', 
      title: 'R1234yf環保冷媒導入指南',
      slug: 'r1234yf-eco-refrigerant-guide',
      excerpt: 'R1234yf環保冷媒完整導入指南，了解新世代汽車冷氣系統的環保升級。車冷博士提供專業R1234yf服務，符合最新環保法規。',
      coverImage: '/images/news/default-2.jpg',
      publishedAt: '2024-01-10',
      viewCount: 203,
      tags: ['R1234yf', '環保冷媒', '技術指南', '法規更新']
    },
    {
      id: '3',
      title: '汽車冷氣不冷原因分析與解決方案',
      slug: 'car-ac-not-cooling-solutions', 
      excerpt: '汽車冷氣不冷怎麼辦？車冷博士分析5大常見原因：冷媒不足、冷凝器阻塞、壓縮機故障等，提供專業解決方案與預防保養建議。',
      coverImage: '/images/news/default-3.jpg',
      publishedAt: '2024-01-05',
      viewCount: 342,
      tags: ['汽車冷氣', '故障診斷', '維修指南', '保養建議']
    },
    {
      id: '4',
      title: '車冷博士服務範圍與聯絡資訊',
      slug: 'service-contact-info',
      excerpt: '車冷博士位於台中市龍井區，提供專業汽車冷媒服務。營業時間週一至週五09:30-17:30，歡迎來電04-26301915預約服務。',
      coverImage: '/images/news/default-4.jpg', 
      publishedAt: '2024-01-01',
      viewCount: 128,
      tags: ['服務範圍', '聯絡資訊', '台中龍井', '預約服務']
    },
    {
      id: '5',
      title: 'Toyota、Honda、Nissan冷媒規格查詢',
      slug: 'toyota-honda-nissan-refrigerant-specs',
      excerpt: '提供Toyota豐田、Honda本田、Nissan日產等主要品牌汽車的冷媒規格查詢。包含R134a、R1234yf冷媒充填量與PAG油規格資訊。',
      coverImage: '/images/news/default-5.jpg',
      publishedAt: '2023-12-28',
      viewCount: 275,
      tags: ['Toyota', 'Honda', 'Nissan', '冷媒規格', '查詢系統']
    },
    {
      id: '6',
      title: '汽車冷氣系統維護保養指南',
      slug: 'car-ac-maintenance-guide',
      excerpt: '定期保養汽車冷氣系統的重要性與方法。包含冷媒檢查、濾網更換、系統清洗等專業保養流程，延長冷氣系統使用壽命。',
      coverImage: '/images/news/default-1.jpg',
      publishedAt: '2023-12-25',
      viewCount: 189,
      tags: ['冷氣保養', '系統維護', '定期檢查', '專業流程']
    }
  ]

  return (
    <div className="min-h-screen">
      {/* SEO增強橫幅 */}
      <SEOBanner type="page-top" variant="compact" />
      
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
                🏆 <strong>車冷博士</strong>為您提供最新的汽車冷媒技術資訊，包括
                <strong className="text-blue-600">R134a、R1234yf</strong>等環保冷媒的深度解析，
                以及實用的<strong className="text-green-600">汽車冷氣維修教學</strong>和
                <strong className="text-orange-600">故障排除指南</strong>。
              </p>
            ) : (
              <p>
                <strong>Dr. Car Cold</strong> provides the latest automotive refrigerant technical information, 
                including R134a, R1234yf analysis and practical repair tutorials.
              </p>
            )}
          </div>
        </div>

        {/* 新聞列表 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((article) => (
            <Card key={article.id} className="h-full hover:shadow-lg transition-shadow group">
              <CardHeader>
                {/* 圖片 */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-blue-600">
                      <div className="text-4xl mb-2">📰</div>
                      <div className="text-sm">車冷博士</div>
                    </div>
                  </div>
                </div>
                
                <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {article.excerpt}
                </p>
                
                {/* 標籤 */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(article.publishedAt).toLocaleDateString('zh-TW')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{article.viewCount}</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* 底部聯絡資訊 */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            {isZh ? '🔧 需要專業汽車冷媒服務？' : '🔧 Need Professional Refrigerant Service?'}
          </h2>
          <p className="text-blue-700 mb-6">
            {isZh 
              ? '車冷博士提供專業的汽車冷媒充填與維修服務，9年專業經驗，值得您的信賴！'
              : 'Dr. Car Cold provides professional automotive refrigerant services with 9 years of experience!'
            }
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 text-blue-800">
            <div className="flex items-center justify-center gap-2">
              <span>📍</span>
              <span>台中市龍井區中和村海尾路278巷33弄8號</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>📞</span>
              <span>04-26301915</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>🕐</span>
              <span>週一至週五 09:30-17:30</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link href={`/${locale}/refrigerant-lookup`}>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                {isZh ? '🔍 冷媒規格查詢' : '🔍 Refrigerant Specifications'}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}