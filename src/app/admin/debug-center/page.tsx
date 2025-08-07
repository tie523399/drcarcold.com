'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface SystemStatus {
  api: Record<string, boolean>
  database: boolean
  ai: Record<string, boolean>
  crawler: boolean
  seo: boolean
  images: boolean
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  details?: any
}

interface DebugTest {
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  result?: any
  error?: string
  duration?: number
}

export default function DebugCenterPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [debugTests, setDebugTests] = useState<DebugTest[]>([])
  const [loading, setLoading] = useState(false)
  const [apiTestUrl, setApiTestUrl] = useState('/api/health')
  const [apiTestMethod, setApiTestMethod] = useState('GET')
  const [apiTestBody, setApiTestBody] = useState('')
  const [apiTestResult, setApiTestResult] = useState<any>(null)
  const { toast } = useToast()

  // 檢查系統狀態
  const checkSystemStatus = async () => {
    setLoading(true)
    const status: SystemStatus = {
      api: {},
      database: false,
      ai: {},
      crawler: false,
      seo: false,
      images: false
    }

    try {
      // 檢查核心API
      const apiEndpoints = [
        '/api/health',
        '/api/settings',
        '/api/news',
        '/api/auto-service',
        '/api/seo-generator',
        '/api/database-health'
      ]

      for (const endpoint of apiEndpoints) {
        try {
          const response = await fetch(endpoint)
          status.api[endpoint] = response.ok
        } catch {
          status.api[endpoint] = false
        }
      }

      // 檢查數據庫
      try {
        const dbResponse = await fetch('/api/database-health')
        status.database = dbResponse.ok
      } catch {
        status.database = false
      }

      // 檢查AI服務
      try {
        const aiResponse = await fetch('/api/settings')
        if (aiResponse.ok) {
          const settings = await aiResponse.json()
          status.ai = {
            openai: Boolean(settings.openaiApiKey),
            groq: Boolean(settings.groqApiKey),
            gemini: Boolean(settings.geminiApiKey),
            deepseek: Boolean(settings.deepseekApiKey),
            autoFallback: Boolean(settings.aiAutoFallback)
          }
        }
      } catch {
        status.ai = {}
      }

      // 檢查爬蟲
      try {
        const crawlerResponse = await fetch('/api/auto-service')
        status.crawler = crawlerResponse.ok
      } catch {
        status.crawler = false
      }

      // 檢查SEO
      try {
        const seoResponse = await fetch('/api/seo-ranking')
        status.seo = seoResponse.ok
      } catch {
        status.seo = false
      }

      // 檢查圖片系統
      try {
        const imageResponse = await fetch('/api/images/random-test')
        status.images = imageResponse.ok
      } catch {
        status.images = false
      }

      setSystemStatus(status)
    } catch (error) {
      toast({
        description: `系統狀態檢查失敗: ${error}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 運行診斷測試
  const runDiagnosticTests = async () => {
    const tests: DebugTest[] = [
      { name: '數據庫連接', status: 'pending' },
      { name: 'AI服務配置', status: 'pending' },
      { name: '圖片系統', status: 'pending' },
      { name: '爬蟲服務', status: 'pending' },
      { name: 'SEO功能', status: 'pending' },
      { name: '文章生成', status: 'pending' }
    ]

    setDebugTests(tests)

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i]
      const startTime = Date.now()
      
      // 更新狀態為運行中
      setDebugTests(prev => prev.map((t, idx) => 
        idx === i ? { ...t, status: 'running' } : t
      ))

      try {
        let result: any = null

        switch (test.name) {
          case '數據庫連接':
            const dbResponse = await fetch('/api/database-health')
            result = await dbResponse.json()
            break
          
          case 'AI服務配置':
            const aiResponse = await fetch('/api/test-ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'test-all' })
            })
            result = await aiResponse.json()
            break
          
          case '圖片系統':
            const imgResponse = await fetch('/api/images/random-test')
            result = await imgResponse.json()
            break
          
          case '爬蟲服務':
            const crawlerResponse = await fetch('/api/auto-service')
            result = await crawlerResponse.json()
            break
          
          case 'SEO功能':
            const seoResponse = await fetch('/api/seo-ranking')
            result = await seoResponse.json()
            break
          
          case '文章生成':
            const newsResponse = await fetch('/api/news?limit=1')
            result = await newsResponse.json()
            break
        }

        const duration = Date.now() - startTime
        
        // 更新為成功
        setDebugTests(prev => prev.map((t, idx) => 
          idx === i ? { 
            ...t, 
            status: 'success', 
            result, 
            duration 
          } : t
        ))

      } catch (error) {
        // 更新為錯誤
        setDebugTests(prev => prev.map((t, idx) => 
          idx === i ? { 
            ...t, 
            status: 'error', 
            error: error instanceof Error ? error.message : String(error),
            duration: Date.now() - startTime
          } : t
        ))
      }

      // 短暫延遲
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // 手動API測試
  const testAPI = async () => {
    try {
      setLoading(true)
      const options: RequestInit = {
        method: apiTestMethod,
        headers: {
          'Content-Type': 'application/json',
        }
      }

      if (apiTestMethod !== 'GET' && apiTestBody) {
        options.body = apiTestBody
      }

      const startTime = Date.now()
      const response = await fetch(apiTestUrl, options)
      const duration = Date.now() - startTime
      
      const contentType = response.headers.get('content-type')
      let data: any

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      setApiTestResult({
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        duration
      })

      toast({
        description: `API測試完成 - 狀態: ${response.status}`
      })

    } catch (error) {
      setApiTestResult({
        error: error instanceof Error ? error.message : String(error)
      })
      toast({
        description: `API測試失敗: ${error}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 獲取系統日誌
  const fetchSystemLogs = async () => {
    try {
      // 模擬獲取日誌（實際項目中應該從後端獲取）
      const mockLogs: LogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: '系統啟動完成',
          details: { version: '1.0.0', environment: 'development' }
        },
        {
          timestamp: new Date(Date.now() - 60000).toISOString(),
          level: 'warn',
          message: 'AI API調用超時',
          details: { provider: 'openai', timeout: 30000 }
        },
        {
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'error',
          message: '爬蟲任務失敗',
          details: { source: '車訊網', error: '網絡連接超時' }
        }
      ]
      setLogs(mockLogs)
    } catch (error) {
      toast({
        description: `獲取日誌失敗: ${error}`,
        variant: 'destructive'
      })
    }
  }

  useEffect(() => {
    checkSystemStatus()
    fetchSystemLogs()
  }, [])

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? '✅' : '❌'
    }
    switch (status) {
      case 'pending': return '⏳'
      case 'running': return '🔄'
      case 'success': return '✅'
      case 'error': return '❌'
      default: return '❓'
    }
  }

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-600' : 'text-red-600'
    }
    switch (status) {
      case 'pending': return 'text-gray-600'
      case 'running': return 'text-blue-600'
      case 'success': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔧 系統除錯中心</h1>
        <div className="flex gap-2">
          <Button onClick={checkSystemStatus} disabled={loading} variant="outline">
            🔍 檢查狀態
          </Button>
          <Button onClick={runDiagnosticTests} disabled={loading}>
            🧪 運行診斷
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="status">系統狀態</TabsTrigger>
          <TabsTrigger value="diagnostic">診斷測試</TabsTrigger>
          <TabsTrigger value="api">API測試</TabsTrigger>
          <TabsTrigger value="logs">系統日誌</TabsTrigger>
          <TabsTrigger value="troubleshoot">故障排除</TabsTrigger>
        </TabsList>

        {/* 系統狀態 */}
        <TabsContent value="status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemStatus && (
              <>
                {/* API狀態 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-800">🌐 API服務狀態</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(systemStatus.api).map(([endpoint, status]) => (
                        <div key={endpoint} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-mono">{endpoint}</span>
                          <span className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI服務狀態 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-purple-800">🤖 AI服務狀態</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(systemStatus.ai).map(([service, status]) => (
                        <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm capitalize">{service}</span>
                          <span className={getStatusColor(status)}>
                            {getStatusIcon(status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 核心功能狀態 */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-green-800">⚙️ 核心功能狀態</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-2xl ${getStatusColor(systemStatus.database)}`}>
                          {getStatusIcon(systemStatus.database)}
                        </div>
                        <div className="text-sm font-medium">數據庫</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-2xl ${getStatusColor(systemStatus.crawler)}`}>
                          {getStatusIcon(systemStatus.crawler)}
                        </div>
                        <div className="text-sm font-medium">爬蟲</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-2xl ${getStatusColor(systemStatus.seo)}`}>
                          {getStatusIcon(systemStatus.seo)}
                        </div>
                        <div className="text-sm font-medium">SEO</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className={`text-2xl ${getStatusColor(systemStatus.images)}`}>
                          {getStatusIcon(systemStatus.images)}
                        </div>
                        <div className="text-sm font-medium">圖片系統</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* 診斷測試 */}
        <TabsContent value="diagnostic">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-800">🧪 系統診斷測試</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {debugTests.map((test, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`text-2xl ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      {test.duration && (
                        <div className="text-sm text-gray-600">耗時: {test.duration}ms</div>
                      )}
                      {test.error && (
                        <div className="text-sm text-red-600">錯誤: {test.error}</div>
                      )}
                    </div>
                    {test.result && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600">查看結果</summary>
                        <pre className="mt-2 p-2 bg-white rounded border max-w-xs overflow-auto">
                          {JSON.stringify(test.result, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API測試 */}
        <TabsContent value="api">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-indigo-800">🔗 API測試工具</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="url">API URL</Label>
                  <Input
                    id="url"
                    value={apiTestUrl}
                    onChange={(e) => setApiTestUrl(e.target.value)}
                    placeholder="/api/endpoint"
                  />
                </div>
                
                <div>
                  <Label htmlFor="method">HTTP方法</Label>
                  <select
                    id="method"
                    value={apiTestMethod}
                    onChange={(e) => setApiTestMethod(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                {apiTestMethod !== 'GET' && (
                  <div>
                    <Label htmlFor="body">請求體 (JSON)</Label>
                    <Textarea
                      id="body"
                      value={apiTestBody}
                      onChange={(e) => setApiTestBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      rows={4}
                    />
                  </div>
                )}

                <Button onClick={testAPI} disabled={loading} className="w-full">
                  {loading ? '測試中...' : '🚀 執行測試'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-800">📋 測試結果</CardTitle>
              </CardHeader>
              <CardContent>
                {apiTestResult ? (
                  <div className="space-y-3">
                    {apiTestResult.error ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800">
                        錯誤: {apiTestResult.error}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>狀態碼: <Badge variant={apiTestResult.ok ? 'default' : 'destructive'}>
                            {apiTestResult.status}
                          </Badge></div>
                          <div>耗時: {apiTestResult.duration}ms</div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">響應數據:</h4>
                          <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                            {JSON.stringify(apiTestResult.data, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    尚未執行測試
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 系統日誌 */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-800">📜 系統日誌</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <Badge variant={
                      log.level === 'error' ? 'destructive' :
                      log.level === 'warn' ? 'secondary' : 'default'
                    }>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{log.message}</div>
                      <div className="text-xs text-gray-500">{log.timestamp}</div>
                      {log.details && (
                        <details className="text-xs mt-1">
                          <summary className="cursor-pointer text-blue-600">詳細信息</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 故障排除 */}
        <TabsContent value="troubleshoot">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-800">🔧 常見問題排除</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-red-600 mb-2">❌ 爬蟲無法運行</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• 檢查網絡連接</li>
                      <li>• 驗證新聞來源URL</li>
                      <li>• 確認選擇器配置</li>
                      <li>• 檢查數據庫連接</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-yellow-600 mb-2">⚠️ AI服務失敗</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• 檢查API Key配置</li>
                      <li>• 確認API額度剩餘</li>
                      <li>• 測試網絡連接</li>
                      <li>• 啟用自動切換</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded">
                    <h4 className="font-medium text-blue-600 mb-2">💾 數據庫問題</h4>
                    <ul className="text-sm space-y-1 text-gray-600">
                      <li>• 運行健康檢查</li>
                      <li>• 清理無效數據</li>
                      <li>• 檢查磁盤空間</li>
                      <li>• 驗證連接字符串</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">⚡ 快速修復工具</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => window.open('/admin/database-health', '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    🏥 數據庫健康檢查
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/admin/ai-test-simple', '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    🤖 AI服務測試
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/admin/auto-service', '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    🚀 一鍵系統測試
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/admin/bulk-update-images', '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    🖼️ 批量圖片更新
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('/admin/deep-test', '_blank')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    🧪 深度系統測試
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
