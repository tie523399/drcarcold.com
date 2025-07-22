# 🚂 Railway 部署指南

## 🌟 為什麼選擇 Railway？

- ✅ **簡單部署**: 自動從 Git 部署
- ✅ **免費額度**: 每月 $5 免費額度
- ✅ **自動 SSL**: 免費 HTTPS 憑證
- ✅ **PostgreSQL**: 免費資料庫
- ✅ **零設定**: 自動檢測 Next.js
- ✅ **自定義域名**: 免費綁定 drcarcold.com

## 📋 部署步驟

### 1. 🏗️ 準備工作

1. **註冊 Railway 帳戶**
   - 前往 [railway.app](https://railway.app)
   - 使用 GitHub 帳戶登入

2. **推送程式碼到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Railway deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/drcarcold.git
   git push -u origin main
   ```

### 2. 🚀 部署到 Railway

#### 方法一：Web 界面部署

1. **建立新專案**
   - 登入 Railway Dashboard
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 選擇您的 drcarcold 倉庫

2. **添加 PostgreSQL 資料庫**
   - 在專案中點擊 "Add Service"
   - 選擇 "Database" → "PostgreSQL"
   - Railway 會自動建立資料庫

3. **設定環境變數**
   在 Railway Dashboard 的 Variables 區域添加：
   ```
   NODE_ENV=production
   DATABASE_PROVIDER=postgresql
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   NEXT_PUBLIC_SITE_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_EMAIL=admin@drcarcold.com
   ADMIN_PASSWORD=your-secure-password
   ```

#### 方法二：CLI 部署

```bash
# 1. 登入 Railway
railway login

# 2. 初始化專案
railway init

# 3. 添加 PostgreSQL 服務
railway add --database postgres

# 4. 設定環境變數
railway variables set NODE_ENV=production
railway variables set DATABASE_PROVIDER=postgresql
railway variables set JWT_SECRET=your-super-secret-jwt-key
railway variables set ADMIN_EMAIL=admin@drcarcold.com
railway variables set ADMIN_PASSWORD=your-secure-password

# 5. 部署
railway up
```

### 3. 🔧 環境變數設定

必要的環境變數：

```bash
# 核心設定
NODE_ENV=production
DATABASE_PROVIDER=postgresql
DATABASE_URL=${{Postgres.DATABASE_URL}}  # Railway 自動提供

# 網站設定
NEXT_PUBLIC_SITE_URL=${{RAILWAY_PUBLIC_DOMAIN}}  # Railway 自動提供
NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}/api

# 安全設定
JWT_SECRET=your-super-secret-jwt-key-change-this

# 管理員設定
ADMIN_EMAIL=admin@drcarcold.com
ADMIN_PASSWORD=your-secure-password

# 可選：AI API 金鑰
COHERE_API_KEY=your-cohere-api-key
OPENAI_API_KEY=your-openai-api-key
GROQ_API_KEY=your-groq-api-key
GEMINI_API_KEY=your-gemini-api-key

# 可選：Telegram Bot
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### 4. 🌐 自定義域名設定

1. **在 Railway 中設定**
   - 進入您的專案
   - 點擊 "Settings" → "Domains"
   - 點擊 "Add Domain"
   - 輸入 `drcarcold.com`

2. **更新 GoDaddy DNS**
   將您的 DNS A 記錄改為指向 Railway：
   ```
   類型    名稱    值                            TTL
   CNAME   @       your-app.railway.app         1小時
   CNAME   www     your-app.railway.app         1小時
   ```

### 5. 🗄️ 資料庫初始化

Railway 自動處理資料庫遷移，但您可能需要手動執行種子：

```bash
# 使用 Railway CLI
railway run npx prisma db seed

# 或在 Railway Dashboard 的 Console 中執行
npx prisma db seed
```

### 6. 📊 監控和日誌

**查看部署日誌：**
```bash
railway logs
```

**開啟專案控制台：**
```bash
railway shell
```

**查看服務狀態：**
- 在 Railway Dashboard 中即時監控
- CPU、記憶體、網路使用情況
- 自動錯誤報告

### 7. 🔄 持續部署

Railway 自動設定 CI/CD：

1. **自動部署**: 每次推送到 main 分支時自動部署
2. **預覽部署**: Pull Request 會建立預覽環境
3. **回滾**: 一鍵回滾到之前的版本

**手動重新部署：**
```bash
railway up --detach
```

### 8. 💰 費用估算

**免費額度 (每月):**
- $5 使用額度
- 包含 PostgreSQL 資料庫
- 500MB 儲存空間
- 無頻寬限制

**估計使用量:**
- 小型網站: $0-2/月
- 中型流量: $3-8/月
- 高流量: $10+/月

### 9. 🛠️ 常見問題

#### Q: 部署失敗怎麼辦？
```bash
# 檢查建構日誌
railway logs --tail

# 檢查環境變數
railway variables

# 重新部署
railway up --detach
```

#### Q: 資料庫連接錯誤？
1. 確認 `DATABASE_URL` 環境變數設定
2. 檢查 Prisma schema 中的 provider
3. 執行 `railway run npx prisma db push`

#### Q: 如何訪問生產資料庫？
```bash
# 開啟資料庫 URL
railway open postgres

# 或使用 Prisma Studio
railway run npx prisma studio
```

#### Q: 如何更新環境變數？
```bash
# CLI 方式
railway variables set KEY=value

# 或在 Railway Dashboard 的 Variables 頁面更新
```

### 10. 🔐 安全最佳實踐

1. **使用強密碼**: JWT_SECRET 至少 32 字符
2. **定期更新密鑰**: 定期輪換 API 金鑰
3. **環境分離**: 使用不同環境變數於開發/生產
4. **備份策略**: Railway 提供自動備份，但建議額外備份

### 11. 📈 效能優化

1. **啟用快取**:
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       serverComponentsExternalPackages: ['@prisma/client']
     },
     headers: async () => [{
       source: '/_next/static/(.*)',
       headers: [{
         key: 'Cache-Control',
         value: 'public, max-age=31536000, immutable'
       }]
     }]
   }
   ```

2. **資料庫優化**:
   - 使用 Connection Pooling
   - 添加適當的索引
   - 定期清理舊數據

### 12. 🚀 部署檢查清單

- [ ] GitHub 倉庫已建立並推送程式碼
- [ ] Railway 專案已建立
- [ ] PostgreSQL 資料庫已添加
- [ ] 環境變數已設定
- [ ] 自定義域名已配置
- [ ] DNS 記錄已更新
- [ ] 資料庫已初始化和種子
- [ ] 應用程式正常運行
- [ ] 管理後台可訪問
- [ ] SSL 憑證有效

### 13. 📞 取得協助

- **Railway 文檔**: [docs.railway.app](https://docs.railway.app)
- **社群支援**: [Railway Discord](https://discord.gg/railway)
- **GitHub Issues**: 報告程式錯誤

---

## 🎯 快速開始

執行以下指令即可開始部署：

```bash
# 1. 安裝 Railway CLI
npm install -g @railway/cli

# 2. 登入
railway login

# 3. 初始化並部署
railway init
railway add --database postgres
railway up
```

部署完成後，您將獲得一個 `your-app.railway.app` 網址，然後就可以設定自定義域名了！ 