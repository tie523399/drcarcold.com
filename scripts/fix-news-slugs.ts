// 修復新聞 slug
import { prisma } from '../src/lib/prisma'

// 生成更友好的 slug
function generateBetterSlug(title: string, id?: string): string {
  // 移除特殊字符，只保留英文、數字和連字符
  let slug = title
    .toLowerCase()
    .trim()
    // 替換中文字符為拼音或移除
    .replace(/[\u4e00-\u9fa5]/g, '') // 暫時移除中文字符
    // 替換空格和特殊字符為連字符
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
  
  // 如果 slug 太短或為空，使用 ID
  if (!slug || slug.length < 3) {
    slug = 'news'
  }
  
  // 限制長度
  slug = slug.substring(0, 60)
  
  // 添加 ID 或時間戳確保唯一性
  if (id) {
    // 使用文章 ID 的後 8 位
    slug += '-' + id.slice(-8)
  } else {
    // 使用時間戳的後 8 位
    slug += '-' + Date.now().toString().slice(-8)
  }
  
  return slug
}

async function fixNewsSlugs() {
  console.log('開始修復新聞 slug...\n')
  
  try {
    // 獲取所有新聞
    const allNews = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    })
    
    console.log(`找到 ${allNews.length} 筆新聞記錄`)
    
    let fixedCount = 0
    
    for (const news of allNews) {
      // 檢查 slug 是否包含中文或格式不正確
      const hasChineseOrBadFormat = /[\u4e00-\u9fa5]/.test(news.slug) || 
                                    news.slug.length > 100 ||
                                    news.slug.includes('--') ||
                                    !news.slug.match(/^[a-z0-9-]+$/)
      
      if (hasChineseOrBadFormat) {
        const newSlug = generateBetterSlug(news.title, news.id)
        
        // 確保新 slug 是唯一的
        let finalSlug = newSlug
        let counter = 1
        
        while (true) {
          const existing = await prisma.news.findFirst({
            where: {
              slug: finalSlug,
              id: { not: news.id }
            }
          })
          
          if (!existing) break
          
          finalSlug = `${newSlug}-${counter}`
          counter++
        }
        
        // 更新 slug
        await prisma.news.update({
          where: { id: news.id },
          data: { slug: finalSlug }
        })
        
        console.log(`✓ 修復: ${news.title}`)
        console.log(`  舊 slug: ${news.slug}`)
        console.log(`  新 slug: ${finalSlug}`)
        
        fixedCount++
      }
    }
    
    console.log(`\n修復完成！共修復 ${fixedCount} 筆記錄`)
    
  } catch (error) {
    console.error('修復 slug 時發生錯誤:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// 執行修復
fixNewsSlugs().catch(console.error) 