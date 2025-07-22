'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Plus, Eye, EyeOff, Image as ImageIcon, Video, FileVideo, Play } from 'lucide-react'

interface Banner {
  id: string
  title: string
  description?: string
  image: string
  thumbnail?: string
  link?: string
  position: string
  order: number
  isActive: boolean
  mediaType?: string
  createdAt: string
  updatedAt: string
}

export default function BannersPage() {
  const router = useRouter()
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    bannerId: string | null
    bannerTitle: string
  }>({
    open: false,
    bannerId: null,
    bannerTitle: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // 載入橫幅資料
  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners')
      const data = await response.json()
      setBanners(data)
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.bannerId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/banners/${deleteDialog.bannerId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBanners(banners.filter(b => b.id !== deleteDialog.bannerId))
        setDeleteDialog({ open: false, bannerId: null, bannerTitle: '' })
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      alert('刪除時發生錯誤')
    } finally {
      setIsDeleting(false)
    }
  }

  const getPositionLabel = (position: string) => {
    const labels: { [key: string]: string } = {
      homepage: '首頁',
      products: '產品頁',
      about: '關於我們'
    }
    return labels[position] || position
  }

  const getMediaTypeIcon = (mediaType: string = 'image') => {
    switch (mediaType) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />
      case 'gif':
        return <FileVideo className="w-4 h-4 text-purple-500" />
      default:
        return <ImageIcon className="w-4 h-4 text-green-500" />
    }
  }

  const getMediaTypeBadge = (mediaType: string = 'image') => {
    const types = {
      video: { label: '影片', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      gif: { label: 'GIF', variant: 'secondary' as const, color: 'bg-purple-100 text-purple-800' },
      image: { label: '圖片', variant: 'outline' as const, color: 'bg-green-100 text-green-800' }
    }
    
    const type = types[mediaType as keyof typeof types] || types.image
    return (
      <Badge variant={type.variant} className={type.color}>
        {getMediaTypeIcon(mediaType)}
        <span className="ml-1">{type.label}</span>
      </Badge>
    )
  }

  const renderMediaPreview = (banner: Banner) => {
    const imageUrl = banner.thumbnail || banner.image
    
    if (banner.mediaType === 'video') {
      return (
        <div className="relative w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center group">
          <video
            src={banner.image}
            className="w-full h-full object-cover rounded-md"
            muted
            loop
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          />
          <Play className="absolute top-1 right-1 w-4 h-4 text-white bg-black/50 rounded-full p-0.5" />
        </div>
      )
    }
    
    return (
      <Image
        src={imageUrl}
        alt={banner.title}
        width={64}
        height={64}
        className="object-cover rounded-md"
        unoptimized={banner.mediaType === 'gif'}
      />
    )
  }

  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">橫幅管理</h1>
          <p className="text-gray-600 mt-2">管理網站橫幅圖片、GIF 和影片</p>
        </div>
        <div className="flex gap-2">
          <Link href="/test-upload">
            <Button variant="outline">
              測試上傳
            </Button>
          </Link>
        <Link href="/admin/banners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增橫幅
          </Button>
        </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>橫幅列表</CardTitle>
          <CardDescription>
            目前共有 {banners.length} 個橫幅，支援圖片、GIF 動畫和影片格式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>預覽</TableHead>
                <TableHead>標題</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex items-center justify-center w-16 h-16">
                      {banner.image ? (
                        renderMediaPreview(banner)
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium truncate max-w-xs">{banner.title}</div>
                      {banner.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {banner.description}
                        </div>
                      )}
                      {banner.link && (
                        <div className="text-xs text-blue-600 truncate max-w-xs">
                          連結: {banner.link}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getMediaTypeBadge(banner.mediaType)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {getPositionLabel(banner.position)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      #{banner.order}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={banner.isActive ? 'default' : 'secondary'}>
                      {banner.isActive ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          顯示
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          隱藏
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(banner.createdAt).toLocaleDateString('zh-TW')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/banners/${banner.id}/edit`}>
                        <Button variant="outline" size="sm" title="編輯橫幅">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="刪除橫幅"
                        onClick={() => setDeleteDialog({
                          open: true,
                          bannerId: banner.id,
                          bannerTitle: banner.title,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {banners.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">尚無橫幅資料</p>
              <p className="text-sm text-gray-500 mb-4">
                開始建立您的第一個橫幅，支援圖片、GIF 動畫和影片
              </p>
              <Link href="/admin/banners/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個橫幅
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除橫幅"
        description={`您確定要刪除橫幅「${deleteDialog.bannerTitle}」嗎？此操作無法復原，相關的媒體檔案也會一併移除。`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />
    </div>
  )
} 