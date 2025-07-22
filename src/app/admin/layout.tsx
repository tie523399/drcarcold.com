'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Snowflake, 
  Newspaper, 
  Settings,
  Car,
  LogOut,
  Menu,
  X,
  Image,
  FolderTree,
  Sparkles,
  Bot,
  Bug,
  Globe,
  Search,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ToastProvider } from '@/components/ui/use-toast'

const navItems = [
  { href: '/admin/dashboard', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/auto-service', label: '自動化服務', icon: Wrench },
  { href: '/admin/content', label: '內容管理', icon: Sparkles },
  { href: '/admin/categories', label: '分類管理', icon: FolderTree },
  { href: '/admin/products', label: '產品管理', icon: Package },
  { href: '/admin/vehicles', label: '汽車冷媒填充資訊', icon: Car },
  { href: '/admin/news', label: '新聞管理', icon: Newspaper },
  { href: '/admin/banners', label: '橫幅管理', icon: Image },
  { href: '/admin/crawler', label: '爬蟲監控', icon: Bot },
  { href: '/admin/news-sources', label: '新聞來源', icon: Globe },
  { href: '/admin/seo-generator', label: 'SEO 文章生成器', icon: Sparkles },
  { href: '/admin/seo-analysis', label: 'SEO 分析', icon: Search },
  { href: '/admin/settings', label: '系統設定', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  // 如果是登入頁面，不顯示側邊欄
  if (pathname === '/admin/login') {
    return <ToastProvider>{children}</ToastProvider>
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <Logo size="lg" />
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r transition-transform',
            'lg:translate-x-0',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="p-6 border-b">
              <Logo size="lg" />
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="mr-3 h-5 w-5" />
                登出
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          'min-h-screen transition-all',
          'lg:ml-64',
          'pt-16 lg:pt-0'
        )}>
          {children}
        </main>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </ToastProvider>
  )
} 