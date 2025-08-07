import { NextRequest, NextResponse } from 'next/server'
import { smartScheduleManager } from '@/lib/smart-schedule-manager'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'config':
        // 獲取當前調度配置
        const config = await smartScheduleManager.getSavedScheduleConfig()
        return NextResponse.json({
          success: true,
          data: config
        })

      case 'usage-report':
        // 獲取API使用量報告
        const report = await smartScheduleManager.getUsageReport()
        return NextResponse.json({
          success: true,
          data: report
        })

      case 'recommended-provider':
        // 獲取當前推薦的AI提供商
        const provider = await smartScheduleManager.getRecommendedProvider()
        return NextResponse.json({
          success: true,
          data: { provider }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('智能調度API錯誤:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '獲取調度信息失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, provider, success } = body

    switch (action) {
      case 'optimize':
        // 重新計算最佳調度
        console.log('🧠 開始智能調度優化...')
        const optimizedConfig = await smartScheduleManager.calculateOptimalSchedule()
        
        return NextResponse.json({
          success: true,
          message: '智能調度優化完成',
          data: optimizedConfig
        })

      case 'record-usage':
        // 記錄API使用量
        if (!provider || typeof success !== 'boolean') {
          return NextResponse.json({
            success: false,
            error: '需要提供provider和success參數'
          }, { status: 400 })
        }
        
        await smartScheduleManager.recordAPIUsage(provider, success)
        
        return NextResponse.json({
          success: true,
          message: 'API使用量已記錄'
        })

      case 'reset-counters':
        // 重置每日計數器
        await smartScheduleManager.resetDailyCounters()
        
        return NextResponse.json({
          success: true,
          message: '每日計數器已重置'
        })

      case 'can-call':
        // 檢查是否可以調用API
        if (!provider) {
          return NextResponse.json({
            success: false,
            error: '需要提供provider參數'
          }, { status: 400 })
        }
        
        const canCall = await smartScheduleManager.canMakeAPICall(provider)
        
        return NextResponse.json({
          success: true,
          data: { canCall }
        })

      default:
        return NextResponse.json({
          success: false,
          error: '無效的操作'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('智能調度操作失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '調度操作失敗'
    }, { status: 500 })
  }
}
