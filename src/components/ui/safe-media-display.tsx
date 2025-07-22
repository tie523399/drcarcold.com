'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SafeMediaDisplayProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  mediaType?: 'image' | 'video' | 'gif'
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  fill?: boolean
  priority?: boolean
}

export default function SafeMediaDisplay({
  src,
  alt,
  width,
  height,
  className = '',
  mediaType = 'image',
  autoPlay = false,
  loop = false,
  muted = true,
  fill = false,
  priority = false
}: SafeMediaDisplayProps) {
  const [hasError, setHasError] = useState(false)

  // 如果出錯，顯示預設圖片
  if (hasError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">無法載入媒體</span>
      </div>
    )
  }

  // 自動判斷媒體類型（如果沒有指定）
  if (!mediaType) {
    if (src.includes('.mp4') || src.includes('.webm') || src.includes('.ogg')) {
      mediaType = 'video'
    } else if (src.includes('.gif')) {
      mediaType = 'gif'
    } else {
      mediaType = 'image'
    }
  }

  // 顯示影片
  if (mediaType === 'video') {
    return (
      <video
        src={src}
        className={className}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        style={fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width, height }}
        onError={() => setHasError(true)}
      />
    )
  }

  // 顯示圖片
  const imageProps = fill
    ? {
        src,
        alt,
        fill: true,
        className,
        priority,
        unoptimized: mediaType === 'gif',
        onError: () => setHasError(true)
      }
    : {
        src,
        alt,
        width: width || 300,
        height: height || 200,
        className,
        priority,
        unoptimized: mediaType === 'gif',
        onError: () => setHasError(true)
      }

  return <Image {...imageProps} />
} 