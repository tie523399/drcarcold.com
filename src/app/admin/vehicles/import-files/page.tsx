'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ImportFilesPage() {
  const [files, setFiles] = useState<FileList | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      alert('請選擇檔案')
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      
      // 添加所有檔案
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const response = await fetch('/api/vehicles/import-files', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // 清空檔案選擇
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        setFiles(null)
      }

    } catch (error) {
      console.error('上傳錯誤:', error)
      setResult({
        success: false,
        error: '網路錯誤，請重試'
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🚗 車輛數據檔案匯入</h1>
        <p className="text-gray-600 mt-2">
          上傳車輛數據檔案 - 每一行都是一條數據
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 上傳區域 */}
        <Card>
          <CardHeader>
            <CardTitle>📤 檔案上傳</CardTitle>
            <CardDescription>
              支援 Excel (.xlsx, .xls) 和 CSV 檔案格式，可同時選擇多個檔案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                📁 選擇檔案
              </label>
              <input
                id="file-input"
                type="file"
                multiple
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {files && files.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">📋 選中的檔案：</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="flex justify-between">
                      <span>• {file.name}</span>
                      <span className="text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!files || files.length === 0 || isUploading}
              className="w-full"
            >
              {isUploading ? '⏳ 處理中...' : '🚀 開始匯入'}
            </Button>
          </CardContent>
        </Card>

        {/* 格式說明 */}
        <Card>
          <CardHeader>
            <CardTitle>📋 檔案格式說明</CardTitle>
            <CardDescription>
              每一行代表一條車輛數據，包含6個欄位
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">📊 數據結構：</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位1:</span> 品牌+汽車冷媒填充資訊</div>
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位2:</span> 車型</div>
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位3:</span> 年份</div>
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位4:</span> 冷媒類型 <span className="text-orange-600">(空白→R1234yf)</span></div>
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位5:</span> 冷媒量</div>
                    <div><span className="font-mono bg-blue-100 px-1 rounded">欄位6:</span> 冷凍油</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">🔄 處理邏輯：</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>自動從欄位1提取品牌名稱</li>
                  <li>冷媒類型空白時自動填入 <code className="bg-gray-100 px-1 rounded">R1234yf</code></li>
                  <li>跳過重複數據</li>
                  <li>自動創建新品牌</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 結果顯示 */}
      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {result.success ? '✅ 處理結果' : '❌ 處理失敗'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">{result.message}</p>
                {result.data && (
                  <div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {result.data.totalProcessed}
                        </div>
                        <div className="text-sm text-green-700">總處理筆數</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {result.data.totalImported}
                        </div>
                        <div className="text-sm text-blue-700">成功匯入</div>
                      </div>
                    </div>

                    {result.data.errors && result.data.errors.length > 0 && (
                      <details className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <summary className="cursor-pointer text-orange-700 font-medium">
                          ⚠️ 警告 ({result.data.errors.length} 個)
                        </summary>
                        <ul className="mt-2 text-sm text-orange-600 max-h-40 overflow-y-auto">
                          {result.data.errors.slice(0, 20).map((error: string, index: number) => (
                            <li key={index} className="mt-1">• {error}</li>
                          ))}
                          {result.data.errors.length > 20 && (
                            <li className="text-gray-500 mt-2">... 還有 {result.data.errors.length - 20} 個錯誤</li>
                          )}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p><strong>錯誤:</strong> {result.error}</p>
                {result.details && (
                  <p className="text-sm mt-2"><strong>詳細:</strong> {result.details}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 範例檔案下載 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📥 範例檔案</CardTitle>
          <CardDescription>
            下載範本檔案進行測試
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => {
                // 🔄 包含品牌+汽車冷媒填充資訊的範本
                const csvContent = `品牌+汽車冷媒填充資訊,車型,年份,冷媒,冷媒量,冷凍油
AUDI 汽車冷媒填充資訊,A1 8X1/8XA/8XF/8XK,2010 - 2018,R134a/R1234yf,500 / 450 ± 20,100 ± 10
AUDI 冷媒充填量表,A2 8X0,2000 - 2007,,520 ± 20,110 ± 10
BMW 汽車冷媒填充資訊,3系 E90/E91/E92/E93,2005 - 2013,R134a,650 ± 30,120 ± 10
TOYOTA 冷媒填充資訊,Camry XV40,2006 - 2011,,580 ± 25,150 ± 15
HONDA Air Conditioning,Civic FB/FG,2012 - 2015,,420 ± 20,90 ± 10`

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'vehicle-template-6-columns.csv'
                a.click()
                window.URL.revokeObjectURL(url)
              }}
            >
              📄 下載 CSV 範本 (6欄位格式)
            </Button>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              <p className="font-medium mb-2">📝 範本說明：</p>
              <p>• 每一行代表一條車輛數據</p>
              <p>• <strong>欄位1</strong> 包含品牌 + 汽車冷媒填充資訊 (例如: "AUDI 汽車冷媒填充資訊")</p>
              <p>• 系統會自動從欄位1提取純品牌名稱 (移除冷媒相關詞彙)</p>
              <p>• 空白的冷媒欄位會自動填入 R1234yf</p>
              <p>• 支援中英文混合格式</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}