'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  Search, 
  Car, 
  Database,
  Download,
  RefreshCw,
  BarChart3,
  CheckCircle,
  AlertTriangle
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
  source: string
  createdAt: string
}

interface ImportStats {
  totalVehicles: number
  totalBrands: number
  brandStats: Array<{ brand: string; _count: { id: number } }>
  refrigerantStats: Array<{ refrigerant: string; _count: { id: number } }>
  sourceStats: Array<{ source: string; _count: { id: number } }>
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [refrigerantFilter, setRefrigerantFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [availableBrands, setAvailableBrands] = useState<string[]>([])
  const [availableRefrigerants, setAvailableRefrigerants] = useState<string[]>([])

  // 載入車輛數據
  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (brandFilter !== 'all') params.append('brand', brandFilter)
      if (refrigerantFilter !== 'all') params.append('refrigerant', refrigerantFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/vehicles?${params}`)
      const data = await response.json()

      if (data.success) {
        setVehicles(data.data)
        setTotalPages(data.pagination.pages)
        setAvailableBrands(data.filters.brands)
        setAvailableRefrigerants(data.filters.refrigerants)
      }
    } catch (error) {
      console.error('載入車輛數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  // 載入統計數據
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/vehicles/import')
      const data = await response.json()

      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('載入統計數據失敗:', error)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchStats()
  }, [currentPage, brandFilter, refrigerantFilter, searchTerm])

  // 執行數據匯入
  const handleImport = async (clearExisting = false) => {
    if (!confirm(clearExisting ? 
      '確定要清空現有數據並重新匯入嗎？這將刪除所有現有車輛數據！' : 
      '確定要匯入車輛數據嗎？重複的數據會被跳過。'
    )) {
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/vehicles/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          source: 'vehicles_import.json',
          clearExisting
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(`匯入完成！\n成功匯入: ${result.stats.imported} 筆\n失敗: ${result.stats.failed} 筆\n資料庫總計: ${result.stats.totalInDatabase} 筆`)
        fetchVehicles()
        fetchStats()
      } else {
        alert(`匯入失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('匯入失敗:', error)
      alert('匯入失敗，請檢查控制台錯誤訊息')
    } finally {
      setImporting(false)
    }
  }

  // 下載範例CSV
  const downloadCSV = () => {
    window.open('/api/vehicles/download?type=import', '_blank')
  }

  // 下載雙語版本CSV
  const downloadBilingualCSV = () => {
    window.open('/api/vehicles/download?type=bilingual', '_blank')
  }

  return (
    <div className="p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">車輛數據管理</h1>
          <p className="text-muted-foreground">管理汽車冷媒規格數據庫</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={downloadCSV}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            下載範本CSV
          </Button>
          
          <Button
            onClick={downloadBilingualCSV}
            variant="outline"
            className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4" />
            下載雙語CSV
          </Button>
          
          <Button
            onClick={() => handleImport(false)}
            disabled={importing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            增量匯入
          </Button>

          <Button
            onClick={() => handleImport(true)}
            disabled={importing}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {importing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            完整重新匯入
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">總車型數</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalVehicles}</p>
                </div>
                <Car className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">品牌數量</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalBrands}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">冷媒類型</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.refrigerantStats.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">數據來源</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.sourceStats.length}</p>
                </div>
                <Database className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜尋和篩選 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋品牌、車型、年份..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="選擇品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有品牌</SelectItem>
                {availableBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={refrigerantFilter} onValueChange={setRefrigerantFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="冷媒類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有冷媒</SelectItem>
                {availableRefrigerants.map((refrigerant) => (
                  <SelectItem key={refrigerant} value={refrigerant}>{refrigerant}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 車輛列表 */}
      <Card>
        <CardHeader>
          <CardTitle>車輛資料</CardTitle>
          <CardDescription>
            {loading ? '載入中...' : `第 ${currentPage} 頁，共 ${totalPages} 頁`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>載入車輛數據中...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>沒有找到車輛數據</p>
              <p className="text-sm">請先匯入數據或調整搜尋條件</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{vehicle.brand}</h4>
                      <Badge variant="outline">{vehicle.model}</Badge>
                      {vehicle.year && (
                        <Badge variant="secondary" className="text-xs">
                          {vehicle.year}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {vehicle.refrigerant && (
                        <Badge className="bg-blue-100 text-blue-800">
                          {vehicle.refrigerant}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {vehicle.source}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    {vehicle.amount && (
                      <div>
                        <span className="font-medium">冷媒量: </span>
                        {vehicle.amount}g
                      </div>
                    )}
                    {vehicle.oil && (
                      <div>
                        <span className="font-medium">冷凍油: </span>
                        {vehicle.oil}cc
                      </div>
                    )}
                    {vehicle.info && (
                      <div className="col-span-2">
                        <span className="font-medium">備註: </span>
                        {vehicle.info}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分頁 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一頁
              </Button>
              
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                第 {currentPage} 頁，共 {totalPages} 頁
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一頁
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 匯入說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            匯入說明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div>
            <strong>增量匯入:</strong> 只添加新數據，跳過重複的記錄，保留現有數據
          </div>
          <div>
            <strong>完整重新匯入:</strong> 刪除所有現有數據後重新匯入，適用於數據更新
          </div>
          <div>
            <strong>數據來源:</strong> 目前匯入 vehicles_import.json 文件，包含1996筆車型數據，涵蓋54個品牌
          </div>
          <div>
            <strong>支援格式:</strong> 包含品牌、車型、年份、冷媒類型、冷媒量、冷凍油量等完整資訊
          </div>
        </CardContent>
      </Card>
    </div>
  )
}