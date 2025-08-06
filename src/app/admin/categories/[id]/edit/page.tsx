'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MediaUpload from '@/components/ui/media-upload'
import { ArrowLeft, Save } from 'lucide-react'

interface CategoryFormData {
  name: string
  slug: string
  description?: string
  image?: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)
  const [uploadedImages, setUploadedImages] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>()

  // 載入分類資料
  useEffect(() => {
    fetchCategory()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${categoryId}`)
      if (!response.ok) throw new Error('獲取分類失敗')
      
      const category = await response.json()
      
      // 設定表單資料
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        seoTitle: category.seoTitle || '',
        seoDescription: category.seoDescription || '',
        seoKeywords: category.seoKeywords || '',
      })
      
      // 設定圖片
      if (category.image) {
        setUploadedImages([{
          url: category.image,
          thumbnail: category.image,
          filename: 'category-image',
          size: 0,
          type: 'image/jpeg'
        }])
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      alert('載入分類資料失敗')
    } finally {
      setIsLoadingCategory(false)
    }
  }

  // 自動產生 slug
  const nameValue = watch('name')
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsLoading(true)
    
    try {
      const categoryData = {
        ...data,
        image: uploadedImages[0]?.url || null,
      }

      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '更新分類失敗')
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (error) {
      console.error('Error updating category:', error)
      alert(error instanceof Error ? error.message : '更新分類時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingCategory) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/categories">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回分類列表
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">編輯分類</h1>
        <p className="text-gray-600 mt-2">修改產品分類資訊</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* 基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
              <CardDescription>修改分類的基本資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  分類名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name', { required: '請輸入分類名稱' })}
                  placeholder="例如：汽車冷媒"
                  error={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  網址代稱 (Slug) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    {...register('slug', { required: '請輸入網址代稱' })}
                    placeholder="例如：automotive-refrigerant"
                    error={!!errors.slug}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setValue('slug', generateSlug(nameValue || ''))}
                  >
                    自動產生
                  </Button>
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  用於網址的英文代稱，例如：/products/automotive-refrigerant
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">分類描述</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="簡短描述這個分類..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">分類圖片</label>
                <MediaUpload
                  uploadType="categories"
                  maxFiles={1}
                  onUpload={setUploadedImages}
                  initialMedia={uploadedImages}
                  acceptVideo={false}
                  acceptGif={false}
                />
                <p className="mt-1 text-sm text-gray-500">
                  建議尺寸：400x400 像素，用於分類列表顯示
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO 設定 */}
          <Card>
            <CardHeader>
              <CardTitle>SEO 優化設定</CardTitle>
              <CardDescription>設定搜尋引擎優化相關內容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">SEO 標題</label>
                <Input
                  {...register('seoTitle')}
                  placeholder="留空將使用分類名稱"
                />
                <p className="mt-1 text-sm text-gray-500">
                  在搜尋結果中顯示的標題（建議 50-60 個字元）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SEO 描述</label>
                <textarea
                  {...register('seoDescription')}
                  rows={3}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="留空將使用分類描述"
                />
                <p className="mt-1 text-sm text-gray-500">
                  在搜尋結果中顯示的描述（建議 120-160 個字元）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SEO 關鍵字</label>
                <Input
                  {...register('seoKeywords')}
                  placeholder="汽車冷媒, R134a, 冷媒批發, 冷凍油"
                />
                <p className="mt-1 text-sm text-gray-500">
                  相關的搜尋關鍵字，用逗號分隔
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/admin/categories">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            儲存變更
          </Button>
        </div>
      </form>
    </div>
  )
}