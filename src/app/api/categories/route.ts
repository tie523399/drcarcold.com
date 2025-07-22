import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: '獲取類別失敗' },
      { status: 500 }
    )
  }
}

// POST /api/categories - 新增分類
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 檢查 slug 是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { slug: body.slug }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: '網址代稱已存在' },
        { status: 400 }
      )
    }
    
    const category = await prisma.category.create({
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
    
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: '創建分類失敗' },
      { status: 500 }
    )
  }
} 