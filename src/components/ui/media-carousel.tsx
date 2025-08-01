'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaItem {
  id: string
  image: string
  thumbnail?: string
  title?: string
  description?: string
  link?: string
  mediaType: 'image' | 'gif' | 'video'
}

interface MediaCarouselProps {
  items: MediaItem[]
  autoPlay?: boolean
  showIndicators?: boolean
}

export function MediaCarousel({ 
  items, 
  autoPlay = true, 
  showIndicators = true 
}: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  if (!items || items.length === 0) {
    return null
  }

  const currentItem = items[currentIndex]

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // 智能檢測媒體類型
  const getMediaType = (item: MediaItem) => {
    if (item.mediaType) return item.mediaType
    
    const imagePath = item.image.toLowerCase()
    if (imagePath.includes('.mp4') || imagePath.includes('.webm') || imagePath.includes('.ogg')) {
      return 'video'
    } else if (imagePath.includes('.gif')) {
      return 'gif'
    }
    return 'image'
  }

  const mediaType = getMediaType(currentItem)

  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-gray-100">
      {/* 主要媒體顯示區域 */}
      <div className="relative aspect-video w-full">
        {mediaType === 'video' ? (
          <video
            key={currentItem.id}
            src={currentItem.image}
            autoPlay={isPlaying}
            loop
            muted
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('影片載入錯誤:', currentItem.image)
              // 可以在這裡設定錯誤處理邏輯
            }}
            onLoadStart={() => {
              console.log('開始載入影片:', currentItem.image)
            }}
            onCanPlay={() => {
              console.log('影片可以播放:', currentItem.image)
            }}
          />
        ) : (
          <Image
            src={currentItem.image}
            alt={currentItem.title || ''}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            unoptimized={mediaType === 'gif'}
            onError={(e) => {
              console.error('圖片載入錯誤:', currentItem.image)
            }}
          />
        )}

        {/* 導航按鈕 */}
        {items.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 w-8 h-8 p-0"
              onClick={goToPrevious}
              aria-label="前一個媒體"
              title="前一個媒體"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100 w-8 h-8 p-0"
              onClick={goToNext}
              aria-label="下一個媒體"
              title="下一個媒體"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* 播放/暫停按鈕（僅視頻） */}
        {mediaType === 'video' && (
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2 opacity-80 hover:opacity-100 w-8 h-8 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "暫停播放" : "開始播放"}
            title={isPlaying ? "暫停播放" : "開始播放"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        )}

        {/* 內容覆蓋層 */}
        {(currentItem.title || currentItem.description) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
            {currentItem.title && (
              <h3 className="text-lg font-semibold mb-1">{currentItem.title}</h3>
            )}
            {currentItem.description && (
              <p className="text-sm opacity-90">{currentItem.description}</p>
            )}
          </div>
        )}
      </div>

      {/* 指示器 */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaCarousel 