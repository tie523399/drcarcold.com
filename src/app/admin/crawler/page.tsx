'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Clock, 
  Globe, 
  Bug,
  Loader2,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react'

interface CrawlerStatus {
  isRunning: boolean
  totalSources: number
  activeSources: number
  lastCrawl: string
  status: string
}

interface NewsSource {
  id: string
  name: string
  url: string
  enabled: boolean
  lastCrawl?: string
  status: string
}

interface CrawlerStats {
  todayArticles: number
  successRate: number
}

export default function CrawlerManagementPage() {
  const [status, setStatus] = useState<CrawlerStatus | null>(null)
  const [sources, setSources] = useState<NewsSource[]>([])
  const [stats, setStats] = useState<CrawlerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [testUrl, setTestUrl] = useState('')
  const [testResult, setTestResult] = useState<any>(null)
  const [testLoading, setTestLoading] = useState(false)

  // 載入所有數據
  const loadData = async () => {
    try {
      // 獲取爬蟲狀態
      const statusRes = await fetch('/api/auto-crawler')
      const statusData = await statusRes.json()
      if (statusData.success) {
        setStatus(statusData.data)
      }

      // 獲取新聞來源
      const sourcesRes = await fetch('/api/news-sources')
      const sourcesData = await sourcesRes.json()
      setSources(sourcesData || [])

      // 獲取統計資料
      const statsRes = await fetch('/api/admin/articles/stats')
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (error) {
      console.error('載入資料失敗:', error)
    }
  }

  useEffect(() => {
    loadData()
    // 每 10 秒刷新一次狀態
    const interval = setInterval(loadData, 10000)
    return () => clearInterval(interval)
  }, [])

  // 測試爬取
  const handleTestCrawl = async () => {
    if (!testUrl) {
      alert('請輸入測試 URL')
      return
    }

    setTestLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/test-crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl }),
      })

      const data = await response.json()

      if (data.success) {
        setTestResult(data.data)
      } else {
        alert(`測試失敗: ${data.error}`)
      }
    } catch (error) {
      alert(`測試錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`)
    } finally {
      setTestLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">爬蟲監控中心</h1>
          <p className="text-gray-600 mt-2">監控新聞爬蟲系統狀態和來源</p>
        </div>
        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          重新整理
        </Button>
      </div>

      {/* 重要提示：統一控制 */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">🚀 一鍵測試已整合</h3>
                <p className="text-blue-700 text-sm">
                  所有爬蟲功能已整合到統一控制中心，支援一鍵測試：爬取→AI改寫→SEO優化→自動發布
                </p>
              </div>
            </div>
            <Link href="/admin/auto-service">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                🎯 前往統一控制中心
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 系統狀態概覽 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${status?.isRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
              <h3 className="font-semibold">運行狀態</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {status?.isRunning ? '運行中' : '已停止'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {status?.isRunning ? '正在監控新聞來源' : '系統已停止'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold">新聞來源</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {status?.activeSources || 0} / {status?.totalSources || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              啟用 / 總數
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <h3 className="font-semibold">今日文章</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {stats?.todayArticles || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              已爬取並處理
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold">最後爬取</h3>
            </div>
            <p className="text-sm font-medium mt-2">
              {status?.lastCrawl ? new Date(status.lastCrawl).toLocaleString('zh-TW') : '尚未爬取'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              由自動化服務控制
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sources">新聞來源</TabsTrigger>
          <TabsTrigger value="test">測試工具</TabsTrigger>
          <TabsTrigger value="settings">設定</TabsTrigger>
        </TabsList>

        {/* 新聞來源 */}
        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                新聞來源管理
              </CardTitle>
              <CardDescription>
                管理爬蟲監控的新聞來源
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.length > 0 ? (
                  <div className="grid gap-4">
                    {sources.map((source) => (
                      <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${source.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <div>
                            <h4 className="font-medium">{source.name}</h4>
                            <p className="text-sm text-gray-500">{source.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={source.enabled ? 'default' : 'secondary'}>
                            {source.enabled ? '啟用' : '停用'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {source.lastCrawl ? new Date(source.lastCrawl).toLocaleDateString() : '未爬取'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    尚未設定任何新聞來源
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <Link href="/admin/news-sources">
                    <Button variant="premium">
                      <Settings className="mr-2 h-4 w-4" />
                      管理新聞來源
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 測試工具 */}
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                爬蟲測試工具
              </CardTitle>
              <CardDescription>
                測試單一 URL 的爬取效果
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="test-url">測試 URL</Label>
                  <Input
                    id="test-url"
                    type="url"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="https://example.com/news/article"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleTestCrawl}
                    disabled={testLoading}
                    variant="default"
                  >
                    {testLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        測試中
                      </>
                    ) : (
                      <>
                        <Bug className="mr-2 h-4 w-4" />
                        測試爬取
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-4">測試結果</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">標題：</span>
                      <p className="text-sm">{testResult.title || '無法擷取'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">摘要：</span>
                      <p className="text-sm">{testResult.excerpt || '無法擷取'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">作者：</span>
                      <p className="text-sm">{testResult.author || '無法擷取'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">內容長度：</span>
                      <p className="text-sm">{testResult.content?.length || 0} 字元</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 設定 */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                系統設定
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/auto-service">
                  <Button className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    自動化服務管理
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    進階系統設定
                  </Button>
                </Link>
                <Link href="/admin/news-sources">
                  <Button variant="outline" className="w-full">
                    <Globe className="mr-2 h-4 w-4" />
                    管理新聞來源
                  </Button>
                </Link>
                <Link href="/admin/news">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    新聞管理
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 