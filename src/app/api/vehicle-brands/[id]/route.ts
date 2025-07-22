import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/vehicle-brands/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const brand = await prisma.vehicleBrand.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { models: true }
        }
      }
    })

    if (!brand) {
      return NextResponse.json(
        { error: '品牌不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error fetching brand:', error)
    return NextResponse.json(
      { error: '獲取品牌失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/vehicle-brands/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const brand = await prisma.vehicleBrand.update({
      where: { id: params.id },
      data: body,
    })
    
    return NextResponse.json(brand)
  } catch (error) {
    console.error('Error updating brand:', error)
    return NextResponse.json(
      { error: '更新品牌失敗' },
      { status: 500 }
    )
  }
}

// DELETE /api/vehicle-brands/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 先刪除相關的車型
    await prisma.vehicleModel.deleteMany({
      where: { brandId: params.id }
    })

    // 再刪除品牌
    await prisma.vehicleBrand.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting brand:', error)
    return NextResponse.json(
      { error: '刪除品牌失敗' },
      { status: 500 }
    )
  }
} 