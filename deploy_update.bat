@echo off
echo ===== Deploy Updates to Server =====
echo.

echo 1. Adding all changes to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Server update - %date% %time%"

echo.
echo 3. Pushing to GitHub (triggers Railway deployment)...
git push

echo.
echo 4. Deployment triggered! Check Railway dashboard for progress.
echo Visit: https://railway.app/

pause