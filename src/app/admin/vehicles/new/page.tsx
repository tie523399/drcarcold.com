'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft } from 'lucide-react'

export default function NewVehicleBrandPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    category: 'regular',
    order: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.nameEn) {
      alert('請填寫所有必填欄位')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/vehicle-brands', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin/vehicles')
        router.refresh()
      } else {
        alert('新增失敗')
      }
    } catch (error) {
      console.error('Error creating brand:', error)
      alert('新增時發生錯誤')
    } finally {
      setIsLoading(false)
    }
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

      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">新增車輛品牌</h1>
        
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>品牌資訊</CardTitle>
              <CardDescription>請填寫車輛品牌的基本資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  品牌名稱（中文） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：豐田"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  品牌名稱（英文） <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="例如：TOYOTA"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  類別 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="regular">一般車輛</option>
                  <option value="truck">大型車輛</option>
                  <option value="malaysia">馬來西亞車</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  排序權重
                </label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-gray-500 mt-1">數字越小排序越前面</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '新增中...' : '新增品牌'}
            </Button>
            <Link href="/admin/vehicles">
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 