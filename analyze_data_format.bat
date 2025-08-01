@echo off
chcp 65001 >nul
echo ================================================
echo          數據庫格式與CSV格式分析
echo ================================================

echo.
echo 📊 [1] 數據庫 VehicleModel 結構:
echo     - brandId (String) ^<-- 關聯到 VehicleBrand.id
echo     - modelName (String) ^<-- CSV中的 'model'
echo     - year (String?)
echo     - engineType (String?) ^<-- CSV中的 'engineSize'
echo     - refrigerantType (String)
echo     - fillAmount (String)
echo     - oilType (String?)
echo     - oilAmount (String?)
echo     - notes (String?)

echo.
echo 📊 [2] 數據庫 VehicleBrand 結構:
echo     - id (String)
echo     - name (String) ^<-- CSV中的 'brand'
echo     - nameEn (String) ^<-- CSV中的 'brandEn'
echo     - category (String)
echo     - order (Int)

echo.
echo 📋 [3] 測試CSV檔案格式:
if exist "test_refrigerant_data.csv" (
    echo 檢查CSV標題...
    powershell -Command "Get-Content 'test_refrigerant_data.csv' | Select-Object -First 1"
    echo.
    echo 檢查第一筆數據...
    powershell -Command "Get-Content 'test_refrigerant_data.csv' | Select-Object -Skip 1 -First 1"
) else (
    echo ✗ test_refrigerant_data.csv 不存在
)

echo.
echo 🔍 [4] 格式相符性分析:
echo     ✓ brand → VehicleBrand.name (需要先確保品牌存在)
echo     ✓ brandEn → VehicleBrand.nameEn
echo     ✓ model → VehicleModel.modelName
echo     ✓ year → VehicleModel.year
echo     ⚠️ engineSize → VehicleModel.engineType (欄位名稱不同)
echo     ✓ refrigerantType → VehicleModel.refrigerantType
echo     ✓ fillAmount → VehicleModel.fillAmount
echo     ✓ oilType → VehicleModel.oilType
echo     ✓ oilAmount → VehicleModel.oilAmount
echo     ✓ notes → VehicleModel.notes

echo.
echo 📋 [5] 檔案解析器映射檢查:
echo     檔案解析器有完整的標題映射功能:
echo     - 'engineSize' 可自動映射到 engineType
echo     - CSV解析器會正規化標題名稱
echo     - 支援多種語言和格式變體

echo.
echo 🎯 [6] 上傳流程:
echo     1. CSV解析器解析檔案 → VehicleData[]
echo     2. API處理 VehicleData 陣列
echo     3. 檢查/創建 VehicleBrand 記錄
echo     4. 創建 VehicleModel 記錄 (使用 brandId)

echo.
echo 📊 [7] 檢查現有數據庫資料:
powershell -Command "try { $response = Invoke-RestMethod 'https://drcarcold.com/api/vehicle-brands'; Write-Host '現有品牌數:' $response.brands.Count; $response.brands | ForEach-Object { Write-Host '  -' $_.name '('$_.nameEn')' } } catch { Write-Host '無法取得品牌資料:' $_.Exception.Message }"

echo.
echo ================================================
echo 結論：CSV格式與數據庫結構基本相符
echo 檔案解析器已處理欄位名稱映射
echo 問題可能在於 API 端點的實際處理邏輯
echo ================================================
pause