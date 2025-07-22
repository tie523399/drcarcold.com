import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      // 獲取單個設定
      const setting = await prisma.setting.findUnique({
        where: { key }
      })

      return NextResponse.json({
        success: true,
        data: setting
      })
    } else {
      // 獲取所有設定
      const settings = await prisma.setting.findMany()
      return NextResponse.json({
        success: true,
        data: settings
      })
    }
  } catch (error) {
    console.error('獲取設定失敗:', error)
    return NextResponse.json({
      success: false,
      error: '獲取設定失敗'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: '缺少必要參數'
      }, { status: 400 })
    }

    // 保存或更新設定
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { 
        key, 
        value: String(value) 
      }
    })

    return NextResponse.json({
      success: true,
      data: setting,
      message: '設定已保存'
    })

  } catch (error) {
    console.error('保存設定失敗:', error)
    return NextResponse.json({
      success: false,
      error: '保存設定失敗'
    }, { status: 500 })
  }
} 