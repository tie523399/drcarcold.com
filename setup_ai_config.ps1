# AI生成文章功能配置腳本
Write-Host "=== 設定AI生成文章功能 ===" -ForegroundColor Cyan

# 1. 啟用AI重寫功能
Write-Host "1. 啟用AI重寫功能..." -ForegroundColor Yellow
$enableAI = @{ ai_rewrite_enabled = "true" }
$json1 = $enableAI | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json1 -ContentType "application/json"
    Write-Host "   ✓ AI功能已啟用" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 啟用AI功能失敗: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. 設定AI提供商為Cohere
Write-Host "2. 設定AI提供商..." -ForegroundColor Yellow
$setProvider = @{ ai_provider = "cohere" }
$json2 = $setProvider | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json2 -ContentType "application/json"
    Write-Host "   ✓ AI提供商設為Cohere" -ForegroundColor Green
} catch {
    Write-Host "   ✗ 設定AI提供商失敗: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. 設定測試用的Cohere API Key (需要用戶自己獲得真實的key)
Write-Host "3. 設定Cohere API Key..." -ForegroundColor Yellow
Write-Host "   注意: 這裡需要您的Cohere API Key" -ForegroundColor Yellow
Write-Host "   請到 https://cohere.ai/ 註冊並獲取API Key" -ForegroundColor Yellow

# 暫時設定一個佔位符
$setApiKey = @{ cohere_api_key = "NEED_TO_SET_REAL_COHERE_API_KEY" }
$json3 = $setApiKey | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json3 -ContentType "application/json"
    Write-Host "   ✓ API Key佔位符已設定" -ForegroundColor Green
    Write-Host "   ⚠️  請手動替換為真實的Cohere API Key" -ForegroundColor Yellow
} catch {
    Write-Host "   ✗ 設定API Key失敗: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. 測試SEO生成器API
Write-Host "4. 測試SEO生成器狀態..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "https://drcarcold.com/api/seo-generator" -Method GET
    Write-Host "   ✓ SEO生成器API正常" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*400*") {
        Write-Host "   ⚠️  SEO生成器API返回400 - 需要真實的Cohere API Key" -ForegroundColor Yellow
    } else {
        Write-Host "   ✗ SEO生成器API錯誤: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 設定完成 ===" -ForegroundColor Cyan
Write-Host "下一步: 請到 https://cohere.ai/ 獲取API Key，" -ForegroundColor White
Write-Host "然後到後台設定頁面將 'NEED_TO_SET_REAL_COHERE_API_KEY' 替換為真實的key" -ForegroundColor White