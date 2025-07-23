# AWS Amplify 自動部署腳本
# 請先安裝 AWS CLI: https://aws.amazon.com/cli/

Write-Host "🚀 開始自動部署到 AWS Amplify..." -ForegroundColor Green

# 檢查 AWS CLI 是否已安裝
try {
    aws --version
    Write-Host "✅ AWS CLI 已安裝" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先安裝 AWS CLI" -ForegroundColor Red
    Write-Host "下載地址: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# 檢查 AWS 憑證
try {
    aws sts get-caller-identity
    Write-Host "✅ AWS 憑證已配置" -ForegroundColor Green
} catch {
    Write-Host "❌ 請先配置 AWS 憑證" -ForegroundColor Red
    Write-Host "執行: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 創建 Amplify 應用..." -ForegroundColor Cyan

# 創建 Amplify 應用
$appResult = aws amplify create-app `
    --name "drcarcold" `
    --description "DR CarCold - 汽車冷媒專業系統" `
    --repository "https://github.com/tie523399/drcarcold" `
    --platform "WEB" `
    --iam-service-role "arn:aws:iam::123456789012:role/AmplifyServiceRole" `
    --environment-variables NODE_ENV=production,DATABASE_URL="file:./dev.db",JWT_SECRET="drcarcold-super-secret-jwt-key-2024-aws",ADMIN_EMAIL="admin@drcarcold.com",ADMIN_PASSWORD="DrCarCold2024!",NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024" `
    --custom-rules '[{"source":"/*","target":"/index.html","status":"200"}]' `
    --output json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Amplify 應用創建成功！" -ForegroundColor Green
    
    # 解析應用 ID
    $app = $appResult | ConvertFrom-Json
    $appId = $app.app.appId
    
    Write-Host "📱 應用 ID: $appId" -ForegroundColor Yellow
    Write-Host "🌐 默認域名: https://$appId.amplifyapp.com" -ForegroundColor Yellow
    
    # 創建分支
    Write-Host "🌿 創建 main 分支..." -ForegroundColor Cyan
    aws amplify create-branch `
        --app-id $appId `
        --branch-name "main" `
        --description "Production branch" `
        --enable-auto-build `
        --output json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 分支創建成功！" -ForegroundColor Green
        
        # 開始部署
        Write-Host "🚀 開始部署..." -ForegroundColor Cyan
        $jobResult = aws amplify start-job `
            --app-id $appId `
            --branch-name "main" `
            --job-type "RELEASE" `
            --output json
        
        if ($LASTEXITCODE -eq 0) {
            $job = $jobResult | ConvertFrom-Json
            $jobId = $job.jobSummary.jobId
            
            Write-Host "✅ 部署任務已啟動！" -ForegroundColor Green
            Write-Host "📋 任務 ID: $jobId" -ForegroundColor Yellow
            Write-Host "⏳ 部署通常需要 5-10 分鐘..." -ForegroundColor Yellow
            
            # 監控部署狀態
            Write-Host "📊 監控部署狀態..." -ForegroundColor Cyan
            do {
                Start-Sleep -Seconds 30
                $status = aws amplify get-job --app-id $appId --branch-name "main" --job-id $jobId --output json | ConvertFrom-Json
                $currentStatus = $status.job.summary.status
                Write-Host "⏳ 當前狀態: $currentStatus" -ForegroundColor Yellow
            } while ($currentStatus -eq "RUNNING" -or $currentStatus -eq "PENDING")
            
            if ($currentStatus -eq "SUCCEED") {
                Write-Host "🎉 部署成功！" -ForegroundColor Green
                Write-Host "🌐 您的網站地址: https://$appId.amplifyapp.com" -ForegroundColor Green
                Write-Host "🔧 AWS Console: https://console.aws.amazon.com/amplify/apps/$appId" -ForegroundColor Cyan
            } else {
                Write-Host "❌ 部署失敗，狀態: $currentStatus" -ForegroundColor Red
                Write-Host "📋 請檢查 AWS Console 查看詳細日誌" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ 啟動部署失敗" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 分支創建失敗" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Amplify 應用創建失敗" -ForegroundColor Red
}

Write-Host "📝 部署腳本完成" -ForegroundColor Cyan 