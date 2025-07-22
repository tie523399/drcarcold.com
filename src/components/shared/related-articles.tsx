'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Eye, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  publishedAt: string
  viewCount: number
  tags: string
  author: string
}

interface RelatedArticlesProps {
  locale: string
  keywords: string[]
  limit?: number
  currentArticleId?: string
}

export function RelatedArticles({ 
  locale, 
  keywords, 
  limit = 3, 
  currentArticleId 
}: RelatedArticlesProps) {
  const t = useTranslations()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        // 構建搜尋查詢
        const searchTerms = keywords.filter(Boolean).join(' ')
        const params = new URLSearchParams({
          limit: limit.toString(),
          published: 'true',
          search: searchTerms
        })

        if (currentArticleId) {
          params.append('exclude', currentArticleId)
        }

        const response = await fetch(`/api/news?${params}`)
        const data = await response.json()
        setArticles(data)
      } catch (error) {
        console.error('Error fetching related articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (keywords.length > 0) {
      fetchRelatedArticles()
    } else {
      setIsLoading(false)
    }
  }, [keywords, limit, currentArticleId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('articles.related.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!articles.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('articles.related.title')}
        </CardTitle>
        <CardDescription>
          {t('articles.related.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => {
            let tags: string[] = []
            try {
              tags = typeof article.tags === 'string' ? JSON.parse(article.tags) : []
            } catch {
              tags = []
            }

            return (
              <Link
                key={article.id}
                href={`/${locale}/news/${article.slug}`}
                className="block group"
              >
                <div className="space-y-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(new Date(article.publishedAt))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {article.viewCount}
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {article.excerpt}
                  </p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {articles.length >= limit && (
          <div className="mt-4 pt-4 border-t">
            <Link href={`/${locale}/news`}>
              <div className="flex items-center justify-center text-sm text-primary hover:underline">
                {t('articles.related.viewMore')}
                <ArrowRight className="ml-1 h-3 w-3" />
              </div>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 