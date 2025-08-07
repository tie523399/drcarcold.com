'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Database, Trash2, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface DatabaseHealthReport {
  totalArticles: number
  validArticles: number
  invalidArticles: number
  missingContent: number
  invalidSlugs: number
  duplicateContent: number
  orphanedRecords: number
  issues: string[]
  cleanupActions: string[]
}

interface CleanupResult {
  success: boolean
  deletedArticles: number
  fixedArticles: number
  actions: string[]
}

export default function DatabaseHealthPage() {
  const [report, setReport] = useState<DatabaseHealthReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const { toast } = useToast()

  const checkDatabaseHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/database-health')
      const data = await response.json()
      
      if (response.ok) {
        setReport(data)
        toast({ description: '數據庫健康檢查完成' })
      } else {
        toast({ description: `檢查失敗: ${data.error}`, variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: '檢查請求失敗', variant: 'destructive' })
      console.error('Database health check error:', error)
    } finally {
      setLoading(false)
    }
  }

  const performCleanup = async (action: string) => {
    setCleanupLoading(true)
    try {
      const response = await fetch('/api/database-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      const result: CleanupResult = await response.json()
      
      if (response.ok && result.success) {
        toast({ description: `清理完成: 刪除 ${result.deletedArticles} 篇，修復 ${result.fixedArticles} 篇` })
        // 重新檢查健康狀況
        await checkDatabaseHealth()
      } else {
        toast({ description: '清理失敗', variant: 'destructive' })
      }
    } catch (error) {
      toast({ description: '清理請求失敗', variant: 'destructive' })
      console.error('Cleanup error:', error)
    } finally {
      setCleanupLoading(false)
    }
  }

  const getHealthScore = () => {
    if (!report) return 0
    if (report.totalArticles === 0) return 100
    return Math.round((report.validArticles / report.totalArticles) * 100)
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-6 h-6 text-green-600" />
    if (score >= 70) return <AlertTriangle className="w-6 h-6 text-yellow-600" />
    return <XCircle className="w-6 h-6 text-red-600" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">數據庫健康檢查</h1>
        <p className="text-muted-foreground">檢查和修復數據庫中的文章問題</p>
      </div>

      {/* 檢查按鈕 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            健康檢查
          </CardTitle>
          <CardDescription>
            檢查數據庫中是否存在無效文章、重複內容或其他問題
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={checkDatabaseHealth}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                檢查中...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                開始健康檢查
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 檢查結果 */}
      {report && (
        <>
          {/* 總覽 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getHealthIcon(getHealthScore())}
                健康狀況總覽
                <Badge variant={getHealthScore() >= 90 ? 'default' : getHealthScore() >= 70 ? 'secondary' : 'destructive'}>
                  {getHealthScore()}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{report.totalArticles}</div>
                  <div className="text-sm text-muted-foreground">總文章數</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{report.validArticles}</div>
                  <div className="text-sm text-muted-foreground">有效文章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{report.invalidArticles}</div>
                  <div className="text-sm text-muted-foreground">無效文章</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{report.duplicateContent}</div>
                  <div className="text-sm text-muted-foreground">重複內容</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 問題詳情 */}
          {report.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  發現問題 ({report.issues.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {report.issues.map((issue, index) => (
                    <div 
                      key={index}
                      className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm"
                    >
                      {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 清理操作 */}
          {report.invalidArticles > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  數據庫清理
                </CardTitle>
                <CardDescription>
                  清理無效文章和修復數據問題
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button 
                    onClick={() => performCleanup('cleanup')}
                    disabled={cleanupLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {cleanupLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        清理中...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        清理無效文章
                      </>
                    )}
                  </Button>
                  
                  {report.duplicateContent > 0 && (
                    <Button 
                      onClick={() => performCleanup('fix-duplicates')}
                      disabled={cleanupLoading}
                      variant="outline"
                      className="w-full"
                    >
                      🔄 修復重複內容
                    </Button>
                  )}
                  
                  {report.invalidSlugs > 0 && (
                    <Button 
                      onClick={() => performCleanup('fix-slugs')}
                      disabled={cleanupLoading}
                      variant="outline"
                      className="w-full"
                    >
                      🔧 修復無效Slug
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 健康提示 */}
          {report.invalidArticles === 0 && (
            <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    數據庫狀況良好！沒有發現需要修復的問題。
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
