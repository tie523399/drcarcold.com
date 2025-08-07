// 測試隨機圖片選擇功能
import { testImageSelection, selectRandomImage, scanAvailableImages } from './random-image-selector'

export async function runRandomImageTests(): Promise<void> {
  console.log('🧪 開始測試隨機圖片選擇功能...')
  
  try {
    // 1. 測試圖片掃描
    console.log('\n📡 測試 1: 圖片掃描功能')
    const images = await scanAvailableImages()
    console.log(`✅ 掃描完成，發現 ${images.length} 個可用圖片`)
    
    // 2. 測試智能選擇
    console.log('\n🎯 測試 2: 智能圖片選擇')
    const testCases = [
      {
        title: 'Toyota Corolla 冷媒更換指南',
        content: '專業技師教您如何為Toyota Corolla進行冷媒系統維護',
        tags: ['toyota', '維修', '冷媒', 'r134a'],
        expected: '品牌相關圖片'
      },
      {
        title: 'Mercedes-Benz C-Class 空調系統故障排除',
        content: '德國豪華車空調系統常見問題及解決方案',
        tags: ['mercedes', 'troubleshoot', '空調'],
        expected: '品牌相關圖片'
      },
      {
        title: '汽車冷氣不冷的10個原因',
        content: 'DIY檢查汽車冷氣系統，自己動手解決常見問題',
        tags: ['diy', '故障', '教學'],
        expected: '主題相關圖片'
      },
      {
        title: '2024年汽車冷媒產業報告',
        content: '最新汽車冷媒技術發展趨勢與市場分析',
        tags: ['industry', 'report', '2024'],
        expected: '新聞相關圖片'
      },
      {
        title: '一般技術文章',
        content: '通用的汽車維修知識分享',
        tags: ['general'],
        expected: '隨機圖片'
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`\n  📝 測試案例: ${testCase.title}`)
      console.log(`     期望: ${testCase.expected}`)
      
      const selectedImage = await selectRandomImage(
        testCase.title,
        testCase.content,
        testCase.tags
      )
      
      console.log(`     結果: ${selectedImage}`)
      
      // 簡單的驗證邏輯
      if (selectedImage.includes('/images/')) {
        console.log(`     ✅ 成功選擇圖片`)
      } else {
        console.log(`     ❌ 圖片路徑異常`)
      }
    }
    
    // 3. 測試批量選擇
    console.log('\n🎲 測試 3: 批量隨機選擇')
    const multipleImages = await import('./random-image-selector').then(m => m.selectMultipleRandomImages(3))
    console.log(`✅ 批量選擇結果:`, multipleImages)
    
    // 4. 性能測試
    console.log('\n⚡ 測試 4: 性能測試')
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      await selectRandomImage(`測試文章 ${i}`, '測試內容', ['test'])
    }
    
    const duration = Date.now() - startTime
    console.log(`✅ 10次選擇耗時: ${duration}ms (平均 ${duration/10}ms/次)`)
    
    console.log('\n🎉 所有測試完成！')
    
  } catch (error) {
    console.error('❌ 測試失敗:', error)
  }
}

// 測試新聞圖片生成整合
export async function testNewsImageGeneration(): Promise<void> {
  console.log('🖼️ 測試新聞圖片生成整合...')
  
  try {
    const { generateNewsImages } = await import('./news-image-generator')
    
    const testArticle = {
      title: 'Honda Civic 夏季冷氣保養攻略',
      content: '炎炎夏日，Honda Civic的冷氣系統需要特別維護。本文將為您詳細介紹如何進行冷媒檢查、濾網清潔和系統診斷。',
      tags: ['honda', 'civic', '夏季', '保養', '冷氣'],
      sourceName: 'DrCarCold技術團隊'
    }
    
    console.log('測試文章:', testArticle.title)
    
    const imageData = await generateNewsImages(
      testArticle.title,
      testArticle.content,
      testArticle.tags,
      testArticle.sourceName
    )
    
    console.log('生成結果:')
    console.log(`  封面圖片: ${imageData.coverImage}`)
    console.log(`  OG圖片: ${imageData.ogImage}`)
    console.log(`  備用圖片: ${imageData.fallbackImage}`)
    
    // 驗證圖片路徑
    const allImages = [imageData.coverImage, imageData.ogImage, imageData.fallbackImage]
    let validCount = 0
    
    for (const img of allImages) {
      if (img && img.startsWith('/images/')) {
        validCount++
      }
    }
    
    console.log(`✅ 有效圖片路徑: ${validCount}/${allImages.length}`)
    
  } catch (error) {
    console.error('❌ 新聞圖片生成測試失敗:', error)
  }
}

// 統計函數
export async function getImageStatistics(): Promise<void> {
  console.log('📊 獲取圖片統計信息...')
  
  try {
    const images = await scanAvailableImages()
    
    const stats = {
      total: images.length,
      byCategory: {} as Record<string, number>,
      totalSize: 0,
      avgSize: 0
    }
    
    for (const img of images) {
      stats.byCategory[img.category] = (stats.byCategory[img.category] || 0) + 1
      if (img.size) {
        stats.totalSize += img.size
      }
    }
    
    stats.avgSize = stats.total > 0 ? Math.round(stats.totalSize / stats.total) : 0
    
    console.log('統計結果:')
    console.log(`  總圖片數: ${stats.total}`)
    console.log(`  總大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`  平均大小: ${(stats.avgSize / 1024).toFixed(1)} KB`)
    console.log('  分類分布:')
    
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1)
      console.log(`    ${category}: ${count} 個 (${percentage}%)`)
    })
    
  } catch (error) {
    console.error('❌ 統計信息獲取失敗:', error)
  }
}
