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
      
      // 將設定轉換為 key-value 對象格式
      const settingsObject: Record<string, any> = {}
      settings.forEach(setting => {
        let value: any = setting.value
        
        // 嘗試解析 JSON 或布林值
        if (value === 'true') value = true
        else if (value === 'false') value = false
        else if (!isNaN(Number(value))) value = Number(value)
        
        settingsObject[setting.key] = value
      })
      
      return NextResponse.json(settingsObject)
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
    const body = await request.json()
    
    // 检查是否是单个设置还是批量设置
    if (body.key && body.value !== undefined) {
      // 单个设置保存
      const { key, value } = body
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
    } else {
      // 批量设置保存
      const settings = body
      const savedSettings = []

      for (const [key, value] of Object.entries(settings)) {
        if (value !== undefined && value !== null) {
          try {
            const setting = await prisma.setting.upsert({
              where: { key },
              update: { value: String(value) },
              create: { 
                key, 
                value: String(value) 
              }
            })
            savedSettings.push(setting)
          } catch (settingError) {
            console.error(`保存設定 ${key} 失敗:`, settingError)
          }
        }
      }

      return NextResponse.json({
        success: true,
        data: savedSettings,
        message: '設定已保存'
      })
    }

  } catch (error) {
    console.error('保存設定失敗:', error)
    return NextResponse.json({
      success: false,
      error: '保存設定失敗'
    }, { status: 500 })
  }
} 