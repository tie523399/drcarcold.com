@echo off
cls
echo ===== Railway Server Management Menu =====
echo.
echo Your server is online and running normally!
echo Main domain: https://drcarcold.com
echo Railway domain: https://web-production-51ba1.up.railway.app
echo.
echo Choose an option:
echo.
echo A. Connect to Railway remote shell
echo    - Execute commands directly on server
echo    - Check database and files
echo.
echo B. View server status and environment
echo    - Check deployment status
echo    - View environment variables
echo.
echo C. View real-time server logs
echo    - Monitor application activity
echo    - Debug issues
echo.
echo D. Deploy updates to server
echo    - Push latest code changes
echo    - Trigger automatic deployment
echo.
echo E. Test website functions
echo    - Open website in browser
echo    - Check API endpoints
echo.
echo.
set /p choice="Enter your choice (A/B/C/D/E): "

if /i "%choice%"=="A" goto connect
if /i "%choice%"=="B" goto status
if /i "%choice%"=="C" goto logs
if /i "%choice%"=="D" goto deploy
if /i "%choice%"=="E" goto test
goto menu

:connect
railway_connect.bat
goto end

:status
railway_status.bat
goto end

:logs
railway_logs.bat
goto end

:deploy
deploy_update.bat
goto end

:test
echo Opening website...
start https://drcarcold.com
start https://drcarcold.com/admin
goto end

:end
pause