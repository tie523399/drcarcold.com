import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: '產品已刪除' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: '刪除產品失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // 處理 JSON 格式的欄位
    if (body.images && typeof body.images !== 'string') {
      body.images = JSON.stringify(body.images)
    }
    if (body.features && typeof body.features !== 'string') {
      body.features = JSON.stringify(body.features)
    }
    if (body.specifications && typeof body.specifications !== 'string') {
      body.specifications = JSON.stringify(body.specifications)
    }
    
    const product = await prisma.product.update({
      where: { id: params.id },
      data: body,
      include: { category: true },
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: '更新產品失敗' },
      { status: 500 }
    )
  }
}

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    })
    
    if (!product) {
      return NextResponse.json(
        { error: '找不到產品' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: '獲取產品失敗' },
      { status: 500 }
    )
  }
} 