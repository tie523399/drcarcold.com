#!/bin/bash

# 🚀 DrCarCold 服務器自動部署腳本
# 在 Ubuntu 22.04 LTS 上運行

echo "🚀 開始部署 DrCarCold 汽車冷媒系統..."

# 更新系統
echo "📦 更新系統套件..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 安裝基本工具
echo "🔧 安裝基本工具..."
sudo apt-get install -y curl wget git unzip nginx software-properties-common

# 安裝 Node.js 18.x
echo "📱 安裝 Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 檢查版本
echo "✅ 檢查版本..."
node --version
npm --version

# 安裝 PM2 進程管理器
echo "⚙️ 安裝 PM2..."
sudo npm install -g pm2

# 創建應用目錄
echo "📁 創建應用目錄..."
sudo mkdir -p /var/www/drcarcold
sudo chown -R ubuntu:ubuntu /var/www/drcarcold
cd /var/www/drcarcold

# 下載項目代碼
echo "📥 下載項目代碼..."
wget https://github.com/tie523399/drcarcold/archive/main.zip
unzip main.zip
mv drcarcold-main/* .
mv drcarcold-main/.* . 2>/dev/null || true
rm -rf drcarcold-main main.zip

# 安裝項目依賴
echo "📦 安裝項目依賴..."
npm install

# 創建生產環境配置
echo "⚙️ 創建環境配置..."
cat > .env.local << EOF
NODE_ENV=production
DATABASE_URL="file:./prod.db"
JWT_SECRET="drcarcold-super-secret-jwt-key-2024-ec2"
ADMIN_EMAIL="admin@drcarcold.com"
ADMIN_PASSWORD="DrCarCold2024!"
NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024"
NEXT_PUBLIC_SITE_URL="http://18.206.205.111"
NEXT_PUBLIC_API_URL="http://18.206.205.111/api"
EOF

# 設置 Prisma 數據庫
echo "🗄️ 設置數據庫..."
npx prisma generate
npx prisma db push

# 運行種子數據（如果存在）
if [ -f "prisma/seed.ts" ]; then
    echo "🌱 導入種子數據..."
    npm run seed || npx tsx prisma/seed.ts || echo "⚠️ 種子數據導入失敗，繼續..."
fi

# 構建生產版本
echo "🔨 構建應用..."
npm run build

# 使用 PM2 啟動應用
echo "🚀 啟動應用..."
pm2 delete drcarcold 2>/dev/null || true
pm2 start npm --name "drcarcold" -- start
pm2 startup
pm2 save

# 配置 Nginx 反向代理
echo "🌐 配置 Nginx..."
sudo tee /etc/nginx/sites-available/drcarcold << EOF
server {
    listen 80;
    server_name _;
    
    # 客戶端最大請求大小
    client_max_body_size 100M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # 靜態文件處理
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # 上傳文件處理
    location /uploads/ {
        proxy_pass http://localhost:3000;
    }
}
EOF

# 啟用站點
sudo ln -sf /etc/nginx/sites-available/drcarcold /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 測試並重啟 Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 設置文件權限
echo "🔐 設置權限..."
sudo chown -R ubuntu:ubuntu /var/www/drcarcold
chmod -R 755 /var/www/drcarcold

# 創建日誌目錄
sudo mkdir -p /var/log/drcarcold
sudo chown ubuntu:ubuntu /var/log/drcarcold

# 顯示服務狀態
echo "📊 檢查服務狀態..."
echo "🔸 PM2 狀態："
pm2 status

echo "🔸 Nginx 狀態："
sudo systemctl status nginx --no-pager -l

echo "🔸 Node.js 進程："
ps aux | grep node

# 顯示部署結果
echo ""
echo "🎉 部署完成！"
echo "===================="
echo "🌐 網站地址: http://18.206.205.111"
echo "🔧 管理後台: http://18.206.205.111/admin"
echo "📧 管理員帳號: admin@drcarcold.com"
echo "🔑 管理員密碼: DrCarCold2024!"
echo "===================="
echo ""
echo "📋 有用的命令："
echo "  - 查看應用日誌: pm2 logs drcarcold"
echo "  - 重啟應用: pm2 restart drcarcold"
echo "  - 查看 Nginx 狀態: sudo systemctl status nginx"
echo "  - 查看 Nginx 日誌: sudo tail -f /var/log/nginx/error.log"
echo ""
echo "✅ 部署腳本執行完成！" 