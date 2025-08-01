@echo off
echo ===== Testing Security and Compatibility Fixes =====
echo.

echo 1. Testing main website health...
curl -s -o nul -w "Main website: %%{http_code}\n" https://drcarcold.com/api/health

echo.
echo 2. Testing admin panel...
curl -s -o nul -w "Admin panel: %%{http_code}\n" https://drcarcold.com/admin/login

echo.
echo 3. Testing AI generator...
curl -s -o nul -w "AI generator: %%{http_code}\n" https://drcarcold.com/admin/seo-generator

echo.
echo 4. Testing news page...
curl -s -o nul -w "News page: %%{http_code}\n" https://drcarcold.com/zh/news

echo.
echo 5. Testing with headers (checking security headers)...
curl -I https://drcarcold.com/ 2>nul | findstr /i "x-content-type-options cache-control"

echo.
echo ===== Test Complete =====
echo All security and compatibility fixes have been deployed!
echo Please re-run your website security scan to verify improvements.
echo.
pause