import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, Tag, ArrowLeft, Share2 } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import ShareButton from './share-button'
import { SafeImage } from '@/components/ui/safe-image'

interface NewsPageProps {
  params: {
    locale: string
    slug: string
  }
}

// 獲取單篇新聞
async function getNewsArticle(slug: string) {
  // 解碼 URL 編碼的 slug（處理中文字符）
  const decodedSlug = decodeURIComponent(slug)
  
  console.log('原始 slug:', slug)
  console.log('解碼後 slug:', decodedSlug)
  
  // 嘗試使用解碼後的 slug 查找
  let article = await prisma.news.findFirst({
    where: {
      slug: decodedSlug,
      isPublished: true,
      publishedAt: {
        lte: new Date(),
      },
    },
  })

  // 如果找不到，嘗試使用原始 slug
  if (!article) {
    article = await prisma.news.findFirst({
      where: {
        slug: slug,
        isPublished: true,
        publishedAt: {
          lte: new Date(),
        },
      },
    })
  }

  if (!article) {
    console.log('文章未找到，嘗試的 slug:', [slug, decodedSlug])
    return null
  }

  // 增加瀏覽次數
  await prisma.news.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  })

  return article
}

// 獲取相關文章
async function getRelatedArticles(currentId: string, tags: string, limit: number = 3) {
  try {
    const tagsArray = typeof tags === 'string' ? JSON.parse(tags) : []
    
    if (!Array.isArray(tagsArray) || tagsArray.length === 0) {
      // 如果沒有標籤，返回最新的文章
      return await prisma.news.findMany({
        where: {
          id: { not: currentId },
          isPublished: true,
          publishedAt: { lte: new Date() },
        },
        orderBy: { publishedAt: 'desc' },
        take: limit,
      })
    }

    // 根據標籤查找相關文章
    return await prisma.news.findMany({
      where: {
        id: { not: currentId },
        isPublished: true,
        publishedAt: { lte: new Date() },
        OR: tagsArray.map((tag: string) => ({
          tags: { contains: tag }
        }))
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })
  } catch (error) {
    console.error('獲取相關文章失敗:', error)
    return []
  }
}

// 生成元數據
export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const article = await getNewsArticle(params.slug)
  
  if (!article) {
    return {
      title: '文章未找到 - 車冷博士',
      description: '您要查找的文章不存在或已被移除。',
    }
  }

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

export default async function NewsArticlePage({ params }: NewsPageProps) {
  const article = await getNewsArticle(params.slug)
  const t = await getTranslations({ locale: params.locale })

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedArticles(article.id, article.tags)

  // 解析標籤
  let tags: string[] = []
  try {
    tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : []
  } catch {
    tags = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link href={`/${params.locale}/news`}>
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('news.backToNews')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-3">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* 新聞封面圖片 */}
              <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-500 to-blue-600">
                <SafeImage
                  src={article.coverImage || '/images/default-news.svg'}
                  alt={article.title}
                  className="w-full h-full object-cover"
                  fallbackSrc="/images/default-news.svg"
                  fill={true}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {article.sourceName || 'DrCarCold 新聞'}
                  </span>
                </div>
              </div>
              
              {/* 文章內容 */}
              <div className="p-6 lg:p-8">
                {/* 標題 */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {article.title}
                </h1>

                {/* 文章資訊 */}
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6 pb-6 border-b">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{article.publishedAt && formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{article.viewCount} {t('news.views')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>作者: {article.author}</span>
                  </div>
                </div>

                {/* 摘要 */}
                {article.excerpt && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                )}

                {/* 文章內容 */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br>') }}
                  />
                </div>

                {/* 標籤 */}
                {tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500 mr-2">標籤:</span>
                      {tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 分享按鈕 */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-4">
                    <Share2 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{t('news.shareArticle')}</span>
                    <ShareButton 
                      title={article.title} 
                      excerpt={article.excerpt} 
                      locale={params.locale}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* 側邊欄 */}
          <div className="lg:col-span-1">
            {/* 相關文章 */}
            {relatedArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('news.relatedArticles')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/${params.locale}/news/${relatedArticle.slug}`}
                        className="block group"
                      >
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedArticle.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {relatedArticle.publishedAt && formatDate(relatedArticle.publishedAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 返回新聞列表 */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <Link href={`/${params.locale}/news`}>
                  <Button className="w-full" variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {t('news.backToNews')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 