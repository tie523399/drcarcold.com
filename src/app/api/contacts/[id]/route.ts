import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: params.id }
    })

    if (!contact) {
      return NextResponse.json({
        success: false,
        error: '找不到該聯絡表單'
      }, { status: 404 })
    }

    // 標記為已讀
    if (!contact.isRead) {
      await prisma.contact.update({
        where: { id: params.id },
        data: { isRead: true }
      })
    }

    return NextResponse.json({
      success: true,
      data: contact
    })

  } catch (error) {
    console.error('獲取聯絡表單失敗:', error)
    return NextResponse.json({
      success: false,
      error: '獲取聯絡表單失敗'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    
    const contact = await prisma.contact.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: contact,
      message: '聯絡表單已更新'
    })

  } catch (error) {
    console.error('更新聯絡表單失敗:', error)
    return NextResponse.json({
      success: false,
      error: '更新聯絡表單失敗'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await prisma.contact.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: '聯絡表單已刪除'
    })

  } catch (error) {
    console.error('刪除聯絡表單失敗:', error)
    return NextResponse.json({
      success: false,
      error: '刪除聯絡表單失敗'
    }, { status: 500 })
  }
}