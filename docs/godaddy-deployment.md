# 🚀 GoDaddy 部署指南

## 📋 部署檢查清單

### 1. 🔧 部署前準備

- [ ] 確認 Node.js 應用程式正常建構 (`npm run build`)
- [ ] 設定生產環境變數 (`.env.production`)
- [ ] 確認資料庫配置
- [ ] DNS 設定已完成 (已在 GoDaddy DNS 管理中設定)

### 2. 📊 GoDaddy 主機要求

#### 最低系統要求：
- **Node.js**: 18.x 或更高版本
- **記憶體**: 至少 1GB RAM
- **儲存空間**: 至少 2GB
- **資料庫**: SQLite (簡單) 或 PostgreSQL/MySQL (推薦)

#### GoDaddy 主機選項：

1. **共享主機 (Shared Hosting)**
   - ❌ 不支援 Node.js
   - ❌ 無法部署此應用程式

2. **VPS 主機 (Virtual Private Server)**
   - ✅ 支援 Node.js
   - ✅ 可安裝任何軟體
   - ✅ 推薦選項

3. **專用主機 (Dedicated Server)**
   - ✅ 完全控制
   - ✅ 最佳效能
   - 💰 價格較高

### 3. 🖥️ VPS 設定步驟

#### A. 初始系統設定

```bash
# 1. 更新系統
sudo apt update && sudo apt upgrade -y

# 2. 安裝 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安裝 PM2 (程序管理器)
sudo npm install -g pm2

# 4. 安裝 Nginx (反向代理)
sudo apt install -y nginx

# 5. 安裝 Git
sudo apt install -y git

# 6. 建立應用程式目錄
sudo mkdir -p /var/www/drcarcold
sudo chown $USER:$USER /var/www/drcarcold
```

#### B. 應用程式部署

```bash
# 1. 進入應用程式目錄
cd /var/www/drcarcold

# 2. 從 Git 複製程式碼 (或上傳檔案)
git clone <your-git-repository> .
# 或者使用 FTP/SFTP 上傳檔案

# 3. 安裝依賴
npm install --production

# 4. 設定環境變數
cp env.production.example .env.production
nano .env.production  # 編輯配置

# 5. 初始化資料庫
npx prisma generate
npx prisma db push
npx prisma db seed

# 6. 建構應用程式
npm run build

# 7. 使用 PM2 啟動應用程式
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 4. ⚙️ Nginx 配置

建立 Nginx 配置檔案：

```bash
sudo nano /etc/nginx/sites-available/drcarcold.com
```

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name drcarcold.com www.drcarcold.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name drcarcold.com www.drcarcold.com;

    # SSL 憑證 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/drcarcold.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/drcarcold.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/drcarcold.com/chain.pem;

    # SSL 安全設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全 Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate no_last_modified no_etag auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # 靜態檔案快取
    location /_next/static {
        alias /var/www/drcarcold/.next/static;
        expires 365d;
        access_log off;
    }

    # 上傳檔案
    location /uploads {
        alias /var/www/drcarcold/public/uploads;
        expires 30d;
        access_log off;
    }

    # API 和動態內容
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

啟用網站：
```bash
sudo ln -s /etc/nginx/sites-available/drcarcold.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. 🔒 SSL 憑證設定 (Let's Encrypt)

```bash
# 1. 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 2. 取得 SSL 憑證
sudo certbot --nginx -d drcarcold.com -d www.drcarcold.com

# 3. 測試自動更新
sudo certbot renew --dry-run

# 4. 設定自動更新 cron job
sudo crontab -e
# 加入這行：
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6. 🗄️ 資料庫配置

#### SQLite (簡單選項)
```bash
# 已在應用程式中配置，無需額外設定
# 資料庫檔案位於：/var/www/drcarcold/prisma/prod.db
```

#### PostgreSQL (推薦生產環境)
```bash
# 1. 安裝 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 2. 建立資料庫和使用者
sudo -u postgres createuser --interactive drcarcold
sudo -u postgres createdb drcarcold_prod -O drcarcold
sudo -u postgres psql -c "ALTER USER drcarcold PASSWORD 'your-secure-password';"

# 3. 更新 .env.production
DATABASE_URL="postgresql://drcarcold:your-secure-password@localhost:5432/drcarcold_prod"
```

### 7. 🔧 PM2 配置

建立 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'drcarcold',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/drcarcold',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/drcarcold-error.log',
    out_file: '/var/log/pm2/drcarcold-out.log',
    log_file: '/var/log/pm2/drcarcold.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

### 8. 🔍 監控和維護

#### 基本監控指令
```bash
# PM2 狀態
pm2 status
pm2 logs drcarcold
pm2 monit

# Nginx 狀態
sudo systemctl status nginx
sudo nginx -t

# 系統資源
htop
df -h
free -h
```

#### 自動備份腳本
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/drcarcold"

# 建立備份目錄
mkdir -p $BACKUP_DIR

# 備份資料庫
cp /var/www/drcarcold/prisma/prod.db $BACKUP_DIR/db_$DATE.db

# 備份上傳檔案
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/drcarcold/public/uploads

# 保留最近 7 天的備份
find $BACKUP_DIR -name "*.db" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "備份完成: $DATE"
```

設定定期備份：
```bash
# 每天凌晨 2 點備份
0 2 * * * /path/to/backup.sh
```

### 9. 🚀 部署更新流程

```bash
# 1. 進入應用程式目錄
cd /var/www/drcarcold

# 2. 備份當前版本
cp -r . ../drcarcold_backup_$(date +%Y%m%d)

# 3. 拉取最新程式碼
git pull origin main

# 4. 安裝新依賴
npm install --production

# 5. 資料庫遷移 (如有需要)
npx prisma db push

# 6. 重新建構
npm run build

# 7. 重啟應用程式
pm2 reload drcarcold

# 8. 檢查狀態
pm2 status
```

### 10. 🛠️ 故障排除

#### 常見問題

1. **應用程式無法啟動**
   ```bash
   # 檢查 PM2 日誌
   pm2 logs drcarcold
   
   # 檢查環境變數
   cat .env.production
   ```

2. **網站無法訪問**
   ```bash
   # 檢查 Nginx 狀態
   sudo systemctl status nginx
   
   # 檢查 Nginx 配置
   sudo nginx -t
   ```

3. **SSL 憑證問題**
   ```bash
   # 檢查憑證狀態
   sudo certbot certificates
   
   # 手動更新憑證
   sudo certbot renew
   ```

4. **資料庫連接錯誤**
   ```bash
   # 檢查資料庫檔案權限
   ls -la prisma/prod.db
   
   # 檢查 PostgreSQL 狀態 (如適用)
   sudo systemctl status postgresql
   ```

### 11. 📞 技術支援

如遇到問題，請檢查：
1. GoDaddy VPS 控制面板
2. 應用程式日誌 (`pm2 logs`)
3. Nginx 錯誤日誌 (`/var/log/nginx/error.log`)
4. 系統日誌 (`journalctl -xe`)

---

## 🎯 快速部署清單

- [ ] 購買 GoDaddy VPS 主機
- [ ] 設定 DNS 記錄 (已完成)
- [ ] 連接到 VPS
- [ ] 安裝 Node.js、PM2、Nginx
- [ ] 上傳應用程式檔案
- [ ] 設定環境變數
- [ ] 初始化資料庫
- [ ] 配置 Nginx
- [ ] 設定 SSL 憑證
- [ ] 啟動應用程式
- [ ] 測試網站功能
- [ ] 設定監控和備份 