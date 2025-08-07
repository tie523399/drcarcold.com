/**
 * 🔄 車輛數據遷移腳本
 * 
 * 將舊的 Vehicle 表格數據遷移到新的 VehicleBrand + VehicleModel 架構
 * 
 * 使用方法：
 * npx tsx src/scripts/migrate-vehicle-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LegacyVehicle {
  id: string
  brand: string
  model: string
  info?: string
  year?: string
  refrigerant?: string
  amount?: string
  oil?: string
  source: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

async function migrateVehicleData() {
  console.log('🚀 開始車輛數據遷移...')
  
  try {
    // 1. 檢查是否存在舊的 Vehicle 表格數據
    const legacyVehicles = await prisma.$queryRaw<LegacyVehicle[]>`
      SELECT * FROM Vehicle WHERE isActive = 1
    `.catch(() => {
      console.log('ℹ️ 舊的 Vehicle 表格不存在或已清空，跳過遷移')
      return []
    })

    if (legacyVehicles.length === 0) {
      console.log('✅ 沒有需要遷移的數據')
      return
    }

    console.log(`📊 找到 ${legacyVehicles.length} 筆舊車輛數據`)

    // 2. 分析並創建品牌
    const brandMap = new Map<string, string>()
    const uniqueBrands = [...new Set(legacyVehicles.map(v => v.brand))]
    
    for (const brandName of uniqueBrands) {
      console.log(`🏷️ 處理品牌: ${brandName}`)
      
      // 檢查品牌是否已存在
      let brand = await prisma.vehicleBrand.findFirst({
        where: {
          OR: [
            { name: brandName },
            { nameEn: brandName }
          ]
        }
      })

      if (!brand) {
        // 創建新品牌
        const category = categorizeBrand(brandName)
        brand = await prisma.vehicleBrand.create({
          data: {
            name: brandName,
            nameEn: brandName,
            category,
            order: 0
          }
        })
        console.log(`  ✅ 創建品牌: ${brandName} (${category})`)
      } else {
        console.log(`  ✓ 品牌已存在: ${brandName}`)
      }

      brandMap.set(brandName, brand.id)
    }

    // 3. 遷移車輛型號數據
    let migratedCount = 0
    let skippedCount = 0

    for (const vehicle of legacyVehicles) {
      const brandId = brandMap.get(vehicle.brand)
      if (!brandId) {
        console.log(`❌ 找不到品牌 ${vehicle.brand}，跳過車型 ${vehicle.model}`)
        skippedCount++
        continue
      }

      // 檢查是否已存在相同的車型
      const existingModel = await prisma.vehicleModel.findFirst({
        where: {
          brandId,
          modelName: vehicle.model,
          year: vehicle.year || undefined
        }
      })

      if (existingModel) {
        console.log(`  ⚠️ 車型已存在: ${vehicle.brand} ${vehicle.model} ${vehicle.year || ''}`)
        skippedCount++
        continue
      }

      // 創建新的車輛型號
      try {
        await prisma.vehicleModel.create({
          data: {
            brandId,
            modelName: vehicle.model,
            year: vehicle.year,
            engineType: vehicle.info,
            refrigerantType: vehicle.refrigerant || 'R134a',
            fillAmount: vehicle.amount || '0g',
            oilType: extractOilType(vehicle.oil),
            oilAmount: vehicle.oil,
            notes: `遷移自舊系統 (來源: ${vehicle.source})`
          }
        })
        
        console.log(`  ✅ 遷移: ${vehicle.brand} ${vehicle.model} ${vehicle.year || ''}`)
        migratedCount++
      } catch (error) {
        console.error(`  ❌ 遷移失敗: ${vehicle.brand} ${vehicle.model}`, error)
        skippedCount++
      }
    }

    // 4. 統計結果
    console.log('\n📊 遷移完成統計:')
    console.log(`✅ 成功遷移: ${migratedCount} 筆`)
    console.log(`⚠️ 跳過/失敗: ${skippedCount} 筆`)
    console.log(`🏷️ 創建品牌: ${brandMap.size} 個`)

    // 5. 驗證遷移結果
    const totalModels = await prisma.vehicleModel.count()
    const totalBrands = await prisma.vehicleBrand.count()
    
    console.log('\n🔍 遷移後統計:')
    console.log(`📊 總品牌數: ${totalBrands}`)
    console.log(`📊 總車型數: ${totalModels}`)

    console.log('\n✅ 車輛數據遷移完成！')
    console.log('\n⚠️ 請檢查數據正確性後，可考慮移除舊的 Vehicle 表格')

  } catch (error) {
    console.error('❌ 遷移過程發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * 根據品牌名稱分類
 */
function categorizeBrand(brandName: string): 'regular' | 'truck' | 'malaysia' | 'luxury' | 'commercial' {
  const brand = brandName.toUpperCase()
  
  // 大型車輛
  if (['HINO', 'FUSO', 'ISUZU', 'MITSUBISHI FUSO', 'UD', 'SCANIA', 'VOLVO', 'MAN'].includes(brand)) {
    return 'truck'
  }
  
  // 馬來西亞品牌
  if (['PROTON', 'PERODUA'].includes(brand)) {
    return 'malaysia'
  }
  
  // 豪華品牌
  if (['LEXUS', 'ACURA', 'INFINITI', 'BMW', 'MERCEDES', 'AUDI', 'PORSCHE', 'JAGUAR', 'LAND ROVER'].includes(brand)) {
    return 'luxury'
  }
  
  // 商用車
  if (['FORD', 'CHEVROLET', 'GMC', 'IVECO'].includes(brand)) {
    return 'commercial'
  }
  
  // 預設為一般車輛
  return 'regular'
}

/**
 * 從油量字串中提取油的類型
 */
function extractOilType(oilString?: string): string | undefined {
  if (!oilString) return undefined
  
  const oil = oilString.toUpperCase()
  if (oil.includes('PAG46')) return 'PAG46'
  if (oil.includes('PAG100')) return 'PAG100'
  if (oil.includes('PAG150')) return 'PAG150'
  if (oil.includes('PAG')) return 'PAG'
  if (oil.includes('POE')) return 'POE'
  if (oil.includes('PAO')) return 'PAO'
  
  return undefined
}

// 執行遷移
if (require.main === module) {
  migrateVehicleData()
    .then(() => {
      console.log('🎉 遷移腳本執行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 遷移腳本執行失敗:', error)
      process.exit(1)
    })
}

export { migrateVehicleData }