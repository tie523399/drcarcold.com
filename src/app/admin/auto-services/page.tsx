'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ServiceStatus {
  isRunning: boolean
  settings: {
    crawlerInterval: number
    seoGeneratorInterval: number
    maxArticleCount: number
    cleanupInterval: number
  }
  services: {
    crawler: {
      running: boolean
      interval: string
    }
    seoGenerator: {
      running: boolean
      interval: string
    }
    cleanup: {
      running: boolean
      interval: string
      maxArticles: number
    }
  }
}

export default function AutoServicesPage() {
  const [status, setStatus] = useState<ServiceStatus>({
    isRunning: false,
    settings: {
      crawlerInterval: 60,
      seoGeneratorInterval: 6,
      maxArticleCount: 20,
      cleanupInterval: 1
    },
    services: {
      crawler: { running: false, interval: '60 分鐘' },
      seoGenerator: { running: false, interval: '6 小時' },
      cleanup: { running: false, interval: '1 小時', maxArticles: 20 }
    }
  })
  const [loading, setLoading] = useState(false)
  const [articleCount, setArticleCount] = useState(0)
  const [settingsForm, setSettingsForm] = useState({
    crawlerInterval: 60,
    seoGeneratorInterval: 6,
    maxArticleCount: 20,
    cleanupInterval: 1
  })

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/auto-startup')
      const data = await response.json()
      
      if (data.success) {
        setStatus(data.status)
        setSettingsForm({
          crawlerInterval: data.status.settings.crawlerInterval,
          seoGeneratorInterval: data.status.settings.seoGeneratorInterval,
          maxArticleCount: data.status.settings.maxArticleCount,
          cleanupInterval: data.status.settings.cleanupInterval
        })
      }
    } catch (error) {
      console.error('獲取狀態失敗:', error)
    }
  }

  const fetchArticleCount = async () => {
    try {
      const response = await fetch('/api/news?admin=true')
      const data = await response.json()
      
      if (data.success && data.data) {
        const publishedArticles = data.data.filter((article: any) => article.isPublished)
        setArticleCount(publishedArticles.length)
      }
    } catch (error) {
      console.error('獲取文章數量失敗:', error)
    }
  }

  const controlService = async (action: 'start' | 'stop') => {
    setLoading(true)
    try {
      const response = await fetch('/api/auto-startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      const data = await response.json()
      
      if (data.success) {
        await fetchStatus()
        alert(data.message)
      } else {
        alert(data.error || '操作失敗')
      }
    } catch (error) {
      console.error('控制服務失敗:', error)
      alert('操作失敗')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async () => {
    setLoading(true)
    try {
      // 先保存設定到數據庫
      await Promise.all([
        updateSetting('crawlerInterval', settingsForm.crawlerInterval.toString()),
        updateSetting('seoGeneratorInterval', settingsForm.seoGeneratorInterval.toString()),
        updateSetting('maxArticleCount', settingsForm.maxArticleCount.toString()),
        updateSetting('cleanupInterval', settingsForm.cleanupInterval.toString())
      ])

      // 重新載入服務設定
      const reloadResponse = await fetch('/api/auto-startup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reload' }),
      })

      if (reloadResponse.ok) {
        await fetchStatus()
        alert('設定已更新並重新載入服務')
      } else {
        alert('設定保存成功，但重新載入服務失敗')
      }
    } catch (error) {
      console.error('更新設定失敗:', error)
      alert('更新設定失敗')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value }),
    })
    
    if (!response.ok) {
      throw new Error(`更新設定 ${key} 失敗`)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchArticleCount()
    
    // 每10秒更新一次狀態
    const interval = setInterval(() => {
      fetchStatus()
      fetchArticleCount()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">自動服務管理</h1>
        <p className="text-gray-600">
          管理爬蟲、SEO文章生成和文章清理的自動服務，可自訂時間間隔
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 服務狀態 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              服務狀態
            </CardTitle>
            <CardDescription>
              自動服務的運行狀態和時間間隔
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>總體狀態</span>
                <span className={`font-semibold ${status.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                  {status.isRunning ? '運行中' : '已停止'}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>🕷️ 自動爬蟲</span>
                  <div className="text-right">
                    <div className={`text-sm ${status.services.crawler.running ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.services.crawler.running ? '活躍' : '未啟動'}
                    </div>
                    <div className="text-xs text-gray-400">
                      間隔: {status.services.crawler.interval}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>🎯 SEO文章生成</span>
                  <div className="text-right">
                    <div className={`text-sm ${status.services.seoGenerator.running ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.services.seoGenerator.running ? '活躍' : '未啟動'}
                    </div>
                    <div className="text-xs text-gray-400">
                      間隔: {status.services.seoGenerator.interval}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>🧹 文章清理</span>
                  <div className="text-right">
                    <div className={`text-sm ${status.services.cleanup.running ? 'text-green-600' : 'text-gray-500'}`}>
                      {status.services.cleanup.running ? '活躍' : '未啟動'}
                    </div>
                    <div className="text-xs text-gray-400">
                      間隔: {status.services.cleanup.interval}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    onClick={() => controlService('start')}
                    disabled={loading || status.isRunning}
                    variant="default"
                    size="sm"
                  >
                    {loading ? '處理中...' : '啟動服務'}
                  </Button>
                  
                  <Button
                    onClick={() => controlService('stop')}
                    disabled={loading || !status.isRunning}
                    variant="danger"
                    size="sm"
                  >
                    {loading ? '處理中...' : '停止服務'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文章統計 */}
        <Card>
          <CardHeader>
            <CardTitle>文章統計</CardTitle>
            <CardDescription>
              當前文章數量和自動清理狀態
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{articleCount}</div>
                <div className="text-sm text-gray-500">已發布文章</div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">容量使用</span>
                  <span className="text-sm text-gray-600">{articleCount}/{status.services.cleanup.maxArticles}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      articleCount > status.services.cleanup.maxArticles - 2 ? 'bg-red-500' :
                      articleCount > status.services.cleanup.maxArticles - 5 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((articleCount / status.services.cleanup.maxArticles) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {articleCount >= status.services.cleanup.maxArticles && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-orange-800 text-sm">
                    ⚠️ 文章數量已達上限，系統將自動刪除低流量文章
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 時間間隔設定 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>時間間隔設定</CardTitle>
          <CardDescription>
            自訂各項自動服務的執行時間間隔
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="crawlerInterval">爬蟲間隔 (分鐘)</Label>
              <Input
                id="crawlerInterval"
                type="number"
                value={settingsForm.crawlerInterval}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  crawlerInterval: parseInt(e.target.value) || 60
                })}
                min="5"
                max="1440"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">建議: 30-120分鐘</p>
            </div>
            
            <div>
              <Label htmlFor="seoGeneratorInterval">SEO生成間隔 (小時)</Label>
              <Input
                id="seoGeneratorInterval"
                type="number"
                value={settingsForm.seoGeneratorInterval}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  seoGeneratorInterval: parseInt(e.target.value) || 6
                })}
                min="1"
                max="168"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">建議: 4-12小時</p>
            </div>
            
            <div>
              <Label htmlFor="maxArticleCount">文章上限</Label>
              <Input
                id="maxArticleCount"
                type="number"
                value={settingsForm.maxArticleCount}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  maxArticleCount: parseInt(e.target.value) || 20
                })}
                min="10"
                max="100"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">超過此數量將自動清理</p>
            </div>
            
            <div>
              <Label htmlFor="cleanupInterval">清理檢查間隔 (小時)</Label>
              <Input
                id="cleanupInterval"
                type="number"
                value={settingsForm.cleanupInterval}
                onChange={(e) => setSettingsForm({
                  ...settingsForm,
                  cleanupInterval: parseInt(e.target.value) || 1
                })}
                min="1"
                max="24"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">建議: 1-6小時</p>
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              onClick={updateSettings}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? '更新中...' : '保存設定並重新載入服務'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 服務說明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>服務說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">🕷️ 自動爬蟲</h4>
              <p className="text-sm text-gray-600">
                按設定時間間隔自動爬取新聞來源，抓取並處理新文章。支援5分鐘到24小時的間隔設定。
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">🎯 SEO文章生成</h4>
              <p className="text-sm text-gray-600">
                按設定時間間隔使用AI自動生成SEO優化的專業文章。支援1小時到7天的間隔設定。
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">🧹 文章清理</h4>
              <p className="text-sm text-gray-600">
                按設定時間間隔檢查文章數量，超過上限時自動刪除零流量文章。支援自訂文章上限。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 