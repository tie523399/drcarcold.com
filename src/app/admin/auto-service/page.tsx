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
  const [config, setConfig] = useState({
    crawlerInterval: 60,
    seoGeneratorInterval: 6,
    seoGeneratorCount: 2,
    maxArticleCount: 20,
    cleanupInterval: 1
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchStatus()
    // 每30秒自動刷新狀態
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
          crawlerInterval: result.data.config.crawlerInterval,
          seoGeneratorInterval: result.data.config.seoGeneratorInterval,
          seoGeneratorCount: result.data.config.seoGeneratorCount,
          maxArticleCount: result.data.config.maxArticleCount,
          cleanupInterval: result.data.config.cleanupInterval
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          config: configData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: '操作成功',
          description: result.message
        })
        
        if (action === 'cleanup-now' && result.data) {
          toast({
            title: '清理結果',
            description: `${result.data.message}`,
            variant: result.data.deletedArticles > 0 ? 'default' : 'default'
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
        description: '網路錯誤，請稍後再試',
        variant: 'destructive'
      })
    } finally {
      setActionLoading(null)
    }
  }

  const updateConfig = async () => {
    await executeAction('update-config', {
      crawlerInterval: config.crawlerInterval,
      seoGeneratorInterval: config.seoGeneratorInterval,
      seoGeneratorCount: config.seoGeneratorCount,
      maxArticleCount: config.maxArticleCount,
      cleanupInterval: config.cleanupInterval
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">載入中...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-red-500">無法載入服務狀態</p>
          <Button onClick={fetchStatus} className="mt-4">重新載入</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">自動化服務管理</h1>
        <div className="flex items-center gap-2">
          <Badge variant={status.isRunning ? 'default' : 'destructive'}>
            {status.isRunning ? '運行中' : '已停止'}
          </Badge>
          <Button onClick={fetchStatus} variant="outline" size="sm">
            刷新狀態
          </Button>
        </div>
      </div>

      {/* 服務控制 */}
      <Card>
        <CardHeader>
          <CardTitle>服務控制</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => executeAction('start')}
              disabled={status.isRunning || !!actionLoading}
              variant="default"
            >
              {actionLoading === 'start' ? '啟動中...' : '啟動服務'}
            </Button>
            <Button
              onClick={() => executeAction('stop')}
              disabled={!status.isRunning || !!actionLoading}
              variant="danger"
            >
              {actionLoading === 'stop' ? '停止中...' : '停止服務'}
            </Button>
            <Button
              onClick={() => executeAction('restart')}
              disabled={!!actionLoading}
              variant="outline"
            >
              {actionLoading === 'restart' ? '重啟中...' : '重新啟動'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 服務狀態 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🕷️ 爬蟲服務
              <Badge variant={status.services.crawler.running ? 'default' : 'secondary'}>
                {status.services.crawler.running ? '運行中' : '已停止'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>啟用:</strong> {status.services.crawler.enabled ? '是' : '否'}</p>
              <p><strong>間隔:</strong> {status.services.crawler.interval}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 SEO文章生成
              <Badge variant={status.services.seoGenerator.running ? 'default' : 'secondary'}>
                {status.services.seoGenerator.running ? '運行中' : '已停止'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>啟用:</strong> {status.services.seoGenerator.enabled ? '是' : '否'}</p>
              <p><strong>間隔:</strong> {status.services.seoGenerator.interval}</p>
              <p><strong>每次生成:</strong> {status.config.seoGeneratorCount} 篇</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🧹 自動清理
              <Badge variant={status.services.cleanup.running ? 'default' : 'secondary'}>
                {status.services.cleanup.running ? '運行中' : '已停止'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>啟用:</strong> {status.services.cleanup.enabled ? '是' : '否'}</p>
              <p><strong>間隔:</strong> {status.services.cleanup.interval}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 文章統計 */}
      <Card>
        <CardHeader>
          <CardTitle>文章統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{status.statistics.totalArticles}</div>
              <div className="text-sm text-gray-500">總文章數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{status.statistics.publishedArticles}</div>
              <div className="text-sm text-gray-500">已發布</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{status.statistics.draftArticles}</div>
              <div className="text-sm text-gray-500">草稿</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{status.statistics.maxArticleCount}</div>
              <div className="text-sm text-gray-500">上限</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${status.statistics.articlesNeedCleanup > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {status.statistics.articlesNeedCleanup}
              </div>
              <div className="text-sm text-gray-500">需清理</div>
            </div>
          </div>
          
          {status.statistics.articlesNeedCleanup > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <p className="text-yellow-800">
                  ⚠️ 文章數量已超過上限 {status.statistics.articlesNeedCleanup} 篇，建議執行清理
                </p>
                <Button
                  onClick={() => executeAction('cleanup-now')}
                  disabled={!!actionLoading}
                  variant="outline"
                  size="sm"
                >
                  {actionLoading === 'cleanup-now' ? '清理中...' : '立即清理'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置設定 */}
      <Card>
        <CardHeader>
          <CardTitle>配置設定</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="crawlerInterval">爬蟲間隔 (分鐘)</Label>
              <Input
                id="crawlerInterval"
                type="number"
                value={config.crawlerInterval}
                onChange={(e) => setConfig({...config, crawlerInterval: parseInt(e.target.value) || 60})}
                min="1"
                max="1440"
              />
            </div>
            
            <div>
              <Label htmlFor="seoGeneratorInterval">SEO文章生成間隔 (小時)</Label>
              <Input
                id="seoGeneratorInterval"
                type="number"
                value={config.seoGeneratorInterval}
                onChange={(e) => setConfig({...config, seoGeneratorInterval: parseInt(e.target.value) || 6})}
                min="1"
                max="168"
              />
            </div>
            
            <div>
              <Label htmlFor="seoGeneratorCount">每次生成文章數量</Label>
              <Input
                id="seoGeneratorCount"
                type="number"
                value={config.seoGeneratorCount}
                onChange={(e) => setConfig({...config, seoGeneratorCount: parseInt(e.target.value) || 2})}
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <Label htmlFor="maxArticleCount">最大文章數量</Label>
              <Input
                id="maxArticleCount"
                type="number"
                value={config.maxArticleCount}
                onChange={(e) => setConfig({...config, maxArticleCount: parseInt(e.target.value) || 20})}
                min="5"
                max="100"
              />
            </div>
            
            <div>
              <Label htmlFor="cleanupInterval">清理檢查間隔 (小時)</Label>
              <Input
                id="cleanupInterval"
                type="number"
                value={config.cleanupInterval}
                onChange={(e) => setConfig({...config, cleanupInterval: parseInt(e.target.value) || 1})}
                min="1"
                max="24"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button
              onClick={updateConfig}
              disabled={!!actionLoading}
            >
              {actionLoading === 'update-config' ? '更新中...' : '更新配置'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 