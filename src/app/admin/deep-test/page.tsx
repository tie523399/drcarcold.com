'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/components/ui/use-toast'

interface TestResult {
  testName: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
  duration?: number
}

interface SystemTestReport {
  overallStatus: 'pass' | 'fail' | 'warning'
  totalTests: number
  passedTests: number
  failedTests: number
  warningTests: number
  duration: number
  results: TestResult[]
  recommendations: string[]
}

export default function DeepTestPage() {
  const [testing, setTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState('')
  const [report, setReport] = useState<SystemTestReport | null>(null)
  const { toast } = useToast()

  const runSystemTest = async () => {
    try {
      setTesting(true)
      setProgress(0)
      setCurrentTest('初始化測試...')
      setReport(null)

      // 動態導入測試工具
      const { ComprehensiveSystemTester } = await import('@/lib/comprehensive-test')
      const tester = new ComprehensiveSystemTester()

      // 模擬進度更新
      const updateProgress = (step: string, percent: number) => {
        setCurrentTest(step)
        setProgress(percent)
      }

      // 1. 隨機圖片系統測試
      updateProgress('🖼️ 測試隨機圖片系統...', 15)
      await tester.testRandomImageSystem()

      // 2. 爬蟲系統測試
      updateProgress('🕷️ 測試爬蟲系統...', 30)
      await tester.testCrawlerSystem()

      // 3. AI服務測試
      updateProgress('🤖 測試AI服務...', 45)
      await tester.testAIServices()

      // 4. 數據庫健康測試
      updateProgress('🗄️ 測試數據庫健康...', 60)
      await tester.testDatabaseHealth()

      // 5. SEO功能測試
      updateProgress('🎯 測試SEO功能...', 75)
      await tester.testSEOFeatures()

      // 6. 智能調度測試
      updateProgress('⏰ 測試智能調度...', 90)
      await tester.testSmartScheduling()

      // 生成最終報告
      updateProgress('📋 生成測試報告...', 100)
      const finalReport = await tester.runFullSystemTest()
      
      setReport(finalReport)
      
      toast({
        description: `系統測試完成！總體狀態: ${
          finalReport.overallStatus === 'pass' ? '✅ 通過' : 
          finalReport.overallStatus === 'fail' ? '❌ 失敗' : '⚠️ 警告'
        }`
      })

    } catch (error) {
      toast({
        description: `測試失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
      setProgress(0)
      setCurrentTest('')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return '✅'
      case 'fail': return '❌'
      case 'warning': return '⚠️'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800'
      case 'fail': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🧪 系統深度測試</h1>
        <Button onClick={runSystemTest} disabled={testing} size="lg">
          {testing ? '測試中...' : '🚀 開始完整測試'}
        </Button>
      </div>

      {/* 測試說明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-800">📝 測試說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">🔍 測試範圍</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 隨機圖片選擇系統</li>
                <li>• 新聞爬蟲自動化</li>
                <li>• AI服務配置與切換</li>
                <li>• 數據庫健康檢查</li>
                <li>• SEO生成與排名監控</li>
                <li>• 智能調度管理</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 測試標準</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <span className="text-green-600">✅ 通過</span>：功能正常</li>
                <li>• <span className="text-yellow-600">⚠️ 警告</span>：部分問題</li>
                <li>• <span className="text-red-600">❌ 失敗</span>：功能異常</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 測試進度 */}
      {testing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-800">⏳ 測試進行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>{currentTest}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
              <div className="text-sm text-gray-600">
                這可能需要 1-2 分鐘，請耐心等候...
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 測試報告 */}
      {report && (
        <>
          {/* 總體結果 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-800">📊 測試結果摘要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className={`text-center p-4 rounded-lg ${getStatusColor(report.overallStatus)}`}>
                  <div className="text-2xl font-bold">{getStatusIcon(report.overallStatus)}</div>
                  <div className="text-sm font-medium">總體狀態</div>
                  <div className="text-xs">{
                    report.overallStatus === 'pass' ? '通過' :
                    report.overallStatus === 'fail' ? '失敗' : '警告'
                  }</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{report.totalTests}</div>
                  <div className="text-sm text-gray-600">總測試數</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{report.passedTests}</div>
                  <div className="text-sm text-gray-600">通過</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{report.warningTests}</div>
                  <div className="text-sm text-gray-600">警告</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{report.failedTests}</div>
                  <div className="text-sm text-gray-600">失敗</div>
                </div>
              </div>
              
              <div className="mt-4 text-center text-sm text-gray-600">
                測試完成時間: {(report.duration / 1000).toFixed(2)} 秒
              </div>
            </CardContent>
          </Card>

          {/* 詳細結果 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-indigo-800">🔍 詳細測試結果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {report.results.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      result.status === 'pass' ? 'bg-green-500' :
                      result.status === 'fail' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {getStatusIcon(result.status)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{result.testName}</span>
                        {result.duration && (
                          <Badge variant="outline" className="text-xs">
                            {result.duration}ms
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{result.message}</div>
                      
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            查看詳細信息
                          </summary>
                          <pre className="mt-2 p-2 bg-white rounded border overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 建議與下一步 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-green-800">💡 建議與下一步</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-600 mt-0.5">💡</span>
                    <span className="text-sm text-blue-800">{recommendation}</span>
                  </div>
                ))}
              </div>

              {report.overallStatus === 'pass' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">🎉 系統測試通過！</h4>
                  <p className="text-sm text-green-700 mb-3">
                    恭喜！您的系統已通過所有主要測試，可以準備部署到生產環境。
                  </p>
                  <div className="flex gap-2">
                    <Badge className="bg-green-600">✅ 可以部署</Badge>
                    <Badge variant="outline">📈 性能良好</Badge>
                    <Badge variant="outline">🔒 配置正確</Badge>
                  </div>
                </div>
              )}

              {report.overallStatus === 'warning' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ 需要注意</h4>
                  <p className="text-sm text-yellow-700">
                    系統基本功能正常，但有一些建議改進的地方。請查看上述建議並考慮優化。
                  </p>
                </div>
              )}

              {report.overallStatus === 'fail' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">❌ 需要修復</h4>
                  <p className="text-sm text-red-700">
                    發現重要問題需要修復。建議先解決失敗的測試項目，然後重新執行測試。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
