import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories/[id] - 獲取單個分類
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: '找不到分類' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: '獲取分類失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - 更新分類
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // 檢查 slug 是否被其他分類使用
    if (body.slug) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          slug: body.slug,
          NOT: { id: params.id }
        }
      })
      
      if (existingCategory) {
        return NextResponse.json(
          { error: '網址代稱已被其他分類使用' },
          { status: 400 }
        )
      }
    }
    
    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description || null,
        image: body.image || null,
        seoTitle: body.seoTitle || null,
        seoDescription: body.seoDescription || null,
        seoKeywords: body.seoKeywords || null,
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: '更新分類失敗' },
      { status: 500 }
    )
  }
}

// DELETE /api/categories/[id] - 刪除分類
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查是否有產品使用此分類
    const productsCount = await prisma.product.count({
      where: { categoryId: params.id }
    })
    
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `無法刪除，此分類下還有 ${productsCount} 個產品` },
        { status: 400 }
      )
    }
    
    await prisma.category.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: '分類已刪除' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: '刪除分類失敗' },
      { status: 500 }
    )
  }
}