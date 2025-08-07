import { PrismaClient } from '@prisma/client'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

// 根據您提供的範例數據
const sampleData = [
  {
    brandName: "BMW",
    brandNameEn: "BMW", 
    category: "馬來西亞車",
    modelName: "320i",
    year: "2019-2023",
    engine: "2.0L 渦輪",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "750g",
    oilType: "PAG 100",
    oilAmount: "180ml",
    notes: "豪華轎車"
  },
  {
    brandName: "BMW",
    brandNameEn: "BMW",
    category: "馬來西亞車", 
    modelName: "X3",
    year: "2017-2023",
    engine: "2.0L/3.0L 渦輪",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "850g",
    oilType: "PAG 100",
    oilAmount: "220ml",
    notes: "豪華SUV"
  },
  {
    brandName: "BMW",
    brandNameEn: "BMW",
    category: "馬來西亞車",
    modelName: "X5", 
    year: "2018-2023",
    engine: "3.0L/4.4L 渦輪",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "950g",
    oilType: "PAG 100",
    oilAmount: "250ml",
    notes: "大型豪華SUV，雙區空調"
  },
  {
    brandName: "BMW",
    brandNameEn: "BMW",
    category: "馬來西亞車",
    modelName: "i3",
    year: "2013-2022",
    engine: "電動馬達",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "650g",
    oilType: "PAG 150",
    oilAmount: "200ml",
    notes: "純電動車，碳纖維車身"
  },
  {
    brandName: "日產",
    brandNameEn: "NISSAN",
    category: "馬來西亞車",
    modelName: "SENTRA",
    year: "2013-2019",
    engine: "1.8L",
    refrigerantType: "R134a",
    refrigerantAmount: "480±25g",
    oilType: "PAG 46",
    oilAmount: "130±10ml",
    notes: ""
  },
  {
    brandName: "日產",
    brandNameEn: "NISSAN",
    category: "馬來西亞車",
    modelName: "TEANA",
    year: "2009-2018",
    engine: "2.0L/2.5L",
    refrigerantType: "R134a", 
    refrigerantAmount: "580±25g",
    oilType: "PAG 46",
    oilAmount: "160±10ml",
    notes: "中大型房車"
  },
  {
    brandName: "日產",
    brandNameEn: "NISSAN",
    category: "馬來西亞車",
    modelName: "X-TRAIL",
    year: "2014-2022",
    engine: "2.0L/2.5L",
    refrigerantType: "R134a",
    refrigerantAmount: "550±25g",
    oilType: "PAG 46",
    oilAmount: "150±10ml",
    notes: "SUV型，後座獨立空調"
  },
  {
    brandName: "本田",
    brandNameEn: "HONDA",
    category: "馬來西亞車",
    modelName: "ACCORD",
    year: "2018-2023",
    engine: "1.5T/2.0L",
    refrigerantType: "R1234yf",
    refrigerantAmount: "520±25g",
    oilType: "PAG 46",
    oilAmount: "140±10ml",
    notes: ""
  },
  {
    brandName: "本田",
    brandNameEn: "HONDA",
    category: "馬來西亞車",
    modelName: "CIVIC",
    year: "2016-2021",
    engine: "1.5T/1.8L",
    refrigerantType: "R1234yf",
    refrigerantAmount: "450±20g",
    oilType: "PAG 46", 
    oilAmount: "120±10ml",
    notes: "新款採用環保冷媒"
  },
  {
    brandName: "本田",
    brandNameEn: "HONDA",
    category: "馬來西亞車",
    modelName: "CR-V",
    year: "2017-2022",
    engine: "1.5T",
    refrigerantType: "R1234yf",
    refrigerantAmount: "500±20g",
    oilType: "PAG 46",
    oilAmount: "130±10ml",
    notes: "新款採用環保冷媒"
  },
  {
    brandName: "本田",
    brandNameEn: "HONDA",
    category: "馬來西亞車",
    modelName: "FIT",
    year: "2014-2020",
    engine: "1.5L",
    refrigerantType: "R134a",
    refrigerantAmount: "430±25g",
    oilType: "PAG 46",
    oilAmount: "120±10ml",
    notes: ""
  },
  {
    brandName: "特斯拉",
    brandNameEn: "TESLA",
    category: "馬來西亞車",
    modelName: "Model 3",
    year: "2017-2023",
    engine: "電動馬達",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "850g",
    oilType: "PAG 150",
    oilAmount: "270ml",
    notes: "純電動車，特殊冷媒系統"
  },
  {
    brandName: "特斯拉",
    brandNameEn: "TESLA",
    category: "馬來西亞車",
    modelName: "Model S",
    year: "2012-2023",
    engine: "電動馬達",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "900g",
    oilType: "PAG 150",
    oilAmount: "300ml",
    notes: "高端電動轎車"
  },
  {
    brandName: "特斯拉",
    brandNameEn: "TESLA",
    category: "馬來西亞車",
    modelName: "Model X",
    year: "2015-2023",
    engine: "電動馬達",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "1100g",
    oilType: "PAG 150",
    oilAmount: "350ml",
    notes: "電動SUV，大容量冷媒"
  },
  {
    brandName: "特斯拉",
    brandNameEn: "TESLA",
    category: "馬來西亞車",
    modelName: "Model Y",
    year: "2020-2023",
    engine: "電動馬達",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "950g",
    oilType: "PAG 150", 
    oilAmount: "320ml",
    notes: "緊湊型電動SUV"
  },
  {
    brandName: "豐田",
    brandNameEn: "TOYOTA",
    category: "馬來西亞車",
    modelName: "ALTIS",
    year: "2014-2018",
    engine: "1.8L 雙凸輪軸",
    refrigerantType: "R134a",
    refrigerantAmount: "500±25g",
    oilType: "ND-OIL 8",
    oilAmount: "150ml",
    notes: ""
  },
  {
    brandName: "豐田",
    brandNameEn: "TOYOTA",
    category: "馬來西亞車",
    modelName: "CAMRY",
    year: "2020-2023",
    engine: "2.5L 混合動力",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "650g",
    oilType: "PAG 46",
    oilAmount: "150ml",
    notes: "混合動力車型，環保冷媒"
  },
  {
    brandName: "豐田",
    brandNameEn: "TOYOTA",
    category: "馬來西亞車",
    modelName: "PRIUS",
    year: "2016-2023",
    engine: "1.8L 混合動力",
    refrigerantType: "R134a",
    refrigerantAmount: "420±25g",
    oilType: "ND-OIL 8",
    oilAmount: "140±10ml",
    notes: "混合動力系統，節能環保"
  },
  {
    brandName: "豐田",
    brandNameEn: "TOYOTA",
    category: "馬來西亞車",
    modelName: "RAV4",
    year: "2019-2023",
    engine: "2.0L",
    refrigerantType: "R-1234yf",
    refrigerantAmount: "575g",
    oilType: "PAG 46",
    oilAmount: "140ml",
    notes: "SUV車型"
  }
]

async function importNewFormatData() {
  try {
    console.log('🚀 開始導入新格式的車輛冷媒數據...')
    
    let totalImported = 0
    const brandMap = new Map<string, string>()
    
    for (const vehicleData of sampleData) {
      // 創建或獲取品牌
      let brandId = brandMap.get(vehicleData.brandName)
      
      if (!brandId) {
        // 判斷品牌類別
        let brandCategory = 'REGULAR'
        if (vehicleData.category?.includes('馬來西亞')) {
          brandCategory = 'MALAYSIA'
        } else if (['BMW', 'MERCEDES', 'AUDI', 'LEXUS', 'TESLA'].some(luxury => 
          vehicleData.brandNameEn.toUpperCase().includes(luxury))) {
          brandCategory = 'LUXURY'
        }
        
        const newBrand = await prisma.vehicleBrand.create({
          data: {
            name: vehicleData.brandName,
            nameEn: vehicleData.brandNameEn,
            category: brandCategory as any,
            order: brandMap.size
          }
        })
        
        brandId = newBrand.id
        brandMap.set(vehicleData.brandName, brandId)
        console.log(`✅ 創建品牌: ${vehicleData.brandName} (${vehicleData.brandNameEn})`)
      }
      
      // 創建車型記錄
      await prisma.vehicleModel.create({
        data: {
          brandId: brandId,
          modelName: vehicleData.modelName,
          year: vehicleData.year,
          engine: vehicleData.engine,
          category: vehicleData.category,
          refrigerantType: vehicleData.refrigerantType,
          refrigerantAmount: vehicleData.refrigerantAmount,
          oilType: vehicleData.oilType,
          oilAmount: vehicleData.oilAmount,
          notes: vehicleData.notes || ''
        }
      })
      
      totalImported++
      console.log(`📝 已導入: ${vehicleData.brandName} ${vehicleData.modelName} (${vehicleData.year})`)
    }
    
    console.log(`\n🎉 導入完成！`)
    console.log(`📊 總計導入: ${totalImported} 條車型記錄`)
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
    
    console.log('\n📈 品牌統計:')
    brandStats.forEach(brand => {
      console.log(`  ${brand.name} (${brand.nameEn}): ${brand._count.models} 個車型`)
    })
    
  } catch (error) {
    console.error('❌ 導入新格式數據時發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  importNewFormatData()
}

export { importNewFormatData }