import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/vehicles/[id] - 刪除車輛
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 檢查車輛是否存在
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json({
        success: false,
        error: '車輛不存在'
      }, { status: 404 })
    }

    // 刪除車輛
    await prisma.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '車輛已刪除'
    })

  } catch (error) {
    console.error('刪除車輛失敗:', error)
    return NextResponse.json({
      success: false,
      error: '刪除車輛失敗'
    }, { status: 500 })
  }
}

// PUT /api/vehicles/[id] - 更新車輛
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      brand,
      model,
      info,
      year,
      refrigerant,
      amount,
      oil
    } = body

    // 檢查車輛是否存在
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json({
        success: false,
        error: '車輛不存在'
      }, { status: 404 })
    }

    // 更新車輛
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        brand,
        model,
        info,
        year,
        refrigerant,
        amount,
        oil
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedVehicle,
      message: '車輛資料已更新'
    })

  } catch (error) {
    console.error('更新車輛失敗:', error)
    return NextResponse.json({
      success: false,
      error: '更新車輛失敗'
    }, { status: 500 })
  }
}

// GET /api/vehicles/[id] - 獲取單一車輛
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      return NextResponse.json({
        success: false,
        error: '車輛不存在'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: vehicle
    })

  } catch (error) {
    console.error('獲取車輛失敗:', error)
    return NextResponse.json({
      success: false,
      error: '獲取車輛失敗'
    }, { status: 500 })
  }
}