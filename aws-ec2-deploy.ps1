# 🚀 AWS EC2 自動部署腳本
# DrCarCold 汽車冷媒系統

Write-Host "🚀 開始創建 AWS EC2 實例..." -ForegroundColor Green

# 檢查 AWS CLI
try {
    aws --version | Out-Null
    Write-Host "✅ AWS CLI 已安裝" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先安裝 AWS CLI" -ForegroundColor Red
    exit 1
}

# 設置變數
$KeyPairName = "drcarcold-keypair"
$SecurityGroupName = "drcarcold-sg"
$InstanceName = "drcarcold-server"
$Region = "us-east-1"

Write-Host "📋 使用配置:" -ForegroundColor Cyan
Write-Host "  - 區域: $Region" -ForegroundColor Yellow
Write-Host "  - 密鑰對: $KeyPairName" -ForegroundColor Yellow
Write-Host "  - 安全組: $SecurityGroupName" -ForegroundColor Yellow
Write-Host "  - 實例名: $InstanceName" -ForegroundColor Yellow

# 創建密鑰對
Write-Host "🔑 創建 SSH 密鑰對..." -ForegroundColor Cyan
try {
    $keyResult = aws ec2 create-key-pair --key-name $KeyPairName --query 'KeyMaterial' --output text --region $Region 2>$null
    if ($keyResult) {
        $keyResult | Out-File -FilePath "$KeyPairName.pem" -Encoding ASCII
        Write-Host "✅ 密鑰對已創建: $KeyPairName.pem" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 密鑰對可能已存在，繼續..." -ForegroundColor Yellow
}

# 創建安全組
Write-Host "🛡️ 創建安全組..." -ForegroundColor Cyan
try {
    $sgResult = aws ec2 create-security-group --group-name $SecurityGroupName --description "DrCarCold Security Group" --region $Region 2>$null
    if ($sgResult) {
        $sgId = ($sgResult | ConvertFrom-Json).GroupId
        Write-Host "✅ 安全組已創建: $sgId" -ForegroundColor Green
        
        # 添加安全組規則
        Write-Host "🔧 配置安全組規則..." -ForegroundColor Cyan
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $Region
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $Region
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $Region
        aws ec2 authorize-security-group-ingress --group-id $sgId --protocol tcp --port 3000 --cidr 0.0.0.0/0 --region $Region
        Write-Host "✅ 安全組規則已配置" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ 安全組可能已存在，獲取現有ID..." -ForegroundColor Yellow
    $sgId = (aws ec2 describe-security-groups --group-names $SecurityGroupName --query 'SecurityGroups[0].GroupId' --output text --region $Region)
}

# 創建用戶數據腳本
$UserData = @"
#!/bin/bash
# DrCarCold 自動安裝腳本

# 更新系統
apt-get update -y
apt-get upgrade -y

# 安裝基本工具
apt-get install -y curl wget git unzip nginx

# 安裝 Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# 安裝 PM2
npm install -g pm2

# 創建應用目錄
mkdir -p /var/www/drcarcold
cd /var/www/drcarcold

# 下載並解壓項目
wget https://github.com/tie523399/drcarcold/archive/main.zip
unzip main.zip
mv drcarcold-main/* .
rm -rf drcarcold-main main.zip

# 安裝依賴
npm install

# 創建環境文件
cat > .env.local << EOF
NODE_ENV=production
DATABASE_URL="file:./prod.db"
JWT_SECRET="drcarcold-super-secret-jwt-key-2024-ec2"
ADMIN_EMAIL="admin@drcarcold.com"
ADMIN_PASSWORD="DrCarCold2024!"
NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024"
NEXT_PUBLIC_SITE_URL="http://\$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
EOF

# 設置 Prisma 數據庫
npx prisma generate
npx prisma db push
npx prisma db seed

# 構建應用
npm run build

# 啟動應用
pm2 start npm --name "drcarcold" -- start
pm2 startup
pm2 save

# 配置 Nginx
cat > /etc/nginx/sites-available/drcarcold << EOF
server {
    listen 80;
    server_name _;
    
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
    }
}
EOF

ln -s /etc/nginx/sites-available/drcarcold /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# 設置權限
chown -R www-data:www-data /var/www/drcarcold
chmod -R 755 /var/www/drcarcold

echo "✅ DrCarCold 安裝完成！" > /var/log/drcarcold-install.log
"@

$UserDataBase64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($UserData))

# 啟動 EC2 實例
Write-Host "🖥️ 啟動 EC2 實例..." -ForegroundColor Cyan
$instanceResult = aws ec2 run-instances `
    --image-id ami-0c7217cdde317cfec `
    --count 1 `
    --instance-type t3.micro `
    --key-name $KeyPairName `
    --security-group-ids $sgId `
    --user-data $UserDataBase64 `
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$InstanceName}]" `
    --region $Region `
    --output json

if ($LASTEXITCODE -eq 0) {
    $instance = $instanceResult | ConvertFrom-Json
    $instanceId = $instance.Instances[0].InstanceId
    
    Write-Host "✅ EC2 實例已啟動！" -ForegroundColor Green
    Write-Host "📱 實例 ID: $instanceId" -ForegroundColor Yellow
    
    # 等待實例運行
    Write-Host "⏳ 等待實例啟動..." -ForegroundColor Cyan
    aws ec2 wait instance-running --instance-ids $instanceId --region $Region
    
    # 獲取公共 IP
    $publicIp = aws ec2 describe-instances --instance-ids $instanceId --query 'Reservations[0].Instances[0].PublicIpAddress' --output text --region $Region
    
    Write-Host "🎉 部署完成！" -ForegroundColor Green
    Write-Host "🌐 網站地址: http://$publicIp" -ForegroundColor Green
    Write-Host "🔧 管理後台: http://$publicIp/admin" -ForegroundColor Green
    Write-Host "📱 實例 ID: $instanceId" -ForegroundColor Yellow
    Write-Host "🔑 SSH 連接: ssh -i $KeyPairName.pem ubuntu@$publicIp" -ForegroundColor Cyan
    Write-Host "📋 AWS Console: https://console.aws.amazon.com/ec2/v2/home?region=$Region#Instances:instanceId=$instanceId" -ForegroundColor Cyan
    
    Write-Host "" -ForegroundColor White
    Write-Host "⏳ 注意：初始化需要約 5-10 分鐘，請稍後訪問網站" -ForegroundColor Yellow
    Write-Host "📖 可以使用 SSH 連接查看安裝進度：" -ForegroundColor Yellow
    Write-Host "   tail -f /var/log/cloud-init-output.log" -ForegroundColor Gray
    
} else {
    Write-Host "❌ EC2 實例創建失敗" -ForegroundColor Red
}

Write-Host "📝 部署腳本完成" -ForegroundColor Cyan 