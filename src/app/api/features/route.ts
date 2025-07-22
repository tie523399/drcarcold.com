import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/features - 獲取功能特點列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position') || 'homepage'
    
    const features = await prisma.feature.findMany({
      where: {
        position,
        isActive: true,
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(features)
  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json(
      { error: '獲取功能特點失敗' },
      { status: 500 }
    )
  }
}

// POST /api/features - 新增功能特點
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const feature = await prisma.feature.create({
      data: {
        icon: body.icon,
        title: body.title,
        titleEn: body.titleEn,
        description: body.description,
        descriptionEn: body.descriptionEn,
        position: body.position || 'homepage',
        order: body.order || 0,
        isActive: body.isActive !== false,
      }
    })
    
    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error('Error creating feature:', error)
    return NextResponse.json(
      { error: '創建功能特點失敗' },
      { status: 500 }
    )
  }
}