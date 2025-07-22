import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/banners - 獲取橫幅列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    
    const where = position ? { position } : {}
    
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: '獲取橫幅列表失敗' },
      { status: 500 }
    )
  }
}

// POST /api/banners - 創建橫幅
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 自動檢測媒體類型（如果沒有提供）
    let mediaType = body.mediaType || 'image'
    if (!body.mediaType && body.image) {
      const imagePath = body.image.toLowerCase()
      if (imagePath.includes('.mp4') || imagePath.includes('.webm') || imagePath.includes('.ogg')) {
        mediaType = 'video'
      } else if (imagePath.includes('.gif')) {
        mediaType = 'gif'
      } else {
        mediaType = 'image'
      }
    }
    
    console.log('創建橫幅:', {
      title: body.title,
      image: body.image,
      mediaType: mediaType,
      position: body.position
    })
    
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        description: body.description || null,
        image: body.image,
        thumbnail: body.thumbnail || null,
        link: body.link || null,
        position: body.position || 'homepage',
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
        mediaType: mediaType, // 確保設定正確的媒體類型
      }
    })
    
    console.log('橫幅創建成功:', banner.id, banner.mediaType)
    
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: '創建橫幅失敗' },
      { status: 500 }
    )
  }
} 