import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'

// GET /api/products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isActive = searchParams.get('active')
    
    const where: any = {}
    
    if (category) {
      where.category = { slug: category }
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: '獲取產品失敗' },
      { status: 500 }
    )
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = productSchema.parse(body)
    
    // 生成 slug
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const product = await prisma.product.create({
      data: {
        ...validatedData,
        slug,
        images: JSON.stringify(validatedData.images),
        features: JSON.stringify(validatedData.features),
        specifications: JSON.stringify(validatedData.specifications),
      },
      include: { category: true },
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '創建產品失敗' },
      { status: 500 }
    )
  }
} 