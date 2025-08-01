@echo off
echo Testing Cache-Control fixes...
echo.
echo Features API Cache-Control:
curl -s -I https://drcarcold.com/api/features?position=homepage | findstr /i "cache-control"
echo.
echo Auto-Service API Cache-Control:
curl -s -I https://drcarcold.com/api/auto-service?action=status | findstr /i "cache-control"
echo.
echo Done!