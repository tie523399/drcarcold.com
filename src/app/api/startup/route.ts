import { NextRequest, NextResponse } from 'next/server'
import { getAutoServiceManager } from '@/lib/auto-service-manager'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 手動觸發應用初始化...')
    const manager = getAutoServiceManager()
    await manager.start()
    
    return NextResponse.json({
      success: true,
      message: '應用初始化完成',
      data: { status: 'running', timestamp: new Date().toISOString() }
    })
  } catch (error) {
    console.error('應用初始化失敗:', error)
    return NextResponse.json({
      success: false,
      error: '應用初始化失敗'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status' // 預設為 status

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        data: { status: 'running', timestamp: new Date().toISOString() }
      })
    }

    if (action === 'health') {
      return NextResponse.json({
        success: true,
        data: {
          healthy: true,
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({
      success: false,
      error: '無效的操作'
    }, { status: 400 })

  } catch (error) {
    console.error('啟動服務 API 錯誤:', error)
    return NextResponse.json({
      success: false,
      error: '內部服務器錯誤'
    }, { status: 500 })
  }
} 