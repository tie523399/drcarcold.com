# Telegram Bot 爬蟲系統架構指南

## 概述

本系統採用**混合架構**設計，結合了以下兩個核心元件：

1. **自動爬蟲系統** (`auto-news-crawler.ts`) - 定時自動執行爬取任務
2. **Telegram Bot 控制器** (`telegram-bot-enhanced.ts`) - 提供即時控制和管理介面

## 系統架構優勢

### ✅ 優點

1. **雙重觸發機制**
   - 自動定時爬取（背景執行）
   - 手動即時控制（Telegram 指令）

2. **完整監控能力**
   - 自動通知（成功/失敗/部分成功）
   - 即時查詢狀態和統計

3. **靈活的管理方式**
   - Web 後台管理介面（批量操作）
   - Telegram Bot（即時調整）

4. **高可用性設計**
   - 即使 Telegram 服務中斷，自動爬蟲仍可運行
   - 多種通知方式（Telegram + Email）

## Telegram Bot 功能

### 基本指令

| 指令 | 說明 | 範例 |
|------|------|------|
| `/help` | 顯示幫助訊息 | `/help` |
| `/status` | 查看爬蟲狀態 | `/status` |

### 爬蟲控制

| 指令 | 說明 | 範例 |
|------|------|------|
| `/crawl_start` | 啟動自動爬蟲 | `/crawl_start` |
| `/crawl_stop` | 停止自動爬蟲 | `/crawl_stop` |
| `/crawl_now` | 立即執行一次爬取 | `/crawl_now` |
| `[URL]` | 爬取單一文章 | `https://example.com/article` |

### 來源管理

| 指令 | 說明 | 範例 |
|------|------|------|
| `/crawl_sources` | 列出所有新聞來源 | `/crawl_sources` |
| `/add_source` | 新增新聞來源 | `/add_source U-CAR https://news.u-car.com.tw/` |
| `/remove_source` | 移除新聞來源 | `/remove_source abc123` |
| `/toggle_source` | 啟用/停用來源 | `/toggle_source abc123` |

### 設定管理

| 指令 | 說明 | 範例 |
|------|------|------|
| `/set_interval` | 設定爬取間隔（分鐘） | `/set_interval 120` |
| `/set_keywords` | 設定 SEO 關鍵字 | `/set_keywords 汽車冷媒,R134a,冷氣保養` |

### 統計資訊

| 指令 | 說明 | 範例 |
|------|------|------|
| `/crawl_history` | 查看爬取歷史 | `/crawl_history 20` |
| `/crawl_stats` | 查看統計資料 | `/crawl_stats 30` |
| `/quality_check` | 檢查文章品質 | `/quality_check https://example.com/article` |

## 設定步驟

### 1. 設定 Telegram Bot

1. 在 Telegram 找 [@BotFather](https://t.me/botfather)
2. 創建新 Bot：`/newbot`
3. 取得 Bot Token
4. 在後台設定頁面填入 Token

### 2. 設定 Webhook

```bash
# 設定 Webhook URL
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram-webhook/enhanced-route"}'
```

### 3. 使用增強版 Webhook

將原本的 `/api/telegram-webhook` 改為使用增強版：

```typescript
// 在 /api/telegram-webhook/route.ts 中
import { POST, GET } from './enhanced-route'
export { POST, GET }
```

## 使用範例

### 1. 初始設定

```
/set_keywords 汽車冷媒,R134a,R1234yf,冷氣保養,車用冷媒
/set_interval 60
/add_source U-CAR https://news.u-car.com.tw/
/add_source 車訊網 https://carnews.com/
```

### 2. 日常操作

```
# 查看狀態
/status

# 立即爬取
/crawl_now

# 查看最近爬取記錄
/crawl_history 10

# 檢查特定文章品質
/quality_check https://news.u-car.com.tw/article/12345
```

### 3. 監控和維護

```
# 查看 7 天統計
/crawl_stats 7

# 查看 30 天統計
/crawl_stats 30

# 停用有問題的來源
/toggle_source abc123

# 調整爬取頻率
/set_interval 120
```

## 整合建議

### 1. 保持分離架構

- **自動爬蟲**：負責定時任務和大批量處理
- **Telegram Bot**：負責即時控制和查詢
- **Web 後台**：負責詳細設定和數據管理

### 2. 監控策略

- 設定 Telegram 通知接收失敗和部分成功
- Email 通知用於詳細報告
- 定期透過 Bot 查看統計資料

### 3. 性能優化

- 避免在尖峰時段使用 `/crawl_now`
- 合理設定爬取間隔（建議 60-120 分鐘）
- 定期檢查和優化新聞來源

## 注意事項

1. **安全性**
   - 確保只有授權的 Chat ID 可以使用 Bot
   - 定期更換 Bot Token

2. **限制**
   - Telegram 訊息有長度限制（4096 字元）
   - 避免頻繁發送大量訊息

3. **備份**
   - 定期備份爬取記錄
   - 保留重要的設定資料

## 故障排除

### Bot 沒有回應

1. 檢查 Webhook 設定
2. 確認 Bot Token 正確
3. 查看伺服器日誌

### 爬蟲無法啟動

1. 檢查系統設定
2. 確認 API Key 有效
3. 查看錯誤日誌

### 通知未收到

1. 確認 Chat ID 正確
2. 檢查 Bot 權限
3. 查看通知設定 