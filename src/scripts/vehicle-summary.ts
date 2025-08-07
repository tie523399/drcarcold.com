/**
 * 🔍 車輛數據簡要統計
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getVehicleSummary() {
  try {
    console.log('🔍 車輛數據庫統計報告\n')
    
    // 品牌統計
    const brandCount = await prisma.vehicleBrand.count()
    const modelCount = await prisma.vehicleModel.count()
    
    console.log(`📊 總體統計:`)
    console.log(`   🏢 品牌總數: ${brandCount} 個`)
    console.log(`   🚗 車型總數: ${modelCount} 筆\n`)
    
    // 品牌分類統計
    const categoryStats = await prisma.vehicleBrand.groupBy({
      by: ['category'],
      _count: true
    })
    
    console.log(`🏷️  品牌分類:`)
    categoryStats.forEach(stat => {
      const categoryName = {
        'LUXURY': '豪華品牌',
        'REGULAR': '一般品牌', 
        'TRUCK': '卡車品牌',
        'MALAYSIA': '馬來西亞品牌',
        'OTHER': '其他品牌'
      }[stat.category] || stat.category
      
      console.log(`   • ${categoryName}: ${stat._count} 個`)
    })
    
    // 冷媒類型統計
    const refrigerantStats = await prisma.vehicleModel.groupBy({
      by: ['refrigerantType'],
      _count: true
    })
    
    console.log(`\n❄️  冷媒類型分布:`)
    refrigerantStats
      .sort((a, b) => b._count - a._count)
      .forEach(stat => {
        console.log(`   • ${stat.refrigerantType}: ${stat._count} 筆`)
      })
    
    // 熱門品牌統計
    const topBrands = await prisma.vehicleBrand.findMany({
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: {
        models: {
          _count: 'desc'
        }
      },
      take: 10
    })
    
    console.log(`\n🏆 車型數量前10名品牌:`)
    topBrands.forEach((brand, index) => {
      console.log(`   ${index + 1}. ${brand.name}: ${brand._count.models} 筆`)
    })
    
  } catch (error) {
    console.error('❌ 統計失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getVehicleSummary()