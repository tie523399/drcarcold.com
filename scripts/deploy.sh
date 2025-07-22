#!/bin/bash

# 🚀 DrCarCold 部署腳本
# 適用於 GoDaddy VPS 主機

set -e  # 遇到錯誤時停止

echo "🚀 開始部署 DrCarCold 汽車冷媒系統..."

# 變數設定
APP_NAME="drcarcold"
APP_DIR="/var/www/drcarcold"
BACKUP_DIR="/var/backups/drcarcold"
DATE=$(date +%Y%m%d_%H%M%S)

# 檢查是否為 root 用戶
if [ "$EUID" -eq 0 ]; then
  echo "❌ 請不要使用 root 用戶執行此腳本"
  exit 1
fi

# 1. 系統準備
echo "📦 檢查系統要求..."

# 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安裝。正在安裝..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "✅ Node.js 版本: $(node --version)"

# 檢查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安裝 PM2..."
    sudo npm install -g pm2
fi

# 檢查 Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 安裝 Nginx..."
    sudo apt install -y nginx
fi

# 2. 應用程式部署
echo "📁 準備應用程式目錄..."

if [ -d "$APP_DIR" ]; then
    echo "📄 備份現有應用程式..."
    sudo mkdir -p $BACKUP_DIR
    sudo cp -r $APP_DIR $BACKUP_DIR/backup_$DATE
fi

# 建立應用程式目錄
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

echo "📂 進入應用程式目錄..."
cd $APP_DIR

# 3. 安裝依賴
echo "📦 安裝相依套件..."
npm install --production

# 4. 環境設定
echo "⚙️ 設定環境變數..."
if [ ! -f ".env.production" ]; then
    if [ -f "env.production.example" ]; then
        cp env.production.example .env.production
        echo "⚠️ 請編輯 .env.production 檔案並設定正確的環境變數"
        echo "🔧 編輯指令: nano .env.production"
        read -p "按 Enter 繼續..."
    else
        echo "❌ 找不到環境設定範例檔案"
        exit 1
    fi
fi

# 5. 資料庫初始化
echo "🗄️ 初始化資料庫..."
npx prisma generate
npx prisma db push

# 檢查是否需要種子資料
if [ ! -f "prisma/prod.db" ] || [ ! -s "prisma/prod.db" ]; then
    echo "🌱 執行資料庫種子..."
    npx prisma db seed || echo "⚠️ 種子腳本執行失敗，請手動檢查"
fi

# 6. 建構應用程式
echo "🔨 建構生產版本..."
npm run build

# 7. PM2 設定
echo "🔄 設定 PM2 程序管理..."

# 停止現有程序 (如果存在)
pm2 delete $APP_NAME 2>/dev/null || true

# 啟動應用程式
pm2 start ecosystem.config.js

# 儲存 PM2 配置
pm2 save

# 設定開機自動啟動
pm2 startup | tail -1 | sudo bash

# 8. Nginx 配置檢查
echo "🌐 檢查 Nginx 配置..."

NGINX_CONFIG="/etc/nginx/sites-available/$APP_NAME.com"
if [ ! -f "$NGINX_CONFIG" ]; then
    echo "⚠️ Nginx 配置檔案不存在"
    echo "請手動建立: $NGINX_CONFIG"
    echo "參考文檔: docs/godaddy-deployment.md"
else
    # 測試 Nginx 配置
    sudo nginx -t
    
    # 啟用網站
    if [ ! -L "/etc/nginx/sites-enabled/$APP_NAME.com" ]; then
        sudo ln -s $NGINX_CONFIG /etc/nginx/sites-enabled/
    fi
    
    # 重載 Nginx
    sudo systemctl reload nginx
fi

# 9. 防火牆設定
echo "🛡️ 設定防火牆..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# 10. SSL 憑證檢查
echo "🔒 檢查 SSL 憑證..."
if command -v certbot &> /dev/null; then
    echo "✅ Certbot 已安裝"
    echo "💡 執行以下指令取得 SSL 憑證:"
    echo "sudo certbot --nginx -d drcarcold.com -d www.drcarcold.com"
else
    echo "📦 安裝 Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
    echo "💡 執行以下指令取得 SSL 憑證:"
    echo "sudo certbot --nginx -d drcarcold.com -d www.drcarcold.com"
fi

# 11. 權限設定
echo "🔐 設定檔案權限..."
chmod -R 755 $APP_DIR
chmod 600 $APP_DIR/.env.production 2>/dev/null || true

# 如果有 uploads 目錄，確保可寫入
if [ -d "$APP_DIR/public/uploads" ]; then
    chmod -R 755 $APP_DIR/public/uploads
fi

# 12. 檢查服務狀態
echo "🔍 檢查服務狀態..."

echo "📊 PM2 狀態:"
pm2 status

echo "🌐 Nginx 狀態:"
sudo systemctl status nginx --no-pager -l

echo "💾 磁碟空間:"
df -h

echo "🧠 記憶體使用:"
free -h

# 13. 完成部署
echo ""
echo "🎉 部署完成！"
echo ""
echo "📋 後續步驟:"
echo "1. 編輯環境變數: nano $APP_DIR/.env.production"
echo "2. 設定 SSL 憑證: sudo certbot --nginx -d drcarcold.com -d www.drcarcold.com"
echo "3. 檢查網站: https://drcarcold.com"
echo "4. 檢查管理後台: https://drcarcold.com/admin"
echo ""
echo "🔧 管理指令:"
echo "pm2 status              # 檢查應用程式狀態"
echo "pm2 logs $APP_NAME      # 查看日誌"
echo "pm2 restart $APP_NAME   # 重啟應用程式"
echo "pm2 reload $APP_NAME    # 零停機重載"
echo ""
echo "📚 詳細文檔: docs/godaddy-deployment.md"
echo "" 