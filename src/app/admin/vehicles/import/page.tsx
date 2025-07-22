'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Upload, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function ImportVehiclesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [importing, setImporting] = useState(false)
  const [importData, setImportData] = useState('')

  const sampleData = `品牌,型號,年份,引擎類型,冷媒類型,充填量,冷凍油類型,油量,備註
TOYOTA,ALTIS,2014-2018,1.8L/2.0L,R134a,500±25g,ND-OIL 8,150±10ml,
TOYOTA,CAMRY,2012-2017,2.0L/2.5L,R134a,550±25g,ND-OIL 8,150±10ml,
HONDA,CIVIC,2016-2021,1.5T/1.8L,R1234yf,450±20g,PAG 46,120±10ml,新款採用環保冷媒`

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: '錯誤',
        description: '請輸入要匯入的資料',
        variant: 'destructive',
      })
      return
    }

    setImporting(true)
    try {
      // 解析CSV資料
      const lines = importData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      if (headers.length < 8) {
        throw new Error('資料格式錯誤：欄位數量不足')
      }

      const vehicles = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 8) {
          vehicles.push({
            brand: values[0],
            model: values[1],
            year: values[2] || null,
            engineType: values[3] || null,
            refrigerantType: values[4],
            fillAmount: values[5],
            oilType: values[6] || null,
            oilAmount: values[7] || null,
            notes: values[8] || null,
          })
        }
      }

      // 發送到API
      const response = await fetch('/api/vehicle-models/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vehicles }),
      })

      if (!response.ok) {
        throw new Error('匯入失敗')
      }

      const result = await response.json()
      toast({
        title: '匯入成功',
        description: `成功匯入 ${result.count} 筆車型資料`,
      })

      // 清空輸入
      setImportData('')
      
      // 返回列表頁面
      setTimeout(() => {
        router.push('/admin/vehicles')
      }, 1500)

    } catch (error) {
      console.error('Import error:', error)
      toast({
        title: '匯入失敗',
        description: error instanceof Error ? error.message : '請檢查資料格式',
        variant: 'destructive',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/vehicles')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回車輛品牌管理
        </Button>
        
        <h1 className="text-3xl font-bold">匯入車輛冷媒資料</h1>
        <p className="text-gray-600 mt-2">支援CSV格式批量匯入車型冷媒填充資訊</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              匯入資料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  貼上CSV格式資料
                </label>
                <Textarea
                  value={importData}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setImportData(e.target.value)}
                  placeholder={sampleData}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button
                onClick={handleImport}
                disabled={importing || !importData.trim()}
                className="w-full"
              >
                {importing ? '匯入中...' : '開始匯入'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              格式說明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">CSV格式要求</h3>
                <p className="text-sm text-gray-600 mb-2">
                  第一行必須是標題列，包含以下欄位（依序）：
                </p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>品牌 - 車輛品牌名稱（必填）</li>
                  <li>型號 - 車型名稱（必填）</li>
                  <li>年份 - 生產年份範圍（選填）</li>
                  <li>引擎類型 - 引擎規格（選填）</li>
                  <li>冷媒類型 - R134a, R1234yf等（必填）</li>
                  <li>充填量 - 冷媒充填量（必填）</li>
                  <li>冷凍油類型 - PAG 46, ND-OIL 8等（選填）</li>
                  <li>油量 - 冷凍油量（選填）</li>
                  <li>備註 - 其他注意事項（選填）</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">範例資料</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <pre className="text-xs overflow-x-auto">{sampleData}</pre>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">注意事項</h3>
                <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                  <li>請確保品牌名稱已存在於系統中</li>
                  <li>每行代表一個車型的資料</li>
                  <li>欄位之間使用逗號分隔</li>
                  <li>空白欄位請留空，不要刪除逗號</li>
                  <li>建議先少量測試，確認格式正確後再大量匯入</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 