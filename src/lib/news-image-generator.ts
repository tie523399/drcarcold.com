// 新聞圖片動態生成器
// 為新聞文章生成適當的圖片，包括封面圖和預設圖片

import { selectRandomImage, selectMultipleRandomImages } from './random-image-selector'

export interface NewsImageData {
  coverImage: string
  ogImage: string
  fallbackImage: string
}

// 汽車冷媒相關的預設圖片池（使用實際存在的圖片）
const CAR_REFRIGERANT_IMAGES = [
  '/images/default-news.svg',
  '/images/logo.png',
  '/images/product-placeholder.svg',
  '/images/default-news.svg'
]

// 汽車品牌相關圖片（使用預設圖片）
const BRAND_IMAGES: Record<string, string> = {
  'toyota': '/images/default-news.svg',
  'honda': '/images/default-news.svg',
  'nissan': '/images/default-news.svg',
  'mazda': '/images/default-news.svg',
  'mitsubishi': '/images/default-news.svg',
  'subaru': '/images/default-news.svg',
  'suzuki': '/images/default-news.svg',
  'mercedes': '/images/default-news.svg',
  'bmw': '/images/default-news.svg',
  'audi': '/images/default-news.svg',
  'volkswagen': '/images/default-news.svg',
  'volvo': '/images/default-news.svg',
  'hyundai': '/images/default-news.svg',
  'kia': '/images/default-news.svg'
}

// 主題相關圖片（使用預設圖片）
const TOPIC_IMAGES: Record<string, string> = {
  'maintenance': '/images/default-news.svg',
  'repair': '/images/default-news.svg',
  'service': '/images/default-news.svg',
  'troubleshooting': '/images/default-news.svg',
  'technology': '/images/default-news.svg',
  'seasonal': '/images/default-news.svg',
  'diy': '/images/default-news.svg',
  'professional': '/images/default-news.svg'
}

/**
 * 根據新聞內容生成適當的圖片（使用隨機圖片選擇）
 */
export async function generateNewsImages(
  title: string, 
  content: string, 
  tags: string[] = [],
  sourceName?: string
): Promise<NewsImageData> {
  
  console.log(`🖼️ 為新聞生成圖片: ${title.substring(0, 50)}...`)
  
  try {
    // 使用新的隨機圖片選擇器
    const coverImage = await selectRandomImage(title, content, tags)
    
    // 為 OG 圖片選擇不同的圖片（如果可能）
    const multipleImages = await selectMultipleRandomImages(2)
    const ogImage = multipleImages.length > 1 ? multipleImages[1] : coverImage
    
    console.log(`✅ 圖片生成完成 - 封面: ${coverImage}, OG: ${ogImage}`)
    
    return {
      coverImage,
      ogImage,
      fallbackImage: '/images/logo.png'
    }
  } catch (error) {
    console.error('隨機圖片選擇失敗，使用舊邏輯:', error)
    
    // 如果隨機選擇失敗，回退到舊邏輯
    return generateNewsImagesLegacy(title, content, tags, sourceName)
  }
}

/**
 * 舊版圖片生成邏輯（作為fallback）
 */
function generateNewsImagesLegacy(
  title: string, 
  content: string, 
  tags: string[] = [],
  sourceName?: string
): NewsImageData {
  
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  const allTags = tags.map(tag => tag.toLowerCase())
  
  // 1. 檢查是否有品牌相關內容
  const brandImage = findBrandImage(titleLower, contentLower, allTags)
  if (brandImage) {
    return {
      coverImage: brandImage,
      ogImage: brandImage,
      fallbackImage: '/images/logo.png'
    }
  }
  
  // 2. 檢查主題相關內容
  const topicImage = findTopicImage(titleLower, contentLower, allTags)
  if (topicImage) {
    return {
      coverImage: topicImage,
      ogImage: topicImage,
      fallbackImage: '/images/logo.png'
    }
  }
  
  // 3. 根據內容關鍵字選擇冷媒相關圖片
  const refrigerantImage = findRefrigerantImage(titleLower, contentLower, allTags)
  if (refrigerantImage) {
    return {
      coverImage: refrigerantImage,
      ogImage: refrigerantImage,
      fallbackImage: '/images/logo.png'
    }
  }
  
  // 4. 使用預設圖片
  return {
    coverImage: '/images/default-news.svg',
    ogImage: '/images/logo.png',
    fallbackImage: '/images/logo.png'
  }
}

/**
 * 尋找品牌相關圖片
 */
function findBrandImage(title: string, content: string, tags: string[]): string | null {
  const text = `${title} ${content} ${tags.join(' ')}`
  
  for (const [brand, imagePath] of Object.entries(BRAND_IMAGES)) {
    if (text.includes(brand)) {
      return imagePath
    }
  }
  
  return null
}

/**
 * 尋找主題相關圖片
 */
function findTopicImage(title: string, content: string, tags: string[]): string | null {
  const text = `${title} ${content} ${tags.join(' ')}`
  
  // 維修保養相關
  if (text.match(/維修|保養|檢修|維護|修理|service|maintenance|repair/)) {
    return TOPIC_IMAGES.maintenance
  }
  
  // 故障排除相關
  if (text.match(/故障|問題|異常|不冷|異音|異味|troubleshoot|problem|issue/)) {
    return TOPIC_IMAGES.troubleshooting
  }
  
  // 季節性保養
  if (text.match(/夏季|冬季|季節|seasonal|summer|winter/)) {
    return TOPIC_IMAGES.seasonal
  }
  
  // DIY相關
  if (text.match(/diy|自己|教學|步驟|tutorial|guide/)) {
    return TOPIC_IMAGES.diy
  }
  
  // 專業服務
  if (text.match(/專業|技師|服務|professional|technician/)) {
    return TOPIC_IMAGES.professional
  }
  
  // 新技術
  if (text.match(/新技術|科技|技術|innovation|technology|tech/)) {
    return TOPIC_IMAGES.technology
  }
  
  return null
}

/**
 * 尋找冷媒相關圖片
 */
function findRefrigerantImage(title: string, content: string, tags: string[]): string | null {
  const text = `${title} ${content} ${tags.join(' ')}`
  
  // R134a 相關
  if (text.includes('r134a') || text.includes('134a')) {
    return '/images/default-news.svg'
  }
  
  // R1234yf 相關
  if (text.includes('r1234yf') || text.includes('1234yf')) {
    return '/images/default-news.svg'
  }
  
  // 冷氣系統相關
  if (text.match(/冷氣|空調|冷媒|ac|air.conditioning|hvac/)) {
    return '/images/default-news.svg'
  }
  
  // 隨機選擇一個冷媒相關圖片
  const randomIndex = Math.floor(Math.random() * CAR_REFRIGERANT_IMAGES.length)
  return CAR_REFRIGERANT_IMAGES[randomIndex]
}

/**
 * 獲取圖片的完整 URL
 */
export function getFullImageUrl(imagePath: string, baseUrl: string = 'https://drcarcold.com'): string {
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  return `${baseUrl}${imagePath}`
}

/**
 * 檢查圖片是否存在，如果不存在則返回預設圖片
 */
export function getValidImageUrl(imagePath: string, fallback: string = '/images/logo.png'): string {
  // 在實際應用中，這裡可以添加圖片存在性檢查
  // 目前先返回傳入的路徑，如果無效會自動fallback
  return imagePath || fallback
}

/**
 * 為現有新聞文章批量生成圖片
 */
export async function generateImageForExistingNews(article: {
  title: string
  content: string
  tags?: string | null
  sourceName?: string | null
}): Promise<NewsImageData> {
  const tags = article.tags ? JSON.parse(article.tags) : []
  return await generateNewsImages(
    article.title,
    article.content,
    tags,
    article.sourceName || undefined
  )
}