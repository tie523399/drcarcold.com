@echo off
echo ===== Railway Server Status =====
echo.

echo Checking deployment status...
npx @railway/cli status

echo.
echo Checking environment variables...
npx @railway/cli variables

echo.
echo Checking domains...
npx @railway/cli domain

pause