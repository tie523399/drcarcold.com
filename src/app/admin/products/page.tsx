'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import { AlertDialog } from '@/components/ui/alert-dialog'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    productId: string | null
    productName: string
  }>({
    open: false,
    productId: null,
    productName: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // 載入產品資料
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.productId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${deleteDialog.productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // 更新產品列表
        setProducts(products.filter(p => p.id !== deleteDialog.productId))
        setDeleteDialog({ open: false, productId: null, productName: '' })
      } else {
        alert('刪除失敗')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">產品管理</h1>
          <p className="text-gray-600 mt-2">管理所有產品資訊</p>
        </div>
        <Link href="/admin/products/new">
          <Button variant="premium">
            <Plus className="mr-2 h-4 w-4" />
            新增產品
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>產品列表</CardTitle>
          <CardDescription>共 {products.length} 個產品</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>產品名稱</TableHead>
                <TableHead>類別</TableHead>
                <TableHead>價格</TableHead>
                <TableHead>庫存</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>更新時間</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>
                    {product.price ? formatCurrency(product.price) : '-'}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? (
                        <>
                          <Eye className="mr-1 h-3 w-3" />
                          上架中
                        </>
                      ) : (
                        <>
                          <EyeOff className="mr-1 h-3 w-3" />
                          已下架
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(product.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="outline" size="sm" title="編輯產品" aria-label="編輯產品">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setDeleteDialog({
                          open: true,
                          productId: product.id,
                          productName: product.name,
                        })}
                        title="刪除產品"
                        aria-label="刪除產品"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">尚無產品資料</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        title="確認刪除"
        description={`您確定要刪除「${deleteDialog.productName}」嗎？此操作無法復原。`}
        onConfirm={handleDelete}
        confirmText="刪除"
        isLoading={isDeleting}
      />
    </div>
  )
} 