'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Car, 
  Search, 
  Zap,
  Leaf,
  Shield,
  Snowflake,
  Star,
  Calendar,
  Wrench,
  CheckCircle,
  Battery
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

export default function HondaHyundaiPage() {
  const [vehicles, setVehicles] = useState<VehicleData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<'honda' | 'hyundai'>('honda')
  const [totalVehicles, setTotalVehicles] = useState({ honda: 0, hyundai: 0 })

  // 搜尋車輛數據
  const searchVehicles = async (brand: 'honda' | 'hyundai', search: string = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        brand: brand.toUpperCase(),
        limit: '6'
      })
      if (search) params.append('search', search)

      const response = await fetch(`/api/vehicles?${params}`)
      const data = await response.json()

      if (data.success) {
        setVehicles(data.data)
      }
    } catch (error) {
      console.error(`搜尋${brand}車輛失敗:`, error)
    } finally {
      setLoading(false)
    }
  }

  // 獲取車輛總數
  const getVehicleCounts = async () => {
    try {
      const [hondaResponse, hyundaiResponse] = await Promise.all([
        fetch('/api/vehicles?brand=HONDA&limit=1'),
        fetch('/api/vehicles?brand=HYUNDAI&limit=1')
      ])

      const hondaData = await hondaResponse.json()
      const hyundaiData = await hyundaiResponse.json()

      setTotalVehicles({
        honda: hondaData.success ? hondaData.vehicleCount : 0,
        hyundai: hyundaiData.success ? hyundaiData.vehicleCount : 0
      })
    } catch (error) {
      console.error('獲取車輛數量失敗:', error)
    }
  }

  useEffect(() => {
    getVehicleCounts()
    searchVehicles('honda')
  }, [])

  const handleSearch = () => {
    searchVehicles(selectedBrand, searchTerm)
  }

  const handleBrandChange = (brand: 'honda' | 'hyundai') => {
    setSelectedBrand(brand)
    setSearchTerm('')
    setVehicles([])
    searchVehicles(brand)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Car className="h-10 w-10 text-red-400" />
              <span className="text-4xl font-bold">HONDA</span>
              <span className="text-2xl">本田</span>
            </div>
            <div className="text-4xl font-bold text-white/50">&</div>
            <div className="flex items-center gap-2">
              <Car className="h-10 w-10 text-blue-400" />
              <span className="text-4xl font-bold">HYUNDAI</span>
              <span className="text-2xl">現代</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              亞洲汽車
            </span>
            <br />
            創新典範
          </h1>
          <p className="text-xl leading-relaxed max-w-4xl mx-auto text-blue-100 mb-8">
            Honda 本田和 Hyundai 現代，兩大亞洲汽車品牌的卓越代表。
            Honda 以其可靠性和創新技術聞名，Hyundai 則以現代化設計和智能科技領先。
            我們為這兩個品牌提供全方位的冷媒規格查詢和專業技術支援。
          </p>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Card className="bg-red-500/20 border-red-400/30 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-red-300">Honda 本田數據</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-red-300">{totalVehicles.honda}+</div>
                    <div className="text-sm">支援車型</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-300">75+</div>
                    <div className="text-sm">年歷史</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-500/20 border-blue-400/30 text-white">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-blue-300">Hyundai 現代數據</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-300">{totalVehicles.hyundai}+</div>
                    <div className="text-sm">支援車型</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-300">55+</div>
                    <div className="text-sm">年歷史</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Selection and Search */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Search className="h-6 w-6 text-blue-600" />
                Honda & Hyundai 車型冷媒規格查詢
              </CardTitle>
              <CardDescription className="text-lg">
                選擇品牌並搜尋您需要的車型冷媒規格資訊
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Brand Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleBrandChange('honda')}
                    variant={selectedBrand === 'honda' ? 'default' : 'outline'}
                    className={selectedBrand === 'honda' ? 'bg-red-500 hover:bg-red-600' : 'border-red-500 text-red-500 hover:bg-red-50'}
                  >
                    Honda 本田
                  </Button>
                  <Button
                    onClick={() => handleBrandChange('hyundai')}
                    variant={selectedBrand === 'hyundai' ? 'default' : 'outline'}
                    className={selectedBrand === 'hyundai' ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}
                  >
                    Hyundai 現代
                  </Button>
                </div>
                
                <div className="flex gap-4">
                  <Input
                    placeholder={selectedBrand === 'honda' ? '例如：Civic, Accord, CR-V...' : '例如：Elantra, Sonata, Tucson...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={loading} 
                    className={selectedBrand === 'honda' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {loading ? '搜尋中...' : '搜尋'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Search Results */}
      {vehicles.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">
              {selectedBrand === 'honda' ? 'Honda' : 'Hyundai'} 搜尋結果
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className={`hover:shadow-xl transition-all duration-300 border-l-4 ${
                  selectedBrand === 'honda' ? 'border-red-600' : 'border-blue-600'
                }`}>
                  <CardHeader>
                    <CardTitle className={`text-lg flex items-center gap-2 ${
                      selectedBrand === 'honda' ? 'text-red-800' : 'text-blue-800'
                    }`}>
                      <Car className="h-5 w-5" />
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
              Honda & Hyundai 的技術特色
            </h2>
            <p className="text-xl text-gray-600">
              亞洲汽車工業的創新代表
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Honda Features */}
            <div>
              <h3 className="text-2xl font-bold text-red-800 mb-8 text-center">Honda 本田特色</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-t-4 border-red-600">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                      <Wrench className="h-6 w-6 text-red-500" />
                    </div>
                    <CardTitle className="text-lg text-red-800">可靠工程</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm">
                      日本精密工程技術，卓越的可靠性和耐用性
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-all duration-300 border-t-4 border-red-600">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-red-50 rounded-full w-fit">
                      <Leaf className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-lg text-red-800">環保技術</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm">
                      混合動力和燃料電池技術的先驅者
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Hyundai Features */}
            <div>
              <h3 className="text-2xl font-bold text-blue-800 mb-8 text-center">Hyundai 現代特色</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-t-4 border-blue-600">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-blue-50 rounded-full w-fit">
                      <Zap className="h-6 w-6 text-blue-500" />
                    </div>
                    <CardTitle className="text-lg text-blue-800">現代科技</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm">
                      先進的智能科技和數位化車載系統
                    </CardDescription>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-all duration-300 border-t-4 border-blue-600">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-blue-50 rounded-full w-fit">
                      <Battery className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-lg text-blue-800">電動未來</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-sm">
                      在電動車領域的領先技術和創新
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Car className="h-12 w-12 text-red-300" />
            <Car className="h-12 w-12 text-blue-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Honda & Hyundai 專業技術支援
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            為您的 Honda 和 Hyundai 車輛提供專業的冷媒技術支援和諮詢服務
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
              <Wrench className="h-5 w-5 mr-2" />
              Honda 技術支援
            </Button>
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
              <Zap className="h-5 w-5 mr-2" />
              Hyundai 技術支援
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}