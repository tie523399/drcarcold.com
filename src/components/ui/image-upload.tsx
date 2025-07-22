'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  Move,
  Eye
} from 'lucide-react'

interface UploadedImage {
  original: string
  filename: string
  url: string
  thumbnail: string
  size: number
  type: string
}

interface ImageUploadProps {
  uploadType?: 'products' | 'categories' | 'news' | 'banners'
  maxFiles?: number
  onUpload?: (images: UploadedImage[]) => void
  onRemove?: (index: number) => void
  initialImages?: UploadedImage[]
  disabled?: boolean
}

export default function ImageUpload({
  uploadType = 'products',
  maxFiles = 10,
  onUpload,
  onRemove,
  initialImages = [],
  disabled = false
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

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
    if (disabled) return

    // 檢查檔案數量限制
    if (images.length + files.length > maxFiles) {
      setErrors([`最多只能上傳 ${maxFiles} 張圖片`])
      return
    }

    setIsUploading(true)
    setErrors([])

    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const newImages = [...images, ...result.images]
        setImages(newImages)
        onUpload?.(newImages)
        
        if (result.errors) {
          setErrors(result.errors)
        }
      } else {
        setErrors([result.error || '上傳失敗'])
      }
    } catch (error) {
      console.error('上傳錯誤:', error)
      setErrors(['上傳時發生錯誤'])
    } finally {
      setIsUploading(false)
    }
  }, [disabled, maxFiles, onUpload, images.length])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const removeImage = (index: number) => {
    if (disabled) return
    
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onRemove?.(index)
    onUpload?.(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (disabled) return
    
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    setImages(newImages)
    onUpload?.(newImages)
  }

  const openFileDialog = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
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
          accept="image/*"
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
              {isUploading ? '正在上傳...' : '點擊或拖拽上傳圖片'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              支援 JPG、PNG、WebP 格式，最大 5MB
            </p>
            <p className="text-sm text-gray-500">
              已上傳 {images.length} / {maxFiles} 張
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
        </div>
      )}

      {/* 圖片預覽 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={image.filename} className="group relative">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={image.thumbnail}
                    alt={image.original}
                    fill
                    className="object-cover rounded-md"
                  />
                  
                  {/* 操作按鈕 */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => window.open(image.url, '_blank')}
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
                            onClick={() => moveImage(index, index - 1)}
                          >
                            <Move className="w-4 h-4" />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 圖片資訊 */}
                <div className="mt-2 text-xs text-gray-500">
                  <p className="truncate">{image.original}</p>
                  <p>{(image.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 