# 🚀 AWS 一鍵部署指南

## 方案A: 手動部署（推薦，3分鐘）

### 1. 前往 AWS Amplify
**直接點擊**: https://console.aws.amazon.com/amplify/

### 2. 創建應用
- 點擊 **"New app"** → **"Host web app"**
- 選擇 **"GitHub"**
- 選擇倉庫: **tie523399/drcarcold**
- 分支: **main**

### 3. 配置設定
**App name**: `drcarcold`

**環境變數**（複製貼上）：
```
NODE_ENV=production
DATABASE_URL=file:./dev.db
JWT_SECRET=drcarcold-super-secret-jwt-key-2024-aws
ADMIN_EMAIL=admin@drcarcold.com
ADMIN_PASSWORD=DrCarCold2024!
NEXTAUTH_SECRET=drcarcold-nextauth-secret-2024
```

### 4. 完成部署
- 點擊 **"Save and deploy"**
- 等待 5-10 分鐘
- 獲得網址: `https://xxxxxxx.amplifyapp.com`

---

## 方案B: 自動化部署（需要設定）

### 1. 設定 AWS 憑證
```bash
aws configure
```

輸入：
- **AWS Access Key ID**: 您的 Access Key
- **AWS Secret Access Key**: 您的 Secret Key  
- **Default region**: `us-east-1`
- **Default output format**: `json`

### 2. 執行自動部署
```bash
.\deploy-to-aws.ps1
```

---

## 🎯 推薦做法

**選擇方案A**，因為：
- ✅ 更快速（3分鐘）
- ✅ 不需要設定 AWS CLI
- ✅ 視覺化界面
- ✅ 更少出錯

## 🔗 有用連結

- **AWS Amplify Console**: https://console.aws.amazon.com/amplify/
- **GitHub 倉庫**: https://github.com/tie523399/drcarcold
- **AWS 免費帳戶**: https://aws.amazon.com/free/

## 📞 如果遇到問題

1. **GitHub 授權失敗**: 確保已登入 GitHub
2. **建置失敗**: 檢查環境變數是否正確
3. **域名問題**: 稍後可以設定自定義域名

## 🎉 部署成功後

您會獲得：
- 🌐 **生產網址**: `https://xxxxxxx.amplifyapp.com`
- 🔧 **管理後台**: `/admin` 
- 📱 **自動 SSL**: HTTPS 安全連線
- 🌍 **全球 CDN**: 快速載入

---

**建議現在就去方案A手動部署，只需要3分鐘！** 🚀 