'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video,
  FileVideo,
  Loader2, 
  AlertCircle,
  Move,
  Eye,
  Play
} from 'lucide-react'

interface UploadedMedia {
  original: string
  filename: string
  url: string
  thumbnail: string
  size: number
  type: string
  mediaType: 'image' | 'video' | 'gif'
}

interface MediaUploadProps {
  uploadType?: 'products' | 'categories' | 'news' | 'banners'
  maxFiles?: number
  onUpload?: (media: UploadedMedia[]) => void
  onRemove?: (index: number) => void
  initialMedia?: UploadedMedia[]
  disabled?: boolean
  acceptVideo?: boolean
  acceptGif?: boolean
}

export default function MediaUpload({
  uploadType = 'products',
  maxFiles = 10,
  onUpload,
  onRemove,
  initialMedia = [],
  disabled = false,
  acceptVideo = true,
  acceptGif = true
}: MediaUploadProps) {
  const [media, setMedia] = useState<UploadedMedia[]>(initialMedia)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // 建立接受的檔案類型
  const getAcceptTypes = () => {
    const types = ['image/jpeg', 'image/png', 'image/webp']
    if (acceptGif) types.push('image/gif')
    if (acceptVideo) types.push('video/mp4', 'video/webm', 'video/ogg')
    return types.join(',')
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [disabled])

  const handleFiles = useCallback(async (files: File[]) => {
    if (disabled || isUploading) return
    
    const remainingSlots = maxFiles - media.length
    if (remainingSlots <= 0) {
      setErrors(['已達到最大檔案數量限制'])
      return
    }

    const filesToUpload = files.slice(0, remainingSlots)
    
    setIsUploading(true)
    setErrors([])

    try {
      console.log('MediaUpload: 開始上傳檔案', filesToUpload.map(f => f.name))
      
      const formData = new FormData()
      filesToUpload.forEach(file => {
        formData.append('files', file)
      })
      formData.append('type', uploadType)
      formData.append('acceptVideo', String(acceptVideo))
      formData.append('acceptGif', String(acceptGif))

      console.log('MediaUpload: 發送上傳請求到 /api/upload')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      console.log('MediaUpload: 收到回應', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('MediaUpload: HTTP 錯誤', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log('MediaUpload: 解析結果', result)

      if (result.success) {
        console.log('MediaUpload: API返回成功', {
          resultMedia: result.media,
          resultImages: result.images,
          currentMedia: media
        })
        
        // 兼容两种数据格式
        const uploadedFiles = result.media || result.images || []
        console.log('MediaUpload: 处理的文件', uploadedFiles)
        
        const newMedia = [...media, ...uploadedFiles]
        console.log('MediaUpload: 新的媒体列表', newMedia)
        
        setMedia(newMedia)
        onUpload?.(newMedia)
        
        if (result.errors && result.errors.length > 0) {
          setErrors(result.errors)
          console.warn('MediaUpload: 部分上传失败', result.errors)
        }
      } else {
        console.error('MediaUpload: 上傳失敗', result)
        setErrors([result.error || '上傳失敗'])
      }
    } catch (error) {
      console.error('MediaUpload: 上傳錯誤', error)
      setErrors([`上傳時發生錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`])
    } finally {
      setIsUploading(false)
    }
  }, [disabled, maxFiles, onUpload, media, uploadType, acceptVideo, acceptGif, isUploading])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const removeMedia = (index: number) => {
    if (disabled) return
    
    const newMedia = media.filter((_, i) => i !== index)
    setMedia(newMedia)
    onRemove?.(index)
    onUpload?.(newMedia)
  }

  const moveMedia = (fromIndex: number, toIndex: number) => {
    if (disabled) return
    
    const newMedia = [...media]
    const [movedMedia] = newMedia.splice(fromIndex, 1)
    newMedia.splice(toIndex, 0, movedMedia)
    setMedia(newMedia)
    onUpload?.(newMedia)
  }

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  // 取得媒體類型圖標
  const getMediaIcon = (mediaType: string) => {
    if (mediaType === 'video') return <Video className="w-8 h-8 text-blue-500" />
    if (mediaType === 'gif') return <FileVideo className="w-8 h-8 text-purple-500" />
    return <ImageIcon className="w-8 h-8 text-green-500" />
  }

  return (
    <div className="space-y-4">
      {/* 上傳區域 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={getAcceptTypes()}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center space-y-4">
          {isUploading ? (
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {isUploading ? '正在上傳...' : '點擊或拖拽上傳檔案'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              支援格式：
              {['圖片 (JPG、PNG、WebP)', acceptGif && 'GIF', acceptVideo && '影片 (MP4、WebM)']
                .filter(Boolean)
                .join('、')}
            </p>
            <p className="text-sm text-gray-500">
              圖片最大 5MB，影片最大 50MB | 已上傳 {media.length} / {maxFiles} 個
            </p>
          </div>
        </div>
      </div>

      {/* 錯誤訊息 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <h4 className="text-sm font-medium text-red-800">上傳錯誤</h4>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <div className="mt-3 text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>🔍 调试提示:</strong> 请按F12打开浏览器控制台查看详细日志
          </div>
        </div>
      )}

      {/* 调试信息面板 */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border">
        <div className="font-medium mb-1">🛠️ 调试信息:</div>
        <div>环境: {process.env.NODE_ENV || 'development'}</div>
        <div>接受GIF: {String(acceptGif)}</div>
        <div>接受视频: {String(acceptVideo)}</div>
        <div>支持格式: {getAcceptTypes()}</div>
        <div>当前文件数: {media.length}/{maxFiles}</div>
        <div>上传中: {String(isUploading)}</div>
      </div>

      {/* 媒體預覽 */}
      {media.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item, index) => (
            <Card key={item.filename} className="group relative">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  {item.mediaType === 'video' ? (
                    <div className="relative w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                      <video
                        src={item.url}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                      <Play className="absolute top-2 right-2 w-6 h-6 text-white bg-black/50 rounded-full p-1" />
                    </div>
                  ) : (
                    <Image
                      src={item.thumbnail || item.url}
                      alt={item.original}
                      fill
                      className="object-cover rounded-md"
                      unoptimized={item.mediaType === 'gif'}
                    />
                  )}
                  
                  {/* 操作按鈕 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(item.url, '_blank')
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {!disabled && (
                      <>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveMedia(index, index - 1)
                            }}
                          >
                            <Move className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeMedia(index)
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 檔案資訊 */}
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {getMediaIcon(item.mediaType)}
                    <p className="truncate flex-1">{item.original}</p>
                  </div>
                  <p>{(item.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 