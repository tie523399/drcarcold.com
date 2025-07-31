'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Car, Truck, MapPin, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'

const categoryIcons: Record<string, any> = {
  regular: Car,
  truck: Truck,
  malaysia: MapPin,
}

const categoryNames: Record<string, string> = {
  regular: '一般車輛',
  truck: '大型車輛',
  malaysia: '馬來西亞車',
}

interface VehicleData {
  brand: string
  model: string
  year?: string
  refrigerantType?: string
  fillAmount?: string
  oilType?: string
  oilAmount?: string
  notes?: string
}

interface ParseResult {
  success: boolean
  data: VehicleData[]
  summary: {
    totalRecords: number
    validRecords: number
    brands: string[]
    years: string[]
  }
  errors?: string[]
}

export default function VehiclesPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    brandId: string | null
    brandName: string
  }>({
    open: false,
    brandId: null,
    brandName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)
  
  // 文件上傳相關狀態
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<ParseResult | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/vehicle-brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.brandId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/vehicle-brands/${deleteDialog.brandId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setBrands(brands.filter(b => b.id !== deleteDialog.brandId))
        setDeleteDialog({ open: false, brandId: null, brandName: '' })
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('刪除時發生錯誤')
    } finally {
      setIsDeleting(false)
    }
  }

  // 📤 文件上傳處理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/vehicle-file-upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setUploadResult(result)
        setShowUploadDialog(true)
      } else {
        alert(`上傳失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('上傳時發生錯誤')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 📥 導入車輛數據
  const handleImportData = async () => {
    if (!uploadResult?.data) return

    setIsImporting(true)
    try {
      const response = await fetch('/api/vehicle-file-upload', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vehicles: uploadResult.data,
          action: 'import'
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(result.message)
        setShowUploadDialog(false)
        setUploadResult(null)
        fetchBrands() // 重新載入品牌列表
      } else {
        alert(`導入失敗: ${result.error}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('導入時發生錯誤')
    } finally {
      setIsImporting(false)
    }
  }

  // 📋 下載CSV範本
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/vehicle-file-upload', {
        method: 'GET'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'vehicle-template.csv'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('下載範本時發生錯誤')
    }
  }

  const filteredBrands = selectedCategory === 'all' 
    ? brands 
    : brands.filter(b => b.category === selectedCategory)

  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">汽車冷媒填充資訊</h1>
          <p className="text-gray-600 mt-2">管理汽車冷媒填充資料庫</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            下載CSV範本
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? '解析中...' : '上傳文件 (PDF/CSV/Excel)'}
          </Button>
          <Link href="/admin/vehicles/import">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              手動匯入
            </Button>
          </Link>
          <Link href="/admin/vehicles/new">
            <Button variant="premium">
              <Plus className="mr-2 h-4 w-4" />
              新增品牌
            </Button>
          </Link>
        </div>
      </div>

      {/* 分類篩選 */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
        >
          全部 ({brands.length})
        </Button>
        {Object.entries(categoryNames).map(([key, name]) => {
          const count = brands.filter(b => b.category === key).length
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(key)}
            >
              {name} ({count})
            </Button>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>汽車冷媒填列表</CardTitle>
          <CardDescription>共 {filteredBrands.length} 個品牌</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>品牌名稱</TableHead>
                <TableHead>英文名稱</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>車型數量</TableHead>
                <TableHead>排序</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => {
                const Icon = categoryIcons[brand.category] || Car
                return (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-500" />
                        {brand.name}
                      </div>
                    </TableCell>
                    <TableCell>{brand.nameEn}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {categoryNames[brand.category]}
                      </span>
                    </TableCell>
                    <TableCell>{brand._count?.models || 0}</TableCell>
                    <TableCell>{brand.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/vehicles/${brand.id}/models`}>
                          <Button variant="outline" size="sm">
                            管理車型
                          </Button>
                        </Link>
                        <Link href={`/admin/vehicles/${brand.id}/edit`}>
                          <Button variant="outline" size="sm" title="編輯品牌" aria-label="編輯品牌">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteDialog({
                            open: true,
                            brandId: brand.id,
                            brandName: brand.name,
                          })}
                          title="刪除品牌"
                          aria-label="刪除品牌"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredBrands.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">尚無品牌資料</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除"
        description={`您確定要刪除「${deleteDialog.brandName}」嗎？此操作將同時刪除該品牌下的所有車型資料。`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />

      {/* 文件解析結果預覽對話框 */}
      {showUploadDialog && uploadResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">文件解析結果</h2>
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                關閉
              </Button>
            </div>

            {/* 解析統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResult.summary.totalRecords}
                </div>
                <div className="text-sm text-blue-600">總記錄數</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.summary.validRecords}
                </div>
                <div className="text-sm text-green-600">有效記錄</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {uploadResult.summary.brands.length}
                </div>
                <div className="text-sm text-purple-600">發現品牌</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {uploadResult.summary.years.length}
                </div>
                <div className="text-sm text-orange-600">年份範圍</div>
              </div>
            </div>

            {/* 錯誤信息 */}
            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-red-600 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  解析警告 ({uploadResult.errors.length})
                </h3>
                <div className="bg-red-50 p-3 rounded max-h-32 overflow-y-auto">
                  {uploadResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 數據預覽 */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                解析數據預覽 (前10筆)
              </h3>
              <div className="border rounded overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>品牌</TableHead>
                      <TableHead>型號</TableHead>
                      <TableHead>年份</TableHead>
                      <TableHead>冷媒類型</TableHead>
                      <TableHead>充填量</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadResult.data.slice(0, 10).map((vehicle, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{vehicle.brand}</TableCell>
                        <TableCell>{vehicle.model}</TableCell>
                        <TableCell>{vehicle.year || '-'}</TableCell>
                        <TableCell>{vehicle.refrigerantType || '-'}</TableCell>
                        <TableCell>{vehicle.fillAmount || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {uploadResult.data.length > 10 && (
                <p className="text-sm text-gray-600 mt-2">
                  還有 {uploadResult.data.length - 10} 筆數據...
                </p>
              )}
            </div>

            {/* 動作按鈕 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUploadDialog(false)}
              >
                取消
              </Button>
              <Button
                onClick={handleImportData}
                disabled={isImporting || uploadResult.data.length === 0}
                variant="premium"
              >
                {isImporting ? '導入中...' : `確認導入 ${uploadResult.data.length} 筆數據`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 