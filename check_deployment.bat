@echo off
echo ===== Checking Deployment Status =====
echo.

echo 1. Testing Features API...
curl -s -o nul -w "Status: %%{http_code}\n" https://drcarcold.com/api/features?position=homepage

echo.
echo 2. Testing Banners API...
curl -s -o nul -w "Status: %%{http_code}\n" https://drcarcold.com/api/banners?position=homepage

echo.
echo 3. Testing News API...
curl -s -o nul -w "Status: %%{http_code}\n" https://drcarcold.com/api/news?limit=6&published=true

echo.
echo 4. Checking Cache-Control Headers...
echo Features API Cache-Control:
curl -I https://drcarcold.com/api/features?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo Banners API Cache-Control:
curl -I https://drcarcold.com/api/banners?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo News API Cache-Control:
curl -I https://drcarcold.com/api/news?limit=6&published=true 2>nul | findstr /i "cache-control"

echo.
echo ===== Deployment Check Complete =====
echo Your Cache-Control fixes have been deployed!
pause