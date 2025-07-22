import { NextRequest, NextResponse } from 'next/server'
import { getAutoStartupService } from '@/lib/auto-startup-service'

export async function GET(request: NextRequest) {
  try {
    const service = getAutoStartupService()
    const status = service.getStatus()
    
    return NextResponse.json({ 
      success: true, 
      status,
      message: '自動服務狀態' 
    })
  } catch (error) {
    console.error('獲取自動服務狀態失敗:', error)
    return NextResponse.json(
      { success: false, error: '獲取狀態失敗' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    const service = getAutoStartupService()

    switch (action) {
      case 'start':
        await service.start()
        return NextResponse.json({ 
          success: true, 
          message: '自動服務已啟動' 
        })

      case 'stop':
        await service.stop()
        return NextResponse.json({ 
          success: true, 
          message: '自動服務已停止' 
        })

      case 'status':
        const status = service.getStatus()
        return NextResponse.json({ 
          success: true, 
          status 
        })

      case 'reload':
        await service.reloadSettings()
        return NextResponse.json({ 
          success: true, 
          message: '設定已重新載入並重啟服務' 
        })

      default:
        return NextResponse.json(
          { success: false, error: '無效的操作' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('自動服務操作失敗:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '操作失敗' },
      { status: 500 }
    )
  }
} 