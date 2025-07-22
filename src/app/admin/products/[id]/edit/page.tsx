'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUpload from '@/components/ui/image-upload'
import { ArrowLeft, Save } from 'lucide-react'
import type { z } from 'zod'

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  // 獲取類別列表
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error)
  }, [])

  // 獲取產品資料
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        // 處理 JSON 字串格式的資料
        const images = data.images ? JSON.parse(data.images) : []
        const formData = {
          ...data,
          images: images,
          features: data.features ? JSON.parse(data.features) : [],
          specifications: data.specifications ? JSON.parse(data.specifications) : {},
        }
        
        // 處理圖片數據 - 將 URL 轉換為 ImageUpload 組件需要的格式
        const imageObjects = images.map((url: string, index: number) => ({
          original: `image_${index}.jpg`,
          filename: `image_${index}.jpg`,
          url: url,
          thumbnail: url,
          size: 0,
          type: 'image/jpeg'
        }))
        
        setUploadedImages(imageObjects)
        reset(formData)
      })
      .catch(console.error)
  }, [productId, reset])

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    
    try {
      // 處理圖片數據
      const productData = {
        ...data,
        images: uploadedImages.map(img => img.url)
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('更新產品失敗')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error updating product:', error)
      alert('更新產品時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/products">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回產品列表
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">編輯產品</h1>
        <p className="text-gray-600 mt-2">修改產品資訊</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>產品資訊</CardTitle>
            <CardDescription>請填寫產品的基本資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 產品名稱 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                產品名稱 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('name')}
                placeholder="請輸入產品名稱"
                error={!!errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* 產品類別 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                產品類別 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('categoryId')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">請選擇類別</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            {/* 產品描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                產品描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入產品描述"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* 產品圖片 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                產品圖片
              </label>
              <ImageUpload
                uploadType="products"
                maxFiles={8}
                onUpload={setUploadedImages}
                initialImages={uploadedImages}
              />
            </div>

            {/* 價格 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">價格</label>
                <Input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  placeholder="請輸入價格"
                  error={!!errors.price}
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {/* 庫存 */}
              <div>
                <label className="block text-sm font-medium mb-2">庫存數量</label>
                <Input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  placeholder="請輸入庫存數量"
                  error={!!errors.stock}
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* 狀態 */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">上架狀態</span>
              </label>
            </div>

            {/* SEO 設定 */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">SEO 設定</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">SEO 標題</label>
                  <Input
                    {...register('seoTitle')}
                    placeholder="留空將使用產品名稱"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">SEO 描述</label>
                  <textarea
                    {...register('seoDescription')}
                    rows={3}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="留空將使用產品描述"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/admin/products">
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