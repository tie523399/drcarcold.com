'use client'

import { useState, useEffect, useCallback } from 'react'
import NextImage from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CarouselImage {
  id: string
  title: string
  description?: string
  image: string
  thumbnail?: string
  link?: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoPlay?: boolean
  interval?: number
  showIndicators?: boolean
  showControls?: boolean
  height?: string
  className?: string
}

export default function ImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
  showIndicators = true,
  showControls = true,
  height = 'h-96',
  className = ''
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // 自動播放功能
  useEffect(() => {
    if (!autoPlay || images.length <= 1 || isHovered) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, images.length, isHovered])

  // 上一張
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  // 下一張
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  // 跳轉到指定圖片
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // 處理點擊事件
  const handleImageClick = (image: CarouselImage) => {
    if (image.link) {
      window.open(image.link, '_blank')
    }
  }

  // 鍵盤事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        goToPrevious()
      } else if (event.key === 'ArrowRight') {
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrevious, goToNext])

  if (images.length === 0) {
    return (
      <div className={`${height} bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🖼️</div>
          <p>暫無圖片</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative ${height} overflow-hidden rounded-lg bg-gray-900 group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 圖片容器 */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="w-full h-full flex-shrink-0 relative cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            {/* 背景圖片 */}
            <NextImage
              src={image.image.startsWith('/') ? image.image : `/${image.image}`}
              alt={image.title}
              fill
              className="object-cover"
            />
            
            {/* 漸層遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30"></div>
            
            {/* 內容文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fadeInUp">
                  {image.title}
                </h2>
                {image.description && (
                  <p className="text-lg md:text-xl opacity-90 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    {image.description}
                  </p>
                )}
                {image.link && (
                  <div className="mt-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                    <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                      了解更多
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 左右控制按鈕 */}
      {showControls && images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
            aria-label="前一張圖片"
            title="前一張圖片"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
            aria-label="下一張圖片"
            title="下一張圖片"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* 指示器 */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}

      {/* 進度條 */}
      {autoPlay && images.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ 
              width: `${((Date.now() % interval) / interval) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
} 