@echo off
echo Testing Railway Direct Domain (bypassing Cloudflare)...
echo.
echo 1. Features API on Railway:
curl -I https://web-production-51ba1.up.railway.app/api/features?position=homepage | findstr /i "cache-control"

echo.
echo 2. Auto-Service API on Railway:
curl -I https://web-production-51ba1.up.railway.app/api/auto-service?action=status | findstr /i "cache-control"

echo.
echo 3. Full headers from Railway:
curl -I https://web-production-51ba1.up.railway.app/api/features?position=homepage

echo.
echo Done!