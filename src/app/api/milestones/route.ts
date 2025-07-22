import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/milestones - 獲取里程碑列表
export async function GET(request: NextRequest) {
  try {
    const milestones = await prisma.milestone.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { order: 'asc' },
        { year: 'desc' }
      ]
    })
    
    return NextResponse.json(milestones)
  } catch (error) {
    console.error('Error fetching milestones:', error)
    return NextResponse.json(
      { error: '獲取里程碑失敗' },
      { status: 500 }
    )
  }
}

// POST /api/milestones - 新增里程碑
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const milestone = await prisma.milestone.create({
      data: {
        year: body.year,
        event: body.event,
        eventEn: body.eventEn,
        description: body.description || null,
        descriptionEn: body.descriptionEn || null,
        order: body.order || 0,
        isActive: body.isActive !== false,
      }
    })
    
    return NextResponse.json(milestone, { status: 201 })
  } catch (error) {
    console.error('Error creating milestone:', error)
    return NextResponse.json(
      { error: '創建里程碑失敗' },
      { status: 500 }
    )
  }
}