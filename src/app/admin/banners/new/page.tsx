'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MediaUpload from '@/components/ui/media-upload'
import { ArrowLeft, Save } from 'lucide-react'

interface BannerFormData {
  title: string
  description?: string
  link?: string
  position: string
  order: number
  isActive: boolean
}

interface UploadedMedia {
  original: string
  filename: string
  url: string
  thumbnail: string
  size: number
  type: string
  mediaType: 'image' | 'video' | 'gif'
}

export default function NewBannerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BannerFormData>({
    defaultValues: {
      position: 'homepage',
      order: 0,
      isActive: true,
    },
  })

  const handleMediaUpload = (media: UploadedMedia[]) => {
    setUploadedMedia(media)
  }

  const onSubmit = async (data: BannerFormData) => {
    if (uploadedMedia.length === 0) {
      alert('請上傳至少一個媒體檔案')
      return
    }

    setIsLoading(true)
    
    try {
      const firstMedia = uploadedMedia[0]
      const bannerData = {
        ...data,
        image: firstMedia.url,
        thumbnail: firstMedia.thumbnail,
        mediaType: firstMedia.mediaType,
      }

      const response = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData),
      })

      if (!response.ok) {
        throw new Error('創建橫幅失敗')
      }

      router.push('/admin/banners')
      router.refresh()
    } catch (error) {
      console.error('Error creating banner:', error)
      alert('創建橫幅時發生錯誤')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/banners">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回橫幅列表
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">新增橫幅</h1>
        <p className="text-gray-600 mt-2">上傳圖片並設定橫幅資訊</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>橫幅資訊</CardTitle>
            <CardDescription>請填寫橫幅的基本資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 橫幅標題 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                橫幅標題 <span className="text-red-500">*</span>
              </label>
              <Input
                {...register('title', { required: '請輸入橫幅標題' })}
                placeholder="請輸入橫幅標題"
                error={!!errors.title}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 橫幅描述 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                橫幅描述
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="請輸入橫幅描述（可選）"
              />
            </div>

            {/* 橫幅圖片 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                橫幅媒體 <span className="text-red-500">*</span>
              </label>
              <MediaUpload
                uploadType="banners"
                maxFiles={1}
                onUpload={handleMediaUpload}
                initialMedia={uploadedMedia}
                acceptVideo={true}
                acceptGif={true}
              />
              <p className="mt-1 text-sm text-gray-500">
                支援圖片（JPG、PNG、WebP）、GIF 動畫和影片（MP4、WebM）
              </p>
            </div>

            {/* 連結 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                連結網址
              </label>
              <Input
                {...register('link')}
                type="url"
                placeholder="https://example.com（可選）"
              />
              <p className="mt-1 text-sm text-gray-500">
                點擊橫幅時跳轉的網址
              </p>
            </div>

            {/* 位置和順序 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  顯示位置
                </label>
                <select
                  {...register('position')}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="homepage">首頁</option>
                  <option value="products">產品頁</option>
                  <option value="about">關於我們</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  排序順序
                </label>
                <Input
                  {...register('order', { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-sm text-gray-500">
                  數字越小越前面
                </p>
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
                <span className="text-sm font-medium">立即顯示</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* 操作按鈕 */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Link href="/admin/banners">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            儲存橫幅
          </Button>
        </div>
      </form>
    </div>
  )
} 