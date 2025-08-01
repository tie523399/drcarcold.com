# Server Connection and Management Script
Write-Host "=== Railway Server Management ===" -ForegroundColor Cyan

# 1. Check server status
Write-Host "1. Checking server status..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest "https://drcarcold.com/api/health" -TimeoutSec 10
    Write-Host "   SUCCESS: Main domain online (Status: $($health.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Main domain issue - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $railway = Invoke-WebRequest "https://web-production-51ba1.up.railway.app/api/health" -TimeoutSec 10
    Write-Host "   SUCCESS: Railway domain online (Status: $($railway.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Railway domain issue - $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Railway CLI status
Write-Host "2. Checking Railway CLI..." -ForegroundColor Yellow
try {
    $cliVersion = & npx @railway/cli --version 2>&1
    Write-Host "   SUCCESS: Railway CLI version $cliVersion" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Railway CLI not available" -ForegroundColor Red
    Write-Host "   Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# 3. Show available commands
Write-Host ""
Write-Host "=== Available Server Commands ===" -ForegroundColor Cyan
Write-Host "A. Connect to Railway shell:"
Write-Host "   npx @railway/cli shell"
Write-Host ""
Write-Host "B. Check Railway status:"
Write-Host "   npx @railway/cli status"
Write-Host ""
Write-Host "C. View Railway logs:"
Write-Host "   npx @railway/cli logs"
Write-Host ""
Write-Host "D. Deploy updates:"
Write-Host "   git add . && git commit -m 'update' && git push"
Write-Host ""
Write-Host "E. Check environment variables:"
Write-Host "   npx @railway/cli variables"

Write-Host ""
Write-Host "Choose an option (A/B/C/D/E) or type 'exit' to quit:"