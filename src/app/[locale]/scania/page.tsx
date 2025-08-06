'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Truck, 
  Search, 
  Shield,
  Cog,
  Globe,
  Snowflake,
  Factory,
  Calendar,
  CheckCircle,
  Award,
  Mountain
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

export default function ScaniaPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [totalVehicles, setTotalVehicles] = useState(0)

  // 搜尋Scania車輛數據
  const searchScaniaVehicles = async (search: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        brand: 'SCANIA',
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
      console.error('搜尋Scania車輛失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchScaniaVehicles()
  }, [])

  const handleSearch = () => {
    searchScaniaVehicles(searchTerm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <Truck className="h-10 w-10 text-orange-400" />
            <span className="text-4xl font-bold">SCANIA</span>
            <span className="text-2xl">斯堪尼亞</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-yellow-300 bg-clip-text text-transparent">
              瑞典工藝
            </span>
            <br />
            商用傳奇
          </h1>
          <p className="text-xl leading-relaxed mb-8 text-red-100 max-w-4xl mx-auto">
            Scania 斯堪尼亞，來自瑞典的商用車輛領導品牌。
            以卓越的工程技術和可靠性聞名全球，提供重型卡車、巴士和工業引擎解決方案。
            我們為您提供 Scania 全系列車輛的冷媒規格和專業技術支援。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="bg-orange-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-300">{totalVehicles}+</div>
              <div className="text-sm text-red-200">商用車型</div>
            </div>
            <div className="bg-orange-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-300">130+</div>
              <div className="text-sm text-red-200">年歷史</div>
            </div>
            <div className="bg-orange-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-300">100+</div>
              <div className="text-sm text-red-200">國家服務</div>
            </div>
            <div className="bg-orange-400/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-orange-300">24/7</div>
              <div className="text-sm text-red-200">技術支援</div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl border-t-4 border-red-600">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="h-6 w-6 text-red-600" />
                Scania 車輛冷媒規格查詢
              </CardTitle>
              <CardDescription className="text-lg">
                專業的 Scania 商用車輛冷媒規格查詢服務
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="例如：R450, S500, P280, G410..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border-red-300 focus:border-red-600"
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={loading} 
                  className="bg-red-600 hover:bg-red-700 text-white"
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
            <h2 className="text-2xl font-bold text-center mb-8 text-red-800">搜尋結果</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-red-600">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-orange-500" />
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
              Scania 的商用優勢
            </h2>
            <p className="text-xl text-gray-600">
              130年來專注於商用車輛創新
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-600">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
                <CardTitle className="text-xl text-red-800">堅固耐用</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  瑞典工程技術，極致耐用性和可靠性
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-600">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                  <Cog className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-xl text-red-800">高效性能</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  優化的引擎技術，提供卓越的燃油效率
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-600">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                  <Globe className="h-8 w-8 text-green-500" />
                </div>
                <CardTitle className="text-xl text-red-800">全球服務</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  遍佈全球的服務網絡和技術支援
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 border-t-4 border-red-600">
              <CardHeader>
                <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                  <Factory className="h-8 w-8 text-orange-500" />
                </div>
                <CardTitle className="text-xl text-red-800">商用專精</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  專注於重型商用車輛和運輸解決方案
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-700 to-red-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Truck className="h-16 w-16 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Scania 商用車專業支援
          </h2>
          <p className="text-xl mb-8 text-red-100">
            為您的 Scania 商用車隊提供專業的冷媒技術支援和維修服務
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-orange-400 text-red-900 hover:bg-orange-500">
              <Factory className="h-5 w-5 mr-2" />
              商用車隊服務
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-red-900">
              <Globe className="h-5 w-5 mr-2" />
              全球技術支援
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}