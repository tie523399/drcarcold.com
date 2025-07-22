import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

// 🎯 動態生成完整 Sitemap - 汽車冷媒SEO優化
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://drcarcold.com'
  const currentDate = new Date()
  
  // 基礎靜態頁面 - 高優先級
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/zh`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    // 🎯 核心頁面 - 汽車冷媒相關
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/zh/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/products`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // 🎯 冷媒查詢工具 - 高價值頁面
    {
      url: `${baseUrl}/refrigerant-lookup`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/zh/refrigerant-lookup`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/refrigerant-lookup`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    // 🎯 技術資訊頁面
    {
      url: `${baseUrl}/news`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/zh/news`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/en/news`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // 公司頁面
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/zh/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/en/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // 聯繫頁面
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/zh/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/en/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    // 🎯 動態產品頁面
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        updatedAt: true,
      }
    })

    const productPages: MetadataRoute.Sitemap = products.flatMap(product => [
      {
        url: `${baseUrl}/products/${product.id}`,
        lastModified: product.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/zh/products/${product.id}`,
        lastModified: product.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/products/${product.id}`,
        lastModified: product.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    ])

    // 🎯 動態新聞文章頁面
    const articles = await prisma.news.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 500 // 限制數量避免sitemap過大
    })

    const articlePages: MetadataRoute.Sitemap = articles.flatMap(article => [
      {
        url: `${baseUrl}/news/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/zh/news/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/en/news/${article.slug}`,
        lastModified: article.updatedAt || article.publishedAt || currentDate,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }
    ])

    // 🎯 分類頁面
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        updatedAt: true,
      }
    })

    const categoryPages: MetadataRoute.Sitemap = categories.flatMap(category => [
      {
        url: `${baseUrl}/products/category/${category.id}`,
        lastModified: category.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/zh/products/category/${category.id}`,
        lastModified: category.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${baseUrl}/en/products/category/${category.id}`,
        lastModified: category.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    ])

    // 🎯 特殊SEO頁面 - 針對汽車冷媒關鍵字
    const seoPages: MetadataRoute.Sitemap = [
      // R134a 相關頁面
      {
        url: `${baseUrl}/r134a-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/zh/r134a-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // R1234yf 相關頁面
      {
        url: `${baseUrl}/r1234yf-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/zh/r1234yf-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      // 品牌車款專頁
      {
        url: `${baseUrl}/toyota-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/honda-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/bmw-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/mercedes-refrigerant`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // 技術指南頁面
      {
        url: `${baseUrl}/refrigerant-guide`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/ac-repair-guide`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/maintenance-tips`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.7,
      }
    ]

    return [
      ...staticPages,
      ...productPages,
      ...articlePages,
      ...categoryPages,
      ...seoPages
    ]

  } catch (error) {
    console.error('生成 sitemap 時發生錯誤:', error)
    // 如果資料庫查詢失敗，至少返回靜態頁面
    return staticPages
  }
} 