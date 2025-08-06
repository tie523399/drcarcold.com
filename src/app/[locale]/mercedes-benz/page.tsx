'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Car, 
  Search, 
  Crown,
  Shield,
  Zap,
  Snowflake,
  Star,
  Calendar,
  CheckCircle,
  Award
} from 'lucide-react'

interface VehicleData {
  id: string
  brand: string
  model: string
  year?: string
  refrigerant?: string
  amount?: string
  oil?: string
  info?: string
}

export default function MercedesBenzPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalVehicles, setTotalVehicles] = useState(0)

  // 搜尋Mercedes-Benz車輛數據
  const searchMercedesVehicles = async (search: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        brand: 'MERCEDES',
        limit: '6'
      })
      if (search) params.append('search', search)

      const response = await fetch(`/api/vehicles?${params}`)
      const data = await response.json()

      if (data.success) {
        setVehicles(data.data)
        setTotalVehicles(data.vehicleCount)
      }
    } catch (error) {
      console.error('搜尋Mercedes-Benz車輛失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchMercedesVehicles()
  }, [])

  const handleSearch = () => {
    searchMercedesVehicles(searchTerm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Crown className="h-10 w-10 text-yellow-400" />
            <span className="text-4xl font-bold">Mercedes-Benz</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
              豪華工藝
            </span>
            <br />
            德國精神
          </h1>
          <p className="text-xl leading-relaxed mb-8 text-gray-300 max-w-4xl mx-auto">
            Mercedes-Benz 賓士，百年來代表著汽車工業的最高標準。
            從經典轎車到豪華SUV，每一款車型都體現著德國工藝的精髓。
            我們提供完整的 Mercedes-Benz 車系冷媒規格和專業技術支援。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-yellow-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">{totalVehicles}+</div>
              <div className="text-sm">豪華車型</div>
            </div>
            <div className="bg-yellow-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">130+</div>
              <div className="text-sm">年歷史</div>
            </div>
            <div className="bg-yellow-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">100%</div>
              <div className="text-sm">德國品質</div>
            </div>
            <div className="bg-yellow-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-400">VIP</div>
              <div className="text-sm">專屬服務</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl border-t-4 border-gray-800">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="h-6 w-6 text-gray-800" />
                Mercedes-Benz 車型冷媒規格查詢
              </CardTitle>
              <CardDescription className="text-lg">
                為您的 Mercedes-Benz 尋找精確的冷媒規格資訊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="例如：C-Class, E-Class, S-Class, GLE..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border-gray-300 focus:border-gray-800"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading} 
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? '搜尋中...' : '搜尋'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search Results */}
      {vehicles.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">搜尋結果</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year && (
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4" />
                          {vehicle.year}
                        </div>
                      )}
                      {vehicle.info && (
                        <div className="text-sm text-gray-600">{vehicle.info}</div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {vehicle.refrigerant && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">冷媒</span>
                          </div>
                          <Badge variant={vehicle.refrigerant.includes('R1234yf') ? 'default' : 'secondary'}>
                            {vehicle.refrigerant}
                          </Badge>
                        </div>
                      )}
                      {vehicle.amount && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">冷媒量</span>
                          <span className="font-medium">{vehicle.amount}</span>
                        </div>
                      )}
                      {vehicle.oil && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">冷凍油</span>
                          <span className="font-medium">{vehicle.oil}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mercedes-Benz 的卓越之處
            </h2>
            <p className="text-xl text-gray-600">
              130年來堅持的豪華汽車標準
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-gray-800">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">豪華典範</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  百年豪華汽車品牌，品質與地位的象徵
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-gray-800">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">創新科技</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  先進的汽車技術和創新工程解決方案
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-gray-800">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">安全領導</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  業界頂尖的安全技術和防護系統
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-gray-800">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl text-gray-800">卓越性能</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  頂級性能和駕駛體驗的完美結合
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Mercedes-Benz 專屬技術支援
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            為您的 Mercedes-Benz 提供頂級的冷媒技術支援和專業諮詢服務
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-yellow-400 text-gray-900 hover:bg-yellow-500">
              <Crown className="h-5 w-5 mr-2" />
              VIP 專屬諮詢
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              技術支援專線
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}