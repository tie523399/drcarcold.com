'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MediaUpload from '@/components/ui/media-upload'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  description: string
  image: string
  thumbnail?: string
  link: string
  position: string
  order: number
  isActive: boolean
  mediaType: 'image' | 'gif' | 'video'
}

export default function EditBannerPage() {
  const params = useParams()
  const router = useRouter()
  const bannerId = params.id as string

  const [banner, setBanner] = useState<Banner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    thumbnail: '',
    link: '',
    position: 'homepage',
    order: 1,
    isActive: true,
    mediaType: 'image' as 'image' | 'gif' | 'video'
  })

  // 載入橫幅資料
  useEffect(() => {
    const loadBanner = async () => {
      try {
        const response = await fetch(`/api/banners/${bannerId}`)
        if (!response.ok) {
          throw new Error('載入橫幅失敗')
        }
        const data = await response.json()
        setBanner(data)
        setFormData({
          title: data.title || '',
          description: data.description || '',
          image: data.image || '',
          thumbnail: data.thumbnail || '',
          link: data.link || '',
          position: data.position || 'homepage',
          order: data.order || 1,
          isActive: data.isActive !== undefined ? data.isActive : true,
          mediaType: data.mediaType || 'image'
        })
      } catch (error) {
        console.error('載入橫幅錯誤:', error)
        alert('載入橫幅失敗')
      } finally {
        setIsLoading(false)
      }
    }

    if (bannerId) {
      loadBanner()
    }
  }, [bannerId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMediaUpload = (media: any[]) => {
    if (media && media.length > 0) {
      const uploadedMedia = media[0]
      setFormData(prev => ({
        ...prev,
        image: uploadedMedia.url,
        thumbnail: uploadedMedia.thumbnail,
        mediaType: uploadedMedia.mediaType
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.image) {
      alert('請填寫標題和上傳媒體檔案')
      return
    }

    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/banners/${bannerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('更新橫幅失敗')
      }

      alert('橫幅更新成功！')
      router.push('/admin/banners')
    } catch (error) {
      console.error('更新橫幅錯誤:', error)
      alert('更新橫幅失敗')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>載入中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!banner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">橫幅不存在</h1>
          <Link href="/admin/banners">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回橫幅列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/banners">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">編輯橫幅</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：基本資訊 */}
          <Card>
            <CardHeader>
              <CardTitle>基本資訊</CardTitle>
              <CardDescription>設定橫幅的基本內容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">標題 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="請輸入橫幅標題"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="請輸入橫幅描述"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="link">連結</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">位置</Label>
                  <Select value={formData.position} onValueChange={(value) => handleInputChange('position', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">首頁</SelectItem>
                      <SelectItem value="products">產品頁</SelectItem>
                      <SelectItem value="news">新聞頁</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="order">排序</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">啟用橫幅</Label>
              </div>
            </CardContent>
          </Card>

          {/* 右側：媒體上傳 */}
          <Card>
            <CardHeader>
              <CardTitle>媒體檔案</CardTitle>
              <CardDescription>上傳橫幅的圖片、GIF 或影片</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaUpload
                uploadType="banners"
                maxFiles={1}
                onUpload={handleMediaUpload}
                initialMedia={formData.image ? [{
                  original: formData.image,
                  filename: formData.title || '橫幅圖片',
                  url: formData.image,
                  thumbnail: formData.thumbnail || formData.image,
                  size: 0,
                  type: formData.mediaType,
                  mediaType: formData.mediaType
                }] : []}
                acceptVideo={true}
                acceptGif={true}
              />
              
              {formData.image && (
                <div className="mt-4 text-sm text-gray-600">
                  <p>媒體類型: {formData.mediaType}</p>
                  <p className="break-all">檔案: {formData.image}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 操作按鈕 */}
        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/banners">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                更新橫幅
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 