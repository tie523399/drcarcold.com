@echo off
chcp 65001 >nul
echo ================================================
echo          檢查現有車輛冷媒資料
echo ================================================

echo.
echo [1] 檢查車輛品牌總數...
powershell -Command "(Invoke-RestMethod 'https://drcarcold.com/api/vehicle-brands').Count"

echo.
echo [2] 檢查車輛型號總數...
powershell -Command "(Invoke-RestMethod 'https://drcarcold.com/api/vehicle-models').Count"

echo.
echo [3] 檢查第一個車輛型號的詳細資訊...
powershell -Command "$v = (Invoke-RestMethod 'https://drcarcold.com/api/vehicle-models')[0]; Write-Host '型號:' $v.name; Write-Host '品牌:' $v.brand.name; Write-Host '冷媒類型:' $v.refrigerantType; Write-Host '充填量:' $v.fillAmount; Write-Host '冷凍油:' $v.oilType"

echo.
echo [4] 檢查冷媒查詢功能...
powershell -Command "try { (Invoke-WebRequest 'https://drcarcold.com/zh/refrigerant-lookup').StatusCode } catch { 'Error' }"

echo.
echo [5] 檢查車輛搜尋API...
powershell -Command "try { (Invoke-RestMethod 'https://drcarcold.com/api/vehicle-models/search?search=Toyota').Count } catch { 'Error' }"

echo.
echo ================================================
echo              數據庫連接狀態
echo ================================================
pause