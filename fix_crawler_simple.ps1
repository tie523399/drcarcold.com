# Batch fix crawler articles publish time
Write-Host "=== Crawler Articles Batch Fix Script ==="

# Get all articles
Write-Host "1. Getting all articles..."
$response = Invoke-WebRequest -Uri "https://drcarcold.com/api/news" -Method GET
$allArticles = $response.Content | ConvertFrom-Json
Write-Host "   Found $($allArticles.Count) articles"

# Identify crawler articles
Write-Host "2. Identifying crawler articles..."
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

Write-Host "   Found $($crawlerArticles.Count) crawler articles"

# Batch fix publish time
Write-Host "3. Batch fixing publish time..."
$successCount = 0
$failCount = 0
$baseTime = Get-Date "2025-08-01T08:00:00.000Z"

foreach ($article in $crawlerArticles) {
    $publishTime = $baseTime.AddMinutes($successCount * 5)
    
    $updateData = @{
        isPublished = $true
        publishedAt = $publishTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    }
    
    $json = $updateData | ConvertTo-Json
    
    try {
        Invoke-WebRequest -Uri "https://drcarcold.com/api/news/$($article.id)" -Method PUT -Body $json -ContentType "application/json" | Out-Null
        Write-Host "   SUCCESS: $($article.id)"
        $successCount++
    } catch {
        Write-Host "   FAILED: $($article.id) - $($_.Exception.Message)"
        $failCount++
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "=== Fix Complete ==="
Write-Host "Success: $successCount articles"
Write-Host "Failed: $failCount articles"

# Test results
Write-Host ""
Write-Host "4. Testing results..."
$testSlugs = @("20-u-carlikelikelikelike-24401053", "daihatsu-move-150-cp-20-carnews-28024910")

foreach ($slug in $testSlugs) {
    try {
        $testResponse = Invoke-WebRequest -Uri "https://drcarcold.com/zh/news/$slug" -Method GET
        Write-Host "   SUCCESS: $slug - Status: $($testResponse.StatusCode)"
    } catch {
        Write-Host "   FAILED: $slug - $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Crawler articles fix script completed!"