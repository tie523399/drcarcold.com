import { PrismaClient } from '@prisma/client'

// 直接設置環境變量
process.env.DATABASE_URL = "file:./prisma/dev.db"

const prisma = new PrismaClient()

async function clearVehicleData() {
  try {
    console.log('🗑️ 開始清除車輛數據...')
    
    // 先刪除車型數據（外鍵關聯）
    const deleteModels = await prisma.vehicleModel.deleteMany({})
    console.log(`✅ 已刪除 ${deleteModels.count} 條車型記錄`)
    
    // 再刪除品牌數據
    const deleteBrands = await prisma.vehicleBrand.deleteMany({})
    console.log(`✅ 已刪除 ${deleteBrands.count} 條品牌記錄`)
    
    // 刪除舊的 Vehicle 記錄（如果還有的話）
    try {
      const deleteOldVehicles = await prisma.$executeRaw`DELETE FROM Vehicle`
      console.log(`✅ 已清除舊的 Vehicle 表記錄`)
    } catch (error) {
      console.log('ℹ️ 舊的 Vehicle 表可能已不存在或為空')
    }
    
    console.log('🎉 車輛數據清除完成！')
    
  } catch (error) {
    console.error('❌ 清除車輛數據時發生錯誤:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  clearVehicleData()
}

export { clearVehicleData }