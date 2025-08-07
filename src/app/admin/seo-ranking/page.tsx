'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  RefreshCw,
  Plus,
  Eye,
  Calendar,
  Award,
  AlertCircle
} from 'lucide-react'

interface RankingResult {
  keyword: string
  position: number | null
  url: string
  title: string | null
  checkedAt: string
  found: boolean
  error?: string
}

interface RankingStats {
  totalKeywords: number
  rankedKeywords: number
  averagePosition: number
  topRankings: number
  improvements: number
  declines: number
}

export default function SEORankingPage() {
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [rankings, setRankings] = useState<RankingResult[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [batchKeywords, setBatchKeywords] = useState('')
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 載入統計數據
      const statsResponse = await fetch('/api/seo-ranking?action=stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data)
      }

      // 載入最新排名
      const rankingsResponse = await fetch('/api/seo-ranking?action=latest')
      if (rankingsResponse.ok) {
        const rankingsData = await rankingsResponse.json()
        setRankings(rankingsData.data)
      }
    } catch (error) {
      console.error('載入數據失敗:', error)
    }
  }

  const checkSingleKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: '請輸入關鍵字',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/seo-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-single',
          keyword: newKeyword.trim()
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: '檢測完成',
          description: data.message
        })
        setNewKeyword('')
        await loadData()
      } else {
        toast({
          title: '檢測失敗',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '檢測失敗',
        description: '網路錯誤，請稍後再試',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkBatchKeywords = async () => {
    if (!batchKeywords.trim()) {
      toast({
        title: '請輸入關鍵字',
        variant: 'destructive'
      })
      return
    }

    const keywords = batchKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0)

    if (keywords.length === 0) {
      toast({
        title: '請輸入有效的關鍵字',
        variant: 'destructive'
      })
      return
    }

    if (keywords.length > 20) {
      toast({
        title: '單次最多檢測20個關鍵字',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/seo-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-multiple',
          keywords
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: '批量檢測完成',
          description: data.message
        })
        setBatchKeywords('')
        await loadData()
      } else {
        toast({
          title: '檢測失敗',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '檢測失敗',
        description: '網路錯誤，請稍後再試',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkSEOKeywords = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seo-ranking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check-seo-keywords'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: 'SEO關鍵字檢測完成',
          description: data.message
        })
        await loadData()
      } else {
        toast({
          title: '檢測失敗',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: '檢測失敗',
        description: '網路錯誤，請稍後再試',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getRankingBadge = (position: number | null) => {
    if (!position) return <Badge variant="secondary">未排名</Badge>
    
    if (position <= 3) return <Badge className="bg-green-500">第 {position} 名 🏆</Badge>
    if (position <= 10) return <Badge className="bg-blue-500">第 {position} 名</Badge>
    if (position <= 20) return <Badge className="bg-yellow-500">第 {position} 名</Badge>
    if (position <= 50) return <Badge variant="outline">第 {position} 名</Badge>
    return <Badge variant="secondary">第 {position} 名</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 SEO排名監控系統</h1>
          <p className="text-gray-600 mt-2">監控關鍵字在Google搜索的排名表現</p>
        </div>
        <Button onClick={loadData} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          重新整理
        </Button>
      </div>

      {/* 統計概覽 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">追蹤關鍵字</p>
                  <p className="text-2xl font-bold">{stats.totalKeywords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">有排名</p>
                  <p className="text-2xl font-bold">{stats.rankedKeywords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">平均排名</p>
                  <p className="text-2xl font-bold">{stats.averagePosition.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">前10名</p>
                  <p className="text-2xl font-bold">{stats.topRankings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 排名趨勢 */}
      {stats && (stats.improvements > 0 || stats.declines > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>📈 排名變化趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-green-600 font-medium">排名提升: {stats.improvements} 個關鍵字</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-red-600 font-medium">排名下降: {stats.declines} 個關鍵字</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 檢測控制區 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 單一關鍵字檢測 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              檢測單一關鍵字
            </CardTitle>
            <CardDescription>
              輸入關鍵字來檢測其在Google的排名
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="輸入關鍵字..."
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkSingleKeyword()}
                disabled={loading}
              />
              <Button 
                onClick={checkSingleKeyword} 
                disabled={loading || !newKeyword.trim()}
              >
                {loading ? '檢測中...' : '檢測'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 快速檢測SEO關鍵字 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              檢測SEO關鍵字
            </CardTitle>
            <CardDescription>
              檢測設定頁面中配置的所有SEO關鍵字
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={checkSEOKeywords} 
              disabled={loading}
              className="w-full"
              variant="default"
            >
              {loading ? '檢測中...' : '🎯 檢測所有SEO關鍵字'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 批量檢測 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            批量關鍵字檢測
          </CardTitle>
          <CardDescription>
            一次檢測多個關鍵字（每行一個，最多20個）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            placeholder="請輸入關鍵字，每行一個...&#10;例如：&#10;汽車冷媒&#10;R134a冷媒&#10;冷氣保養"
            value={batchKeywords}
            onChange={(e) => setBatchKeywords(e.target.value)}
            disabled={loading}
            className="w-full h-32 p-3 border rounded-md resize-none"
          />
          <Button 
            onClick={checkBatchKeywords} 
            disabled={loading || !batchKeywords.trim()}
            className="w-full"
          >
            {loading ? '檢測中...' : '🔍 批量檢測'}
          </Button>
        </CardContent>
      </Card>

      {/* 排名結果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            最新排名結果
          </CardTitle>
          <CardDescription>
            最近檢測的關鍵字排名情況
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">還沒有排名數據</p>
              <p className="text-sm text-gray-400">開始檢測關鍵字來查看排名</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((ranking, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{ranking.keyword}</span>
                      {getRankingBadge(ranking.position)}
                    </div>
                    {ranking.url && (
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {ranking.url}
                      </p>
                    )}
                    {ranking.error && (
                      <p className="text-sm text-red-500 mt-1">
                        錯誤: {ranking.error}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ranking.checkedAt).toLocaleDateString('zh-TW')}
                    </div>
                    <div className="text-xs">
                      {new Date(ranking.checkedAt).toLocaleTimeString('zh-TW')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用說明 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">💡 使用說明</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 space-y-2">
          <p><strong>SEO排名監控功能：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>自動檢測關鍵字在Google搜索的排名位置</li>
            <li>追蹤排名變化趨勢，及時發現SEO問題</li>
            <li>支援批量檢測，提高工作效率</li>
            <li>整合現有SEO關鍵字設定，一鍵檢測</li>
          </ul>
          <p className="mt-3"><strong>注意事項：</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>檢測可能需要幾分鐘時間，請耐心等待</li>
            <li>建議定期檢測以追蹤排名變化</li>
            <li>排名結果僅供參考，實際排名可能因地區而異</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
