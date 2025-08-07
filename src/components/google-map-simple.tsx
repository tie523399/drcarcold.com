'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Navigation, Phone, Mail, Clock } from 'lucide-react'

interface SimpleGoogleMapProps {
  className?: string
  showInfo?: boolean
  height?: string
}

export function SimpleGoogleMap({ 
  className = '', 
  showInfo = true, 
  height = '400px'
}: SimpleGoogleMapProps) {
  // 公司實際資訊
  const company = {
    name: '車冷博士 Dr. Car Cold',
    address: '台中市龍井區中和村海尾路278巷33弄8號',
    phone: '04-26301915',
    mobile: '0903-049150',
    fax: '04-26301510',
    email: 'hongshun.TW@gmail.com',
    lineId: '0903049150',
    hours: '週一至週五 09:30-17:30'
  }

  // Google Maps URLs - 使用實際地址
  const mapEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3647.123!2d120.5434!3d24.1947!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z6LuK5YaL5Y2a5aOr!5e0!3m2!1szh-TW!2stw!4v1234567890123!5m2!1szh-TW!2stw`
  
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(company.address)}`

  const handleNavigation = () => {
    window.open(directionsUrl, '_blank', 'noopener,noreferrer')
  }

  const handleCall = () => {
    window.location.href = `tel:${company.phone}`
  }

  const handleEmail = () => {
    window.location.href = `mailto:${company.email}`
  }

  return (
    <div className={`google-map-simple ${className}`}>
      {showInfo && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              聯絡資訊與交通位置
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* 聯絡資訊 */}
              <div className="space-y-4">
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
                      電話：<button onClick={handleCall} className="text-blue-600 hover:underline">{company.phone}</button>
                    </p>
                    <p className="text-sm text-gray-600">
                      手機：<button onClick={() => window.location.href = `tel:${company.mobile}`} className="text-blue-600 hover:underline">{company.mobile}</button>
                    </p>
                    <p className="text-sm text-gray-600">傳真：{company.fax}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">電子信箱</p>
                    <p className="text-sm text-gray-600">
                      <button onClick={handleEmail} className="text-blue-600 hover:underline">
                        {company.email}
                      </button>
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
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">交通指引</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📍 位於台中市龍井區，鄰近台中港與沙鹿</p>
                  <p>🚗 國道三號龍井交流道約5分鐘車程</p>
                  <p>🚌 可搭乘台中客運至龍井站步行約10分鐘</p>
                  <p>🅿️ 門口備有停車位，方便客戶洽談</p>
                </div>
                
                <Button 
                  onClick={handleNavigation}
                  className="w-full flex items-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  Google地圖導航
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 簡化的地圖顯示 */}
      <Card>
        <CardContent className="p-0">
          <div className="relative" style={{ height }}>
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
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
                onClick={handleNavigation}
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
    </div>
  )
}