# 🚀 AWS EC2 遠程服務器部署指南

## 📋 方案概述

使用 AWS EC2 實例搭建專屬的 DrCarCold 服務器，具備完全控制權和靈活性。

## 🎯 部署配置

- **操作系統**: Ubuntu 22.04 LTS
- **實例類型**: t3.micro (免費層級)
- **自動安裝**: Node.js + Next.js + Nginx + PM2
- **數據庫**: SQLite (自動配置)
- **反向代理**: Nginx (80端口)
- **進程管理**: PM2 (自動重啟)

## 🚀 一鍵部署步驟

### 步驟1: 配置 AWS 憑證

您需要 AWS 訪問密鑰：

1. **獲取憑證**：
   - 前往 [AWS IAM Console](https://console.aws.amazon.com/iam/home#/users)
   - 創建新用戶或使用現有用戶
   - 生成 Access Key 和 Secret Key

2. **配置本地憑證**：
```powershell
aws configure
```
輸入：
- AWS Access Key ID: `您的訪問密鑰ID`
- AWS Secret Access Key: `您的秘密訪問密鑰`
- Default region name: `us-east-1`
- Default output format: `json`

### 步驟2: 執行部署腳本

```powershell
.\aws-ec2-deploy.ps1
```

## 📊 部署進度時間線

1. **創建資源** (2-3分鐘)
   - SSH 密鑰對
   - 安全組配置
   - EC2 實例啟動

2. **系統初始化** (5-8分鐘)
   - Ubuntu 系統更新
   - Node.js 18.x 安裝
   - 項目代碼下載

3. **應用部署** (3-5分鐘)
   - 依賴安裝
   - 數據庫設置
   - 應用構建和啟動

**總計時間**: 約 10-15 分鐘

## 🔧 部署後會自動獲得

- 🌐 **公共網址**: `http://YOUR-IP`
- 🔧 **管理後台**: `http://YOUR-IP/admin`
- 🔑 **SSH 訪問**: `ssh -i drcarcold-keypair.pem ubuntu@YOUR-IP`
- 📱 **自動 SSL**: 可後續配置 Let's Encrypt

## 💡 優勢特色

### ✅ 優點
- **完全控制**: 根據需求自定義配置
- **性能優化**: 專屬服務器資源
- **SSH 訪問**: 可直接遠程管理
- **成本透明**: 按使用量付費
- **擴展性**: 可隨時升級實例類型

### 📈 擴展能力
- **升級實例**: t3.micro → t3.small → t3.medium
- **添加存儲**: EBS 卷擴展
- **負載均衡**: ALB + 多實例
- **數據庫**: 可遷移到 RDS

## 🛡️ 安全配置

自動配置的安全組規則：
- **22端口**: SSH 訪問
- **80端口**: HTTP 網站
- **443端口**: HTTPS (預留)
- **3000端口**: Next.js 開發

## 📞 故障排除

### 常見問題

1. **實例無法訪問**
```bash
# SSH 連接檢查狀態
ssh -i drcarcold-keypair.pem ubuntu@YOUR-IP
sudo systemctl status nginx
sudo pm2 status
```

2. **查看安裝日誌**
```bash
sudo tail -f /var/log/cloud-init-output.log
```

3. **重啟服務**
```bash
sudo pm2 restart drcarcold
sudo systemctl restart nginx
```

## 🌍 後續優化建議

1. **域名綁定**：配置自定義域名
2. **SSL 證書**：Let's Encrypt 自動 HTTPS
3. **數據備份**：設置自動快照
4. **監控告警**：CloudWatch 監控
5. **CDN 加速**：CloudFront 全球加速

## 💰 成本預估

- **t3.micro**: 免費層級 (12個月)
- **超出後**: ~$8-12/月
- **存儲**: 8GB 免費，超出 ~$1/月
- **流量**: 15GB 免費，超出 ~$0.09/GB

---

**立即執行部署腳本開始搭建您的專屬服務器！** 🚀 