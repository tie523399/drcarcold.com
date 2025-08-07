import { PrismaClient } from '@prisma/client'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

// 中英文翻譯映射
const categoryTranslations: { [key: string]: string } = {
  '英文版資料': 'English Version Data',
  '一般車輛': 'Regular Vehicles',
  '豪華轎車': 'Luxury Sedan',
  'SUV型': 'SUV Type',
  '純電動車': 'Electric Vehicle',
  '混合動力': 'Hybrid Vehicle',
  '商用車': 'Commercial Vehicle',
  '跑車': 'Sports Car',
  '轎車': 'Sedan',
  '掀背車': 'Hatchback',
  '旅行車': 'Station Wagon',
  '皮卡車': 'Pickup Truck',
  '客車': 'Bus',
  '卡車': 'Truck'
}

const engineTranslations: { [key: string]: string } = {
  '渦輪': 'Turbo',
  '增壓': 'Supercharged',
  '電動馬達': 'Electric Motor',
  '混合動力': 'Hybrid',
  '柴油': 'Diesel',
  '汽油': 'Gasoline',
  '雙凸輪軸': 'DOHC',
  '單凸輪軸': 'SOHC',
  '直列': 'Inline',
  'V型': 'V-Type'
}

const notesTranslations: { [key: string]: string } = {
  '豪華轎車': 'Luxury Sedan',
  '純電動車': 'Electric Vehicle',
  '新款採用環保冷媒': 'New model uses eco-friendly refrigerant',
  '大型豪華SUV': 'Large Luxury SUV',
  '雙區空調': 'Dual Zone AC',
  '後座獨立空調': 'Rear Independent AC',
  '特殊冷媒系統': 'Special refrigerant system',
  '高端電動轎車': 'High-end electric sedan',
  '電動SUV': 'Electric SUV',
  '大容量冷媒': 'High capacity refrigerant',
  '緊湊型電動SUV': 'Compact electric SUV',
  '中大型房車': 'Mid-large sedan',
  '混合動力車型': 'Hybrid model',
  '環保冷媒': 'Eco-friendly refrigerant',
  '混合動力系統': 'Hybrid system',
  '節能環保': 'Energy saving and eco-friendly'
}

function translateText(text: string, translationMap: { [key: string]: string }): string {
  if (!text) return text
  
  let translated = text
  
  // 查找完全匹配
  if (translationMap[text]) {
    return translationMap[text]
  }
  
  // 查找部分匹配並替換
  for (const [chinese, english] of Object.entries(translationMap)) {
    if (text.includes(chinese)) {
      translated = translated.replace(chinese, english)
    }
  }
  
  return translated
}

async function updateExistingDataAsEnglish() {
  try {
    console.log('🚀 開始更新現有資料為英文版格式...')
    
    // 獲取所有現有的車型記錄
    const existingVehicles = await prisma.vehicleModel.findMany({
      include: {
        brand: true
      }
    })
    
    console.log(`📊 找到 ${existingVehicles.length} 條現有記錄需要更新`)
    
    let updatedCount = 0
    
    for (const vehicle of existingVehicles) {
      try {
        // 準備英文版本的資料
        const modelNameEn = vehicle.modelName // 車型名稱通常是通用的
        const engineEn = vehicle.engine ? translateText(vehicle.engine, engineTranslations) : undefined
        const categoryEn = vehicle.category ? translateText(vehicle.category, categoryTranslations) : undefined
        const notesEn = vehicle.notes ? translateText(vehicle.notes, notesTranslations) : undefined
        
        // 更新記錄
        await prisma.vehicleModel.update({
          where: { id: vehicle.id },
          data: {
            modelNameEn: modelNameEn,
            engineEn: engineEn,
            categoryEn: categoryEn,
            notesEn: notesEn,
            dataSource: 'English Version' // 標記為英文版資料
          }
        })
        
        updatedCount++
        
        // 每更新100筆顯示進度
        if (updatedCount % 100 === 0) {
          console.log(`📝 已更新 ${updatedCount} 筆記錄...`)
        }
        
      } catch (error) {
        console.error(`❌ 更新記錄失敗: ${vehicle.modelName}`, error)
      }
    }
    
    console.log(`\n🎉 更新完成！`)
    console.log(`📊 總計更新: ${updatedCount} 條記錄`)
    
    // 顯示更新後的統計
    const dataSourceStats = await prisma.vehicleModel.groupBy({
      by: ['dataSource'],
      _count: true
    })
    
    console.log('\n📈 資料來源統計:')
    dataSourceStats.forEach(stat => {
      console.log(`  ${stat.dataSource || '未標記'}: ${stat._count} 個車型`)
    })
    
    // 顯示一些更新後的範例
    const sampleUpdated = await prisma.vehicleModel.findMany({
      where: {
        dataSource: 'English Version'
      },
      include: {
        brand: true
      },
      take: 5
    })
    
    console.log('\n📋 更新後範例:')
    sampleUpdated.forEach((vehicle, index) => {
      console.log(`${index + 1}. ${vehicle.brand.name}(${vehicle.brand.nameEn}) ${vehicle.modelName}`)
      console.log(`   中文: ${vehicle.engine || 'N/A'} | ${vehicle.category || 'N/A'} | ${vehicle.notes || 'N/A'}`)
      console.log(`   英文: ${vehicle.engineEn || 'N/A'} | ${vehicle.categoryEn || 'N/A'} | ${vehicle.notesEn || 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ 更新過程中發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  updateExistingDataAsEnglish()
}

export { updateExistingDataAsEnglish }