import { NextRequest, NextResponse } from 'next/server'
import { 
  getScheduledPublisher, 
  startScheduledPublishing, 
  stopScheduledPublishing, 
  getPublishStats,
  triggerManualPublish
} from '@/lib/scheduled-publisher'

// GET /api/scheduled-publisher - 獲取發布統計
export async function GET(request: NextRequest) {
  try {
    const stats = await getPublishStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('獲取發布統計失敗:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '獲取統計失敗' 
      },
      { status: 500 }
    )
  }
}

// POST /api/scheduled-publisher - 控制定時發布
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (!action) {
      return NextResponse.json(
        { error: '請提供操作類型 (start/stop/manual-publish)' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'start':
        await startScheduledPublishing()
        result = {
          success: true,
          message: '定時發布已啟動',
          action: 'start'
        }
        break

      case 'stop':
        stopScheduledPublishing()
        result = {
          success: true,
          message: '定時發布已停止',
          action: 'stop'
        }
        break

      case 'manual-publish':
        const publishResult = await triggerManualPublish()
        result = {
          success: publishResult.success,
          message: publishResult.message,
          action: 'manual-publish',
          count: publishResult.count
        }
        break

      default:
        return NextResponse.json(
          { error: '無效的操作類型' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('控制定時發布失敗:', error)
    return NextResponse.json(
      { 
        success: false,
        error: '操作失敗' 
      },
      { status: 500 }
    )
  }
} 