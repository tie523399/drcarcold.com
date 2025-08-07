'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { 
  Brain, 
  TestTube, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

export default function AITestPage() {
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    title: '汽車冷氣系統維修與保養',
    content: '汽車冷氣系統是現代車輛重要的舒適配備之一。定期的維修和保養可以確保冷氣系統正常運作，延長使用壽命。本文將介紹汽車冷氣系統的基本構造、常見問題以及維修保養的要點。',
    keywords: 'R134a冷媒, 汽車冷氣, 冷媒充填, 空調維修'
  })
  const [testResults, setTestResults] = useState<any>(null)
  const { toast } = useToast()

  const runTest = async (action: string) => {
    try {
      setLoading(true)
      setTestResults(null)
      
      const response = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ...testData
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResults(data.data)
        toast({
          title: '✅ 測試成功',
          description: data.message
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
        description: '網路錯誤，請稍後再試',
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
          AI調用測試系統
        </h1>
        <p className="text-gray-600 mt-2">
          測試智能AI改寫功能，驗證自動fallback機制和API調用是否正常
        </p>
      </div>

      {/* 測試數據輸入 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            測試數據配置
          </CardTitle>
          <CardDescription>
            設定測試用的標題、內容和SEO關鍵字
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">測試標題</Label>
            <Input
              id="title"
              value={testData.title}
              onChange={(e) => setTestData({...testData, title: e.target.value})}
              placeholder="輸入測試標題..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">測試內容</Label>
            <Textarea
              id="content"
              value={testData.content}
              onChange={(e) => setTestData({...testData, content: e.target.value})}
              placeholder="輸入測試內容..."
              rows={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keywords">SEO關鍵字</Label>
            <Input
              id="keywords"
              value={testData.keywords}
              onChange={(e) => setTestData({...testData, keywords: e.target.value})}
              placeholder="輸入SEO關鍵字，用逗號分隔..."
            />
          </div>
        </CardContent>
      </Card>

      {/* 測試控制 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI測試控制
          </CardTitle>
          <CardDescription>
            選擇要測試的AI功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => runTest('test-title')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              測試標題改寫
            </Button>
            
            <Button
              onClick={() => runTest('test-article')}
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
              測試文章改寫
            </Button>
            
            <Button
              onClick={() => runTest('test-both')}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              完整測試
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 測試結果 */}
      {testResults && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              測試結果
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {testResults.original && testResults.rewritten && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 原始內容 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">📝 原始內容</h3>
                  
                  {testResults.original.title && (
                    <div className="p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-1">標題：</div>
                      <div className="font-medium">{testResults.original.title}</div>
                    </div>
                  )}
                  
                  {testResults.original.content && (
                    <div className="p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-1">內容：</div>
                      <div className="text-sm">{testResults.original.content}</div>
                    </div>
                  )}
                  
                  {typeof testResults.original === 'string' && (
                    <div className="p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600 mb-1">內容：</div>
                      <div className="text-sm">{testResults.original}</div>
                    </div>
                  )}
                </div>
                
                {/* 改寫結果 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-green-700">🤖 AI改寫結果</h3>
                  
                  {testResults.rewritten.title && (
                    <div className="p-3 bg-green-100 rounded border border-green-200">
                      <div className="text-sm text-green-600 mb-1">改寫標題：</div>
                      <div className="font-medium text-green-800">{testResults.rewritten.title}</div>
                    </div>
                  )}
                  
                  {testResults.rewritten.content && (
                    <div className="p-3 bg-green-100 rounded border border-green-200">
                      <div className="text-sm text-green-600 mb-1">改寫內容：</div>
                      <div className="text-sm text-green-800">{testResults.rewritten.content}</div>
                    </div>
                  )}
                  
                  {typeof testResults.rewritten === 'string' && (
                    <div className="p-3 bg-green-100 rounded border border-green-200">
                      <div className="text-sm text-green-600 mb-1">改寫結果：</div>
                      <div className="text-sm text-green-800">{testResults.rewritten}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {testResults.keywords && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">使用的SEO關鍵字：</div>
                <div className="text-sm text-blue-800 font-medium">{testResults.keywords}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 使用說明 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            測試說明
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">🧪 測試功能：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li><strong>標題改寫測試：</strong>測試AI智能標題改寫功能</li>
              <li><strong>文章改寫測試：</strong>測試AI智能內容改寫功能</li>
              <li><strong>完整測試：</strong>同時測試標題和內容改寫</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">🤖 智能特性：</h4>
            <ul className="list-disc list-inside space-y-1 text-sm ml-4">
              <li>自動選擇最佳可用的AI服務（DeepSeek、Groq、Gemini等）</li>
              <li>智能fallback：當一個服務失敗時自動切換到下一個</li>
              <li>API限制監控：避免超出免費額度限制</li>
              <li>重試機制：網路錯誤時自動重試</li>
              <li>繁體中文優化：確保輸出使用正確的繁體中文</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
