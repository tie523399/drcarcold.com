import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

interface VehicleRecord {
  brand: string           // 品牌中文名
  brandEn: string        // 品牌英文名
  category: string       // 類別
  model: string          // 車型
  information: string    // 資訊欄位
  year: string           // 年份
  refrigerant: string    // 冷媒類型
  amount: string         // 冷媒量
  oil: string           // 冷凍油量
}

// 品牌分類映射
function getBrandCategory(brandEn: string, category: string): string {
  const luxuryBrands = ['BMW', 'MERCEDES-BENZ', 'AUDI', 'LEXUS', 'PORSCHE', 'JAGUAR', 'LAND ROVER', 'VOLVO']
  const japaneseBrands = ['TOYOTA', 'HONDA', 'NISSAN', 'MAZDA', 'MITSUBISHI', 'SUBARU', 'SUZUKI', 'LEXUS']
  const koreanBrands = ['HYUNDAI', 'KIA']
  const americanBrands = ['FORD', 'CHEVROLET', 'CHRYSLER', 'JEEP']
  const europeanBrands = ['VOLKSWAGEN', 'CITROEN', 'PEUGEOT', 'RENAULT', 'FIAT', 'OPEL', 'SAAB', 'SKODA']
  
  if (luxuryBrands.some(brand => brandEn.includes(brand))) {
    return 'LUXURY'
  } else if (japaneseBrands.some(brand => brandEn.includes(brand))) {
    return 'JAPANESE'
  } else if (koreanBrands.some(brand => brandEn.includes(brand))) {
    return 'KOREAN'
  } else if (americanBrands.some(brand => brandEn.includes(brand))) {
    return 'AMERICAN'
  } else if (europeanBrands.some(brand => brandEn.includes(brand))) {
    return 'EUROPEAN'
  } else {
    return 'REGULAR'
  }
}

// 清理和標準化資料
function cleanData(data: VehicleRecord): VehicleRecord {
  return {
    brand: data.brand.trim(),
    brandEn: data.brandEn.trim().toUpperCase(),
    category: data.category || '一般車輛',
    model: data.model.trim(),
    information: data.information?.trim() || '',
    year: data.year?.trim() || '',
    refrigerant: data.refrigerant?.trim() || 'R134a',
    amount: data.amount?.trim() || '',
    oil: data.oil?.trim() || ''
  }
}

// 檢查是否為有效的車型資料
function isValidVehicleData(data: VehicleRecord): boolean {
  if (!data.model || data.model.length < 2) return false
  if (data.model.includes('Car model') || data.model.includes('Information')) return false
  if (data.model.includes('車型') || data.model.includes('資訊')) return false
  
  return true
}

// 從油量字串中提取油品類型
function extractOilType(oilString: string): string | undefined {
  if (!oilString) return undefined
  
  const oil = oilString.toString().trim()
  
  // 常見油品類型
  const oilTypes = ['PAG 46', 'PAG 100', 'PAG 150', 'ND-OIL 8', 'PAG', 'POE']
  
  for (const type of oilTypes) {
    if (oil.toUpperCase().includes(type)) {
      return type
    }
  }
  
  // 如果包含 "See Spec"，返回空
  if (oil.toLowerCase().includes('see') || oil.toLowerCase().includes('spec')) {
    return undefined
  }
  
  return undefined
}

async function importEnglishData() {
  try {
    console.log('🚀 開始導入英文版冷媒資料...')
    
    // 讀取英文版轉換後的資料
    const jsonPath = 'converted-english-refrigerant-data.json'
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ 找不到英文版轉換後的資料檔案: ${jsonPath}`)
      return
    }
    
    const rawData: VehicleRecord[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    console.log(`📖 讀取到 ${rawData.length} 筆英文版原始資料`)
    
    // 清除現有資料
    console.log('🧹 清除現有資料...')
    await prisma.vehicleModel.deleteMany()
    await prisma.vehicleBrand.deleteMany()
    
    // 過濾和清理資料
    const validData = rawData
      .map(item => cleanData(item))
      .filter(item => isValidVehicleData(item))
    
    console.log(`✅ 過濾後剩餘 ${validData.length} 筆有效資料`)
    
    // 去重處理 - 使用品牌+車型+年份作為唯一鍵
    const uniqueData = new Map<string, VehicleRecord>()
    
    for (const item of validData) {
      const uniqueKey = `${item.brand}-${item.model}-${item.year}-${item.information}`
      
      // 如果已存在，保留資料更完整的版本
      if (uniqueData.has(uniqueKey)) {
        const existing = uniqueData.get(uniqueKey)!
        // 比較完整度（非空字段數量）
        const existingFields = Object.values(existing).filter(v => v && v.toString().trim()).length
        const newFields = Object.values(item).filter(v => v && v.toString().trim()).length
        
        if (newFields > existingFields) {
          uniqueData.set(uniqueKey, item)
        }
      } else {
        uniqueData.set(uniqueKey, item)
      }
    }
    
    const finalData = Array.from(uniqueData.values())
    console.log(`🔧 去重後剩餘 ${finalData.length} 筆唯一資料`)
    
    // 建立品牌映射
    const brandMap = new Map<string, string>()
    let totalImported = 0
    
    // 逐一處理資料
    for (const vehicleData of finalData) {
      try {
        // 創建或獲取品牌
        let brandId = brandMap.get(vehicleData.brand)
        
        if (!brandId) {
          const brandCategory = getBrandCategory(vehicleData.brandEn, vehicleData.category)
          
          const newBrand = await prisma.vehicleBrand.create({
            data: {
              name: vehicleData.brand,
              nameEn: vehicleData.brandEn,
              category: brandCategory as any,
              order: brandMap.size
            }
          })
          
          brandId = newBrand.id
          brandMap.set(vehicleData.brand, brandId)
          console.log(`✅ 創建品牌: ${vehicleData.brand} (${vehicleData.brandEn}) - ${brandCategory}`)
        }
        
        // 組合引擎資訊（如果有 information 欄位的話）
        const engineInfo = vehicleData.information ? vehicleData.information : undefined
        
        // 創建車型記錄
        await prisma.vehicleModel.create({
          data: {
            brandId: brandId,
            modelName: vehicleData.model,
            year: vehicleData.year || undefined,
            engine: engineInfo,
            category: vehicleData.category,
            refrigerantType: vehicleData.refrigerant,
            refrigerantAmount: vehicleData.amount || '500g',
            oilType: extractOilType(vehicleData.oil),
            oilAmount: vehicleData.oil || undefined,
            notes: ''
          }
        })
        
        totalImported++
        
        // 每匯入100筆顯示進度
        if (totalImported % 100 === 0) {
          console.log(`📝 已匯入 ${totalImported} 筆記錄...`)
        }
        
      } catch (error) {
        console.error(`❌ 匯入記錄失敗: ${vehicleData.brand} ${vehicleData.model}`, error)
      }
    }
    
    console.log(`\n🎉 英文版匯入完成！`)
    console.log(`📊 總計匯入: ${totalImported} 條車型記錄`)
    console.log(`🏷️ 總計品牌: ${brandMap.size} 個品牌`)
    
    // 顯示品牌統計
    const brandStats = await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    console.log('\n📈 英文版品牌統計 (前20名):')
    brandStats
      .sort((a, b) => b._count.models - a._count.models)
      .slice(0, 20)
      .forEach(brand => {
        console.log(`  ${brand.name} (${brand.nameEn}): ${brand._count.models} 個車型`)
      })
    
    // 顯示冷媒類型統計
    const refrigerantStats = await prisma.vehicleModel.groupBy({
      by: ['refrigerantType'],
      _count: true,
      orderBy: {
        _count: {
          refrigerantType: 'desc'
        }
      },
      take: 10
    })
    
    console.log('\n🧪 英文版冷媒類型統計:')
    refrigerantStats.forEach(stat => {
      console.log(`  ${stat.refrigerantType}: ${stat._count} 個車型`)
    })
    
    console.log('\n🔍 資料庫匯入完成！可以開始測試 API 和前端功能了')
    
  } catch (error) {
    console.error('❌ 英文版匯入過程中發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  importEnglishData()
}

export { importEnglishData }