'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, Globe, Settings, Activity } from 'lucide-react'
import { NewsSource } from '@/lib/auto-news-crawler'

interface NewsSourceConfig extends NewsSource {
  // 擴展屬性，用於表單顯示
  baseUrl?: string
  listPageUrl?: string
  listSelector?: string
  linkSelector?: string
  isActive?: boolean
}

export default function NewsSourcesPage() {
  const [sources, setSources] = useState<NewsSourceConfig[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSource, setEditingSource] = useState<NewsSourceConfig | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [crawlStats, setCrawlStats] = useState<any>(null)

  useEffect(() => {
    fetchSources()
    fetchCrawlStats()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/news-sources')
      if (response.ok) {
        const data = await response.json()
        setSources(data)
      }
    } catch (error) {
      console.error('獲取新聞來源失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCrawlStats = async () => {
    try {
      const response = await fetch('/api/auto-crawler')
      if (response.ok) {
        const data = await response.json()
        setCrawlStats(data.data)
      }
    } catch (error) {
      console.error('獲取爬蟲統計失敗:', error)
    }
  }

  const handleSave = async (sourceData: Partial<NewsSourceConfig>) => {
    try {
      const url = editingSource 
        ? `/api/news-sources/${editingSource.id}`
        : '/api/news-sources'
      
      const method = editingSource ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceData),
      })

      if (response.ok) {
        await fetchSources()
        setShowForm(false)
        setEditingSource(null)
        alert(editingSource ? '新聞來源已更新' : '新聞來源已添加')
      } else {
        throw new Error('儲存失敗')
      }
    } catch (error) {
      console.error('儲存新聞來源失敗:', error)
      alert('儲存時發生錯誤')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個新聞來源嗎？')) return

    try {
      const response = await fetch(`/api/news-sources/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSources()
        alert('新聞來源已刪除')
      } else {
        throw new Error('刪除失敗')
      }
    } catch (error) {
      console.error('刪除新聞來源失敗:', error)
      alert('刪除時發生錯誤')
    }
  }

  const handleEdit = (source: NewsSourceConfig) => {
    setEditingSource(source)
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingSource(null)
    setShowForm(true)
  }



  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新聞來源管理</h1>
          <p className="text-gray-600 mt-2">管理自動爬取的新聞網站來源</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          新增來源
        </Button>
      </div>

      {/* 爬蟲狀態 */}
      {crawlStats && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              爬蟲狀態
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {crawlStats.totalSources}
                </div>
                <div className="text-sm text-gray-500">總來源數</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {crawlStats.activeSources}
                </div>
                <div className="text-sm text-gray-500">啟用來源</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${crawlStats.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                  {crawlStats.isRunning ? '運行中' : '已停止'}
                </div>
                <div className="text-sm text-gray-500">爬蟲狀態</div>
              </div>
                            <div className="text-center">
                <Link href="/admin/auto-service">
                  <Button variant="outline" size="sm">
                    統一控制
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 新聞來源列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <Card key={source.id} className={`${source.enabled ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {source.name}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(source)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {source.url}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">狀態:</span>
                  <span className={`font-medium ${source.enabled ? 'text-green-600' : 'text-red-600'}`}>
                    {source.enabled ? '啟用' : '停用'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">間隔:</span>
                  <span>{source.crawlInterval}分鐘</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">每次抓取:</span>
                  <span>{source.maxArticlesPerCrawl}篇</span>
                </div>
                {source.lastCrawl && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">上次爬取:</span>
                    <span>{new Date(source.lastCrawl).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 表單彈窗 */}
      {showForm && (
        <NewsSourceForm
          source={editingSource}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false)
            setEditingSource(null)
          }}
        />
      )}
    </div>
  )
}

// 新聞來源表單組件
interface NewsSourceFormProps {
  source: NewsSourceConfig | null
  onSave: (data: Partial<NewsSourceConfig>) => void
  onCancel: () => void
}

function NewsSourceForm({ source, onSave, onCancel }: NewsSourceFormProps) {
  const [formData, setFormData] = useState({
    name: source?.name || '',
    baseUrl: source?.baseUrl || '',
    listPageUrl: source?.url || '',
    listSelector: source?.selectors?.articleLinks || '.article',
    linkSelector: source?.linkSelector || 'a',
    isActive: source?.enabled ?? true,
    crawlInterval: source?.crawlInterval || 60,
    maxArticlesPerCrawl: source?.maxArticlesPerCrawl || 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.listPageUrl) {
      alert('請填寫必要欄位')
      return
    }
    onSave(formData)
  }

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {source ? '編輯新聞來源' : '新增新聞來源'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                來源名稱 *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例如：BBC News"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                基礎網址
              </label>
              <Input
                value={formData.baseUrl}
                onChange={(e) => handleChange('baseUrl', e.target.value)}
                placeholder="https://www.bbc.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                列表頁網址 *
              </label>
              <Input
                value={formData.listPageUrl}
                onChange={(e) => handleChange('listPageUrl', e.target.value)}
                placeholder="https://www.bbc.com/news"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                文章列表選擇器
              </label>
              <Input
                value={formData.listSelector}
                onChange={(e) => handleChange('listSelector', e.target.value)}
                placeholder=".article"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                連結選擇器
              </label>
              <Input
                value={formData.linkSelector}
                onChange={(e) => handleChange('linkSelector', e.target.value)}
                placeholder="a"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  爬取間隔（分鐘）
                </label>
                <Input
                  type="number"
                  value={formData.crawlInterval}
                  onChange={(e) => handleChange('crawlInterval', parseInt(e.target.value))}
                  min="15"
                  max="1440"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  每次抓取篇數
                </label>
                <Input
                  type="number"
                  value={formData.maxArticlesPerCrawl}
                  onChange={(e) => handleChange('maxArticlesPerCrawl', parseInt(e.target.value))}
                  min="1"
                  max="20"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm font-medium">啟用此來源</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
              <Button type="submit">
                {source ? '更新' : '新增'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 