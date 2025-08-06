'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation, Phone, Clock, Mail, ExternalLink } from 'lucide-react'
import { SEO_CONFIG } from '@/lib/seo-config'

interface GoogleMapProps {
  className?: string
  showInfo?: boolean
  height?: string
  zoom?: number
}

export function GoogleMap({ 
  className = '', 
  showInfo = true, 
  height = '400px',
  zoom = 16 
}: GoogleMapProps) {
  const [isLoading, setIsLoading] = useState(true)
  const company = SEO_CONFIG.COMPANY

  // Google Maps URLs
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3647.123456789!2d${company.coordinates.lng}!3d${company.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z6LuK5YaL5Y2a5aOr!5e0!3m2!1szh-TW!2stw!4v1234567890123!5m2!1szh-TW!2stw&zoom=${zoom}`
  
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(company.address)}`
  
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.name + ' ' + company.address)}`

  const handleMapLoad = () => {
    setIsLoading(false)
  }

  const openDirections = () => {
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  const openInGoogleMaps = () => {
    window.open(mapSearchUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className={`google-map-container ${className}`}>
      {showInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              聯絡資訊與交通位置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 聯絡資訊 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">地址</p>
                    <p className="text-sm text-gray-600">{company.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">聯絡電話</p>
                    <p className="text-sm text-gray-600">
                      電話：<a href={`tel:${company.phone}`} className="text-blue-600 hover:underline">{company.phone}</a>
                    </p>
                    <p className="text-sm text-gray-600">
                      手機：<a href={`tel:${company.mobile}`} className="text-blue-600 hover:underline">{company.mobile}</a>
                    </p>
                    <p className="text-sm text-gray-600">傳真：{company.fax}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">電子信箱</p>
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${company.email}`} className="text-blue-600 hover:underline">
                        {company.email}
                      </a>
                    </p>
                    <p className="text-sm text-gray-600">LINE ID：{company.lineId}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">營業時間</p>
                    <p className="text-sm text-gray-600">{company.hours}</p>
                  </div>
                </div>
              </div>

              {/* 交通指引 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">交通指引</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📍 位於台中市龍井區，鄰近台中港與沙鹿</p>
                  <p>🚗 國道三號龍井交流道約5分鐘車程</p>
                  <p>🚌 可搭乘台中客運至龍井站步行約10分鐘</p>
                  <p>🅿️ 門口備有停車位，方便客戶洽談</p>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={openDirections}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    導航到此
                  </Button>
                  
                  <Button 
                    onClick={openInGoogleMaps}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    在Google地圖中開啟
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Google Maps Embed */}
      <Card>
        <CardContent className="p-0">
          <div className="relative" style={{ height }}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">載入地圖中...</p>
                </div>
              </div>
            )}
            
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={handleMapLoad}
              className="rounded-lg"
              title={`${company.name} 地圖位置`}
            />
          </div>
          
          {/* 地圖底部資訊 */}
          <div className="p-4 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{company.name}</p>
                <p className="text-sm text-gray-600">{company.address}</p>
              </div>
              <Button 
                onClick={openDirections}
                size="sm"
                className="shrink-0"
              >
                <Navigation className="h-3 w-3 mr-1" />
                導航
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO結構化數據 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": company.name,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": company.address,
              "addressLocality": company.location,
              "addressCountry": "TW"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": company.coordinates.lat,
              "longitude": company.coordinates.lng
            },
            "telephone": company.phone,
            "email": company.email,
            "openingHours": "Mo-Fr 09:30-17:30",
            "url": "https://drcarcold.com"
          })
        }}
      />
    </div>
  )
}

// 簡化版地圖組件（用於頁腳或側邊欄）
export function CompactGoogleMap({ className = '' }: { className?: string }) {
  return (
    <GoogleMap 
      className={className}
      showInfo={false}
      height="250px"
      zoom={15}
    />
  )
}