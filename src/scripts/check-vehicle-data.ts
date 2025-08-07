/**
 * 🔍 檢查車輛數據
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVehicleData() {
  try {
    console.log('🔍 檢查車輛數據...')
    
    // 檢查品牌
    const brands = await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    console.log(`\n📊 品牌統計 (${brands.length} 個品牌):`)
    brands.forEach(brand => {
      console.log(`  • ${brand.name} (${brand.nameEn}) - ${brand._count.models} 車型 [${brand.category}]`)
    })
    
    // 檢查車型
    const models = await prisma.vehicleModel.findMany({
      include: {
        brand: true
      },
      orderBy: [
        { brand: { name: 'asc' } },
        { modelName: 'asc' }
      ]
    })
    
    console.log(`\n🚗 車型詳情 (${models.length} 筆):`)
    models.forEach(model => {
      const refrigerant = model.refrigerantType || 'N/A'
      const amount = model.fillAmount || 'N/A'
      const oil = model.oilAmount || 'N/A'
      console.log(`  • ${model.brand.name}/${model.modelName} (${model.year || '未指定'})`)
      console.log(`    冷媒: ${refrigerant}, 冷媒量: ${amount}, 冷凍油: ${oil}`)
    })
    
    // 統計冷媒類型
    const refrigerantStats = await prisma.vehicleModel.groupBy({
      by: ['refrigerantType'],
      _count: true
    })
    
    console.log(`\n❄️ 冷媒類型統計:`)
    refrigerantStats.forEach(stat => {
      console.log(`  • ${stat.refrigerantType}: ${stat._count} 筆`)
    })
    
  } catch (error) {
    console.error('❌ 檢查失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVehicleData()