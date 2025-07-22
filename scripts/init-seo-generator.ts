// 初始化 SEO 生成器設定
import { prisma } from '../src/lib/prisma'

async function initSEOGenerator() {
  console.log('初始化 SEO 生成器設定...\n')

  try {
    // 檢查是否已經有 Cohere API Key 設定
    const cohereKeyExists = await prisma.setting.findUnique({
      where: { key: 'cohere_api_key' }
    })

    if (!cohereKeyExists) {
      console.log('❌ Cohere API Key 未設定')
      console.log('   請到後台設定頁面 (/admin/settings) 設定 Cohere API Key')
    } else if (cohereKeyExists.value) {
      console.log('✅ Cohere API Key 已設定')
    } else {
      console.log('⚠️  Cohere API Key 已存在但為空值')
      console.log('   請到後台設定頁面更新 API Key')
    }

    // 檢查 AI 改寫是否啟用
    const aiEnabled = await prisma.setting.findUnique({
      where: { key: 'ai_rewrite_enabled' }
    })

    if (aiEnabled?.value === 'true') {
      console.log('✅ AI 改寫功能已啟用')
    } else {
      console.log('⚠️  AI 改寫功能未啟用')
      console.log('   請到後台設定頁面啟用 AI 改寫功能')
    }

    // 統計現有的 SEO 文章
    const seoArticleCount = await prisma.news.count({
      where: {
        sourceName: 'AI Generated - SEO'
      }
    })

    const publishedSeoCount = await prisma.news.count({
      where: {
        sourceName: 'AI Generated - SEO',
        isPublished: true
      }
    })

    console.log(`\n📊 SEO 文章統計:`)
    console.log(`   總數: ${seoArticleCount}`)
    console.log(`   已發布: ${publishedSeoCount}`)
    console.log(`   草稿: ${seoArticleCount - publishedSeoCount}`)

    // 顯示可用的主題數量
    const totalTopics = 8 // 根據 seo-content-generator.ts 中的主題數量
    console.log(`\n🎯 可用主題: ${totalTopics} 個`)

    console.log('\n🚀 SEO 生成器功能:')
    console.log('   1. 訪問 /admin/seo-generator 進行文章生成')
    console.log('   2. 支援批量生成 1-10 篇文章')
    console.log('   3. 自動優化 SEO 標題和描述')
    console.log('   4. 直接發布到網站新聞區塊')
    console.log('   5. 包含汽車冷氣相關關鍵字')

    if (cohereKeyExists?.value && aiEnabled?.value === 'true') {
      console.log('\n✅ SEO 生成器已準備就緒！')
    } else {
      console.log('\n⚠️  請完成設定後再使用 SEO 生成器')
    }

  } catch (error) {
    console.error('初始化 SEO 生成器失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 直接執行
initSEOGenerator()
  .then(() => {
    console.log('\n初始化完成！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('初始化失敗:', error)
    process.exit(1)
  }) 