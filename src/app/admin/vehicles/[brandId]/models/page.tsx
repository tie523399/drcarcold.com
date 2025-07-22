'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, ArrowLeft } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

interface VehicleModel {
  id: string
  modelName: string
  year?: string
  engineType?: string
  refrigerantType: string
  fillAmount: string
  oilType?: string
  oilAmount?: string
  notes?: string
}

interface VehicleBrand {
  id: string
  name: string
  nameEn: string
  category: string
}

export default function VehicleModelsPage({
  params
}: {
  params: { brandId: string }
}) {
  const [brand, setBrand] = useState<VehicleBrand | null>(null)
  const [models, setModels] = useState<VehicleModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    modelId: string | null
    modelName: string
  }>({
    open: false,
    modelId: null,
    modelName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState({
    modelName: '',
    year: '',
    engineType: '',
    refrigerantType: 'R134a',
    fillAmount: '',
    oilType: '',
    oilAmount: '',
    notes: '',
  })

  const fetchBrandAndModels = useCallback(async () => {
    try {
      // 獲取品牌資訊
      const brandResponse = await fetch(`/api/vehicle-brands/${params.brandId}`)
      const brandData = await brandResponse.json()
      setBrand(brandData)

      // 獲取車型列表
      const modelsResponse = await fetch(`/api/vehicle-models?brandId=${params.brandId}`)
      const modelsData = await modelsResponse.json()
      setModels(modelsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [params.brandId])

  useEffect(() => {
    fetchBrandAndModels()
  }, [fetchBrandAndModels])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.modelName || !formData.fillAmount) {
      alert('請填寫必填欄位')
      return
    }

    try {
      const response = await fetch('/api/vehicle-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          brandId: params.brandId,
        }),
      })

      if (response.ok) {
        await fetchBrandAndModels()
        setShowAddForm(false)
        setFormData({
          modelName: '',
          year: '',
          engineType: '',
          refrigerantType: 'R134a',
          fillAmount: '',
          oilType: '',
          oilAmount: '',
          notes: '',
        })
      } else {
        alert('新增失敗')
      }
    } catch (error) {
      console.error('Error creating model:', error)
      alert('新增時發生錯誤')
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.modelId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/vehicle-models/${deleteDialog.modelId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setModels(models.filter(m => m.id !== deleteDialog.modelId))
        setDeleteDialog({ open: false, modelId: null, modelName: '' })
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting model:', error)
      alert('刪除時發生錯誤')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  if (!brand) {
    return <div className="p-8">品牌不存在</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/vehicles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回車輛管理
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {brand.name} ({brand.nameEn}) - 車型管理
          </h1>
          <p className="text-gray-600 mt-2">管理 {brand.name} 品牌的車型資料</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showAddForm ? '取消新增' : '新增車型'}
        </Button>
      </div>

      {/* 新增車型表單 */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>新增車型</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  車型名稱 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.modelName}
                  onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                  placeholder="例如：ALTIS"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">年份</label>
                <Input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="例如：2014-2018"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">引擎型式</label>
                <Input
                  type="text"
                  value={formData.engineType}
                  onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
                  placeholder="例如：1.8L/2.0L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">冷媒種類</label>
                <select
                  value={formData.refrigerantType}
                  onChange={(e) => setFormData({ ...formData, refrigerantType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="R134a">R134a</option>
                  <option value="R1234yf">R1234yf</option>
                  <option value="R404A">R404A</option>
                  <option value="R410A">R410A</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  充填量 <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.fillAmount}
                  onChange={(e) => setFormData({ ...formData, fillAmount: e.target.value })}
                  placeholder="例如：500±25g"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">冷凍油類型</label>
                <Input
                  type="text"
                  value={formData.oilType}
                  onChange={(e) => setFormData({ ...formData, oilType: e.target.value })}
                  placeholder="例如：ND-OIL 8"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">油量</label>
                <Input
                  type="text"
                  value={formData.oilAmount}
                  onChange={(e) => setFormData({ ...formData, oilAmount: e.target.value })}
                  placeholder="例如：150±10ml"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">備註</label>
                <Input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="例如：新款採用環保冷媒"
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit">新增車型</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 車型列表 */}
      <Card>
        <CardHeader>
          <CardTitle>車型列表</CardTitle>
          <CardDescription>共 {models.length} 個車型</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>車型</TableHead>
                  <TableHead>年份</TableHead>
                  <TableHead>引擎</TableHead>
                  <TableHead>冷媒種類</TableHead>
                  <TableHead>充填量</TableHead>
                  <TableHead>冷凍油</TableHead>
                  <TableHead>備註</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.modelName}</TableCell>
                    <TableCell>{model.year || '-'}</TableCell>
                    <TableCell>{model.engineType || '-'}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {model.refrigerantType}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-primary-600">
                      {model.fillAmount}
                    </TableCell>
                    <TableCell>
                      {model.oilType && model.oilAmount
                        ? `${model.oilType} / ${model.oilAmount}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {model.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteDialog({
                          open: true,
                          modelId: model.id,
                          modelName: model.modelName,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {models.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">尚無車型資料</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除"
        description={`您確定要刪除車型「${deleteDialog.modelName}」嗎？`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />
    </div>
  )
} 