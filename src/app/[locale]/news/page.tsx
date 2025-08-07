import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { SEOBanner } from '@/components/seo/seo-banner'
import { Calendar, Eye, Tag, FileText, Bot } from 'lucide-react'
import { prisma } from '@/lib/prisma'

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
    const news = await prisma.news.findMany({
      where: {
        isPublished: true
      },
      orderBy: {
        publishedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        viewCount: true,
        sourceName: true,
        tags: true,
        seoKeywords: true,
        author: true
      }
    })

    return news.map(article => ({
      ...article,
      // 解析 tags（如果是 JSON 字符串）
      parsedTags: (() => {
        try {
          return typeof article.tags === 'string' ? JSON.parse(article.tags) : (article.tags || [])
        } catch {
          return []
        }
      })(),
      // 解析 SEO 關鍵字作為標籤
      keywordTags: article.seoKeywords ? article.seoKeywords.split(',').map(k => k.trim()).slice(0, 3) : [],
      // 判斷文章類型
      isAIGenerated: article.sourceName?.includes('AI Generated') || article.sourceName?.includes('SEO'),
      viewCount: article.viewCount || 0
    }))
  } catch (error) {
    console.error('獲取新聞失敗:', error)
    return []
  }
}

export default async function NewsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === 'zh'
  const news = await getNews()

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

          {/* 文章統計 */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>📚 共 {news.length} 篇文章</span>
            <span>🤖 AI 生成: {news.filter(n => n.isAIGenerated).length} 篇</span>
            <span>📰 新聞爬取: {news.filter(n => !n.isAIGenerated).length} 篇</span>
          </div>
        </div>

        {/* 新聞列表 */}
        {news.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((article) => (
              <Card key={article.id} className="h-full hover:shadow-lg transition-shadow group">
                <CardHeader>
                  {/* 圖片和文章類型標識 */}
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 overflow-hidden relative">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-blue-600">
                        <div className="text-4xl mb-2">
                          {article.isAIGenerated ? '🤖' : '📰'}
                        </div>
                        <div className="text-sm">
                          {article.isAIGenerated ? 'AI 生成' : '新聞爬取'}
                        </div>
                      </div>
                    </div>
                    
                    {/* 來源標識 */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        article.isAIGenerated 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {article.isAIGenerated ? (
                          <><Bot className="inline h-3 w-3 mr-1" />SEO</>
                        ) : (
                          <><FileText className="inline h-3 w-3 mr-1" />新聞</>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                    <Link href={`/${locale}/news/${article.slug}`}>
                      {article.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {article.excerpt || '點擊查看完整內容...'}
                  </p>
                  
                  {/* 標籤 */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {(article.keywordTags.length > 0 ? article.keywordTags : article.parsedTags)
                      .slice(0, 3)
                      .map((tag: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                  </div>

                  {/* 來源資訊 */}
                  <div className="text-xs text-gray-500 mb-2">
                    來源: {article.sourceName || '未知'}
                    {article.author && ` | 作者: ${article.author}`}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {article.publishedAt 
                        ? new Date(article.publishedAt).toLocaleDateString('zh-TW')
                        : '未發布'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{article.viewCount}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* 無文章狀態 */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold mb-2">目前沒有文章</h3>
            <p className="text-gray-600 mb-6">系統正在生成和爬取最新的汽車冷媒技術資訊</p>
            <Link href={`/${locale}/refrigerant-lookup`}>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                🔍 查看冷媒規格
              </button>
            </Link>
          </div>
        )}

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