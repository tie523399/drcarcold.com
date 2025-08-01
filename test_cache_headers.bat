@echo off
echo ===== Testing Cache-Control Headers =====
echo.

echo 1. Testing Features API Cache-Control...
curl -I https://drcarcold.com/api/features?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo 2. Testing Banners API Cache-Control...
curl -I https://drcarcold.com/api/banners?position=homepage 2>nul | findstr /i "cache-control"

echo.
echo 3. Testing News API Cache-Control...
curl -I https://drcarcold.com/api/news?limit=6&published=true 2>nul | findstr /i "cache-control"

echo.
echo 4. Testing API Response Status...
curl -s -o nul -w "Features API: %%{http_code}\n" https://drcarcold.com/api/features?position=homepage
curl -s -o nul -w "Banners API: %%{http_code}\n" https://drcarcold.com/api/banners?position=homepage
curl -s -o nul -w "News API: %%{http_code}\n" https://drcarcold.com/api/news?limit=6&published=true

echo.
echo ===== Cache Headers Test Complete =====
pause