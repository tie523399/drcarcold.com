// Telegram Bot 主要處理模組
// 為 webhook 提供統一的處理接口

import { sendTelegramMessage } from './telegram-bot-enhanced'

/**
 * 處理 Telegram Bot 的更新消息
 * @param update Telegram 更新對象
 */
export async function handleTelegramUpdate(update: any): Promise<void> {
  try {
    // 檢查是否為消息更新
    if (!update.message) {
      console.log('非消息更新，跳過處理')
      return
    }

    const message = update.message
    const chatId = message.chat.id.toString()
    const text = message.text || ''

    console.log(`收到 Telegram 消息: ${text} (來自: ${chatId})`)

    // 基本指令處理
    if (text.startsWith('/')) {
      await handleCommand(chatId, text)
    } else {
      // 非指令消息的一般回應
      await sendTelegramMessage(
        chatId,
        '您好！我是車冷博士的助手機器人。\n\n使用 /help 查看可用指令。'
      )
    }
  } catch (error) {
    console.error('處理 Telegram 更新失敗:', error)
  }
}

/**
 * 處理 Telegram Bot 指令
 * @param chatId 聊天 ID
 * @param command 指令文本
 */
async function handleCommand(chatId: string, command: string): Promise<void> {
  try {
    const cmd = command.toLowerCase().split(' ')[0]

    switch (cmd) {
      case '/start':
      case '/help':
        await sendTelegramMessage(
          chatId,
          `🤖 *車冷博士助手機器人*\n\n` +
          `歡迎使用我們的服務！\n\n` +
          `*可用指令:*\n` +
          `/help - 顯示此幫助信息\n` +
          `/status - 查看服務狀態\n` +
          `/info - 公司資訊\n\n` +
          `如需更多協助，請聯繫我們：\n` +
          `📞 04-26301915\n` +
          `📱 0903-049150`
        )
        break

      case '/status':
        await sendTelegramMessage(
          chatId,
          `✅ *系統狀態*\n\n` +
          `🌐 網站運行正常\n` +
          `💾 資料庫連線正常\n` +
          `🔄 自動服務運行中\n\n` +
          `最後更新: ${new Date().toLocaleString('zh-TW')}`
        )
        break

      case '/info':
        await sendTelegramMessage(
          chatId,
          `🏢 *車冷博士*\n\n` +
          `專業冷凍空調解決方案供應商\n\n` +
          `📍 地址: 台中市龍井區忠和里海尾路278巷33弄8號\n` +
          `📞 電話: 04-26301915\n` +
          `📠 傳真: 04-26301510\n` +
          `📱 手機: 0903-049150\n` +
          `📧 Email: hongshun.TW@gmail.com\n` +
          `🕒 營業時間: 週一至週五 09:30-17:30\n\n` +
          `🌐 網站: https://drcarcold.com`
        )
        break

      default:
        await sendTelegramMessage(
          chatId,
          `❓ 未知指令: ${command}\n\n使用 /help 查看可用指令。`
        )
        break
    }
  } catch (error) {
    console.error('處理指令失敗:', error)
    await sendTelegramMessage(
      chatId,
      '❌ 處理指令時發生錯誤，請稍後再試。'
    )
  }
}

export { sendTelegramMessage }