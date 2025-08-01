@echo off
echo ===== Railway Server Logs =====
echo.

echo Viewing real-time server logs...
echo Press Ctrl+C to stop watching logs.
echo.

npx @railway/cli logs --follow

pause