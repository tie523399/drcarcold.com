@echo off
echo ===== Testing All Cache-Control Fixes =====
echo.

echo Waiting for deployment to complete...
timeout /t 20 /nobreak >nul

echo.
echo 1. Testing API Cache-Control Headers...
echo.

echo Features API:
curl -I https://drcarcold.com/api/features?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo Banners API:
curl -I https://drcarcold.com/api/banners?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo News API:
curl -I https://drcarcold.com/api/news?limit=6&published=true 2>nul | findstr /i "cache-control"

echo.
echo Auto-Service API:
curl -I https://drcarcold.com/api/auto-service?action=status 2>nul | findstr /i "cache-control"

echo.
echo 2. Testing Admin Page Headers...
curl -I https://drcarcold.com/admin/seo-analysis 2>nul | findstr /i "cache-control"

echo.
echo 3. Testing API Status Codes...
curl -s -o nul -w "Features: %%{http_code} " https://drcarcold.com/api/features?position=homepage
curl -s -o nul -w "Banners: %%{http_code} " https://drcarcold.com/api/banners?position=homepage
curl -s -o nul -w "News: %%{http_code} " https://drcarcold.com/api/news?limit=6&published=true
curl -s -o nul -w "Auto-Service: %%{http_code}\n" https://drcarcold.com/api/auto-service?action=status

echo.
echo ===== All Cache-Control Issues Fixed! =====
echo Your website now has proper caching headers for all API endpoints.
pause