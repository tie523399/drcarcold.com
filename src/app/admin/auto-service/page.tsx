'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'

interface ServiceStatus {
  isRunning: boolean
  config: {
    crawlerEnabled: boolean
    crawlerInterval: number
    seoGeneratorEnabled: boolean
    seoGeneratorInterval: number
    seoGeneratorCount: number
    maxArticleCount: number
    cleanupInterval: number
    minViewCountToKeep: number
    autoScheduleEnabled?: boolean
  }
  services: {
    crawler: {
      enabled: boolean
      running: boolean
      interval: string
    }
    seoGenerator: {
      enabled: boolean
      running: boolean
      interval: string
    }
    cleanup: {
      enabled: boolean
      running: boolean
      interval: string
    }
  }
  statistics: {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    maxArticleCount: number
    articlesNeedCleanup: number
  }
}

export default function AutoServicePage() {
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<any>(null)
  const [config, setConfig] = useState<{
    crawlerInterval: number
    seoGeneratorInterval: number
    seoGeneratorCount: number
    maxArticleCount: number
    cleanupInterval: number
    autoScheduleEnabled: boolean
  }>({
    crawlerInterval: 240, // 調整為4小時，節省花費
    seoGeneratorInterval: 720, // 調整為12小時
    seoGeneratorCount: 1, // 降低每次生成數量
    maxArticleCount: 15, // 降低文章上限
    cleanupInterval: 180, // 調整為3小時
    autoScheduleEnabled: false
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/auto-service?action=status')
      const result = await response.json()
      
      if (result.success) {
        setStatus(result.data)
        setConfig({
          crawlerInterval: result.data.config.crawlerInterval || 240,
          seoGeneratorInterval: result.data.config.seoGeneratorInterval || 720,
          seoGeneratorCount: result.data.config.seoGeneratorCount || 1,
          maxArticleCount: result.data.config.maxArticleCount || 15,
          cleanupInterval: result.data.config.cleanupInterval || 180,
          autoScheduleEnabled: result.data.config.autoScheduleEnabled || false
        })
      }
    } catch (error) {
      console.error('獲取狀態失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const executeAction = async (action: string, configData?: any) => {
    setActionLoading(action)
    try {
      const response = await fetch('/api/auto-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          config: configData || config
        })
      })

      const result = await response.json()
      
      if (result.success) {
        if (action === 'test-full-workflow') {
          setTestResults(result.data)
          toast({
            title: '一鍵測試成功！',
            description: '工作流程測試完成，建議使用智能調度功能'
          })
        } else {
          toast({
            title: '操作成功',
            description: result.message
          })
        }
        
        await fetchStatus()
      } else {
        toast({
          title: '操作失敗',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '操作失敗',
        description: '請檢查網路連接',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const saveConfig = async (newConfig?: any) => {
    const configToSave = newConfig || config
    await executeAction('save-config', configToSave)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p>載入中...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-500">無法載入服務狀態</p>
          <Button onClick={fetchStatus} variant="default" className="mt-4">重新載入</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🚀 統一控制中心</h1>
        <div className="flex items-center gap-2">
          <Badge variant={status.isRunning ? 'default' : 'destructive'}>
            {status.isRunning ? '運行中' : '已停止'}
          </Badge>
          <Button onClick={fetchStatus} variant="outline" size="sm">
            刷新狀態
          </Button>
        </div>
      </div>

      {/* 一鍵測試系統 */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🎯 一鍵測試系統</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">完整工作流程測試</h3>
                <p className="text-sm text-gray-600 mt-1">
                  測試：爬取新聞 → AI改寫 → SEO優化 → 自動發布
                </p>
              </div>
              <Button
                onClick={() => executeAction('test-full-workflow')}
                disabled={!!actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading === 'test-full-workflow' ? '測試中...' : '🎯 開始一鍵測試'}
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white rounded-lg">
              <div className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
                <span>新聞爬取</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                <span className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
                <span>AI改寫</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-purple-100 rounded">
                <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
                <span>SEO優化</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-orange-100 rounded">
                <span className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</span>
                <span>自動發布</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 測試結果顯示 */}
      {testResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🎯 一鍵測試結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.steps?.map((step: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${step.success ? 'bg-green-500' : 'bg-red-500'}`}>
                    {step.success ? '✓' : '✗'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{step.step}</div>
                    <div className="text-sm text-gray-600">{step.message}</div>
                    {step.data && (
                      <div className="text-xs text-gray-500 mt-1">
                        {typeof step.data === 'object' ? JSON.stringify(step.data, null, 2) : step.data}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 一鍵測試成功後顯示時間配置提示 */}
            {testResults.success && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">⏰ 時間配置提示</h4>
                <p className="text-sm text-blue-700 mb-3">
                  測試成功！現在可以配置自動化時間間隔，讓系統定期執行上述流程。
                </p>
                <Button
                  onClick={() => executeAction('test-full-workflow')}
                  variant="outline"
                  size="sm"
                  disabled={!!actionLoading}
                >
                  再次測試
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 服務控制 */}
      <Card>
        <CardHeader>
          <CardTitle>🎛️ 服務控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => executeAction('start')}
              disabled={status.isRunning || !!actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading === 'start' ? '啟動中...' : '🚀 啟動所有服務'}
            </Button>
            
            <Button
              onClick={() => executeAction('stop')}
              disabled={!status.isRunning || !!actionLoading}
              variant="danger"
            >
              {actionLoading === 'stop' ? '停止中...' : '🛑 停止所有服務'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 服務狀態顯示 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🕷️ 爬蟲服務</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>狀態:</span>
                <Badge variant={status.services.crawler.running ? 'default' : 'secondary'}>
                  {status.services.crawler.running ? '運行中' : '已停止'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>間隔:</span>
                <span>{status.services.crawler.interval}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📝 SEO生成器</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>狀態:</span>
                <Badge variant={status.services.seoGenerator.running ? 'default' : 'secondary'}>
                  {status.services.seoGenerator.running ? '運行中' : '已停止'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>間隔:</span>
                <span>{status.services.seoGenerator.interval}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🧹 清理服務</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>狀態:</span>
                <Badge variant={status.services.cleanup.running ? 'default' : 'secondary'}>
                  {status.services.cleanup.running ? '運行中' : '已停止'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>間隔:</span>
                <span>{status.services.cleanup.interval}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 統計信息 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 統計信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{status.statistics.totalArticles}</div>
              <div className="text-sm text-gray-600">總文章數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.statistics.publishedArticles}</div>
              <div className="text-sm text-gray-600">已發布</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{status.statistics.draftArticles}</div>
              <div className="text-sm text-gray-600">草稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{status.statistics.maxArticleCount}</div>
              <div className="text-sm text-gray-600">文章上限</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{status.statistics.articlesNeedCleanup}</div>
              <div className="text-sm text-gray-600">待清理</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置設定 */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ 配置設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="crawlerInterval">🕷️ 爬蟲間隔 (分鐘)</Label>
                <Input
                  id="crawlerInterval"
                  type="number"
                  value={config.crawlerInterval}
                  onChange={(e) => setConfig({...config, crawlerInterval: parseInt(e.target.value) || 240})}
                  min="60"
                  max="1440"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoGeneratorInterval">📝 SEO生成間隔 (分鐘)</Label>
                <Input
                  id="seoGeneratorInterval"
                  type="number"
                  value={config.seoGeneratorInterval}
                  onChange={(e) => setConfig({...config, seoGeneratorInterval: parseInt(e.target.value) || 720})}
                  min="120"
                  max="1440"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seoGeneratorCount">📊 每次生成文章數量</Label>
                <Input
                  id="seoGeneratorCount"
                  type="number"
                  value={config.seoGeneratorCount}
                  onChange={(e) => setConfig({...config, seoGeneratorCount: parseInt(e.target.value) || 1})}
                  min="1"
                  max="5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxArticleCount">📄 文章數量上限</Label>
                <Input
                  id="maxArticleCount"
                  type="number"
                  value={config.maxArticleCount}
                  onChange={(e) => setConfig({...config, maxArticleCount: parseInt(e.target.value) || 15})}
                  min="5"
                  max="50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cleanupInterval">🧹 清理間隔 (分鐘)</Label>
                <Input
                  id="cleanupInterval"
                  type="number"
                  value={config.cleanupInterval}
                  onChange={(e) => setConfig({...config, cleanupInterval: parseInt(e.target.value) || 180})}
                  min="30"
                  max="1440"
                />
              </div>
            </div>
          </div>

          {/* 智能調度設置 */}
          <div className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoScheduleEnabled"
                  checked={config.autoScheduleEnabled}
                  onChange={(e) => setConfig({...config, autoScheduleEnabled: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="autoScheduleEnabled" className="text-lg font-semibold">
                  🤖 啟用智能調度
                </Label>
              </div>
              <Badge variant={config.autoScheduleEnabled ? "default" : "secondary"}>
                {config.autoScheduleEnabled ? "已啟用" : "已停用"}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>✅ 智能調度將根據AI API使用限制自動調整執行時間</p>
              <p>💰 優化API調用頻率，最大化利用免費額度</p>
              <p>⏰ 避開API高峰期，提升成功率</p>
              {config.autoScheduleEnabled && (
                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                  <p className="font-medium text-blue-800">智能調度已啟用</p>
                  <p className="text-blue-700 text-xs mt-1">
                    系統將根據API使用情況自動調整間隔時間，優化成本效益
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={() => saveConfig()} disabled={!!actionLoading}>
              {actionLoading === 'save-config' ? '保存中...' : '💾 保存配置'}
            </Button>
            
            <Button onClick={() => executeAction('restart')} disabled={!!actionLoading} variant="outline">
              {actionLoading === 'restart' ? '重啟中...' : '🔄 重啟服務'}
            </Button>
          </div>

          {/* 時間配置預覽 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">⏰ 時間配置預覽</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">爬蟲執行:</span>
                  <span className="font-medium">每 {config.crawlerInterval} 分鐘</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">SEO生成:</span>
                  <span className="font-medium">每 {config.seoGeneratorInterval} 分鐘，{config.seoGeneratorCount} 篇文章</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">文章清理:</span>
                  <span className="font-medium">每 {config.cleanupInterval} 分鐘</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">每日爬取次數:</span>
                  <span className="font-medium">{Math.floor(1440 / config.crawlerInterval)} 次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">每日SEO生成:</span>
                  <span className="font-medium">{Math.floor(1440 / config.seoGeneratorInterval) * config.seoGeneratorCount} 篇</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">文章上限:</span>
                  <span className="font-medium">{config.maxArticleCount} 篇</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
  )
} 

