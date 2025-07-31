'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Image as ImageIcon } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  _count?: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    categoryId: string | null
    categoryName: string
  }>({
    open: false,
    categoryId: null,
    categoryName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // 載入分類資料
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.categoryId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/categories/${deleteDialog.categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== deleteDialog.categoryId))
        setDeleteDialog({ open: false, categoryId: null, categoryName: '' })
      } else {
        const error = await response.json()
        alert(error.error || '刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">分類管理</h1>
          <p className="text-gray-600 mt-2">管理產品分類，優化 SEO 結構</p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增分類
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>分類列表</CardTitle>
          <CardDescription>共 {categories.length} 個分類</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>圖片</TableHead>
                <TableHead>分類名稱</TableHead>
                <TableHead>網址代稱 (Slug)</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>產品數量</TableHead>
                <TableHead>建立時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {category.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.slug}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {category.description || '-'}
                  </TableCell>
                  <TableCell>
                    {category._count?.products || 0} 個產品
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Button variant="outline" size="sm" title="編輯分類" aria-label="編輯分類">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteDialog({
                          open: true,
                          categoryId: category.id,
                          categoryName: category.name,
                        })}
                        disabled={!!(category._count?.products && category._count.products > 0)}
                        title="刪除分類"
                        aria-label="刪除分類"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {categories.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">尚無分類資料</p>
              <Link href="/admin/categories/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  新增第一個分類
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除"
        description={`您確定要刪除分類「${deleteDialog.categoryName}」嗎？此操作無法復原。`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />
    </div>
  )
}