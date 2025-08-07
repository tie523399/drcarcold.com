'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface ImageUpdateResult {
  id: string
  title: string
  coverImage: string
  ogImage?: string
  previousImage?: string
  status: 'updated' | 'error' | 'skipped'
  error?: string
}

interface UpdateResponse {
  success: boolean
  message: string
  totalProcessed: number
  updatedCount: number
  skippedCount?: number
  forceUpdate: boolean
  results: ImageUpdateResult[]
}

export default function BulkUpdateImagesPage() {
  const [loading, setLoading] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [results, setResults] = useState<UpdateResponse | null>(null)
  const { toast } = useToast()

  // 檢查圖片狀態
  const checkImageStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news/update-images')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
        console.log('圖片狀態:', data.stats)
        console.log('樣本數據:', data.samples)
      }
    } catch (error) {
      toast({
        description: '檢查圖片狀態失敗',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // 批量更新圖片
  const updateImages = async () => {
    try {
      setLoading(true)
      setResults(null)
      
      const response = await fetch('/api/news/update-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceUpdate })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResults(data)
        toast({
          description: data.message
        })
        // 更新統計
        await checkImageStatus()
      } else {
        throw new Error(data.error)
      }
      
    } catch (error) {
      toast({
        description: `更新失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🖼️ 批量更新新聞圖片</h1>
        <Button onClick={checkImageStatus} variant="outline" disabled={loading}>
          📊 檢查狀態
        </Button>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800">📈 圖片狀態統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.totalNews}</div>
                <div className="text-sm text-gray-600">總文章數</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.newsWithImages}</div>
                <div className="text-sm text-gray-600">有圖片</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.newsWithoutImages}</div>
                <div className="text-sm text-gray-600">缺少圖片</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round((stats.newsWithImages / stats.totalNews) * 100)}%
                </div>
                <div className="text-sm text-gray-600">完整度</div>
              </div>
            </div>
            
            {stats.needsImageGeneration && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-800">⚠️ 發現 {stats.newsWithoutImages} 篇文章缺少圖片</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 更新設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-800">🔧 更新設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="forceUpdate" 
              checked={forceUpdate}
              onCheckedChange={(checked) => setForceUpdate(checked as boolean)}
            />
            <label htmlFor="forceUpdate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              強制更新所有文章圖片 (包含已有圖片的文章)
            </label>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 更新模式說明</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>標準模式</strong>：只更新沒有封面圖片的文章</li>
              <li>• <strong>強制模式</strong>：替換所有文章的圖片（使用新的隨機圖片系統）</li>
              <li>• 所有更新都會使用最新的智能圖片選擇算法</li>
            </ul>
          </div>

          <Button 
            onClick={updateImages} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? '更新中...' : `🎯 開始${forceUpdate ? '強制' : '標準'}更新`}
          </Button>
        </CardContent>
      </Card>

      {/* 更新結果 */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="text-purple-800">📋 更新結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 結果摘要 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">📊 更新摘要</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>總處理: <strong>{results.totalProcessed}</strong></div>
                  <div>成功更新: <strong className="text-green-600">{results.updatedCount}</strong></div>
                  <div>跳過: <strong className="text-yellow-600">{results.skippedCount || 0}</strong></div>
                  <div>模式: <Badge variant={results.forceUpdate ? 'destructive' : 'default'}>
                    {results.forceUpdate ? '強制' : '標準'}
                  </Badge></div>
                </div>
              </div>

              {/* 詳細結果 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.results.map((result, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      result.status === 'updated' ? 'bg-green-500' :
                      result.status === 'error' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}>
                      {result.status === 'updated' ? '✓' : 
                       result.status === 'error' ? '✗' : '?'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.status === 'updated' && (
                        <div className="text-sm text-gray-600">
                          新圖片: <span className="text-blue-600">{result.coverImage}</span>
                          {result.previousImage && (
                            <span className="text-gray-400"> (替換: {result.previousImage})</span>
                          )}
                        </div>
                      )}
                      {result.status === 'error' && (
                        <div className="text-sm text-red-600">錯誤: {result.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
