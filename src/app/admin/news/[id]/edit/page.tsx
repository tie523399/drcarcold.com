'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save } from 'lucide-react'

interface NewsFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  isPublished: boolean
  publishedAt?: string
  scheduledAt?: string
  coverImage?: string
  tags: string
}

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: '',
    isPublished: false,
    tags: ''
  })

  // 載入新聞資料
  useEffect(() => {
    if (params.id) {
      fetchNews()
    }
  }, [params.id])

  const fetchNews = async () => {
    try {
      const response = await fetch(`/api/news/${params.id}`)
      if (response.ok) {
        const news = await response.json()
        setFormData({
          title: news.title || '',
          slug: news.slug || '',
          excerpt: news.excerpt || '',
          content: news.content || '',
          author: news.author || '',
          isPublished: news.isPublished || false,
          publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : '',
          scheduledAt: news.scheduledAt ? new Date(news.scheduledAt).toISOString().slice(0, 16) : '',
          coverImage: news.coverImage || '',
          tags: news.tags ? JSON.parse(news.tags).join(', ') : ''
        })
      } else {
        console.error('無法載入新聞資料')
        router.push('/admin/news')
      }
    } catch (error) {
      console.error('載入新聞時發生錯誤:', error)
    } finally {
      setIsPageLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // 處理標籤
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      const newsData = {
        ...formData,
        tags: JSON.stringify(tagsArray),
        publishedAt: formData.publishedAt || null,
        scheduledAt: formData.scheduledAt || null
      }

      const response = await fetch(`/api/news/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      })

      if (response.ok) {
        router.push('/admin/news')
      } else {
        const errorData = await response.json()
        console.error('更新失敗:', errorData.error)
        alert('更新失敗: ' + errorData.error)
      }
    } catch (error) {
      console.error('更新新聞時發生錯誤:', error)
      alert('更新時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  if (isPageLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/news">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回新聞列表
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">編輯新聞</h1>
        <p className="text-gray-600 mt-2">
          修改新聞內容、發布狀態和相關資訊
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
            <CardDescription>
              設定新聞的標題、網址和基本內容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  標題 *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="輸入新聞標題..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  網址代稱 (Slug)
                </label>
                <Input
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="news-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  用於生成新聞網址，會自動根據標題生成
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                摘要
              </label>
              <Textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="輸入新聞摘要..."
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                用於首頁和列表頁面的簡短描述
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                內容 *
              </label>
              <Textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="輸入新聞內容..."
                rows={12}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>發布設定</CardTitle>
            <CardDescription>
              設定新聞的發布狀態和時間
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  作者
                </label>
                <Input
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  placeholder="作者姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  標籤
                </label>
                <Input
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="標籤1, 標籤2, 標籤3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  多個標籤請用逗號分隔
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="isPublished" className="text-sm font-medium">
                立即發布
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  發布時間
                </label>
                <Input
                  type="datetime-local"
                  name="publishedAt"
                  value={formData.publishedAt}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  排程發布時間
                </label>
                <Input
                  type="datetime-local"
                  name="scheduledAt"
                  value={formData.scheduledAt}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                封面圖片網址
              </label>
              <Input
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            variant="premium"
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? '更新中...' : '更新新聞'}
          </Button>
          
          <Link href="/admin/news" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
} 