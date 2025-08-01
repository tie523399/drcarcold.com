@echo off
echo Checking API Status and Headers...
echo.
echo 1. API Status Codes:
curl -s -o nul -w "Features API: %%{http_code}\n" https://drcarcold.com/api/features?position=homepage
curl -s -o nul -w "Banners API: %%{http_code}\n" https://drcarcold.com/api/banners?position=homepage  
curl -s -o nul -w "News API: %%{http_code}\n" https://drcarcold.com/api/news?limit=6&published=true
curl -s -o nul -w "Auto-Service API: %%{http_code}\n" https://drcarcold.com/api/auto-service?action=status

echo.
echo 2. All Headers for Features API:
curl -I https://drcarcold.com/api/features?position=homepage

echo.
echo Done!