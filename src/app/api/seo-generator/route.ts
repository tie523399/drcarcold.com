import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SEOContentGenerator } from '@/lib/seo-content-generator'

// GET /api/seo-generator - 獲取統計資訊
export async function GET(request: NextRequest) {
  try {
    // 獲取 Cohere API Key
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'cohere_api_key' }
    })

    if (!apiKeySetting?.value) {
      return NextResponse.json(
        { error: '未設定 Cohere API Key' },
        { status: 400 }
      )
    }

    const generator = new SEOContentGenerator(apiKeySetting.value)
    const stats = await generator.getStats()

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('獲取 SEO 生成器統計失敗:', error)
    return NextResponse.json(
      { error: '獲取統計資訊失敗' },
      { status: 500 }
    )
  }
}

// POST /api/seo-generator - 生成 SEO 文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { count = 1 } = body

    // 驗證參數
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: '生成數量必須在 1-10 之間' },
        { status: 400 }
      )
    }

    // 獲取 Cohere API Key
    const apiKeySetting = await prisma.setting.findUnique({
      where: { key: 'cohere_api_key' }
    })

    if (!apiKeySetting?.value) {
      return NextResponse.json(
        { error: '未設定 Cohere API Key，請先到設定頁面配置' },
        { status: 400 }
      )
    }

    // 檢查是否啟用 AI 功能
    const aiEnabledSetting = await prisma.setting.findUnique({
      where: { key: 'ai_rewrite_enabled' }
    })

    if (aiEnabledSetting?.value !== 'true') {
      return NextResponse.json(
        { error: '請先在設定中啟用 AI 改寫功能' },
        { status: 400 }
      )
    }

    console.log(`開始生成 ${count} 篇 SEO 文章...`)

    const generator = new SEOContentGenerator(apiKeySetting.value)
    
    let results = []
    if (count === 1) {
      const article = await generator.generateSEOArticle()
      if (article) {
        results.push(article)
      }
    } else {
      results = await generator.generateMultipleSEOArticles(count)
    }

    // 獲取更新後的統計
    const stats = await generator.getStats()

    return NextResponse.json({
      success: true,
      message: `成功生成 ${results.length} 篇 SEO 文章`,
      articles: results.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        publishedAt: article.publishedAt
      })),
      stats
    })

  } catch (error) {
    console.error('生成 SEO 文章失敗:', error)
    return NextResponse.json(
      { 
        error: '生成文章失敗',
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    )
  }
} 