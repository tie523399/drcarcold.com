'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { TestTube, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function AITestSimplePage() {
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const { toast } = useToast()

  const runQuickTest = async () => {
    try {
      setLoading(true)
      setTestResults(null)
      
      toast({
        title: '🚀 開始快速AI測試',
        description: '正在測試智能AI改寫功能...'
      })
      
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-both',
          title: '汽車冷媒系統檢查保養',
          content: '定期檢查汽車冷媒系統對於維持車內舒適溫度非常重要。專業技師會檢查冷媒壓力、管路密封性和壓縮機運作狀況。',
          keywords: 'R134a冷媒, 汽車冷氣保養, 冷媒檢查, 空調系統維修'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResults(data.data)
        toast({
          title: '✅ 測試成功！',
          description: '智能AI改寫功能運作正常'
        })
      } else {
        toast({
          title: '❌ 測試失敗',
          description: data.error,
          variant: 'destructive'
        })
      }
      
    } catch (error) {
      console.error('測試失敗:', error)
      toast({
        title: '測試失敗',
        description: '網路錯誤或AI服務不可用',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <TestTube className="h-8 w-8 text-blue-600" />
          AI快速測試
        </h1>
        <p className="text-gray-600 mt-2">
          一鍵測試智能AI改寫功能是否正常工作
        </p>
      </div>

      {/* 快速測試 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            快速AI測試
          </CardTitle>
          <CardDescription>
            點擊下方按鈕立即測試AI改寫功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={runQuickTest}
            disabled={loading}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <TestTube className="mr-2 h-5 w-5" />
            )}
            {loading ? '測試中...' : '🚀 開始AI測試'}
          </Button>
        </CardContent>
      </Card>

      {/* 測試結果 */}
      {testResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              測試結果 ✅
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 標題對比 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">📝 標題改寫</h3>
                
                <div className="p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">原始標題：</div>
                  <div className="text-sm">{testResults.original.title}</div>
                </div>
                
                <div className="p-3 bg-green-100 rounded border border-green-200">
                  <div className="text-xs text-green-600 mb-1">AI改寫標題：</div>
                  <div className="text-sm font-medium text-green-800">{testResults.rewritten.title}</div>
                </div>
              </div>
              
              {/* 內容對比 */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">📄 內容改寫</h3>
                
                <div className="p-3 bg-white rounded border">
                  <div className="text-xs text-gray-500 mb-1">原始內容：</div>
                  <div className="text-sm">{testResults.original.content}</div>
                </div>
                
                <div className="p-3 bg-green-100 rounded border border-green-200">
                  <div className="text-xs text-green-600 mb-1">AI改寫內容：</div>
                  <div className="text-sm text-green-800">{testResults.rewritten.content}</div>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-blue-600 mb-1">使用的SEO關鍵字：</div>
              <div className="text-sm text-blue-800 font-medium">{testResults.keywords}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 功能說明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            測試功能說明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">🤖 智能AI功能：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>自動選擇最佳AI服務（DeepSeek、Groq、Gemini等）</li>
              <li>智能fallback：一個服務失敗時自動切換到下一個</li>
              <li>API限制監控：避免超出免費額度</li>
              <li>重試機制：自動處理網路錯誤</li>
              <li>繁體中文優化：確保輸出正確的繁體中文</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">✅ 測試內容：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>標題智能改寫和SEO優化</li>
              <li>文章內容改寫和關鍵字融入</li>
              <li>繁體中文輸出品質檢查</li>
              <li>API調用成功率驗證</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
