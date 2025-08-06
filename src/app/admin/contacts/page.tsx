'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  Phone, 
  Building, 
  Clock, 
  Search, 
  Filter,
  Eye,
  Trash2,
  Star,
  Reply,
  CheckCircle,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  customerType?: string
  interestedProducts?: string
  source: string
  status: string
  priority: string
  assignedTo?: string
  notes?: string
  followUpDate?: string
  lastContactDate?: string
  isRead: boolean
  isReplied: boolean
  tags: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
  updatedAt: string
}

interface ContactStats {
  new: number
  contacted: number
  quoted: number
  closed: number
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStats>({ new: 0, contacted: 0, quoted: 0, closed: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // 載入聯絡表單
  const fetchContacts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })

      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/contacts?${params}`)
      const data = await response.json()

      if (data.success) {
        setContacts(data.data)
        setStats(data.stats || { new: 0, contacted: 0, quoted: 0, closed: 0 })
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('載入聯絡表單失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [currentPage, statusFilter, priorityFilter, searchTerm])

  // 更新聯絡表單狀態
  const updateContactStatus = async (id: string, updates: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        fetchContacts()
        setSelectedContact(null)
      }
    } catch (error) {
      console.error('更新失敗:', error)
    }
  }

  // 刪除聯絡表單
  const deleteContact = async (id: string) => {
    if (!confirm('確定要刪除這個聯絡表單嗎？')) return

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchContacts()
        setSelectedContact(null)
      }
    } catch (error) {
      console.error('刪除失敗:', error)
    }
  }

  // 獲取狀態徽章
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: '新', color: 'bg-blue-100 text-blue-800' },
      contacted: { label: '已聯絡', color: 'bg-yellow-100 text-yellow-800' },
      quoted: { label: '已報價', color: 'bg-purple-100 text-purple-800' },
      closed: { label: '已完成', color: 'bg-green-100 text-green-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, color: 'bg-gray-100 text-gray-800' }

    return <Badge className={config.color}>{config.label}</Badge>
  }

  // 獲取優先級徽章
  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: '低', color: 'bg-gray-100 text-gray-800' },
      normal: { label: '一般', color: 'bg-blue-100 text-blue-800' },
      high: { label: '高', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: '緊急', color: 'bg-red-100 text-red-800' }
    }

    const config = priorityConfig[priority as keyof typeof priorityConfig] || 
                  { label: priority, color: 'bg-gray-100 text-gray-800' }

    return <Badge className={config.color}>{config.label}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">聯絡表單管理</h1>
          <p className="text-muted-foreground">查看和管理客戶聯絡表單</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">新表單</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new || 0}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已聯絡</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contacted || 0}</p>
              </div>
              <Phone className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已報價</p>
                <p className="text-2xl font-bold text-purple-600">{stats.quoted || 0}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-2xl font-bold text-green-600">{stats.closed || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜尋和篩選 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜尋姓名、電子郵件、公司..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="狀態篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部狀態</SelectItem>
                <SelectItem value="new">新表單</SelectItem>
                <SelectItem value="contacted">已聯絡</SelectItem>
                <SelectItem value="quoted">已報價</SelectItem>
                <SelectItem value="closed">已完成</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="優先級篩選" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部優先級</SelectItem>
                <SelectItem value="urgent">緊急</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="normal">一般</SelectItem>
                <SelectItem value="low">低</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 聯絡表單列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 表單列表 */}
        <Card>
          <CardHeader>
            <CardTitle>聯絡表單列表</CardTitle>
            <CardDescription>點擊表單查看詳細內容</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center">載入中...</div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">沒有找到聯絡表單</div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedContact?.id === contact.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {!contact.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <h4 className="font-medium">{contact.name}</h4>
                        {contact.company && (
                          <Badge variant="outline" className="text-xs">
                            {contact.company}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(contact.priority)}
                        {getStatusBadge(contact.status)}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {contact.subject}
                    </p>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {contact.message}
                    </p>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{contact.email}</span>
                      <span>{new Date(contact.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 表單詳情 */}
        <Card>
          <CardHeader>
            <CardTitle>表單詳情</CardTitle>
            <CardDescription>
              {selectedContact ? '查看和處理選中的聯絡表單' : '請選擇一個表單查看詳情'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedContact ? (
              <div className="space-y-6">
                {/* 基本資訊 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">姓名</label>
                    <p className="font-medium">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">電子郵件</label>
                    <p className="font-medium">{selectedContact.email}</p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">電話</label>
                      <p className="font-medium">{selectedContact.phone}</p>
                    </div>
                  )}
                  {selectedContact.company && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">公司</label>
                      <p className="font-medium">{selectedContact.company}</p>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* 主旨和訊息 */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">主旨</label>
                  <p className="font-medium mb-3">{selectedContact.subject}</p>
                  
                  <label className="text-sm font-medium text-muted-foreground">訊息內容</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* 狀態管理 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        處理狀態
                      </label>
                      <Select
                        value={selectedContact.status}
                        onValueChange={(value) =>
                          updateContactStatus(selectedContact.id, { status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">新表單</SelectItem>
                          <SelectItem value="contacted">已聯絡</SelectItem>
                          <SelectItem value="quoted">已報價</SelectItem>
                          <SelectItem value="closed">已完成</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        優先級
                      </label>
                      <Select
                        value={selectedContact.priority}
                        onValueChange={(value) =>
                          updateContactStatus(selectedContact.id, { priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="normal">一般</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="urgent">緊急</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        updateContactStatus(selectedContact.id, { 
                          isReplied: true,
                          lastContactDate: new Date().toISOString()
                        })
                      }
                      className="flex-1"
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      標記已回覆
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => deleteContact(selectedContact.id)}
                      className="px-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 時間資訊 */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>提交時間: {new Date(selectedContact.createdAt).toLocaleString('zh-TW')}</p>
                  {selectedContact.lastContactDate && (
                    <p>最後聯絡: {new Date(selectedContact.lastContactDate).toLocaleString('zh-TW')}</p>
                  )}
                  <p>來源: {selectedContact.source}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>請從左側選擇一個聯絡表單查看詳情</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 分頁 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            上一頁
          </Button>
          
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            下一頁
          </Button>
        </div>
      )}
    </div>
  )
}