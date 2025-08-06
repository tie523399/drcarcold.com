import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Search, ArrowLeft, Car } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
            <Car className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            頁面不存在
          </CardTitle>
          <p className="text-gray-600">
            抱歉，您要找的頁面可能已經移動或不存在了
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* SEO優化建議 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">您可能在尋找：</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 汽車冷媒知識文章</li>
              <li>• R134a、R1234yf 技術資訊</li>
              <li>• 汽車冷氣維修教學</li>
              <li>• 車型冷媒規格查詢</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <Link href="/">
              <Button className="w-full" variant="default">
                <Home className="mr-2 h-4 w-4" />
                回到首頁
              </Button>
            </Link>
            
            <Link href="/zh/news">
              <Button className="w-full" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                瀏覽新聞知識
              </Button>
            </Link>
            
            <Link href="/zh/about">
              <Button className="w-full" variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                關於我們
              </Button>
            </Link>
          </div>
          
          {/* 額外的SEO內容 */}
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              DrCarCold 專業汽車冷媒服務 - 提供 R134a、R1234yf 冷媒充填及汽車冷氣維修服務
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// SEO 元數據
export const metadata = {
  title: '頁面不存在 - DrCarCold 汽車冷媒專家',
  description: '抱歉，您要找的頁面不存在。請瀏覽我們的汽車冷媒知識文章、R134a R1234yf 技術資訊或汽車冷氣維修教學。',
  robots: 'noindex, follow'
}