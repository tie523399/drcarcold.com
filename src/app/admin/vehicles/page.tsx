'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Upload, 
  Search, 
  Car, 
  Database,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet
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

export default function ImprovedVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')

  // 新增車輛資料狀態
  const [newVehicle, setNewVehicle] = useState({
    brand: '',
    model: '',
    year: '',
    refrigerant: 'R134a',
    amount: '',
    oil: '',
    info: ''
  })

  // 批量匯入狀態
  const [batchData, setBatchData] = useState('')
  const [importing, setImporting] = useState(false)

  // 載入車輛數據
  const fetchVehicles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (brandFilter !== 'all') params.append('brand', brandFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/vehicles?${params}`)
      const data = await response.json()

      if (data.success) {
        setVehicles(data.data)
      }
    } catch (error) {
      console.error('載入車輛數據失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [brandFilter, searchTerm])

  // 新增單筆車輛
  const handleAddVehicle = async () => {
    if (!newVehicle.brand || !newVehicle.model) {
      alert('請至少填入品牌和車型！')
      return
    }

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: newVehicle.brand,
          model: newVehicle.model,
          year: newVehicle.year || null,
          refrigerant: newVehicle.refrigerant,
          amount: newVehicle.amount || null,
          oil: newVehicle.oil || null,
          info: newVehicle.info || null,
          source: 'manual'
        })
      })

      if (response.ok) {
        alert('新增成功！')
        setNewVehicle({
          brand: '',
          model: '',
          year: '',
          refrigerant: 'R134a',
          amount: '',
          oil: '',
          info: ''
        })
        fetchVehicles()
      } else {
        alert('新增失敗！')
      }
    } catch (error) {
      console.error('新增車輛失敗:', error)
      alert('新增失敗，請檢查網路連線')
    }
  }

  // 批量匯入
  const handleBatchImport = async () => {
    if (!batchData.trim()) {
      alert('請輸入要匯入的資料！')
      return
    }

    setImporting(true)
    try {
      const lines = batchData.trim().split('\n').filter(line => line.trim())
      const vehicles = []

      for (const line of lines) {
        const parts = line.split(',').map(p => p.trim())
        if (parts.length >= 2) {
          vehicles.push({
            brand: parts[0],
            model: parts[1],
            year: parts[2] || null,
            refrigerant: parts[3] || 'R134a',
            amount: parts[4] || null,
            oil: parts[5] || null,
            info: parts[6] || null,
            source: 'batch'
          })
        }
      }

      for (const vehicle of vehicles) {
        await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicle)
        })
      }

      alert(`批量匯入完成！共處理 ${vehicles.length} 筆資料`)
      setBatchData('')
      fetchVehicles()
    } catch (error) {
      console.error('批量匯入失敗:', error)
      alert('批量匯入失敗！')
    } finally {
      setImporting(false)
    }
  }

  // 刪除車輛
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('確定要刪除這筆資料嗎？')) return

    try {
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('刪除成功！')
        fetchVehicles()
      } else {
        alert('刪除失敗！')
      }
    } catch (error) {
      console.error('刪除失敗:', error)
      alert('刪除失敗！')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🚗 汽車冷媒資料管理</h1>
          <p className="text-gray-600">簡單易用的車輛冷媒資料管理系統</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.open('/api/vehicles/download?type=import', '_blank')}>
            <Download className="h-4 w-4 mr-2" />
            下載範本
          </Button>
          <Button onClick={fetchVehicles} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新載入
          </Button>
        </div>
      </div>

      {/* 功能選單 */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">📋 查看資料</TabsTrigger>
          <TabsTrigger value="add">➕ 新增資料</TabsTrigger>
          <TabsTrigger value="batch">📤 批量匯入</TabsTrigger>
        </TabsList>

        {/* 查看資料 */}
        <TabsContent value="list" className="space-y-4">
          {/* 搜尋篩選 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                搜尋篩選
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="搜尋品牌或車型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇品牌" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有品牌</SelectItem>
                    <SelectItem value="TOYOTA">Toyota</SelectItem>
                    <SelectItem value="HONDA">Honda</SelectItem>
                    <SelectItem value="NISSAN">Nissan</SelectItem>
                    <SelectItem value="MAZDA">Mazda</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="BENZ">Mercedes-Benz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 車輛列表 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  車輛資料 ({vehicles.length} 筆)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">載入中...</div>
              ) : vehicles.length > 0 ? (
                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{vehicle.brand}</Badge>
                          <span className="font-medium">{vehicle.model}</span>
                          {vehicle.year && <span className="text-gray-500">({vehicle.year})</span>}
                        </div>
                        <div className="text-sm text-gray-600 grid grid-cols-1 md:grid-cols-3 gap-2">
                          <span>🧊 {vehicle.refrigerant || 'R134a'}</span>
                          <span>📏 {vehicle.amount || '-'}</span>
                          <span>🛢️ {vehicle.oil || '-'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  目前沒有車輛資料
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 新增資料 */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新增車輛資料
              </CardTitle>
              <CardDescription>
                填入車輛的冷媒相關資料
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">品牌 *</label>
                  <Input
                    placeholder="例：TOYOTA"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, brand: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">車型 *</label>
                  <Input
                    placeholder="例：ALTIS"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">年份</label>
                  <Input
                    placeholder="例：2014-2018"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, year: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">冷媒類型</label>
                  <Select
                    value={newVehicle.refrigerant}
                    onValueChange={(value) => setNewVehicle(prev => ({ ...prev, refrigerant: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="R134a">R134a</SelectItem>
                      <SelectItem value="R1234yf">R1234yf</SelectItem>
                      <SelectItem value="R12">R12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">冷媒量</label>
                  <Input
                    placeholder="例：500±25g"
                    value={newVehicle.amount}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">冷凍油</label>
                  <Input
                    placeholder="例：PAG 46 150ml"
                    value={newVehicle.oil}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, oil: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">備註</label>
                <Input
                  placeholder="額外資訊..."
                  value={newVehicle.info}
                  onChange={(e) => setNewVehicle(prev => ({ ...prev, info: e.target.value }))}
                />
              </div>
              <Button onClick={handleAddVehicle} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                新增車輛資料
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 批量匯入 */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                批量匯入資料
              </CardTitle>
              <CardDescription>
                每行一筆資料，格式：品牌,車型,年份,冷媒類型,冷媒量,冷凍油,備註
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📝 格式範例：</h4>
                <pre className="text-sm bg-white p-2 rounded border">
{`TOYOTA,ALTIS,2014-2018,R134a,500±25g,PAG 46 150ml,
HONDA,CIVIC,2016-2021,R1234yf,450±20g,PAG 46 120ml,新款環保冷媒
NISSAN,SENTRA,2013-2019,R134a,480±25g,PAG 100 140ml,`}
                </pre>
              </div>
              
              <Textarea
                placeholder="請輸入要匯入的資料，每行一筆..."
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
                rows={10}
              />
              
              <Button 
                onClick={handleBatchImport} 
                disabled={importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    匯入中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    開始批量匯入
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}