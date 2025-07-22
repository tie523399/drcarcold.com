'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { newsSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Calendar } from 'lucide-react'
import type { z } from 'zod'

type NewsFormData = z.infer<typeof newsSchema>

export default function NewNewsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      tags: [],
      isPublished: false,
    },
  })

  const isPublished = watch('isPublished')

  const onSubmit = async (data: NewsFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('創建文章失敗')
      }

      router.push('/admin/news')
      router.refresh()
    } catch (error) {
      console.error('Error creating news:', error)
      alert('創建文章時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/news">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回文章列表
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">撰寫新文章</h1>
        <p className="text-gray-600 mt-2">創建新的新聞文章</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>文章內容</CardTitle>
            <CardDescription>請填寫文章的詳細資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 標題 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                文章標題 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder="請輸入文章標題"
                error={!!errors.title}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 摘要 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                文章摘要 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('excerpt')}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入文章摘要 (最多 200 字)"
                maxLength={200}
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt.message}</p>
              )}
            </div>

            {/* 內容 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                文章內容 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('content')}
                rows={10}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入文章內容"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* 作者 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                作者 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('author')}
                placeholder="請輸入作者名稱"
                error={!!errors.author}
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
              )}
            </div>

            {/* 標籤 */}
            <div>
              <label className="block text-sm font-medium mb-2">標籤</label>
              <Input
                placeholder="輸入標籤並用逗號分隔 (例如: 新聞,技術,產品)"
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  register('tags').onChange({
                    target: { value: tags, name: 'tags' }
                  })
                }}
              />
            </div>

            {/* 發布設定 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">發布設定</h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('isPublished')}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium">立即發布</span>
                </label>

                {!isPublished && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Calendar className="inline-block mr-1 h-4 w-4" />
                      排程發布時間
                    </label>
                    <Input
                      type="datetime-local"
                      {...register('scheduledAt', { valueAsDate: true })}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* SEO 設定 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">SEO 設定</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO 標題</label>
                  <Input
                    {...register('seoTitle')}
                    placeholder="留空將使用文章標題"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO 描述</label>
                  <textarea
                    {...register('seoDescription')}
                    rows={3}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="留空將使用文章摘要"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/admin/news">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isPublished ? '發布文章' : '儲存草稿'}
          </Button>
        </div>
      </form>
    </div>
  )
} 