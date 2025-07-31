'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Eye, EyeOff, Clock } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    newsId: string | null
    newsTitle: string
  }>({
    open: false,
    newsId: null,
    newsTitle: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // 載入新聞資料
  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      const response = await fetch('/api/news')
      const data = await response.json()
      setNews(data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.newsId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/news/${deleteDialog.newsId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 更新新聞列表
        setNews(news.filter(n => n.id !== deleteDialog.newsId))
        setDeleteDialog({ open: false, newsId: null, newsTitle: '' })
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('刪除時發生錯誤')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return <div className="p-8">載入中...</div>
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">新聞管理</h1>
          <p className="text-gray-600 mt-2">管理所有新聞文章</p>
        </div>
        <Link href="/admin/news/new">
          <Button variant="premium">
            <Plus className="mr-2 h-4 w-4" />
            撰寫文章
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>文章列表</CardTitle>
          <CardDescription>共 {news.length} 篇文章</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>標題</TableHead>
                <TableHead>作者</TableHead>
                <TableHead>瀏覽次數</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>發布時間</TableHead>
                <TableHead>更新時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>{article.viewCount}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      article.isPublished
                        ? 'bg-green-100 text-green-800'
                        : article.scheduledAt && new Date(article.scheduledAt) > new Date()
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.isPublished ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          已發布
                        </>
                      ) : article.scheduledAt && new Date(article.scheduledAt) > new Date() ? (
                        <>
                          <Clock className="mr-1 h-3 w-3" />
                          已排程
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          草稿
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    {article.publishedAt 
                      ? formatDate(article.publishedAt)
                      : article.scheduledAt
                      ? `預定 ${formatDate(article.scheduledAt)}`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{formatDate(article.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/news/${article.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteDialog({
                          open: true,
                          newsId: article.id,
                          newsTitle: article.title,
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {news.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">尚無文章</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除"
        description={`您確定要刪除「${deleteDialog.newsTitle}」嗎？此操作無法復原。`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />
    </div>
  )
} 