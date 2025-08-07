'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Image as ImageIcon, RefreshCw, TestTube, Shuffle } from 'lucide-react'

interface ImageInfo {
  path: string
  category: string
  filename: string
  size?: number
}

interface TestStats {
  totalImages: number
  categoryBreakdown: Record<string, number>
  availableImages: ImageInfo[]
}

export default function RandomImagesPage() {
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [stats, setStats] = useState<TestStats | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [testParams, setTestParams] = useState({
    title: 'Toyota汽車冷媒保養指南',
    content: '專業技師教您如何進行Toyota車款的冷媒系統維護，包括檢查、清潔和更換步驟。',
    tags: 'toyota,維修,保養,冷媒'
  })
  const { toast } = useToast()

  const runFullTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/images/random-test')
      const result = await response.json()
      
      if (result.success) {
        setStats(result.stats)
        toast({ description: '圖片掃描測試完成' })
      } else {
        toast({ description: `測試失敗: ${result.error}`, variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: '測試請求失敗', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const testSpecificSelection = async () => {
    setTestLoading(true)
    try {
      const response = await fetch('/api/images/random-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: testParams.title,
          content: testParams.content,
          tags: testParams.tags.split(',').map(tag => tag.trim())
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSelectedImage(result.selectedImage)
        toast({ description: '隨機圖片選擇完成' })
      } else {
        toast({ description: `選擇失敗: ${result.error}`, variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: '選擇請求失敗', variant: 'destructive' })
    } finally {
      setTestLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'brand': return 'bg-blue-100 text-blue-800'
      case 'topic': return 'bg-green-100 text-green-800'
      case 'news': return 'bg-purple-100 text-purple-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🎲 隨機圖片測試</h1>
        <p className="text-muted-foreground">測試新聞封面圖片的隨機選擇功能</p>
      </div>

      {/* 掃描和測試 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            圖片掃描測試
          </CardTitle>
          <CardDescription>
            掃描 public/images 目錄，檢查可用的圖片資源
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runFullTest}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                掃描中...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 mr-2" />
                開始掃描圖片
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 掃描結果 */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>📊 掃描結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 統計信息 */}
              <div>
                <h3 className="font-semibold mb-3">總覽統計</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>總圖片數:</span>
                    <Badge variant="default">{stats.totalImages}</Badge>
                  </div>
                  {Object.entries(stats.categoryBreakdown).map(([category, count]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <Badge className={getCategoryColor(category)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* 圖片列表 */}
              <div>
                <h3 className="font-semibold mb-3">可用圖片</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {stats.availableImages.map((img, index) => (
                    <div key={index} className="p-2 border rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getCategoryColor(img.category)} variant="secondary">
                          {img.category}
                        </Badge>
                        <span className="text-sm font-medium">{img.filename}</span>
                      </div>
                      <div className="text-xs text-gray-600">{img.path}</div>
                      {img.size && (
                        <div className="text-xs text-gray-500">
                          大小: {(img.size / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 智能選擇測試 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            智能圖片選擇測試
          </CardTitle>
          <CardDescription>
            根據文章內容智能選擇合適的封面圖片
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">文章標題</Label>
              <Input
                id="title"
                value={testParams.title}
                onChange={(e) => setTestParams({...testParams, title: e.target.value})}
                placeholder="輸入測試文章標題"
              />
            </div>
            
            <div>
              <Label htmlFor="content">文章內容</Label>
              <Input
                id="content"
                value={testParams.content}
                onChange={(e) => setTestParams({...testParams, content: e.target.value})}
                placeholder="輸入測試文章內容"
              />
            </div>
            
            <div>
              <Label htmlFor="tags">標籤 (逗號分隔)</Label>
              <Input
                id="tags"
                value={testParams.tags}
                onChange={(e) => setTestParams({...testParams, tags: e.target.value})}
                placeholder="toyota,維修,保養"
              />
            </div>
          </div>

          <Button 
            onClick={testSpecificSelection}
            disabled={testLoading}
            className="w-full"
          >
            {testLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                選擇中...
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4 mr-2" />
                智能選擇圖片
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 選擇結果 */}
      {selectedImage && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">🎯 選擇結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">選中的圖片:</p>
                <p className="text-sm text-gray-600">{selectedImage}</p>
              </div>
              {selectedImage && (
                <div className="w-32 h-24 border rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img 
                    src={selectedImage} 
                    alt="選擇的圖片" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="text-xs text-gray-500">圖片預覽</div>'
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用說明 */}
      <Card>
        <CardHeader>
          <CardTitle>📋 功能說明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>圖片掃描:</strong> 自動掃描 public/images 目錄及其子目錄 (news/, brands/, topics/)
            </div>
            <div>
              <strong>智能分類:</strong> 根據檔名和路徑自動分類為 general, brand, topic, news
            </div>
            <div>
              <strong>智能選擇:</strong> 根據文章標題、內容和標籤智能選擇最合適的圖片
            </div>
            <div>
              <strong>優先級:</strong> 品牌相關 > 主題相關 > 新聞相關 > 隨機選擇
            </div>
            <div>
              <strong>過濾規則:</strong> 自動排除過小文件 (&lt;1KB) 和非圖片格式
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
