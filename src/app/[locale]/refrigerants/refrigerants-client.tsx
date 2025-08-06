'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Snowflake, 
  ShoppingCart, 
  Phone, 
  Mail, 
  CheckCircle, 
  Thermometer,
  Leaf,
  Star
} from 'lucide-react'

export default function RefrigerantsClient({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-4 rounded-full">
                <Snowflake className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              汽車冷媒專業供應
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              原廠品質 • 專業供應 • 技術支援 • 全馬配送
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <CheckCircle className="h-4 w-4" />
                正品保證
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Phone className="h-4 w-4" />
                技術支援
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {/* R-134a */}
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                      R-134a 冷媒
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600">
                      最廣泛使用的汽車空調冷媒，性能穩定，兼容性佳
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">現貨供應</Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                      <Star className="h-3 w-3 mr-1" />
                      熱門
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <Thermometer className="h-4 w-4 mr-2" />
                    技術規格
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">化學分子式:</span>
                      <br />
                      <span className="font-mono font-medium">CH₂FCF₃</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">沸點:</span>
                      <br />
                      <span className="font-medium">-26.3°C</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">工作壓力:</span>
                      <br />
                      <span className="font-medium">6.2 bar (25°C)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">GWP值:</span>
                      <br />
                      <span className="font-medium">1,430</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">適用車型</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">汽車空調系統</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">小型商用車</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">客車空調</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">產品優勢</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      廣泛兼容性
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      成熟技術
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      維修簡便
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      價格實惠
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">包裝規格</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-slate-300">13.6kg 鋼瓶</Badge>
                    <Badge variant="outline" className="border-slate-300">1kg 小瓶裝</Badge>
                    <Badge variant="outline" className="border-slate-300">500g 補充罐</Badge>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.open('https://wa.me/60123456789?text=您好！我想詢問 R-134a 冷媒 的價格和供貨情況，請提供詳細報價。', '_blank')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    立即詢價
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/zh/contact'}
                    className="px-6"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    電話詢問
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* R-1234yf */}
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800 mb-2">
                      R-1234yf 冷媒
                    </CardTitle>
                    <CardDescription className="text-lg text-slate-600">
                      新世代環保冷媒，符合歐盟環保法規，未來主流
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">現貨供應</Badge>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <Leaf className="h-3 w-3 mr-1" />
                      環保
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                      <Star className="h-3 w-3 mr-1" />
                      熱門
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                    <Thermometer className="h-4 w-4 mr-2" />
                    技術規格
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">化學分子式:</span>
                      <br />
                      <span className="font-mono font-medium">CF₃CF=CH₂</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">沸點:</span>
                      <br />
                      <span className="font-medium">-29.4°C</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">工作壓力:</span>
                      <br />
                      <span className="font-medium">6.8 bar (25°C)</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded">
                      <span className="text-slate-500">GWP值:</span>
                      <br />
                      <span className="font-medium">4</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">適用車型</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">歐系新車</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">豪華車款</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">2017年後新車</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">產品優勢</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      符合環保法規
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      未來主流
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      性能媲美R-134a
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      政府支持
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-700 mb-3">包裝規格</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-slate-300">10kg 鋼瓶</Badge>
                    <Badge variant="outline" className="border-slate-300">1kg 專用瓶</Badge>
                    <Badge variant="outline" className="border-slate-300">250g 精裝罐</Badge>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.open('https://wa.me/60123456789?text=您好！我想詢問 R-1234yf 冷媒 的價格和供貨情況，請提供詳細報價。', '_blank')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    size="lg"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    立即詢價
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.href = '/zh/contact'}
                    className="px-6"
                    size="lg"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    電話詢問
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">需要專業諮詢？</h2>
          <p className="text-xl mb-8 text-slate-300">
            我們的技術團隊提供專業的冷媒選擇建議和技術支援
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-green-500 hover:bg-green-600 text-white px-8"
              onClick={() => window.open('https://wa.me/60123456789', '_blank')}
            >
              <Phone className="h-5 w-5 mr-2" />
              WhatsApp 諮詢
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-slate-900 px-8"
              onClick={() => window.location.href = '/zh/contact'}
            >
              <Mail className="h-5 w-5 mr-2" />
              聯絡我們
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}