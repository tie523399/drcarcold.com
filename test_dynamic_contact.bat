@echo off
echo ===== Testing Dynamic Contact Page =====
echo.

echo Waiting for deployment to complete...
timeout /t 25 /nobreak >nul

echo.
echo 1. Testing Contact Page...
curl -s -o nul -w "Contact Page: %%{http_code}\n" https://drcarcold.com/zh/contact

echo.
echo 2. Testing Company Info API...
curl -s -o nul -w "Company Info API: %%{http_code}\n" https://drcarcold.com/api/company-info

echo.
echo 3. Testing Admin Content Management...
curl -s -o nul -w "Admin Content Page: %%{http_code}\n" https://drcarcold.com/admin/content

echo.
echo 4. Fetching Company Info Data...
curl -s https://drcarcold.com/api/company-info

echo.
echo ===== Dynamic Contact Test Complete =====
pause