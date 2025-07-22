// 增強版 Telegram Webhook API 路由
// 使用 TelegramBotController 處理所有指令

import { NextRequest, NextResponse } from 'next/server'
import { TelegramBotController } from '@/lib/telegram-bot-enhanced'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // 獲取系統設定中的 Telegram 配置
    const settings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['telegram_bot_token', 'telegram_chat_id']
        }
      }
    })
    
    const settingsMap = new Map(settings.map(s => [s.key, s.value]))
    const botToken = settingsMap.get('telegram_bot_token')
    const chatId = settingsMap.get('telegram_chat_id')
    
    if (!botToken || !chatId) {
      console.error('Telegram 設定未完成')
      return NextResponse.json({ error: 'Telegram configuration missing' }, { status: 500 })
    }
    
    // 驗證請求來源
    if (update.message?.chat?.id?.toString() !== chatId) {
      console.log('未授權的 chat ID:', update.message?.chat?.id)
      return NextResponse.json({ ok: true })
    }
    
    // 使用增強版控制器處理更新
    const controller = new TelegramBotController(chatId, botToken)
    await controller.handleUpdate(update)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('處理 Telegram webhook 時發生錯誤:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 處理 GET 請求（用於測試）
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: '增強版 Telegram Bot Webhook 正在運行',
    features: [
      '爬蟲控制',
      '來源管理',
      '監控統計',
      '品質檢查',
      '設定管理'
    ]
  })
} 