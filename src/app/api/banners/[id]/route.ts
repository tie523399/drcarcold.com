import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/banners/[id] - 獲取單個橫幅
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await prisma.banner.findUnique({
      where: { id: params.id }
    })
    
    if (!banner) {
      return NextResponse.json(
        { error: '找不到橫幅' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: '獲取橫幅失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/banners/[id] - 更新橫幅
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description || null,
        image: body.image,
        thumbnail: body.thumbnail || null,
        link: body.link || null,
        position: body.position || 'homepage',
        order: body.order || 0,
        isActive: body.isActive !== undefined ? body.isActive : true,
      }
    })
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: '更新橫幅失敗' },
      { status: 500 }
    )
  }
}

// DELETE /api/banners/[id] - 刪除橫幅
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.banner.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: '橫幅已刪除' })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: '刪除橫幅失敗' },
      { status: 500 }
    )
  }
} 