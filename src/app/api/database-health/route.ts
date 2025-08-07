// 數據庫健康檢查和清理API
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface DatabaseHealthReport {
  totalArticles: number
  validArticles: number
  invalidArticles: number
  missingContent: number
  invalidSlugs: number
  duplicateContent: number
  orphanedRecords: number
  issues: string[]
  cleanupActions: string[]
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 開始數據庫健康檢查...')
    
    const report: DatabaseHealthReport = {
      totalArticles: 0,
      validArticles: 0,
      invalidArticles: 0,
      missingContent: 0,
      invalidSlugs: 0,
      duplicateContent: 0,
      orphanedRecords: 0,
      issues: [],
      cleanupActions: []
    }

    // 獲取所有文章
    const allArticles = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        contentHash: true
      }
    })

    report.totalArticles = allArticles.length
    console.log(`📊 總計文章數: ${report.totalArticles}`)

    // 檢查每篇文章
    const duplicateHashes = new Map<string, string[]>()
    const duplicateSlugs = new Map<string, string[]>()
    
    for (const article of allArticles) {
      let isValid = true
      const issues: string[] = []

      // 檢查標題
      if (!article.title || article.title.length < 5) {
        isValid = false
        issues.push('標題過短或無效')
        report.missingContent++
      }

      // 檢查內容
      if (!article.content || article.content.length < 100) {
        isValid = false
        issues.push('內容過短或無效')
        report.missingContent++
      }

      // 檢查slug
      if (!article.slug || article.slug.length < 3) {
        isValid = false
        issues.push('Slug無效')
        report.invalidSlugs++
      }

      // 檢查發布狀態邏輯
      if (article.isPublished && !article.publishedAt) {
        isValid = false
        issues.push('發布狀態不一致（已發布但無發布時間）')
      }

      // 收集重複檢查數據
      if (article.contentHash) {
        if (!duplicateHashes.has(article.contentHash)) {
          duplicateHashes.set(article.contentHash, [])
        }
        duplicateHashes.get(article.contentHash)!.push(article.id)
      }

      if (article.slug) {
        if (!duplicateSlugs.has(article.slug)) {
          duplicateSlugs.set(article.slug, [])
        }
        duplicateSlugs.get(article.slug)!.push(article.id)
      }

      if (isValid) {
        report.validArticles++
      } else {
        report.invalidArticles++
        report.issues.push(`文章 ${article.id} (${article.title}): ${issues.join(', ')}`)
      }
    }

    // 檢查重複內容
    for (const [hash, ids] of duplicateHashes) {
      if (ids.length > 1) {
        report.duplicateContent++
        report.issues.push(`重複內容哈希 ${hash}: ${ids.length} 篇文章 (${ids.join(', ')})`)
      }
    }

    // 檢查重複slug
    for (const [slug, ids] of duplicateSlugs) {
      if (ids.length > 1) {
        report.issues.push(`重複Slug ${slug}: ${ids.length} 篇文章 (${ids.join(', ')})`)
      }
    }

    console.log(`✅ 健康檢查完成: ${report.validArticles}/${report.totalArticles} 篇文章有效`)
    console.log(`❌ 問題數量: ${report.issues.length}`)

    return NextResponse.json(report)

  } catch (error: any) {
    console.error('數據庫健康檢查失敗:', error)
    return NextResponse.json(
      { error: '數據庫健康檢查失敗', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()
    
    if (action === 'cleanup') {
      return await performCleanup()
    } else if (action === 'fix-duplicates') {
      return await fixDuplicates()
    } else if (action === 'fix-slugs') {
      return await fixInvalidSlugs()
    } else {
      return NextResponse.json(
        { error: '無效的操作類型' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('數據庫清理失敗:', error)
    return NextResponse.json(
      { error: '數據庫清理失敗', details: error.message },
      { status: 500 }
    )
  }
}

async function performCleanup() {
  console.log('🧹 開始數據庫清理...')
  const cleanupResults = {
    deletedArticles: 0,
    fixedArticles: 0,
    actions: [] as string[]
  }

  // 刪除無效文章
  const invalidArticles = await prisma.news.findMany({
    where: {
      OR: [
        { title: { in: ['', null] } },
        { content: { in: ['', null] } },
        { slug: { in: ['', null] } },
        // 內容過短
        { title: { notIn: [] } }, // 這裡需要更複雜的查詢
      ]
    }
  })

  for (const article of invalidArticles) {
    if (!article.title || article.title.length < 5 ||
        !article.content || article.content.length < 100 ||
        !article.slug || article.slug.length < 3) {
      
      console.log(`🗑️ 刪除無效文章: ${article.id} - ${article.title}`)
      await prisma.news.delete({ where: { id: article.id } })
      cleanupResults.deletedArticles++
      cleanupResults.actions.push(`刪除無效文章: ${article.title}`)
    }
  }

  // 修復發布狀態不一致
  const inconsistentArticles = await prisma.news.findMany({
    where: {
      isPublished: true,
      publishedAt: null
    }
  })

  for (const article of inconsistentArticles) {
    console.log(`🔧 修復發布狀態: ${article.id} - ${article.title}`)
    await prisma.news.update({
      where: { id: article.id },
      data: { publishedAt: article.createdAt }
    })
    cleanupResults.fixedArticles++
    cleanupResults.actions.push(`修復發布時間: ${article.title}`)
  }

  console.log(`✅ 清理完成: 刪除 ${cleanupResults.deletedArticles} 篇，修復 ${cleanupResults.fixedArticles} 篇`)
  
  return NextResponse.json({
    success: true,
    ...cleanupResults
  })
}

async function fixDuplicates() {
  console.log('🔧 修復重複內容...')
  const results = {
    processedDuplicates: 0,
    keptArticles: 0,
    deletedArticles: 0,
    actions: [] as string[]
  }

  // 查找重複的contentHash
  const articles = await prisma.news.findMany({
    where: {
      contentHash: { not: null }
    },
    orderBy: { createdAt: 'asc' }
  })

  const hashGroups = new Map<string, any[]>()
  articles.forEach(article => {
    if (article.contentHash) {
      if (!hashGroups.has(article.contentHash)) {
        hashGroups.set(article.contentHash, [])
      }
      hashGroups.get(article.contentHash)!.push(article)
    }
  })

  for (const [hash, duplicateArticles] of hashGroups) {
    if (duplicateArticles.length > 1) {
      results.processedDuplicates++
      
      // 保留第一篇（最舊的），刪除其他
      const [keep, ...toDelete] = duplicateArticles
      results.keptArticles++
      results.deletedArticles += toDelete.length
      
      console.log(`🔄 處理重複內容組 ${hash}: 保留 ${keep.title}，刪除 ${toDelete.length} 篇`)
      results.actions.push(`重複內容: 保留"${keep.title}"，刪除 ${toDelete.length} 篇重複`)
      
      for (const article of toDelete) {
        await prisma.news.delete({ where: { id: article.id } })
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...results
  })
}

async function fixInvalidSlugs() {
  console.log('🔧 修復無效Slug...')
  const results = {
    fixedSlugs: 0,
    actions: [] as string[]
  }

  // 查找無效slug
  const invalidSlugArticles = await prisma.news.findMany({
    where: {
      OR: [
        { slug: { in: ['', null] } },
        { slug: { lt: '___' } } // 長度小於3的slug
      ]
    }
  })

  for (const article of invalidSlugArticles) {
    const newSlug = generateValidSlug(article.title, article.id)
    
    console.log(`🔧 修復Slug: ${article.id} "${article.title}" -> ${newSlug}`)
    
    await prisma.news.update({
      where: { id: article.id },
      data: { slug: newSlug }
    })
    
    results.fixedSlugs++
    results.actions.push(`修復Slug: "${article.title}" -> ${newSlug}`)
  }

  return NextResponse.json({
    success: true,
    ...results
  })
}

function generateValidSlug(title: string, id: string): string {
  if (!title || title.length < 3) {
    return `article-${id}`
  }
  
  // 生成URL友好的slug
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s\u4e00-\u9fa5]/g, '') // 保留中文、英文、數字和空格
    .replace(/\s+/g, '-') // 空格轉連字符
    .replace(/-+/g, '-') // 合併多個連字符
    .replace(/^-+|-+$/g, '') // 移除開頭結尾連字符
  
  // 如果處理後太短，使用ID
  if (slug.length < 3) {
    slug = `article-${id}`
  } else {
    // 限制長度並添加ID確保唯一性
    slug = slug.substring(0, 50) + `-${id.substring(0, 8)}`
  }
  
  return slug
}
