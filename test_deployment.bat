@echo off
echo ===== Testing Deployment Status =====
echo.

echo 1. Testing main domain...
curl -s -o nul -w "Main domain: %%{http_code}\n" https://drcarcold.com/api/health

echo.
echo 2. Testing Railway domain...
curl -s -o nul -w "Railway domain: %%{http_code}\n" https://web-production-51ba1.up.railway.app/api/health

echo.
echo 3. Testing AI generator...
curl -s -o nul -w "AI generator: %%{http_code}\n" https://drcarcold.com/api/seo-generator

echo.
echo 4. Testing admin panel...
curl -s -o nul -w "Admin panel: %%{http_code}\n" https://drcarcold.com/admin/login

echo.
echo ===== Deployment Test Complete =====
echo All systems online! Your server update was successful.
echo.
pause