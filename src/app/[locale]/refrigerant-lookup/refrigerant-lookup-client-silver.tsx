'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Car, 
  Truck, 
  Globe, 
  Search, 
  Loader2, 
  Snowflake,
  Droplets,
  Gauge,
  Info,
  CheckCircle,
  Wrench
} from 'lucide-react'

interface Vehicle {
  id: string
  brand: string
  model: string
  info?: string
  year?: string
  refrigerant?: string
  amount?: string
  oil?: string
}

export default function ImprovedRefrigerantLookupClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('all')
  const [results, setResults] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  // 快速搜尋
  const handleQuickSearch = async (query?: string) => {
    const searchQuery = query || searchTerm
    if (!searchQuery.trim() && selectedBrand === 'all') return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.append('search', searchQuery.trim())
      if (selectedBrand !== 'all') params.append('brand', selectedBrand)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/refrigerant-lookup?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('搜尋失敗:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // 分類搜尋
  const handleCategorySearch = async (category: string) => {
    setSelectedCategory(category)
    setSelectedBrand('all')
    setSearchTerm('')
    setIsLoading(true)
    setHasSearched(true)

    try {
      const params = new URLSearchParams()
      params.append('category', category)

      const response = await fetch(`/api/refrigerant-lookup?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data || [])
      } else {
        setResults([])
      }
    } catch (error) {
      console.error('分類搜尋失敗:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // 熱門品牌 - 銀色系配色
  const popularBrands = [
    { value: 'TOYOTA', label: 'Toyota 豐田', color: 'bg-gradient-to-r from-gray-500 to-gray-600' },
    { value: 'HONDA', label: 'Honda 本田', color: 'bg-gradient-to-r from-slate-500 to-slate-600' },
    { value: 'NISSAN', label: 'Nissan 日產', color: 'bg-gradient-to-r from-zinc-500 to-zinc-600' },
    { value: 'MAZDA', label: 'Mazda 馬自達', color: 'bg-gradient-to-r from-gray-600 to-gray-700' },
    { value: 'BMW', label: 'BMW', color: 'bg-gradient-to-r from-slate-600 to-slate-700' },
    { value: 'BENZ', label: 'Mercedes-Benz 賓士', color: 'bg-gradient-to-r from-zinc-600 to-zinc-700' },
  ]

  return (
    <div className="space-y-6">
      {/* 搜尋區域 - 銀色系漸層 */}
      <Card className="bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100 border-gray-300 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-3">
            <Snowflake className="h-7 w-7 text-gray-600" />
            🔍 汽車冷媒快速查詢
          </CardTitle>
          <CardDescription className="text-lg text-gray-700">
            輸入車型或選擇品牌，快速找到準確的冷媒規格
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 搜尋框 */}
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="🚗 輸入車型名稱 (例：ALTIS, CIVIC, X3...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
                  className="text-lg h-12 border-gray-300 bg-white/70 backdrop-blur"
                />
              </div>
              <Button 
                onClick={() => handleQuickSearch()}
                disabled={isLoading}
                className="h-12 px-6 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    搜尋
                  </>
                )}
              </Button>
            </div>

            {/* 品牌選擇 */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">🏷️ 或選擇品牌:</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="h-10 border-gray-300 bg-white/70">
                  <SelectValue placeholder="選擇汽車品牌" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有品牌</SelectItem>
                  {popularBrands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速分類 - 銀色系配色 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 bg-gradient-to-br from-gray-50 to-slate-100 ${
            selectedCategory === 'regular' ? 'ring-2 ring-gray-500 bg-gradient-to-br from-gray-100 to-slate-200' : ''
          }`}
          onClick={() => handleCategorySearch('regular')}
        >
          <CardContent className="p-6 text-center">
            <Car className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <h3 className="font-bold text-lg mb-2 text-gray-800">🚗 一般轎車</h3>
            <p className="text-sm text-gray-600">Toyota, Honda, Nissan, BMW...</p>
          </CardContent>
        </Card>

        <Card 
          className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 bg-gradient-to-br from-slate-50 to-zinc-100 ${
            selectedCategory === 'truck' ? 'ring-2 ring-slate-500 bg-gradient-to-br from-slate-100 to-zinc-200' : ''
          }`}
          onClick={() => handleCategorySearch('truck')}
        >
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 mx-auto mb-3 text-slate-600" />
            <h3 className="font-bold text-lg mb-2 text-slate-800">🚛 商用車</h3>
            <p className="text-sm text-slate-600">貨車、巴士、大型車輛</p>
          </CardContent>
        </Card>

        <Card 
          className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 bg-gradient-to-br from-zinc-50 to-gray-100 ${
            selectedCategory === 'malaysia' ? 'ring-2 ring-zinc-500 bg-gradient-to-br from-zinc-100 to-gray-200' : ''
          }`}
          onClick={() => handleCategorySearch('malaysia')}
        >
          <CardContent className="p-6 text-center">
            <Globe className="h-12 w-12 mx-auto mb-3 text-zinc-600" />
            <h3 className="font-bold text-lg mb-2 text-zinc-800">🌏 馬來西亞車型</h3>
            <p className="text-sm text-zinc-600">Proton, Perodua, 當地車型</p>
          </CardContent>
        </Card>
      </div>

      {/* 熱門品牌快速按鈕 - 銀色系漸層 */}
      <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Car className="h-5 w-5" />
            🔥 熱門品牌快速查詢
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularBrands.map((brand) => (
              <Button
                key={brand.value}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center hover:bg-gray-100 border-gray-300"
                onClick={() => {
                  setSelectedBrand(brand.value)
                  handleQuickSearch('')
                }}
              >
                <div className={`w-8 h-8 rounded-full ${brand.color} mb-1`}></div>
                <span className="text-xs font-medium text-gray-700">{brand.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 搜尋結果 - 銀色系配色 */}
      {hasSearched && (
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-gray-800">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                搜尋結果 ({results.length} 筆)
              </span>
              {results.length > 0 && (
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
                  找到 {results.length} 個車型
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((vehicle) => (
                  <Card key={vehicle.id} className="bg-gradient-to-r from-white via-gray-50 to-slate-50 border-l-4 border-l-gray-500 shadow-md">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 車輛資訊 */}
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <Badge className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1">
                              {vehicle.brand}
                            </Badge>
                            <h3 className="text-xl font-bold text-gray-800">{vehicle.model}</h3>
                            {vehicle.year && (
                              <span className="text-gray-600">({vehicle.year})</span>
                            )}
                          </div>
                          {vehicle.info && (
                            <div className="flex items-center gap-2 mb-2">
                              <Wrench className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{vehicle.info}</span>
                            </div>
                          )}
                        </div>

                        {/* 冷媒規格 - 銀色系漸層 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Snowflake className="h-5 w-5 text-gray-600" />
                              <span className="font-medium text-gray-700">冷媒類型</span>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`${
                                vehicle.refrigerant === 'R1234yf' 
                                  ? 'bg-gray-200 text-gray-800 border-gray-400' 
                                  : 'bg-slate-200 text-slate-800 border-slate-400'
                              }`}
                            >
                              {vehicle.refrigerant || 'R134a'}
                            </Badge>
                          </div>

                          <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Gauge className="h-5 w-5 text-slate-600" />
                              <span className="font-medium text-slate-700">充填量</span>
                            </div>
                            <span className="text-lg font-bold text-slate-700">
                              {vehicle.amount || '-'}
                            </span>
                          </div>

                          <div className="bg-gradient-to-br from-white to-zinc-50 rounded-lg p-4 border border-gray-200 sm:col-span-2">
                            <div className="flex items-center gap-2 mb-2">
                              <Droplets className="h-5 w-5 text-zinc-600" />
                              <span className="font-medium text-zinc-700">冷凍油</span>
                            </div>
                            <span className="text-zinc-700">
                              {vehicle.oil || '請參考原廠規格'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">找不到相關車型</h3>
                <p className="text-gray-600 mb-4">請嘗試：</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• 檢查車型名稱拼寫</li>
                  <li>• 使用更簡單的關鍵字</li>
                  <li>• 選擇品牌進行搜尋</li>
                  <li>• 聯絡我們更新資料庫</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 說明卡片 - 銀色系漸層 */}
      {!hasSearched && (
        <Card className="bg-gradient-to-r from-gray-100 via-slate-100 to-zinc-100 border-gray-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-gray-600 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">💡 使用說明</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>快速搜尋</strong>：直接輸入車型名稱 (如：ALTIS, CIVIC)</li>
                  <li>• <strong>品牌篩選</strong>：選擇品牌查看所有車型</li>
                  <li>• <strong>分類查詢</strong>：點擊分類按鈕快速篩選</li>
                  <li>• <strong>準確資料</strong>：所有冷媒規格均來自原廠資料</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}