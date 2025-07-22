import React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className, size = 'md', showText = false }: LogoProps) {
  const sizes = {
    sm: { image: 'h-10 w-10', container: 'h-10' },
    md: { image: 'h-12 w-12', container: 'h-12' },
    lg: { image: 'h-16 w-16', container: 'h-16' },
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizes[size].image)}>
              <Image
        src="/images/logo.png"
        alt="車冷博士"
        fill
        sizes="(max-width: 768px) 100px, 150px"
        className="object-contain"
        priority
      />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-gray-900', textSizes[size])}>
            車冷博士
          </span>
        </div>
      )}
    </div>
  )
} 