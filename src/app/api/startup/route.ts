import { NextRequest, NextResponse } from 'next/server'
import { startupService } from '@/lib/startup-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 手動觸發應用初始化...')
    await startupService.initialize()
    
    return NextResponse.json({
      success: true,
      message: '應用初始化完成',
      data: startupService.getStatus()
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
    const action = searchParams.get('action')

    if (action === 'status') {
      const status = startupService.getStatus()
      return NextResponse.json({
        success: true,
        data: status
      })
    }

    if (action === 'health') {
      const isHealthy = await startupService.healthCheck()
      return NextResponse.json({
        success: true,
        data: {
          healthy: isHealthy,
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