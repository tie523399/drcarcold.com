# Setup AI article generation
Write-Host "=== AI Article Generation Setup ==="

# 1. Enable AI rewrite
Write-Host "1. Enabling AI rewrite function..."
$enableAI = @{ ai_rewrite_enabled = "true" }
$json1 = $enableAI | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json1 -ContentType "application/json" | Out-Null
    Write-Host "   SUCCESS: AI function enabled"
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)"
}

# 2. Set AI provider
Write-Host "2. Setting AI provider to Cohere..."
$setProvider = @{ ai_provider = "cohere" }
$json2 = $setProvider | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json2 -ContentType "application/json" | Out-Null
    Write-Host "   SUCCESS: AI provider set to Cohere"
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)"
}

# 3. Set placeholder API key
Write-Host "3. Setting placeholder Cohere API key..."
$setApiKey = @{ cohere_api_key = "NEED_REAL_COHERE_API_KEY" }
$json3 = $setApiKey | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "https://drcarcold.com/api/settings" -Method POST -Body $json3 -ContentType "application/json" | Out-Null
    Write-Host "   SUCCESS: Placeholder API key set"
    Write-Host "   WARNING: You need to get a real Cohere API key from https://cohere.ai/"
} catch {
    Write-Host "   FAILED: $($_.Exception.Message)"
}

# 4. Test SEO generator
Write-Host "4. Testing SEO generator API..."
try {
    $testResponse = Invoke-WebRequest -Uri "https://drcarcold.com/api/seo-generator" -Method GET
    Write-Host "   SUCCESS: SEO generator API working"
} catch {
    if ($_.Exception.Message -like "*400*") {
        Write-Host "   INFO: SEO generator needs real API key (expected 400 error)"
    } else {
        Write-Host "   ERROR: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "=== Setup Complete ==="
Write-Host "Next step: Get Cohere API key from https://cohere.ai/"
Write-Host "Then update the setting in admin panel."