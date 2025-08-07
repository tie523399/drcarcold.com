// 測試隨機圖片選擇功能的API端點
import { NextRequest, NextResponse } from 'next/server'
import { testImageSelection, scanAvailableImages, selectRandomImage } from '@/lib/random-image-selector'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 開始測試隨機圖片選擇功能...')
    
    // 執行測試
    await testImageSelection()
    
    // 獲取統計信息
    const images = await scanAvailableImages()
    const stats = images.reduce((acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      message: '隨機圖片選擇測試完成',
      stats: {
        totalImages: images.length,
        categoryBreakdown: stats,
        availableImages: images.map(img => ({
          path: img.path,
          category: img.category,
          filename: img.filename,
          size: img.size
        }))
      }
    })

  } catch (error) {
    console.error('測試隨機圖片選擇失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, tags } = await request.json()
    
    console.log('🎲 為指定內容選擇隨機圖片...')
    console.log(`標題: ${title}`)
    console.log(`內容: ${content?.substring(0, 100)}...`)
    console.log(`標籤: ${tags?.join(', ')}`)
    
    const selectedImage = await selectRandomImage(
      title || '測試新聞標題',
      content || '測試新聞內容',
      tags || ['test']
    )
    
    return NextResponse.json({
      success: true,
      selectedImage,
      message: '隨機圖片選擇完成'
    })

  } catch (error) {
    console.error('隨機圖片選擇失敗:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}
