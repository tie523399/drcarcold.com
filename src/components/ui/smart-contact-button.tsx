'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Phone, Mail } from 'lucide-react'

interface SmartContactButtonProps {
  productName?: string
  className?: string
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'success' | 'warning' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}

export function SmartContactButton({ 
  productName = '',
  className = '',
  variant = 'premium',
  size = 'md',
  children
}: SmartContactButtonProps) {
  const [isMobile, setIsMobile] = useState(false)
  
  // 聯絡資訊 - 根據系統中的記錄
  const PHONE_NUMBER = '04-26301915'
  const EMAIL = 'hongshun.TW@gmail.com'
  
  useEffect(() => {
    // 檢測是否為行動裝置
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleContact = () => {
    if (isMobile) {
      // 手機端：直接撥號
      window.location.href = `tel:${PHONE_NUMBER}`
    } else {
      // 電腦端：發送郵件
      const subject = productName 
        ? `詢問商品：${productName}` 
        : '商品詢價'
      const body = productName
        ? `您好，我想詢問關於「${productName}」的相關資訊，請與我聯絡。\n\n謝謝！`
        : '您好，我想詢問商品相關資訊，請與我聯絡。\n\n謝謝！'
      
      const mailtoUrl = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.location.href = mailtoUrl
    }
  }

  return (
    <Button 
      onClick={handleContact}
      variant={variant}
      size={size}
      className={className}
    >
      {isMobile ? (
        <Phone className="h-4 w-4 mr-2" />
      ) : (
        <Mail className="h-4 w-4 mr-2" />
      )}
      {children || (isMobile ? '立即來電' : '聯絡我們')}
    </Button>
  )
} 