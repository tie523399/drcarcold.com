/**
 * 🗑️ 清空舊數據並匯入新的車輛資料
 * 
 * 步驟：
 * 1. 刪除所有舊的車輛數據
 * 2. 重置資料庫
 * 3. 創建範例數據
 * 4. 匯入您提供的車輛資料
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔄 車輛數據（基於您提供的格式）
const vehicleData = [
  // AUDI 系列
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A1 8X1/8XA/8XF/8XK',
    year: '2010 - 2018',
    refrigerant: 'R134a/R1234yf',
    amount: '500 / 450 ± 20',
    oil: '100 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A1 GBA',
    year: '2018 -',
    refrigerant: 'R1234yf',
    amount: '450 ± 20',
    oil: '100 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A2 8X0',
    year: '2000 - 2007',
    refrigerant: '', // 空白 → R1234yf
    amount: '520 ± 20',
    oil: '110 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A2',
    year: '2007 -',
    refrigerant: '', // 空白 → R1234yf
    amount: '460 ± 20',
    oil: '90 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A3/S3 8L1',
    year: '1996 - 2003',
    refrigerant: '', // 空白 → R1234yf
    amount: '740 ± 30',
    oil: '130 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A3/S3 8P1/8P&/8PA',
    year: '2003 - 2013',
    refrigerant: '', // 空白 → R1234yf
    amount: '530 ± 20',
    oil: '110 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A3/S3 8V1/8V7/8V',
    year: '2012 - 2018',
    refrigerant: 'R134a/R1234yf',
    amount: '500 / 460 ± 20',
    oil: '110 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A3 e-tron 8VA/8V',
    year: '2014 -',
    refrigerant: 'R134a/R1234yf',
    amount: '500 / 450 ± 20',
    oil: '110 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A4/S4',
    year: '1994 - 1997',
    refrigerant: '', // 空白 → R1234yf
    amount: '670 ± 20',
    oil: '130 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A4 S4',
    year: '1997 - 2000',
    refrigerant: '', // 空白 → R1234yf
    amount: '730 ± 30',
    oil: '140 ± 10'
  },
  {
    brandInfo: 'AUDI 汽車冷媒填充資訊',
    model: 'A4/S4',
    year: '1998 - 2000',
    refrigerant: '', // 空白 → R1234yf
    amount: '580 ± 20',
    oil: '110 ± 10'
  },

  // BMW 系列
  {
    brandInfo: 'BMW 汽車冷媒填充資訊',
    model: '1系 E81/E82/E87/E88',
    year: '2004 - 2013',
    refrigerant: 'R134a',
    amount: '650 ± 30',
    oil: '120 ± 10'
  },
  {
    brandInfo: 'BMW 汽車冷媒填充資訊',
    model: '3系 E90/E91/E92/E93',
    year: '2005 - 2013',
    refrigerant: 'R134a',
    amount: '750 ± 30',
    oil: '135 ± 10'
  },
  {
    brandInfo: 'BMW 汽車冷媒填充資訊',
    model: '3系 F30/F31/F34/F35',
    year: '2012 - 2019',
    refrigerant: 'R134a/R1234yf',
    amount: '600 / 550 ± 25',
    oil: '120 ± 10'
  },

  // TOYOTA 系列
  {
    brandInfo: 'TOYOTA 汽車冷媒填充資訊',
    model: 'Camry XV40',
    year: '2006 - 2011',
    refrigerant: 'R134a',
    amount: '580 ± 25',
    oil: '150 ± 15'
  },
  {
    brandInfo: 'TOYOTA 汽車冷媒填充資訊',
    model: 'Camry XV50',
    year: '2011 - 2017',
    refrigerant: 'R134a',
    amount: '600 ± 25',
    oil: '160 ± 15'
  },
  {
    brandInfo: 'TOYOTA 汽車冷媒填充資訊',
    model: 'Corolla E120',
    year: '2000 - 2007',
    refrigerant: '', // 空白 → R1234yf
    amount: '450 ± 20',
    oil: '100 ± 10'
  },

  // HONDA 系列
  {
    brandInfo: 'HONDA Air Conditioning System',
    model: 'Civic FB/FG',
    year: '2012 - 2015',
    refrigerant: 'R134a',
    amount: '420 ± 20',
    oil: '90 ± 10'
  },
  {
    brandInfo: 'HONDA Air Conditioning System',
    model: 'Accord CU',
    year: '2008 - 2012',
    refrigerant: '', // 空白 → R1234yf
    amount: '550 ± 25',
    oil: '120 ± 10'
  },

  // MERCEDES-BENZ 系列
  {
    brandInfo: 'MERCEDES-BENZ 汽車冷媒填充資訊',
    model: 'C-Class W204',
    year: '2007 - 2014',
    refrigerant: 'R134a',
    amount: '800 ± 40',
    oil: '180 ± 20'
  },
  {
    brandInfo: 'MERCEDES-BENZ 汽車冷媒填充資訊',
    model: 'C-Class W205',
    year: '2014 - 2021',
    refrigerant: 'R134a/R1234yf',
    amount: '750 / 700 ± 35',
    oil: '170 ± 15'
  },

  // VOLKSWAGEN 系列
  {
    brandInfo: 'VOLKSWAGEN 汽車冷媒填充資訊',
    model: 'Golf MK6',
    year: '2008 - 2013',
    refrigerant: 'R134a',
    amount: '480 ± 20',
    oil: '110 ± 10'
  },
  {
    brandInfo: 'VOLKSWAGEN 汽車冷媒填充資訊',
    model: 'Golf MK7',
    year: '2013 - 2020',
    refrigerant: 'R134a/R1234yf',
    amount: '460 / 420 ± 20',
    oil: '100 ± 10'
  }
]

async function resetAndImportVehicles() {
  console.log('🗑️ 開始清空舊數據並匯入新車輛資料...')

  try {
    // 🗑️ 步驟1: 清空所有舊數據
    console.log('🗑️ 清空舊的車輛數據...')
    await prisma.$transaction(async (tx) => {
      await tx.vehicleModel.deleteMany({})
      await tx.vehicleBrand.deleteMany({})
      console.log('✅ 舊數據已清空')
    })

    // 🏗️ 步驟2: 重新匯入新數據
    console.log('🏗️ 開始匯入新的車輛數據...')
    
    let totalImported = 0
    let brandsCreated = 0
    const processedBrands = new Set<string>()

    await prisma.$transaction(async (tx) => {
      for (const vehicle of vehicleData) {
        // 提取品牌名稱
        const brandName = extractBrandName(vehicle.brandInfo)
        
        // 處理冷媒類型
        const refrigerant = vehicle.refrigerant || 'R1234yf'
        
        // 檢查並創建品牌
        let brand = await tx.vehicleBrand.findFirst({
          where: { name: brandName }
        })
        
        if (!brand) {
          brand = await tx.vehicleBrand.create({
            data: {
              name: brandName,
              nameEn: brandName, // 加入必要的 nameEn 欄位
              category: categorizeBrand(brandName)
            }
          })
          if (!processedBrands.has(brandName)) {
            brandsCreated++
            processedBrands.add(brandName)
            console.log(`🆕 創建品牌: ${brandName}`)
          }
        }
        
        // 創建車型
        await tx.vehicleModel.create({
          data: {
            brandId: brand.id,
            modelName: vehicle.model, // 使用正確的欄位名稱
            year: vehicle.year,
            refrigerantType: refrigerant, // 使用正確的欄位名稱
            fillAmount: vehicle.amount, // 使用正確的欄位名稱
            oilAmount: vehicle.oil
          }
        })
        
        totalImported++
        
        if (totalImported % 5 === 0) {
          console.log(`✅ 已匯入 ${totalImported} 筆車型數據`)
        }
      }
    })

    console.log('🎉 車輛數據匯入完成！')
    console.log(`📊 統計結果:`)
    console.log(`   • 創建品牌: ${brandsCreated} 個`)
    console.log(`   • 創建車型: ${totalImported} 筆`)
    console.log(`   • 自動填充冷媒: ${vehicleData.filter(v => !v.refrigerant).length} 筆`)

  } catch (error) {
    console.error('❌ 匯入失敗:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 提取品牌名稱
function extractBrandName(brandInfo: string): string {
  const cleaned = brandInfo.toUpperCase().trim()
  
  // 移除冷媒相關詞彙
  const brandName = cleaned
    .replace(/汽車冷媒填充資訊/g, '')
    .replace(/冷媒充填量表/g, '')
    .replace(/冷媒填充資訊/g, '')
    .replace(/AIR\s*CONDITIONING\s*SYSTEM?/g, '')
    .replace(/A\/C\s*SYSTEM/g, '')
    .trim()
  
  // 品牌映射
  const brandMapping: Record<string, string> = {
    'AUDI': 'Audi',
    'BMW': 'BMW',
    'MERCEDES': 'Mercedes-Benz',
    'MERCEDES-BENZ': 'Mercedes-Benz',
    'VOLKSWAGEN': 'Volkswagen',
    'TOYOTA': 'Toyota',
    'HONDA': 'Honda'
  }
  
  return brandMapping[brandName] || brandName
}

// 品牌分類
function categorizeBrand(brandName: string): 'REGULAR' | 'LUXURY' | 'TRUCK' | 'MALAYSIA' | 'OTHER' {
  const brand = brandName.toUpperCase()
  
  if (['AUDI', 'BMW', 'MERCEDES-BENZ', 'PORSCHE', 'LEXUS'].includes(brand)) {
    return 'LUXURY'
  }
  
  if (['PROTON', 'PERODUA'].includes(brand)) {
    return 'MALAYSIA'
  }
  
  if (['HINO', 'FUSO', 'ISUZU', 'SCANIA', 'VOLVO'].includes(brand)) {
    return 'TRUCK'
  }
  
  return 'REGULAR'
}

// 執行腳本
if (require.main === module) {
  resetAndImportVehicles()
    .then(() => {
      console.log('🎉 重置和匯入完成！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 處理失敗:', error)
      process.exit(1)
    })
}

export { resetAndImportVehicles }