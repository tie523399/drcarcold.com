# 🚂 Railway 部署完整指南

## 📋 部署前檢查清單

### ✅ 必要文件
- [x] `package.json` - 包含所有腳本和依賴
- [x] `nixpacks.toml` - Nixpacks 構建配置
- [x] `railway.json` - Railway 部署配置
- [x] `next.config.js` - Next.js 配置（standalone 模式）
- [x] `prisma/schema.prisma` - 數據庫 schema
- [x] `public/images/hero-video.mp4` - 首頁背景視頻

### ✅ 環境配置
- [x] NODE_ENV=production
- [x] DATABASE_URL=file:./prod.db
- [x] JWT_SECRET (已設置)
- [x] ADMIN_EMAIL=admin@drcarcold.com
- [x] ADMIN_PASSWORD=DrCarCold2024!
- [x] NEXTAUTH_SECRET (已設置)

## 🚀 部署步驟

### 步驟1: 準備代碼
```bash
# 執行預部署檢查
chmod +x scripts/railway-deploy.sh
./scripts/railway-deploy.sh
```

### 步驟2: 推送到 GitHub
```bash
git add .
git commit -m "feat: add hero video and Railway deployment config"
git push origin main
```

### 步驟3: Railway 部署
1. **前往 [Railway.app](https://railway.app)**
2. **點擊 "Start a New Project"**
3. **選擇 "Deploy from GitHub repo"**
4. **選擇 `tie523399/drcarcold` 倉庫**
5. **Railway 自動檢測配置並開始部署**

### 步驟4: 配置自定義域名
1. **部署完成後，前往項目設置**
2. **點擊 "Domains" 標籤**
3. **添加自定義域名**: `tieads.top`
4. **在域名管理後台添加 CNAME 記錄**:
   - 類型: CNAME
   - 名稱: @ 或 www
   - 值: Railway 提供的域名 (例: xxx.railway.app)

## 📊 部署配置詳解

### Nixpacks 配置 (`nixpacks.toml`)
```toml
[phases.setup]
nixPkgs = ['nodejs_18', 'npm']

[phases.install]
cmds = [
  'npm ci --include=dev',
  'npx prisma generate'
]

[phases.build]
cmds = [
  'npm run build',
  'npx prisma db push --accept-data-loss || true'
]

[start]
cmd = 'npm start'
```

### Railway 配置 (`railway.json`)
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30
  }
}
```

## 🔍 部署監控

### 檢查部署狀態
1. **Railway Dashboard** - 查看構建和部署日誌
2. **應用健康檢查** - `/api/health` 端點
3. **數據庫狀態** - Prisma 遷移日誌

### 常見問題排查
1. **構建失敗** - 檢查 Node.js 版本和依賴
2. **啟動失敗** - 檢查環境變數和端口配置
3. **數據庫錯誤** - 檢查 Prisma schema 和遷移

## 🎯 部署後驗證

### 功能測試
- [ ] 首頁加載 (帶視頻背景)
- [ ] 管理後台登入
- [ ] 產品頁面
- [ ] 冷媒查詢功能
- [ ] 新聞文章
- [ ] 聯絡表單

### 性能測試
- [ ] 頁面加載速度 < 3秒
- [ ] 視頻自動播放
- [ ] 響應式設計
- [ ] SEO 元標籤

## 📞 技術支援

如果遇到部署問題：
1. 檢查 Railway 部署日誌
2. 確認所有環境變數正確設置
3. 驗證 GitHub 倉庫權限
4. 檢查域名 DNS 設置

---

**預計部署時間**: 5-10 分鐘  
**域名生效時間**: 5-30 分鐘 