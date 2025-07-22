import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramUpdate } from '@/lib/telegram-bot'

// POST /api/telegram-webhook
// Telegram Bot 會將更新發送到這個端點
export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // 處理 Telegram 更新
    await handleTelegramUpdate(update)
    
    // Telegram 要求返回 200 OK
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: true }) // 即使出錯也返回 200，避免 Telegram 重試
  }
}

// GET /api/telegram-webhook
// 用於設定 webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  if (action === 'setup') {
    // 這裡可以實作設定 webhook 的邏輯
    return NextResponse.json({
      message: '請使用以下命令設定 Telegram Bot Webhook:',
      command: `curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook -d "url=https://yourdomain.com/api/telegram-webhook"`,
    })
  }
  
  return NextResponse.json({
    message: 'Telegram Bot Webhook Endpoint',
    usage: 'POST /api/telegram-webhook',
  })
} 