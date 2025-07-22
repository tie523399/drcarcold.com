import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/company-info - 獲取公司資訊
export async function GET(request: NextRequest) {
  try {
    let companyInfo = await prisma.companyInfo.findFirst()
    
    // 如果沒有資料，建立預設資料
    if (!companyInfo) {
      companyInfo = await prisma.companyInfo.create({
        data: {
          companyName: '車冷博士',
          companyNameEn: 'Dr. Car Cold',
          phone: '04-26301915',
          email: 'hongshun.TW@gmail.com',
          address: '台中市龍井區臨港東路二段100號',
          businessHours: '週一至週五 8:30-17:30',
        }
      })
    }
    
    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error('Error fetching company info:', error)
    return NextResponse.json(
      { error: '獲取公司資訊失敗' },
      { status: 500 }
    )
  }
}

// PUT /api/company-info - 更新公司資訊
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 獲取現有資料或建立新資料
    let companyInfo = await prisma.companyInfo.findFirst()
    
    if (companyInfo) {
      // 更新現有資料
      companyInfo = await prisma.companyInfo.update({
        where: { id: companyInfo.id },
        data: {
          companyName: body.companyName,
          companyNameEn: body.companyNameEn,
          phone: body.phone,
          fax: body.fax || null,
          email: body.email,
          address: body.address,
          addressEn: body.addressEn || null,
          businessHours: body.businessHours,
          businessHoursEn: body.businessHoursEn || null,
          description: body.description || null,
          descriptionEn: body.descriptionEn || null,
        }
      })
    } else {
      // 建立新資料
      companyInfo = await prisma.companyInfo.create({
        data: {
          companyName: body.companyName,
          companyNameEn: body.companyNameEn,
          phone: body.phone,
          fax: body.fax || null,
          email: body.email,
          address: body.address,
          addressEn: body.addressEn || null,
          businessHours: body.businessHours,
          businessHoursEn: body.businessHoursEn || null,
          description: body.description || null,
          descriptionEn: body.descriptionEn || null,
        }
      })
    }
    
    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error('Error updating company info:', error)
    return NextResponse.json(
      { error: '更新公司資訊失敗' },
      { status: 500 }
    )
  }
}