# 🚀 快速部署腳本 - 使用AWS Console Session
Write-Host "🚀 開始快速部署..." -ForegroundColor Green

# 使用AWS Console的憑證
$env:AWS_PROFILE = "default"

Write-Host "📋 正在創建Amplify應用..." -ForegroundColor Cyan

# 嘗試使用AWS CLI創建應用
try {
    # 檢查是否已經有同名應用
    $existingApps = aws amplify list-apps --query 'apps[?name==`drcarcold`]' --output json 2>$null
    if ($existingApps -and $existingApps -ne "[]") {
        Write-Host "⚠️ 發現現有應用，正在清理..." -ForegroundColor Yellow
        $appId = (aws amplify list-apps --query 'apps[?name==`drcarcold`].appId' --output text)
        if ($appId -and $appId -ne "None") {
            aws amplify delete-app --app-id $appId
            Write-Host "✅ 舊應用已刪除" -ForegroundColor Green
            Start-Sleep -Seconds 5
        }
    }

    # 創建新應用
    $result = aws amplify create-app `
        --name "drcarcold" `
        --description "DR CarCold - 汽車冷媒專業系統" `
        --platform "WEB" `
        --environment-variables NODE_ENV=production,DATABASE_URL="file:./dev.db",JWT_SECRET="drcarcold-super-secret-jwt-key-2024-aws",ADMIN_EMAIL="admin@drcarcold.com",ADMIN_PASSWORD="DrCarCold2024!",NEXTAUTH_SECRET="drcarcold-nextauth-secret-2024" `
        --output json 2>&1

    if ($LASTEXITCODE -eq 0) {
        $app = $result | ConvertFrom-Json
        $appId = $app.app.appId
        Write-Host "✅ 應用創建成功！" -ForegroundColor Green
        Write-Host "📱 應用 ID: $appId" -ForegroundColor Yellow
        Write-Host "🌐 應用 URL: https://$appId.amplifyapp.com" -ForegroundColor Green
        Write-Host "🔧 AWS Console: https://console.aws.amazon.com/amplify/apps/$appId" -ForegroundColor Cyan
    } else {
        Write-Host "❌ 自動創建失敗，請使用手動方式" -ForegroundColor Red
        Write-Host "🔗 請前往: https://console.aws.amazon.com/amplify/" -ForegroundColor Yellow
        Write-Host "📋 手動創建應用，名稱: drcarcold" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 執行失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔗 請手動前往: https://console.aws.amazon.com/amplify/" -ForegroundColor Yellow
}

Write-Host "📝 腳本完成" -ForegroundColor Cyan 