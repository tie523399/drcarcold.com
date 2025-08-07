import { NextRequest, NextResponse } from 'next/server'
import { processVehicleFiles } from '@/scripts/process-vehicle-files'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    console.log('📁 車輛檔案匯入API - 開始處理...')
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    
    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: '沒有檔案被上傳'
      }, { status: 400 })
    }

    console.log(`📊 收到 ${files.length} 個檔案`)
    
    // 驗證檔案格式
    const supportedTypes = ['.xlsx', '.xls', '.csv']
    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase()
      if (!supportedTypes.includes(ext)) {
        return NextResponse.json({
          success: false,
          error: `不支援的檔案格式: ${ext}，請上傳 Excel (.xlsx, .xls) 或 CSV 檔案`
        }, { status: 400 })
      }
    }
    
    // 確保上傳目錄存在
    const uploadDir = path.join(process.cwd(), 'temp', 'vehicle-imports')
    await mkdir(uploadDir, { recursive: true })
    
    // 保存上傳的檔案
    const savedFilePaths: string[] = []
    for (const file of files) {
      if (!file.name) continue
      
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      const filePath = path.join(uploadDir, file.name)
      await writeFile(filePath, buffer)
      savedFilePaths.push(filePath)
      
      console.log(`💾 保存檔案: ${file.name}`)
    }
    
    // 🔄 處理車輛數據檔案 - 每一行一條數據
    console.log('🔄 開始處理車輛數據 - 每一行一條數據格式...')
    console.log(`📋 處理結構:`)
    console.log(`   欄位1: 品牌+汽車冷媒填充資訊`)
    console.log(`   欄位2: 車型`)
    console.log(`   欄位3: 年份`)
    console.log(`   欄位4: 冷媒類型 (空白→R1234yf)`)
    console.log(`   欄位5: 冷媒量`)
    console.log(`   欄位6: 冷凍油`)
    
    const result = await processVehicleFiles(savedFilePaths)
    
    // 清理臨時檔案
    const { unlink } = await import('fs/promises')
    for (const filePath of savedFilePaths) {
      try {
        await unlink(filePath)
        console.log(`🗑️  清理檔案: ${filePath}`)
      } catch (error) {
        console.warn(`清理檔案失敗: ${filePath}`, error)
      }
    }
    
    return NextResponse.json({
      success: result.success,
      message: result.success 
        ? `檔案處理完成 - 處理 ${result.totalProcessed} 筆，匯入 ${result.totalImported} 筆數據` 
        : '檔案處理失敗',
      data: {
        totalProcessed: result.totalProcessed,
        totalImported: result.totalImported,
        errors: result.errors.length > 0 ? result.errors : undefined
      }
    })
    
  } catch (error) {
    console.error('❌ 車輛檔案匯入錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '服務器處理錯誤',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}