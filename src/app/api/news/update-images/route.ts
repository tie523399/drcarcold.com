import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateImageForExistingNews } from '@/lib/news-image-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const forceUpdate = body.forceUpdate === true
    
    console.log(`🖼️ 開始為新聞生成圖片... ${forceUpdate ? '(強制更新模式)' : '(只更新缺失圖片)'}`)
    
    // 根據模式選擇要更新的新聞
    const newsToUpdate = await prisma.news.findMany({
      where: forceUpdate ? {} : {
        OR: [
          { coverImage: null },
          { coverImage: '' },
        ]
      },
      select: {
        id: true,
        title: true,
        content: true,
        tags: true,
        sourceName: true,
        coverImage: true,
        ogImage: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`找到 ${newsToUpdate.length} 篇需要生成圖片的新聞`)

    let updatedCount = 0
    let skippedCount = 0
    const results = []

    for (const news of newsToUpdate) {
      try {
        // 生成圖片資訊
        const imageData = await generateImageForExistingNews(news)
        
        // 更新新聞記錄
        await prisma.news.update({
          where: { id: news.id },
          data: {
            coverImage: imageData.coverImage,
            ogImage: imageData.ogImage,
          }
        })

        results.push({
          id: news.id,
          title: news.title.substring(0, 50) + '...',
          coverImage: imageData.coverImage,
          ogImage: imageData.ogImage,
          previousImage: news.coverImage,
          status: 'updated'
        })

        updatedCount++
        console.log(`✅ 已更新: ${news.title.substring(0, 30)}... -> ${imageData.coverImage}`)
      } catch (error) {
        results.push({
          id: news.id,
          title: news.title.substring(0, 50) + '...',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        console.error(`❌ 更新失敗: ${news.title}`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功為 ${updatedCount} 篇新聞生成圖片`,
      totalProcessed: newsToUpdate.length,
      updatedCount,
      skippedCount,
      forceUpdate,
      results
    })

  } catch (error) {
    console.error('生成新聞圖片失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // 檢查新聞圖片狀態
    const totalNews = await prisma.news.count()
    const newsWithImages = await prisma.news.count({
      where: {
        AND: [
          { coverImage: { not: null } },
          { coverImage: { not: '' } },
        ]
      }
    })

    const newsWithoutImages = totalNews - newsWithImages

    // 獲取一些樣本數據
    const sampleNews = await prisma.news.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        coverImage: true,
        ogImage: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalNews,
        newsWithImages,
        newsWithoutImages,
        needsImageGeneration: newsWithoutImages > 0
      },
      samples: sampleNews
    })

  } catch (error) {
    console.error('檢查新聞圖片狀態失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}