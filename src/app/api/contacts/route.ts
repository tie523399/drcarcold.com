import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // 建立查詢條件
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (priority) {
      where.priority = priority
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } }
      ]
    }

    // 獲取聯絡表單
    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // 獲取總數
    const total = await prisma.contact.count({ where })

    // 獲取統計數據
    const stats = await prisma.contact.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const statusStats = stats.reduce((acc, item) => {
      acc[item.status] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusStats
    })

  } catch (error) {
    console.error('獲取聯絡表單失敗:', error)
    return NextResponse.json({
      success: false,
      error: '獲取聯絡表單失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      subject,
      message,
      customerType,
      interestedProducts,
      source = 'website'
    } = body

    // 驗證必要欄位
    if (!name || !email || !subject || !message) {
      return NextResponse.json({
        success: false,
        error: '姓名、電子郵件、主旨和訊息為必填欄位'
      }, { status: 400 })
    }

    // 電子郵件格式驗證
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: '請輸入有效的電子郵件地址'
      }, { status: 400 })
    }

    // 取得客戶端資訊
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 建立聯絡表單記錄
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        subject,
        message,
        customerType,
        interestedProducts,
        source,
        ipAddress,
        userAgent
      }
    })

    // 發送通知郵件（這裡可以實現郵件發送功能）
    // await sendNotificationEmail(contact)

    return NextResponse.json({
      success: true,
      data: contact,
      message: '聯絡表單已成功提交，我們會盡快回覆您'
    })

  } catch (error) {
    console.error('提交聯絡表單失敗:', error)
    return NextResponse.json({
      success: false,
      error: '提交聯絡表單失敗，請稍後再試'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少聯絡表單ID'
      }, { status: 400 })
    }

    // 更新聯絡表單
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        ...updateData,
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少聯絡表單ID'
      }, { status: 400 })
    }

    // 刪除聯絡表單
    await prisma.contact.delete({
      where: { id }
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