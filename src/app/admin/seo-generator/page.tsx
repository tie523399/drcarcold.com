'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, FileText, TrendingUp, Calendar, Loader2, CheckCircle, AlertCircle, Key, Eye, EyeOff, Save } from 'lucide-react'

interface Article {
  id: number
  title: string
  slug: string
  excerpt: string
  publishedAt: string
}

interface Stats {
  totalSEOArticles: number
  publishedSEOArticles: number
  totalTopics: number
  usedTopics: number
  availableTopics: number
}

interface GeneratorResponse {
  success: boolean
  message?: string
  articles?: Article[]
  stats?: Stats
  error?: string
  details?: string
}

export default function SEOGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [generatedArticles, setGeneratedArticles] = useState<Article[]>([])
  const [generateCount, setGenerateCount] = useState(1)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // API Key 管理狀態
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  // 載入統計資訊和設定
  useEffect(() => {
    fetchStats()
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      const apiKeySetting = data.find((s: any) => s.key === 'cohere_api_key')
      const aiEnabledSetting = data.find((s: any) => s.key === 'ai_rewrite_enabled')
      
      if (apiKeySetting?.value) {
        setHasApiKey(true)
        setApiKey('') // 不顯示實際的 API Key
      }
      
      setAiEnabled(aiEnabledSetting?.value === 'true')
    } catch (error) {
      console.error('載入設定失敗:', error)
    }
  }

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/seo-generator')
      const data: GeneratorResponse = await response.json()
      
      if (data.success && data.stats) {
        setStats(data.stats)
      } else {
        setMessage({ type: 'error', text: data.error || '載入統計失敗' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '載入統計時發生錯誤' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (generateCount < 1 || generateCount > 10) {
      setMessage({ type: 'error', text: '生成數量必須在 1-10 之間' })
      return
    }

    setIsGenerating(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/seo-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: generateCount })
      })

      const data: GeneratorResponse = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message || '生成成功' })
        setGeneratedArticles(data.articles || [])
        if (data.stats) {
          setStats(data.stats)
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || '生成失敗' + (data.details ? `: ${data.details}` : '')
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '生成時發生錯誤' })
    } finally {
      setIsGenerating(false)
    }
  }

  const clearMessage = () => setMessage(null)

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: '請輸入 Cohere API Key' })
      return
    }

    setIsSavingApiKey(true)
    try {
      // 保存 API Key
      const apiKeyResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'cohere_api_key',
          value: apiKey.trim()
        })
      })

      // 啟用 AI 功能
      const aiResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'ai_rewrite_enabled',
          value: 'true'
        })
      })

      if (apiKeyResponse.ok && aiResponse.ok) {
        setMessage({ type: 'success', text: 'API Key 設定成功！AI 功能已啟用' })
        setHasApiKey(true)
        setAiEnabled(true)
        setApiKey('')
        setShowApiKey(false)
        // 重新載入統計
        fetchStats()
      } else {
        setMessage({ type: 'error', text: '設定失敗，請重試' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '設定時發生錯誤' })
    } finally {
      setIsSavingApiKey(false)
    }
  }

  const toggleAiEnabled = async () => {
    try {
      const newValue = !aiEnabled
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'ai_rewrite_enabled',
          value: newValue.toString()
        })
      })

      if (response.ok) {
        setAiEnabled(newValue)
        setMessage({ 
          type: 'success', 
          text: `AI 功能已${newValue ? '啟用' : '停用'}` 
        })
      } else {
        setMessage({ type: 'error', text: '設定失敗' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '設定時發生錯誤' })
    }
  }

  const testApiPerformance = async () => {
    if (!hasApiKey) {
      setMessage({ type: 'error', text: '請先設定 API Key' })
      return
    }

    setIsTesting(true)
    setTestResult(null)
    try {
      const response = await fetch('/api/seo-generator/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      setTestResult(data)
      
      if (data.success) {
        const status = data.performance.status
        const time = data.performance.apiResponseTime
        let statusText = ''
        
        if (status === 'good') {
          statusText = '🟢 良好'
        } else if (status === 'slow') {
          statusText = '🟡 較慢'
        } else {
          statusText = '🔴 很慢'
        }
        
        setMessage({ 
          type: 'success', 
          text: `API 測試完成！響應時間: ${time}ms (${statusText})` 
        })
      } else {
        setMessage({ 
          type: 'error', 
          text: `API 測試失敗: ${data.details || data.error}` 
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'API 測試時發生錯誤' })
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">載入中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-yellow-600" />
          SEO 文章生成器
        </h1>
        <p className="text-gray-600 mt-2">
          使用 Cohere AI 自動生成對網站 SEO 有幫助的專業文章
        </p>
      </div>

      {/* 訊息提示 */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{message.text}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessage}
            className="text-current hover:bg-black/10"
            aria-label="關閉訊息"
            title="關閉訊息"
          >
            ✕
          </Button>
        </div>
      )}

      {/* API Key 管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            API Key 設定
          </CardTitle>
          <CardDescription>
            設定 Cohere API Key 以啟用 AI 文章生成功能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                Cohere API Key
              </label>
              <div className="relative">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={hasApiKey ? "已設定 API Key（輸入新的將覆蓋）" : "請輸入 Cohere API Key"}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="h-8 w-8 p-0"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={saveApiKey}
                disabled={isSavingApiKey || !apiKey.trim()}
                variant="default"
                size="sm"
              >
                {isSavingApiKey ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    儲存中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    儲存
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">AI 功能狀態:</span>
              <Badge variant={hasApiKey && aiEnabled ? "default" : "destructive"}>
                {hasApiKey && aiEnabled ? "已啟用" : "未啟用"}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {hasApiKey && (
                <Button
                  onClick={toggleAiEnabled}
                  variant="outline"
                  size="sm"
                >
                  {aiEnabled ? "停用 AI" : "啟用 AI"}
                </Button>
              )}
              
              {hasApiKey && aiEnabled && (
                <Button
                  onClick={testApiPerformance}
                  disabled={isTesting}
                  variant="secondary"
                  size="sm"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      測試中...
                    </>
                  ) : (
                    "測試 API 速度"
                  )}
                </Button>
              )}
            </div>
          </div>

          {testResult && (
            <div className={`p-3 rounded-md border ${
              testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h4 className="font-medium mb-2">API 測試結果</h4>
              {testResult.success ? (
                <div className="text-sm space-y-1">
                  <p><strong>響應時間:</strong> {testResult.performance.apiResponseTime}ms</p>
                  <p><strong>狀態:</strong> {
                    testResult.performance.status === 'good' ? '🟢 良好 (< 10秒)' :
                    testResult.performance.status === 'slow' ? '🟡 較慢 (10-20秒)' :
                    '🔴 很慢 (> 20秒)'
                  }</p>
                  <p className="text-xs text-gray-600">建議：響應時間超過 20 秒可能會影響用戶體驗</p>
                </div>
              ) : (
                <div className="text-sm text-red-800">
                  <p><strong>錯誤:</strong> {testResult.error}</p>
                  {testResult.details && <p><strong>詳情:</strong> {testResult.details}</p>}
                </div>
              )}
            </div>
          )}

          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>如何獲取 Cohere API Key：</strong><br />
              1. 訪問 <a href="https://cohere.ai" target="_blank" className="underline font-medium">cohere.ai</a><br />
              2. 註冊並登入帳號<br />
              3. 前往 Dashboard → API Keys<br />
              4. 創建新的 API Key 並複製貼上到這裡
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 統計資訊 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">總文章數</p>
                  <p className="text-2xl font-bold">{stats.totalSEOArticles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">已發布</p>
                  <p className="text-2xl font-bold">{stats.publishedSEOArticles}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">已用主題</p>
                  <p className="text-2xl font-bold">{stats.usedTopics}/{stats.totalTopics}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">可用主題</p>
                  <p className="text-2xl font-bold">{stats.availableTopics}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 生成控制 */}
      <Card>
        <CardHeader>
          <CardTitle>生成 SEO 文章</CardTitle>
          <CardDescription>
            基於預定義的主題庫，自動生成對網站 SEO 有幫助的專業文章
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="generateCount" className="block text-sm font-medium mb-2">生成數量</label>
              <Input
                id="generateCount"
                type="number"
                min="1"
                max="10"
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                className="w-24"
                aria-label="設定生成文章數量，範圍1到10篇"
                title="設定要生成的SEO文章數量"
                placeholder="1"
              />
              <p className="text-xs text-gray-500 mt-1">建議 1-3 篇</p>
            </div>
            
            <div className="flex-1">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !stats || !hasApiKey || !aiEnabled}
                variant="premium"
                className="w-full md:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    生成 SEO 文章
                  </>
                )}
              </Button>
            </div>
          </div>

          {!hasApiKey || !aiEnabled ? (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ 請先設定 API Key：</strong><br />
                需要設定 Cohere API Key 並啟用 AI 功能才能生成文章
              </p>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>功能說明：</strong><br />
                • 自動從預定義主題庫中選擇主題<br />
                • 使用 Cohere AI 生成專業內容<br />
                • 自動優化 SEO 標題和描述<br />
                • 直接發布到網站新聞區塊<br />
                • 包含汽車冷氣相關關鍵字
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 最近生成的文章 */}
      {generatedArticles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>最近生成的文章</CardTitle>
            <CardDescription>
              剛剛生成的 SEO 文章列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-gray-600 mt-1">{article.excerpt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">SEO 優化</Badge>
                        <span className="text-sm text-gray-500">
                          發布時間: {new Date(article.publishedAt).toLocaleString('zh-TW')}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/news/${article.slug}`, '_blank')}
                      >
                        查看文章
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 預定義主題預覽 */}
      <Card>
        <CardHeader>
          <CardTitle>預定義主題庫</CardTitle>
          <CardDescription>
            系統內建的 SEO 文章主題，會自動輪換使用
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              '汽車冷氣系統維修保養完整指南',
              'R134a vs R1234yf 冷媒比較分析',
              '夏季汽車冷氣效能提升秘訣',
              '電動車冷氣系統特點與保養',
              '汽車冷氣異味問題解決方案',
              '冷媒洩漏檢測與修復指南',
              '汽車冷氣壓縮機保養維修詳解',
              '車輛冷氣系統升級改造指南'
            ].map((topic, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <h4 className="font-medium">{topic}</h4>
                <Badge variant="outline" className="mt-2">
                  教育性內容
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 