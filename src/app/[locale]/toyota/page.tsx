'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Car, 
  Search, 
  Award,
  ShieldCheck,
  Globe,
  Snowflake,
  Wrench,
  Calendar,
  CheckCircle,
  ArrowRight,
  Star
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

export default function ToyotaPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalVehicles, setTotalVehicles] = useState(0)

  // 搜尋Toyota車輛數據
  const searchToyotaVehicles = async (search: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        brand: 'TOYOTA',
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
      console.error('搜尋Toyota車輛失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchToyotaVehicles()
  }, [])

  const handleSearch = () => {
    searchToyotaVehicles(searchTerm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Car className="h-10 w-10" />
            <span className="text-4xl font-bold">TOYOTA</span>
            <span className="text-2xl">豐田</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            品質與可靠的象徵
          </h1>
          <p className="text-xl leading-relaxed mb-8 max-w-4xl mx-auto">
            Toyota豐田汽車作為全球知名品牌，以其卓越的品質、可靠性和創新技術聞名。
            我們提供完整的Toyota車系冷媒規格查詢和專業服務支援。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-300">{totalVehicles}+</div>
              <div className="text-sm">支援車型</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-300">98%</div>
              <div className="text-sm">覆蓋率</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-300">2</div>
              <div className="text-sm">冷媒類型</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-3xl font-bold text-yellow-300">24/7</div>
              <div className="text-sm">技術支援</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="h-6 w-6" />
                Toyota 車型冷媒規格查詢
              </CardTitle>
              <CardDescription>
                輸入車型名稱或年份，快速查找您需要的冷媒規格信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="例如：Camry, Prius, RAV4..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading} className="bg-red-600 hover:bg-red-700">
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
            <h2 className="text-2xl font-bold text-center mb-8">搜尋結果</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">
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
              為什麼選擇 Toyota
            </h2>
            <p className="text-xl text-gray-600">
              全球數百萬車主的信賴之選
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Award className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-xl">全球領導品牌</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  Toyota作為全球最大汽車製造商之一，車型眾多
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl">可靠品質</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  以卓越的品質和可靠性聞名於世
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Globe className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl">環保先驅</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  在混合動力和環保技術方面領先行業
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-xl">維修便利</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  零件供應充足，維修網絡遍布全球
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            需要 Toyota 冷媒支援？
          </h2>
          <p className="text-xl mb-8">
            我們的專業團隊隨時為您提供 Toyota 車系的冷媒諮詢和技術支援
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="text-red-600">
              <Search className="h-5 w-5 mr-2" />
              查詢更多車型
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-red-600">
              聯絡技術支援
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}