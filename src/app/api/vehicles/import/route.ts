import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { source = 'vehicles_import.json', clearExisting = false } = body

    console.log(`開始匯入車輛數據，來源文件: ${source}`)

    // 讀取匯入文件
    const filePath = path.join(process.cwd(), source)
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const importData = JSON.parse(fileContent)

    // 驗證數據格式
    if (!importData.data || !Array.isArray(importData.data)) {
      return NextResponse.json({
        success: false,
        error: '無效的數據格式'
      }, { status: 400 })
    }

    const vehicles = importData.data

    // 清空現有數據（如果需要）
    if (clearExisting) {
      console.log('清空現有車輛數據...')
      await prisma.vehicle.deleteMany({})
    }

    // 批量匯入車輛數據
    console.log(`開始匯入 ${vehicles.length} 筆車輛數據...`)
    
    const batchSize = 100
    let imported = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < vehicles.length; i += batchSize) {
      const batch = vehicles.slice(i, i + batchSize)
      
      try {
        const vehicleData = batch.map((vehicle: any) => ({
          brand: vehicle.brand || 'Unknown',
          model: vehicle.model || 'Unknown',
          info: vehicle.info || null,
          year: vehicle.year || null,
          refrigerant: vehicle.refrigerant || null,
          amount: vehicle.amount || null,
          oil: vehicle.oil || null,
          source: vehicle.source || 'import'
        }))

        // SQLite不支援skipDuplicates，改用upsert或單個創建
        let createdCount = 0
        for (const vehicle of vehicleData) {
          try {
            await prisma.vehicle.create({
              data: vehicle
            })
            createdCount++
          } catch (error) {
            // 跳過重複數據
            console.log(`跳過重複數據: ${vehicle.brand} ${vehicle.model}`)
          }
        }
        const result = { count: createdCount }

        imported += result.count || 0
        console.log(`已匯入 ${imported}/${vehicles.length} 筆數據，本批次: ${result.count || 0} 筆`)

      } catch (error) {
        console.error(`批次匯入失敗 (${i}-${i + batchSize}):`, error)
        failed += batch.length
        errors.push(`批次 ${i}-${i + batchSize}: ${error}`)
      }
    }

    // 獲取匯入後統計
    const totalVehicles = await prisma.vehicle.count()
    const brandStats = await prisma.vehicle.groupBy({
      by: ['brand'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    const refrigerantStats = await prisma.vehicle.groupBy({
      by: ['refrigerant'],
      _count: {
        id: true
      },
      where: {
        refrigerant: {
          not: null
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '車輛數據匯入完成',
      stats: {
        totalAttempted: vehicles.length,
        imported,
        failed,
        totalInDatabase: totalVehicles,
        topBrands: brandStats.slice(0, 10).map(b => ({
          brand: b.brand,
          count: b._count.id
        })),
        refrigerantTypes: refrigerantStats.map(r => ({
          type: r.refrigerant,
          count: r._count.id
        }))
      },
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('匯入車輛數據失敗:', error)
    return NextResponse.json({
      success: false,
      error: `匯入失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 獲取匯入狀態和統計
    const totalVehicles = await prisma.vehicle.count()
    
    const brandStats = await prisma.vehicle.groupBy({
      by: ['brand'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    const refrigerantStats = await prisma.vehicle.groupBy({
      by: ['refrigerant'],
      _count: {
        id: true
      },
      where: {
        refrigerant: {
          not: null
        }
      }
    })

    const sourceStats = await prisma.vehicle.groupBy({
      by: ['source'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalVehicles,
        totalBrands: brandStats.length,
        brandStats: brandStats.slice(0, 15),
        refrigerantStats,
        sourceStats
      }
    })

  } catch (error) {
    console.error('獲取匯入統計失敗:', error)
    return NextResponse.json({
      success: false,
      error: '獲取統計資料失敗'
    }, { status: 500 })
  }
}