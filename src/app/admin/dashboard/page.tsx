'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity, 
  Bot, 
  Clock, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface SystemStatus {
  crawler: {
    isRunning: boolean
    totalSources: number
    activeSources: number
    lastUpdate?: string
  }
  publisher: {
    isRunning: boolean
    todayPublished: number
    yesterdayPublished: number
    totalPublished: number
    draftCount: number
    scheduleCount: number
  }
  articles: {
    total: number
    published: number
    drafts: number
    thisWeek: number
    today?: number // Added for new_code
  }
  newsCleanup: {
    totalPublishedNews: number
    needsCleanup: boolean
    topNewsByTraffic: Array<{ title: string; viewCount: number; publishedAt: Date }>
    lastCleanupDate?: string
    lastCleanupCount?: number
  }
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchSystemStatus()
    
    // 每30秒自動刷新
    const interval = setInterval(fetchSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      const [crawlerRes, publisherRes, articlesRes] = await Promise.all([
        fetch('/api/auto-crawler'),
        fetch('/api/scheduled-publisher'),
        fetch('/api/admin/articles/stats')
      ])

      const [crawlerData, publisherData, articlesData] = await Promise.all([
        crawlerRes.json(),
        publisherRes.json(),
        articlesRes.json()
      ])

      // 從文章統計中獲取新聞清理資訊
      const publishedNewsCount = articlesData.data?.published || 0
      
      setStatus({
        crawler: crawlerData.data || { isRunning: false, totalSources: 0, activeSources: 0 },
        publisher: publisherData.data || { 
          isRunning: false, 
          todayPublished: 0, 
          yesterdayPublished: 0, 
          totalPublished: 0, 
          draftCount: 0, 
          scheduleCount: 0 
        },
        articles: articlesData.data || { total: 0, published: 0, drafts: 0, thisWeek: 0 },
        newsCleanup: {
          totalPublishedNews: publishedNewsCount,
          needsCleanup: publishedNewsCount > 20,
          topNewsByTraffic: [],
          lastCleanupDate: undefined,
          lastCleanupCount: 0
        }
      })
      
      setLastRefresh(new Date())
    } catch (error) {
      console.error('獲取系統狀態失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublisherControl = async (action: 'start' | 'stop') => {
    try {
      const response = await fetch('/api/scheduled-publisher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        await fetchSystemStatus()
      } else {
        throw new Error('操作失敗')
      }
    } catch (error) {
      console.error('發布控制失敗:', error)
      alert('操作時發生錯誤')
    }
  }

  const handleManualPublish = async () => {
    try {
      const response = await fetch('/api/scheduled-publisher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual-publish' })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        await fetchSystemStatus()
      } else {
        throw new Error('發布失敗')
      }
    } catch (error) {
      console.error('手動發布失敗:', error)
      alert('發布時發生錯誤')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>載入系統狀態中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">管理儀表板</h1>
          <p className="text-gray-600 mt-2">
            自動化系統狀態監控 · 最後更新: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchSystemStatus} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 系統狀態總覽 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">自動爬蟲</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {status?.crawler.activeSources || 0}/{status?.crawler.totalSources || 0}
                </div>
                <p className="text-xs text-muted-foreground">活躍來源</p>
              </div>
              <div className="flex items-center gap-2">
                {status?.crawler.isRunning ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm">
                  {status?.crawler.isRunning ? '運行中' : '已停止'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">定時發布</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {status?.publisher.todayPublished || 0}
                </div>
                <p className="text-xs text-muted-foreground">今日發布</p>
              </div>
              <div className="flex items-center gap-2">
                {status?.publisher.isRunning ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm">
                  {status?.publisher.isRunning ? '運行中' : '已停止'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">文章統計</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {status?.articles.total || 0}
                </div>
                <p className="text-xs text-muted-foreground">總文章數</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-green-600">
                  {status?.articles.published || 0} 已發布
                </div>
                <div className="text-xs text-gray-500">
                  {status?.articles.drafts || 0} 草稿
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 新聞清理狀態 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">智能新聞清理</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {status?.newsCleanup.totalPublishedNews || 0}/20
                </div>
                <p className="text-xs text-muted-foreground">已發布新聞</p>
              </div>
              <div className="flex items-center gap-2">
                {status?.newsCleanup.needsCleanup ? (
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-sm">
                  {status?.newsCleanup.needsCleanup ? '需要清理' : '狀態正常'}
                </span>
              </div>
            </div>
            {status?.newsCleanup.lastCleanupDate && (
              <div className="mt-2 text-xs text-gray-500">
                上次清理：{status.newsCleanup.lastCleanupDate} 
                (刪除 {status.newsCleanup.lastCleanupCount} 篇)
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 系統控制面板 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 爬蟲控制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              新聞爬蟲系統
            </CardTitle>
            <CardDescription>
              查看爬蟲系統運行狀態
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">系統狀態</div>
                <div className="text-sm text-gray-500">
                  {status?.crawler.isRunning ? '正在監控新聞來源' : '系統已停止'}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                status?.crawler.isRunning 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {status?.crawler.isRunning ? '運行中' : '已停止'}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">新聞來源：</span>
                <span className="font-medium">{status?.crawler.activeSources || 0}</span>
              </div>
              <div>
                <span className="text-gray-500">今日文章：</span>
                <span className="font-medium">{status?.articles.today || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Link href="/admin/auto-service">
                <Button variant="premium" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  自動化服務管理
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 發布控制 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              定時發布控制
            </CardTitle>
            <CardDescription>
              管理文章自動發布系統
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">發布狀態</div>
                <div className="text-sm text-gray-500">
                  {status?.publisher.isRunning ? '定時發布已啟用' : '定時發布已停用'}
                </div>
              </div>
              <Button
                onClick={() => handlePublisherControl(status?.publisher.isRunning ? 'stop' : 'start')}
                variant={status?.publisher.isRunning ? 'danger' : 'default'}
                size="sm"
              >
                {status?.publisher.isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    停止
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    啟動
                  </>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">今日發布:</span>
                  <span className="ml-2 font-medium">{status?.publisher.todayPublished || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">待發布:</span>
                  <span className="ml-2 font-medium">{status?.publisher.draftCount || 0}</span>
                </div>
              </div>
              
              <Button 
                onClick={handleManualPublish}
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={!status?.publisher.draftCount}
              >
                立即發布草稿
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細統計 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              發布統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">今日發布</span>
                <span className="font-medium">{status?.publisher.todayPublished || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">昨日發布</span>
                <span className="font-medium">{status?.publisher.yesterdayPublished || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">總發布數</span>
                <span className="font-medium">{status?.publisher.totalPublished || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">排程數量</span>
                <span className="font-medium">{status?.publisher.scheduleCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              文章狀態
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">總文章數</span>
                <span className="font-medium">{status?.articles.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">已發布</span>
                <span className="font-medium text-green-600">{status?.articles.published || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">草稿</span>
                <span className="font-medium text-orange-600">{status?.articles.drafts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">本週新增</span>
                <span className="font-medium">{status?.articles.thisWeek || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              系統健康度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">爬蟲系統</span>
                <div className="flex items-center gap-2">
                  {status?.crawler.isRunning ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {status?.crawler.isRunning ? '正常' : '停止'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">發布系統</span>
                <div className="flex items-center gap-2">
                  {status?.publisher.isRunning ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {status?.publisher.isRunning ? '正常' : '停止'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">待處理任務</span>
                <span className="text-sm font-medium">
                  {status?.publisher.draftCount || 0} 篇草稿
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 