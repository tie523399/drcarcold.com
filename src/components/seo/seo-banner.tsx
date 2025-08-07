'use client'

import { useLocale } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, MessageCircle, Star, Award, Truck, Shield } from 'lucide-react'
import { SEO_CONFIG, getSEOSlogan } from '@/lib/seo-config'

interface SEOBannerProps {
  type?: 'header' | 'footer' | 'floating' | 'page-top'
  variant?: 'full' | 'compact' | 'minimal'
  className?: string
}

export function SEOBanner({ 
  type = 'page-top', 
  variant = 'full',
  className = '' 
}: SEOBannerProps) {
  const locale = useLocale()
  const company = SEO_CONFIG.COMPANY

  // 根據類型選擇不同的標語
  const getSlogan = () => {
    switch (type) {
      case 'header':
        return getSEOSlogan('primary', locale)
      case 'footer':
        return getSEOSlogan('trust', locale)
      case 'floating':
        return getSEOSlogan('service', locale)
      default:
        return getSEOSlogan('primary', locale)
    }
  }

  const handleContact = (method: 'phone' | 'line') => {
    if (method === 'phone') {
      window.location.href = `tel:${company.phone}`
    } else {
      window.open(`https://line.me/ti/p/${company.lineId}`, '_blank')
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={`seo-banner-minimal ${className}`}>
        <p className="text-sm text-center text-gray-600 px-4">
          {getSEOSlogan('location', locale)}
        </p>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`seo-banner-compact bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">
              {getSEOSlogan('secondary', locale)}
            </p>
          </div>
          <Button 
            size="sm" 
            onClick={() => handleContact('phone')}
            className="shrink-0"
          >
            <Phone className="h-3 w-3 mr-1" />
            立即諮詢
          </Button>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <div className={`seo-banner-full bg-gradient-silver-dark text-white relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-silver-pattern opacity-10"></div>
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* 主要標語 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {getSlogan()}
          </h2>
          <p className="text-gray-300 text-lg">
            {getSEOSlogan('secondary', locale)}
          </p>
        </div>

        {/* 特色標籤 */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Star className="h-3 w-3 mr-1" />
            {locale === 'zh' ? '9年專業經驗' : '9 Years Experience'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Shield className="h-3 w-3 mr-1" />
            {locale === 'zh' ? '品質保證' : 'Quality Guaranteed'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Truck className="h-3 w-3 mr-1" />
            {locale === 'zh' ? '快速供貨' : 'Fast Delivery'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
            <Award className="h-3 w-3 mr-1" />
            {locale === 'zh' ? '技術諮詢' : 'Technical Support'}
          </Badge>
        </div>

        {/* 聯絡按鈕 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button 
            size="lg"
            variant="secondary"
            onClick={() => handleContact('phone')}
            className="bg-white text-gray-800 hover:bg-gray-100 font-medium"
          >
            <Phone className="h-4 w-4 mr-2" />
            立即來電：{company.phone}
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            onClick={() => handleContact('line')}
            className="border-white/30 text-white hover:bg-white/10"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            LINE諮詢：{company.lineId}
          </Button>
        </div>

        {/* 營業時間 */}
        <div className="text-center mt-4">
          <p className="text-gray-300 text-sm">
            🕒 營業時間：{company.hours} | 📍 {company.location}
          </p>
        </div>
      </div>
    </div>
  )
}

// 浮動SEO橫幅（用於頁面底部）
export function FloatingSEOBanner() {
  const locale = useLocale()
  const company = SEO_CONFIG.COMPANY

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-blue-600 text-white shadow-lg border-t-2 border-blue-500">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="text-sm font-medium">
              {locale === 'zh' ? '專業汽車冷媒諮詢' : 'Professional Refrigerant Consultation'}
            </span>
            <Badge variant="secondary" className="bg-yellow-500 text-yellow-900 text-xs">
              {locale === 'zh' ? '免費' : 'FREE'}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="secondary"
              onClick={() => window.location.href = `tel:${company.phone}`}
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Phone className="h-3 w-3 mr-1" />
              {company.phone}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}