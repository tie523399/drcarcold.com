#!/usr/bin/env pwsh
# 批量修復爬蟲文章發布時間腳本

Write-Host "=== 爬蟲文章批量修復腳本 ===" -ForegroundColor Green

# 獲取所有文章
Write-Host "1. 獲取所有文章..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://drcarcold.com/api/news" -Method GET
    $allArticles = $response.Content | ConvertFrom-Json
    Write-Host "   ✅ 獲取到 $($allArticles.Count) 篇文章" -ForegroundColor Green
} catch {
    Write-Host "   ❌ 獲取文章失敗: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 識別爬蟲文章
Write-Host "2. 識別爬蟲文章..." -ForegroundColor Yellow
$crawlerKeywords = @("carnews", "carlike", "u-car", "carstuff", "8891")
$crawlerArticles = @()

foreach ($article in $allArticles) {
    $isCrawler = $false
    foreach ($keyword in $crawlerKeywords) {
        if ($article.slug -like "*$keyword*") {
            $isCrawler = $true
            break
        }
    }
    
    if ($isCrawler) {
        $crawlerArticles += $article
    }
}

Write-Host "   ✅ 找到 $($crawlerArticles.Count) 篇爬蟲文章" -ForegroundColor Green

# 批量修復發布時間
Write-Host "3. 批量修復發布時間..." -ForegroundColor Yellow
$successCount = 0
$failCount = 0
$baseTime = Get-Date "2025-08-01T08:00:00.000Z"

foreach ($article in $crawlerArticles) {
    # 每篇文章間隔5分鐘，避免時間重複
    $publishTime = $baseTime.AddMinutes($successCount * 5)
    
    $updateData = @{
        isPublished = $true
        publishedAt = $publishTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    
    $json = $updateData | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-WebRequest -Uri "https://drcarcold.com/api/news/$($article.id)" -Method PUT -Body $json -ContentType "application/json"
        Write-Host "   ✅ $($article.id): $($article.slug)" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ❌ $($article.id): $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    # 避免請求過快
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "=== 修復完成 ===" -ForegroundColor Green
Write-Host "成功修復: $successCount 篇" -ForegroundColor Green
Write-Host "修復失敗: $failCount 篇" -ForegroundColor Red

# 測試幾個修復後的文章
Write-Host ""
Write-Host "4. 測試修復結果..." -ForegroundColor Yellow
$testSlugs = @("20-u-carlikelikelikelike-24401053", "daihatsu-move-150-cp-20-carnews-28024910")

foreach ($slug in $testSlugs) {
    try {
        $testResponse = Invoke-WebRequest -Uri "https://drcarcold.com/zh/news/$slug" -Method GET
        Write-Host "   ✅ $slug - StatusCode: $($testResponse.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $slug - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 爬蟲文章修復腳本執行完成！" -ForegroundColor Cyan