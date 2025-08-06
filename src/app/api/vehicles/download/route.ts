import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'import' // import 或 bilingual
    
    const fileName = type === 'bilingual' ? 'vehicles_bilingual.csv' : 'vehicles_import.csv'
    const filePath = path.join(process.cwd(), 'public', fileName)
    
    // 檢查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json({
        success: false,
        error: '範本文件不存在'
      }, { status: 404 })
    }
    
    // 讀取文件
    const fileContent = await fs.readFile(filePath)
    
    // 設定下載headers
    const headers = new Headers()
    headers.set('Content-Type', 'text/csv; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`)
    headers.set('Content-Length', fileContent.length.toString())
    
    return new NextResponse(fileContent, {
      status: 200,
      headers
    })
    
  } catch (error) {
    console.error('下載範本失敗:', error)
    return NextResponse.json({
      success: false,
      error: `下載失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    }, { status: 500 })
  }
}