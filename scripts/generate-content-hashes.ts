// 為現有文章生成內容哈希的遷移腳本
// 使用方式: npx ts-node scripts/generate-content-hashes.ts

import { prisma } from '../src/lib/prisma'
import { DuplicateChecker } from '../src/lib/duplicate-checker'

async function generateContentHashes() {
  console.log('開始為現有文章生成內容哈希...')
  
  const duplicateChecker = new DuplicateChecker()
  
  try {
    // 獲取所有沒有 contentHash 的文章
    // @ts-ignore - contentHash 欄位需要 prisma generate
    const articles = await prisma.news.findMany({
      where: {
        contentHash: null
      },
      select: {
        id: true,
        content: true,
        title: true
      }
    })
    
    console.log(`找到 ${articles.length} 篇文章需要生成哈希`)
    
    let updated = 0
    const batchSize = 10
    
    // 批次處理
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = articles.slice(i, i + batchSize)
      
      await Promise.all(
        batch.map(async (article) => {
          if (!article.content) {
            console.log(`跳過無內容的文章: ${article.title}`)
            return
          }
          
          try {
            await duplicateChecker.updateContentHash(article.id, article.content)
            updated++
            console.log(`✓ 更新文章哈希 (${updated}/${articles.length}): ${article.title}`)
          } catch (error) {
            console.error(`✗ 更新失敗: ${article.title}`, error)
          }
        })
      )
      
      // 顯示進度
      const progress = Math.round((i + batch.length) / articles.length * 100)
      console.log(`進度: ${progress}%`)
    }
    
    console.log(`\n完成！共更新 ${updated} 篇文章的內容哈希`)
    
  } catch (error) {
    console.error('執行過程中發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行腳本
generateContentHashes()
  .then(() => {
    console.log('腳本執行完成')
    process.exit(0)
  })
  .catch((error) => {
    console.error('腳本執行失敗:', error)
    process.exit(1)
  }) 