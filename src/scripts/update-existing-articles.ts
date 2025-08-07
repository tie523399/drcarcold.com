// 批量更新現有文章圖片腳本
import { PrismaClient } from '@prisma/client'
import { generateImageForExistingNews } from '../lib/news-image-generator'

const prisma = new PrismaClient()

interface UpdateStats {
  total: number
  updated: number
  failed: number
  skipped: number
  errors: string[]
}

async function updateExistingArticles(forceUpdate: boolean = false): Promise<UpdateStats> {
  console.log('🚀 開始批量更新現有文章圖片...')
  
  const stats: UpdateStats = {
    total: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: []
  }

  try {
    // 根據模式選擇要更新的文章
    const whereCondition = forceUpdate ? {} : {
      OR: [
        { coverImage: null },
        { coverImage: '' },
        { coverImage: '/images/default-news.svg' }, // 替換預設圖片
      ]
    }

    const articles = await prisma.news.findMany({
      where: whereCondition,
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

    stats.total = articles.length
    console.log(`📊 找到 ${articles.length} 篇文章需要更新圖片`)

    if (articles.length === 0) {
      console.log('✅ 沒有文章需要更新')
      return stats
    }

    // 逐個更新文章
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i]
      const progress = ((i + 1) / articles.length * 100).toFixed(1)
      
      try {
        console.log(`\n📝 [${i + 1}/${articles.length}] ${progress}% - 更新: ${article.title.substring(0, 50)}...`)
        
        // 生成新圖片
        const imageData = await generateImageForExistingNews({
          id: article.id,
          title: article.title,
          content: article.content,
          tags: article.tags,
          sourceName: article.sourceName,
        })

        // 更新數據庫
        await prisma.news.update({
          where: { id: article.id },
          data: {
            coverImage: imageData.coverImage,
            ogImage: imageData.ogImage,
          }
        })

        console.log(`   ✅ 成功更新: ${imageData.coverImage}`)
        stats.updated++

        // 每10篇文章顯示一次進度
        if ((i + 1) % 10 === 0) {
          console.log(`📈 進度: ${i + 1}/${articles.length} (${progress}%) - 成功: ${stats.updated}, 失敗: ${stats.failed}`)
        }

        // 短暫延遲避免過快操作
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`   ❌ 更新失敗: ${article.title.substring(0, 30)}...`)
        console.error(`   錯誤: ${error}`)
        
        stats.failed++
        stats.errors.push(`${article.title}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    console.log('\n🎉 批量更新完成！')
    console.log(`📊 統計結果:`)
    console.log(`   總文章數: ${stats.total}`)
    console.log(`   成功更新: ${stats.updated}`)
    console.log(`   失敗: ${stats.failed}`)
    console.log(`   跳過: ${stats.skipped}`)
    
    if (stats.errors.length > 0) {
      console.log(`\n❌ 錯誤列表:`)
      stats.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

  } catch (error) {
    console.error('❌ 批量更新過程中發生嚴重錯誤:', error)
    stats.errors.push(`系統錯誤: ${error}`)
  } finally {
    await prisma.$disconnect()
  }

  return stats
}

// 如果直接執行此腳本
if (require.main === module) {
  const forceUpdate = process.argv.includes('--force')
  
  console.log(`🔄 執行模式: ${forceUpdate ? '強制更新所有文章' : '只更新缺失圖片的文章'}`)
  console.log('💡 使用 --force 參數可強制更新所有文章\n')
  
  updateExistingArticles(forceUpdate)
    .then((stats) => {
      const successRate = stats.total > 0 ? (stats.updated / stats.total * 100).toFixed(1) : '0'
      console.log(`\n✨ 完成！成功率: ${successRate}% (${stats.updated}/${stats.total})`)
      
      if (stats.failed === 0) {
        console.log('🎯 所有文章都已成功更新圖片！')
        process.exit(0)
      } else {
        console.log(`⚠️ 有 ${stats.failed} 篇文章更新失敗，請檢查錯誤信息`)
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error('💥 腳本執行失敗:', error)
      process.exit(1)
    })
}

export { updateExistingArticles }
export type { UpdateStats }
