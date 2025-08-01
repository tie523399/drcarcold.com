'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Save, Plus, Edit2, Trash2, Building2, Sparkles, Calendar } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'features' | 'milestones'>('company')
  const { toast } = useToast()

  const tabs = [
    { id: 'company' as const, label: '公司資訊', icon: Building2 },
    { id: 'features' as const, label: '功能特點', icon: Sparkles },
    { id: 'milestones' as const, label: '里程碑', icon: Calendar },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">內容管理</h1>
        <p className="text-gray-600 mt-2">管理網站內容，優化 SEO 表現</p>
      </div>

      {/* 標籤頁切換 */}
      <div className="flex space-x-1 mb-6 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 內容區域 */}
      {activeTab === 'company' && <CompanyInfoTab />}
      {activeTab === 'features' && <FeaturesTab />}
      {activeTab === 'milestones' && <MilestonesTab />}
    </div>
  )
}

// 公司資訊標籤頁
function CompanyInfoTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchCompanyInfo()
  }, [])

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/company-info')
      const data = await response.json()
      reset(data)
    } catch (error) {
      console.error('Error fetching company info:', error)
      toast({
        title: '錯誤',
        description: '載入公司資訊失敗',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: any) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/company-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: '成功',
          description: '公司資訊已更新',
        })
      } else {
        throw new Error('更新失敗')
      }
    } catch (error) {
      console.error('Error updating company info:', error)
      toast({
        title: '錯誤',
        description: '更新公司資訊失敗',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div>載入中...</div>

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>公司基本資訊</CardTitle>
          <CardDescription>這些資訊會顯示在網站的頁尾和聯絡頁面</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">公司名稱（中文）</label>
              <Input {...register('companyName', { required: '請輸入公司名稱' })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">公司名稱（英文）</label>
              <Input {...register('companyNameEn')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">聯絡電話</label>
              <Input {...register('phone', { required: '請輸入聯絡電話' })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">24小時緊急專線</label>
              <Input {...register('emergencyPhone')} placeholder="例：+886-9-1234-5678" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">傳真號碼</label>
              <Input {...register('fax')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Line ID</label>
              <Input {...register('lineId')} placeholder="例：0903049150" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Line 連結</label>
            <Input {...register('lineUrl')} placeholder="例：https://line.me/ti/p/0903049150" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">電子郵件</label>
            <Input {...register('email', { required: '請輸入電子郵件' })} type="email" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">公司地址（中文）</label>
            <Input {...register('address', { required: '請輸入公司地址' })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">公司地址（英文）</label>
            <Input {...register('addressEn')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">緯度</label>
              <Input {...register('latitude')} type="number" step="any" placeholder="例：24.2633" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">經度</label>
              <Input {...register('longitude')} type="number" step="any" placeholder="例：120.5431" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">營業時間（中文）</label>
              <Input {...register('businessHours')} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">營業時間（英文）</label>
              <Input {...register('businessHoursEn')} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">緊急服務說明</label>
            <Input {...register('emergencyService')} placeholder="例：24小時緊急服務" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">服務區域 (JSON格式)</label>
            <textarea 
              {...register('serviceAreas')}
              className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
              placeholder='例：[{"name":"台北市","coverage":"100%","response":"30分鐘"},{"name":"新北市","coverage":"95%","response":"45分鐘"}]'
            />
            <p className="text-xs text-gray-500 mt-1">請輸入JSON格式的服務區域資料</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <Input {...register('facebook')} placeholder="Facebook 粉絲頁網址" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input {...register('instagram')} placeholder="Instagram 帳號網址" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <Input {...register('youtube')} placeholder="YouTube 頻道網址" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">網站網址</label>
            <Input {...register('website')} placeholder="例：https://drcarcold.com" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">公司簡介（中文）</label>
            <textarea
              {...register('description')}
              rows={4}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">公司簡介（英文）</label>
            <textarea
              {...register('descriptionEn')}
              rows={4}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-6">
        <Button type="submit" loading={isSaving} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          儲存變更
        </Button>
      </div>
    </form>
  )
}

// 功能特點標籤頁 - 簡化版本，稍後會建立完整的組件
function FeaturesTab() {
  return <div>功能特點管理功能開發中...</div>
}

// 里程碑標籤頁 - 簡化版本，稍後會建立完整的組件  
function MilestonesTab() {
  return <div>里程碑管理功能開發中...</div>
}