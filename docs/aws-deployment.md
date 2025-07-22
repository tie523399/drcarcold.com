# 🚀 AWS 部署完整指南

## 🌟 為什麼選擇 AWS？

- ✅ **穩定性最佳**: 99.99% 可用性保證
- ✅ **全球 CDN**: 全世界訪問都快速
- ✅ **成本控制**: 按使用量計費
- ✅ **擴展性強**: 自動應對流量增長
- ✅ **專業級**: 大企業都在用

## 📋 推薦方案：AWS Amplify

### 🎯 方案特點：
- 💰 **成本**: ~$5-15/月
- ⚡ **速度**: 全球 CDN 加速
- 🔒 **安全**: 自動 SSL + DDoS 防護
- 🔄 **自動部署**: Git 推送即部署

## 🚀 部署步驟

### 1. 準備工作

#### A. 推送代碼到 GitHub
```bash
git init
git add .
git commit -m "Deploy to AWS Amplify"
git branch -M main
git remote add origin https://github.com/yourusername/drcarcold.git
git push -u origin main
```

#### B. 創建 AWS 帳戶
1. 前往 [AWS 官網](https://aws.amazon.com)
2. 註冊帳戶（需要信用卡驗證）
3. 前往 [AWS Amplify Console](https://console.aws.amazon.com/amplify/)

### 2. 部署到 AWS Amplify

#### 步驟 1: 創建新應用
1. 打開 AWS Amplify Console
2. 點擊 "New app" → "Host web app"
3. 選擇 "GitHub" 作為源碼提供商
4. 授權 GitHub 訪問權限

#### 步驟 2: 選擇倉庫
1. 選擇您的 `drcarcold` 倉庫
2. 選擇 `main` 分支
3. 點擊 "Next"

#### 步驟 3: 配置構建設置
1. App name: `drcarcold`
2. Environment: `production`
3. 構建配置會自動檢測 `amplify.yml`
4. 點擊 "Next"

#### 步驟 4: 設置環境變數
在 "Environment variables" 區域添加：

```bash
NODE_ENV=production
DATABASE_URL=你的資料庫URL
JWT_SECRET=drcarcold-super-secret-jwt-key-2024-aws
ADMIN_EMAIL=admin@drcarcold.com
ADMIN_PASSWORD=DrCarCold2024!
NEXTAUTH_URL=https://your-app.amplifyapp.com
NEXTAUTH_SECRET=your-nextauth-secret
```

#### 步驟 5: 完成部署
1. 檢查所有設置
2. 點擊 "Save and deploy"
3. 等待部署完成（約 5-10 分鐘）

### 3. 設置資料庫

#### 選項 A: AWS RDS (推薦)
```bash
# 創建 PostgreSQL 實例
aws rds create-db-instance \
    --db-instance-identifier drcarcold-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password YourPassword \
    --allocated-storage 20
```

#### 選項 B: 使用 Supabase (更簡單)
1. 註冊 [Supabase](https://supabase.com)
2. 創建新專案
3. 獲取連接字符串
4. 更新 Amplify 環境變數

### 4. 自定義域名設置

#### 步驟 1: 在 Amplify 中添加域名
1. 在 Amplify 控制台選擇您的應用
2. 點擊 "Domain management"
3. 點擊 "Add domain"
4. 輸入 `drcarcold.com`

#### 步驟 2: 配置 DNS
將以下記錄添加到您的 DNS 提供商（如 GoDaddy）：

```
類型    名稱    值
CNAME   @       d1234567890.cloudfront.net
CNAME   www     d1234567890.cloudfront.net
```

### 5. 資料庫初始化

```bash
# 本地初始化資料庫
npm run prisma:db:push
npm run prisma:seed
```

## 🔧 高級配置

### A. 設置 S3 存儲桶（圖片上傳）

```bash
# 創建 S3 存儲桶
aws s3 mb s3://drcarcold-uploads

# 設置公開讀取權限
aws s3api put-bucket-policy \
    --bucket drcarcold-uploads \
    --policy file://s3-policy.json
```

### B. 配置 CloudFront CDN

1. 在 AWS CloudFront 創建分發
2. 設置原點為 S3 存儲桶
3. 配置快取策略

### C. 設置監控和警報

```bash
# 設置 CloudWatch 警報
aws cloudwatch put-metric-alarm \
    --alarm-name "High-CPU-Usage" \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ApplicationELB \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold
```

## 💰 成本估算

### AWS Amplify 定價：
- **構建時間**: $0.01/分鐘
- **託管**: $0.15/GB/月
- **請求**: $0.20/百萬請求
- **SSL 憑證**: 免費

### 預估月費用：
- **小型網站**: $5-10/月
- **中型流量**: $15-30/月
- **高流量**: $50+/月

## 🔐 安全最佳實踐

### 1. IAM 用戶設置
```bash
# 創建專用 IAM 用戶
aws iam create-user --user-name amplify-drcarcold

# 附加最小權限策略
aws iam attach-user-policy \
    --user-name amplify-drcarcold \
    --policy-arn arn:aws:iam::aws:policy/AmplifyBackendDeployFullAccess
```

### 2. 環境變數加密
```bash
# 使用 AWS Systems Manager Parameter Store
aws ssm put-parameter \
    --name "/drcarcold/prod/database-url" \
    --value "your-database-url" \
    --type "SecureString"
```

### 3. 訪問控制
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::drcarcold-uploads/*"
    }
  ]
}
```

## 🔄 CI/CD 流程

### 自動化部署流程：
1. **推送代碼** → GitHub
2. **觸發構建** → AWS Amplify
3. **運行測試** → 自動化測試
4. **部署到生產** → 自動部署
5. **健康檢查** → 確保服務正常

### Webhook 設置：
```bash
# 設置 Slack 通知
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"🚀 DRCarCold 部署成功！"}' \
    YOUR_SLACK_WEBHOOK_URL
```

## 📊 監控和日誌

### CloudWatch 日誌：
```bash
# 查看應用日誌
aws logs describe-log-groups \
    --log-group-name-prefix "/aws/amplify/drcarcold"
```

### 性能監控：
- **響應時間監控**
- **錯誤率追蹤**
- **流量分析**
- **資源使用情況**

## 🛠️ 故障排除

### 常見問題：

#### Q: 構建失敗怎麼辦？
```bash
# 檢查構建日誌
aws amplify get-job \
    --app-id YOUR_APP_ID \
    --branch-name main \
    --job-id YOUR_JOB_ID
```

#### Q: 環境變數不生效？
1. 確認變數名稱正確
2. 重新部署應用
3. 檢查構建日誌

#### Q: 資料庫連接失敗？
1. 檢查 DATABASE_URL 格式
2. 確認資料庫安全組設置
3. 測試網路連接

## 🚀 部署檢查清單

- [ ] GitHub 倉庫已創建並推送代碼
- [ ] AWS Amplify 應用已創建
- [ ] 環境變數已設置
- [ ] 資料庫已配置並初始化
- [ ] 自定義域名已設置
- [ ] SSL 憑證已配置
- [ ] 監控和警報已設置
- [ ] 備份策略已實施

## 📞 獲取支援

- **AWS 支援**: [AWS Support Center](https://console.aws.amazon.com/support/)
- **Amplify 文檔**: [AWS Amplify Docs](https://docs.amplify.aws/)
- **社群支援**: [AWS 開發者論壇](https://forums.aws.amazon.com/)

---

## 🎯 快速開始

執行以下命令立即開始：

```bash
# 1. 推送到 GitHub
git add .
git commit -m "Deploy to AWS"
git push origin main

# 2. 前往 AWS Amplify Console
# https://console.aws.amazon.com/amplify/

# 3. 連接 GitHub 倉庫並部署
```

部署完成後，您將獲得一個 `https://yourapp.amplifyapp.com` 網址！ 