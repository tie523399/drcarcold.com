'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Brain, 
  RefreshCw, 
  Zap, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Settings,
  TrendingUp,
  Shield
} from 'lucide-react'

interface SmartScheduleConfig {
  crawlerInterval: number
  seoGeneratorInterval: number
  seoGeneratorCount: number
  maxArticleCount: number
  cleanupInterval: number
  lastOptimized: string
  activeProvider: string
  backupProviders: string[]
}

interface APIUsageReport {
  [provider: string]: {
    name: string
    used: number
    available: number
    total: number
    successRate: string
    canCall: boolean
  }
}

export default function SmartSchedulePage() {
  const [loading, setLoading] = useState(false)
  const [smartSchedule, setSmartSchedule] = useState<SmartScheduleConfig | null>(null)
  const [apiUsageReport, setApiUsageReport] = useState<APIUsageReport | null>(null)
  const [autoScheduleEnabled, setAutoScheduleEnabled] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    await Promise.all([
      loadSmartSchedule(),
      loadApiUsageReport()
    ])
  }

  const loadSmartSchedule = async () => {
    try {
      const response = await fetch('/api/smart-schedule?action=config')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setSmartSchedule(data.data)
          setAutoScheduleEnabled(true)
        }
      }
    } catch (error) {
      console.error('載入智能調度配置失敗:', error)
    }
  }

  const loadApiUsageReport = async () => {
    try {
      const response = await fetch('/api/smart-schedule?action=usage-report')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApiUsageReport(data.data)
        }
      }
    } catch (error) {
      console.error('載入API使用報告失敗:', error)
    }
  }

  const optimizeSmartSchedule = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimize' })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSmartSchedule(data.data)
          setAutoScheduleEnabled(true)
          await loadApiUsageReport()
          
          toast({
            title: '🧠 智能調度優化完成',
            description: `已根據API限制自動調整時間間隔，主要使用: ${data.data.activeProvider}`
          })
        }
      }
    } catch (error) {
      console.error('智能調度優化失敗:', error)
      toast({
        title: '優化失敗',
        description: '無法進行智能調度優化',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resetCounters = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-counters' })
      })

      if (response.ok) {
        toast({
          title: '✅ 計數器重置成功',
          description: '所有API使用量計數器已重置'
        })
        await loadApiUsageReport()
      }
    } catch (error) {
      toast({
        title: '重置失敗',
        description: '無法重置計數器',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const applyScheduleToAutoService = async () => {
    if (!smartSchedule) return

    try {
      setLoading(true)
      
      // 應用配置到自動服務
      const response = await fetch('/api/auto-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-smart-schedule',
          config: {
            crawlerInterval: smartSchedule.crawlerInterval,
            seoGeneratorInterval: smartSchedule.seoGeneratorInterval,
            seoGeneratorCount: smartSchedule.seoGeneratorCount,
            maxArticleCount: smartSchedule.maxArticleCount,
            cleanupInterval: smartSchedule.cleanupInterval
          }
        })
      })

      if (response.ok) {
        toast({
          title: '✅ 智能調度已應用',
          description: '配置已成功應用到自動服務系統'
        })
      }
    } catch (error) {
      toast({
        title: '應用失敗',
        description: '無法應用智能調度配置',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getProviderStatusColor = (canCall: boolean, used: number, total: number) => {
    if (!canCall) return 'bg-red-500'
    if (used / total > 0.8) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProviderStatusText = (canCall: boolean, used: number, total: number) => {
    if (!canCall) return '已超限'
    if (used / total > 0.8) return '接近限制'
    return '正常'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            智能API調度系統
          </h1>
          <p className="text-gray-600 mt-2">
            根據不同AI服務的免費額度限制，自動調整時間間隔，避免API調用失敗
          </p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          重新整理
        </Button>
      </div>

      {/* 主控制區 */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-5 w-5" />
            智能調度控制中心
          </CardTitle>
          <CardDescription className="text-blue-600">
            一鍵優化時間間隔，確保API調用成功率最大化
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={optimizeSmartSchedule}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4" />
              {loading ? '優化中...' : '🧠 開始智能優化'}
            </Button>
            
            <Button
              onClick={resetCounters}
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重置計數器
            </Button>

            {smartSchedule && (
              <Button
                onClick={applyScheduleToAutoService}
                variant="default"
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Settings className="h-4 w-4" />
                應用到自動服務
              </Button>
            )}
          </div>

          {smartSchedule && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">主要AI服務</span>
                </div>
                <div className="text-lg font-bold text-blue-600">{smartSchedule.activeProvider}</div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-gray-700">備用服務</span>
                </div>
                <div className="text-sm text-gray-600">
                  {smartSchedule.backupProviders?.length > 0 
                    ? smartSchedule.backupProviders.join(', ') 
                    : '無備用服務'
                  }
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-gray-700">最後優化</span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(smartSchedule.lastOptimized).toLocaleString('zh-TW')}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 智能調度配置顯示 */}
      {smartSchedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              智能調度配置
            </CardTitle>
            <CardDescription>
              系統根據API限制自動計算的最佳時間間隔
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">🕷️ 爬蟲間隔</Label>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {smartSchedule.crawlerInterval} 分鐘
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  每 {(smartSchedule.crawlerInterval / 60).toFixed(1)} 小時執行一次
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">📝 SEO生成間隔</Label>
                <div className="text-2xl font-bold text-purple-600 mt-1">
                  {smartSchedule.seoGeneratorInterval} 分鐘
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  每次生成 {smartSchedule.seoGeneratorCount} 篇文章
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">📊 每日限制</Label>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {smartSchedule.maxArticleCount} 篇
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  避免超出API每日限制
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* API使用量監控 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            API使用量監控
          </CardTitle>
          <CardDescription>
            今日各AI服務的使用量和剩餘額度
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!apiUsageReport ? (
            <div className="text-center py-8">
              <div className="text-gray-500">載入使用量數據中...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(apiUsageReport).map(([provider, data]) => (
                <div key={provider} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">{data.name}</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${getProviderStatusColor(data.canCall, data.used, data.total)}`}
                      />
                      <span className={`text-xs px-2 py-1 rounded ${
                        data.canCall ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {getProviderStatusText(data.canCall, data.used, data.total)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">已使用:</span>
                      <span>{data.used} / {data.total}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">成功率:</span>
                      <span className={data.successRate === '100.0' ? 'text-green-600' : 'text-yellow-600'}>
                        {data.successRate}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          data.used / data.total > 0.8 ? 'bg-red-500' : 
                          data.used / data.total > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((data.used / data.total) * 100, 100)}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      剩餘: {data.available} 次調用
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用說明 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            智能調度說明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">🧠 智能調度如何工作：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>自動檢測您配置的所有AI API keys</li>
              <li>根據每個服務的免費額度限制計算最佳間隔</li>
              <li>優先使用免費額度最多的服務（如DeepSeek、Groq）</li>
              <li>當主要服務接近限制時自動切換到備用服務</li>
              <li>實時監控API使用量，避免超出限制</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">⚡ 使用建議：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>每天至少執行一次智能優化以獲得最佳效果</li>
              <li>配置多個AI服務作為備用，提高系統穩定性</li>
              <li>監控API使用量，適時手動重置計數器</li>
              <li>如果某個服務經常失敗，檢查API key是否正確</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
