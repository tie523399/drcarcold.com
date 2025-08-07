// 隨機圖片選擇器 - 從 public/images 目錄隨機選擇新聞封面圖片
import fs from 'fs'
import path from 'path'

export interface ImageInfo {
  path: string
  filename: string
  category: 'general' | 'brand' | 'topic' | 'news'
  size?: number
}

// 支援的圖片格式
const SUPPORTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif']

// 排除的檔案（不適合作為新聞封面）
const EXCLUDED_FILES = [
  'video-placeholder.svg', // 太小，只有1B
  'product-placeholder.svg' // 可能不太適合新聞
]

/**
 * 掃描 public/images 目錄，獲取所有可用的圖片
 */
export async function scanAvailableImages(): Promise<ImageInfo[]> {
  const imagesDir = path.join(process.cwd(), 'public', 'images')
  const images: ImageInfo[] = []

  try {
    console.log(`🔍 掃描圖片目錄: ${imagesDir}`)

    // 掃描主目錄
    await scanDirectory(imagesDir, '', images)
    
    // 掃描子目錄
    const subDirs = ['news', 'brands', 'topics']
    for (const subDir of subDirs) {
      const subDirPath = path.join(imagesDir, subDir)
      if (fs.existsSync(subDirPath)) {
        await scanDirectory(subDirPath, subDir, images)
      }
    }

    console.log(`✅ 掃描完成，發現 ${images.length} 個可用圖片`)
    images.forEach(img => {
      console.log(`   📷 ${img.category}: ${img.path}`)
    })

    return images

  } catch (error) {
    console.error('圖片掃描失敗:', error)
    return getDefaultImages() // 返回預設圖片
  }
}

/**
 * 掃描指定目錄
 */
async function scanDirectory(dirPath: string, category: string, images: ImageInfo[]): Promise<void> {
  try {
    const files = fs.readdirSync(dirPath)
    
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      
      // 跳過目錄
      if (stats.isDirectory()) continue
      
      // 檢查檔案副檔名
      const ext = path.extname(file).toLowerCase()
      if (!SUPPORTED_IMAGE_EXTENSIONS.includes(ext)) continue
      
      // 檢查是否在排除列表中
      if (EXCLUDED_FILES.includes(file)) {
        console.log(`🚫 跳過排除檔案: ${file}`)
        continue
      }
      
      // 跳過太小的檔案（可能是placeholder）
      if (stats.size < 1000) { // 小於1KB
        console.log(`🚫 跳過過小檔案: ${file} (${stats.size}B)`)
        continue
      }

      // 生成相對於 public 的路徑
      const relativePath = path.relative(path.join(process.cwd(), 'public'), filePath)
      const webPath = '/' + relativePath.replace(/\\/g, '/') // 轉換為 web 路徑
      
      images.push({
        path: webPath,
        filename: file,
        category: getCategoryFromPath(category, file),
        size: stats.size
      })
    }
  } catch (error) {
    console.error(`掃描目錄失敗 ${dirPath}:`, error)
  }
}

/**
 * 根據路徑和檔名決定分類
 */
function getCategoryFromPath(directory: string, filename: string): 'general' | 'brand' | 'topic' | 'news' {
  if (directory === 'brands') return 'brand'
  if (directory === 'topics') return 'topic'
  if (directory === 'news') return 'news'
  
  // 根據檔名判斷
  const nameLower = filename.toLowerCase()
  if (nameLower.includes('brand') || nameLower.includes('car') || nameLower.includes('auto')) {
    return 'brand'
  }
  if (nameLower.includes('topic') || nameLower.includes('tech') || nameLower.includes('service')) {
    return 'topic'
  }
  if (nameLower.includes('news') || nameLower.includes('article')) {
    return 'news'
  }
  
  return 'general'
}

/**
 * 獲取預設圖片列表（作為fallback）
 */
function getDefaultImages(): ImageInfo[] {
  return [
    {
      path: '/images/logo.png',
      filename: 'logo.png',
      category: 'general',
      size: 73000
    },
    {
      path: '/images/default-news.svg',
      filename: 'default-news.svg',
      category: 'news',
      size: 2500
    }
  ]
}

/**
 * 根據內容智能選擇圖片
 */
export async function selectRandomImage(
  title: string = '',
  content: string = '',
  tags: string[] = [],
  preferredCategory?: 'general' | 'brand' | 'topic' | 'news'
): Promise<string> {
  
  const availableImages = await scanAvailableImages()
  
  if (availableImages.length === 0) {
    console.log('⚠️ 沒有可用圖片，使用預設圖片')
    return '/images/default-news.svg'
  }

  // 如果指定了偏好分類，優先選擇該分類的圖片
  if (preferredCategory) {
    const categoryImages = availableImages.filter(img => img.category === preferredCategory)
    if (categoryImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryImages.length)
      console.log(`🎯 選擇 ${preferredCategory} 分類圖片: ${categoryImages[randomIndex].path}`)
      return categoryImages[randomIndex].path
    }
  }

  // 根據內容關鍵字智能選擇
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase()
  
  // 品牌相關
  if (text.match(/toyota|honda|nissan|mazda|bmw|mercedes|audi|hyundai|kia|ford|chevrolet/)) {
    const brandImages = availableImages.filter(img => img.category === 'brand')
    if (brandImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * brandImages.length)
      console.log(`🚗 檢測到品牌內容，選擇品牌圖片: ${brandImages[randomIndex].path}`)
      return brandImages[randomIndex].path
    }
  }

  // 技術/主題相關
  if (text.match(/維修|保養|技術|service|maintenance|repair|troubleshoot|diy/)) {
    const topicImages = availableImages.filter(img => img.category === 'topic')
    if (topicImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * topicImages.length)
      console.log(`🔧 檢測到技術內容，選擇主題圖片: ${topicImages[randomIndex].path}`)
      return topicImages[randomIndex].path
    }
  }

  // 新聞相關
  const newsImages = availableImages.filter(img => img.category === 'news')
  if (newsImages.length > 0) {
    const randomIndex = Math.floor(Math.random() * newsImages.length)
    console.log(`📰 選擇新聞分類圖片: ${newsImages[randomIndex].path}`)
    return newsImages[randomIndex].path
  }

  // 隨機選擇任意圖片
  const randomIndex = Math.floor(Math.random() * availableImages.length)
  console.log(`🎲 隨機選擇圖片: ${availableImages[randomIndex].path}`)
  return availableImages[randomIndex].path
}

/**
 * 獲取多個隨機圖片（用於生成不同尺寸的圖片）
 */
export async function selectMultipleRandomImages(count: number = 3): Promise<string[]> {
  const availableImages = await scanAvailableImages()
  
  if (availableImages.length === 0) {
    return ['/images/default-news.svg']
  }

  const selectedImages: string[] = []
  const usedIndices = new Set<number>()

  for (let i = 0; i < Math.min(count, availableImages.length); i++) {
    let randomIndex: number
    do {
      randomIndex = Math.floor(Math.random() * availableImages.length)
    } while (usedIndices.has(randomIndex))
    
    usedIndices.add(randomIndex)
    selectedImages.push(availableImages[randomIndex].path)
  }

  console.log(`🎲 選擇了 ${selectedImages.length} 個隨機圖片:`, selectedImages)
  return selectedImages
}

/**
 * 測試圖片選擇功能
 */
export async function testImageSelection(): Promise<void> {
  console.log('🧪 測試圖片選擇功能...')
  
  const testCases = [
    { title: 'Toyota汽車冷媒保養', content: '專業維修服務', tags: ['toyota', 'maintenance'] },
    { title: 'BMW空調系統', content: '德國豪華車技術', tags: ['bmw', 'technology'] },
    { title: '一般新聞文章', content: '日常資訊', tags: ['news'] }
  ]

  for (const testCase of testCases) {
    console.log(`\n測試案例: ${testCase.title}`)
    const selectedImage = await selectRandomImage(testCase.title, testCase.content, testCase.tags)
    console.log(`選擇結果: ${selectedImage}`)
  }

  console.log('\n📊 可用圖片統計:')
  const images = await scanAvailableImages()
  const stats = images.reduce((acc, img) => {
    acc[img.category] = (acc[img.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  Object.entries(stats).forEach(([category, count]) => {
    console.log(`   ${category}: ${count} 個圖片`)
  })
}
