import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { vehicles } = await request.json()

    if (!vehicles || !Array.isArray(vehicles)) {
      return NextResponse.json(
        { error: '無效的資料格式' },
        { status: 400 }
      )
    }

    let successCount = 0
    const errors: string[] = []

    for (const vehicle of vehicles) {
      try {
        // 查找品牌
        // @ts-ignore
        const brand = await prisma.vehicleBrand.findFirst({
          where: {
            OR: [
              { name: vehicle.brand },
              { nameEn: vehicle.brand }
            ]
          }
        })

        if (!brand) {
          errors.push(`找不到品牌：${vehicle.brand}`)
          continue
        }

        // 創建車型
        // @ts-ignore
        await prisma.vehicleModel.create({
          data: {
            brandId: brand.id,
            modelName: vehicle.model,
            year: vehicle.year,
            engineType: vehicle.engineType,
            refrigerantType: vehicle.refrigerantType,
            fillAmount: vehicle.fillAmount,
            oilType: vehicle.oilType,
            oilAmount: vehicle.oilAmount,
            notes: vehicle.notes,
          }
        })

        successCount++
      } catch (error) {
        errors.push(`車型 ${vehicle.brand} ${vehicle.model} 匯入失敗`)
      }
    }

    return NextResponse.json({
      count: successCount,
      errors: errors.length > 0 ? errors : undefined,
      message: `成功匯入 ${successCount} 筆資料${errors.length > 0 ? `，${errors.length} 筆失敗` : ''}`
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: '匯入過程發生錯誤' },
      { status: 500 }
    )
  }
} 