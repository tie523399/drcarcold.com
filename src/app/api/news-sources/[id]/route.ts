import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/news-sources/[id] - 更新新聞來源
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // 驗證必要欄位
    if (!body.name || !body.listPageUrl) {
      return NextResponse.json(
        { error: '請提供必要欄位：name, listPageUrl' },
        { status: 400 }
      )
    }

    // 準備要更新的設定
    const settingsToUpdate = [
      { key: `news_source_${id}_name`, value: body.name },
      { key: `news_source_${id}_baseUrl`, value: body.baseUrl || '' },
      { key: `news_source_${id}_listPageUrl`, value: body.listPageUrl },
      { key: `news_source_${id}_listSelector`, value: body.listSelector || '.article' },
      { key: `news_source_${id}_linkSelector`, value: body.linkSelector || 'a' },
      { key: `news_source_${id}_isActive`, value: String(body.isActive !== false) },
      { key: `news_source_${id}_crawlInterval`, value: String(body.crawlInterval || 60) },
      { key: `news_source_${id}_maxArticlesPerCrawl`, value: String(body.maxArticlesPerCrawl || 5) },
    ]

    // 批次更新設定
    await Promise.all(
      settingsToUpdate.map(setting =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        })
      )
    )

    return NextResponse.json({
      success: true,
      message: '新聞來源已更新'
    })
  } catch (error) {
    console.error('更新新聞來源失敗:', error)
    return NextResponse.json(
      { error: '更新新聞來源失敗' },
      { status: 500 }
    )
  }
}

// DELETE /api/news-sources/[id] - 刪除新聞來源
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // 刪除該新聞來源的所有設定
    await prisma.setting.deleteMany({
      where: {
        key: {
          startsWith: `news_source_${id}_`
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '新聞來源已刪除'
    })
  } catch (error) {
    console.error('刪除新聞來源失敗:', error)
    return NextResponse.json(
      { error: '刪除新聞來源失敗' },
      { status: 500 }
    )
  }
} 