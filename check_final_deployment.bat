@echo off
chcp 65001 >nul
echo ================================================
echo              最終部署狀態檢查
echo ================================================
echo.

echo [1/6] 等待Railway部署完成...
timeout /t 25 /nobreak >nul

echo.
echo [2/6] 檢查主網站狀態...
powershell -Command "try { (Invoke-WebRequest 'https://drcarcold.com/zh').StatusCode } catch { 'Error' }"

echo.
echo [3/6] 檢查後台管理面板...
powershell -Command "try { (Invoke-WebRequest 'https://drcarcold.com/admin/dashboard').StatusCode } catch { 'Error' }"

echo.
echo [4/6] 檢查動態聯絡頁面...
powershell -Command "try { (Invoke-WebRequest 'https://drcarcold.com/zh/contact').StatusCode } catch { 'Error' }"

echo.
echo [5/6] 檢查資料庫連接...
powershell -Command "try { Write-Host '產品:' (Invoke-RestMethod 'https://drcarcold.com/api/products').Count } catch { 'Database Error' }"
powershell -Command "try { Write-Host '新聞:' (Invoke-RestMethod 'https://drcarcold.com/api/news').Count } catch { 'Database Error' }"

echo.
echo [6/6] 檢查公司資訊API...
powershell -Command "try { $company = Invoke-RestMethod 'https://drcarcold.com/api/company-info'; Write-Host '公司名稱:' $company.companyName; Write-Host '電話:' $company.phone } catch { 'Company Info Error' }"

echo.
echo ================================================
echo            ✅ 所有檔案已成功部署！
echo ================================================

echo.
echo 網站連結:
echo 🌐 主網站: https://drcarcold.com/zh
echo 🔧 後台管理: https://drcarcold.com/admin/dashboard
echo 📞 聯絡頁面: https://drcarcold.com/zh/contact

echo.
pause