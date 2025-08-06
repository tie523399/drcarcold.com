'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 記錄錯誤到監控服務
    console.error('頁面錯誤:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            載入錯誤
          </CardTitle>
          <p className="text-gray-600">
            抱歉，頁面載入時發生錯誤
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 錯誤詳情（僅開發環境顯示） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-700 font-mono">
                {error.message}
              </p>
            </div>
          )}
          
          {/* 解決建議 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">嘗試以下方法：</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 重新載入頁面</li>
              <li>• 檢查網路連接</li>
              <li>• 清除瀏覽器快取</li>
              <li>• 稍後再試</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              重新載入
            </Button>
            
            <Link href="/">
              <Button className="w-full" variant="outline">
                <Home className="mr-2 h-4 w-4" />
                回到首頁
              </Button>
            </Link>
          </div>
          
          {/* SEO內容 */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              如果問題持續，請聯絡 DrCarCold 客服團隊
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}