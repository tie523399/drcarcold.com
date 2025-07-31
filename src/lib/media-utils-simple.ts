import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

// 媒體檔案大小限制
export const MEDIA_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  gif: 10 * 1024 * 1024, // 10MB
  video: 50 * 1024 * 1024, // 50MB
}

// 支援的媒體類型
export const ALLOWED_MEDIA_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'],
  gif: ['image/gif'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
}

// 上傳路徑配置 - Railway 环境适配
export const UPLOAD_PATHS = {
  products: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT 
    ? '/tmp/uploads/products' 
    : 'public/uploads/products',
  categories: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT 
    ? '/tmp/uploads/categories' 
    : 'public/uploads/categories',
  news: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT 
    ? '/tmp/uploads/news' 
    : 'public/uploads/news',
  banners: process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT 
    ? '/tmp/uploads/banners' 
    : 'public/uploads/banners',
}

// 驗證媒體檔案
export function validateMediaFile(file: File) {
  // 檢查檔案類型
  const allTypes = [
    ...ALLOWED_MEDIA_TYPES.image,
    ...ALLOWED_MEDIA_TYPES.gif,
    ...ALLOWED_MEDIA_TYPES.video,
  ]
  
  // 先檢查 MIME 類型，如果不在清單中，再檢查檔案擴展名
  let isValidType = allTypes.includes(file.type)
  let detectedMediaType: 'image' | 'gif' | 'video' = 'image'
  
  // 如果 MIME 類型檢查失敗，使用檔案擴展名檢測
  if (!isValidType) {
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.mp4') || fileName.endsWith('.webm') || fileName.endsWith('.ogg')) {
      isValidType = true
      detectedMediaType = 'video'
    } else if (fileName.endsWith('.gif')) {
      isValidType = true
      detectedMediaType = 'gif'
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
               fileName.endsWith('.png') || fileName.endsWith('.webp')) {
      isValidType = true
      detectedMediaType = 'image'
    }
  } else {
    // 使用 MIME 類型判斷
    if (ALLOWED_MEDIA_TYPES.gif.includes(file.type)) {
      detectedMediaType = 'gif'
    } else if (ALLOWED_MEDIA_TYPES.video.includes(file.type)) {
      detectedMediaType = 'video'
    } else {
      detectedMediaType = 'image'
    }
  }
  
  if (!isValidType) {
    return {
      isValid: false,
      error: `不支援的檔案格式: ${file.type}. 支援的格式: 圖片(JPG/PNG/WebP), GIF, 影片(MP4/WebM/OGG)`,
      mediaType: null
    }
  }

  // 獲取對應的大小限制
  let sizeLimit = MEDIA_SIZE_LIMITS.image
  if (detectedMediaType === 'gif') {
    sizeLimit = MEDIA_SIZE_LIMITS.gif
  } else if (detectedMediaType === 'video') {
    sizeLimit = MEDIA_SIZE_LIMITS.video
  }

  // 檢查檔案大小
  if (file.size > sizeLimit) {
    const limitMB = sizeLimit / (1024 * 1024)
    return {
      isValid: false,
      error: `檔案大小超過 ${limitMB}MB 的限制，目前檔案大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      mediaType: detectedMediaType
    }
  }

  console.log(`檔案驗證成功: ${file.name}, 類型: ${detectedMediaType}, 大小: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

  return { isValid: true, error: null, mediaType: detectedMediaType }
}

// 生成安全的檔案名稱
export function generateSafeFileName(originalName: string, mediaType: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  
  // 獲取檔案副檔名
  const lastDotIndex = originalName.lastIndexOf('.')
  const extension = lastDotIndex > -1 ? originalName.substring(lastDotIndex) : ''
  
  // 清理檔案名稱，移除特殊字符
  const cleanName = originalName
    .substring(0, lastDotIndex > -1 ? lastDotIndex : originalName.length)
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_')
    .substring(0, 30)
  
  return `${timestamp}_${randomString}_${cleanName}${extension}`
}

// 簡化的媒體處理（不使用 sharp）
export async function processAndSaveMediaSimple(
  buffer: Buffer,
  fileName: string,
  uploadPath: string,
  mediaType: 'image' | 'gif' | 'video'
) {
  try {
    console.log('🔧 处理媒体文件:', { fileName, uploadPath, mediaType })
    
    // Railway环境适配：确保上传目录存在
    const isRailwayProd = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT
    let fullUploadPath: string
    
    if (isRailwayProd) {
      // Railway环境：使用绝对路径，不依赖process.cwd()
      fullUploadPath = uploadPath.startsWith('/') ? uploadPath : join('/tmp/uploads', uploadPath.replace(/^.*\/uploads\//, ''))
    } else {
      fullUploadPath = join(process.cwd(), uploadPath)
    }
    
    console.log('📁 创建目录:', { 
      uploadPath, 
      fullUploadPath, 
      exists: existsSync(fullUploadPath),
      isRailwayProd,
      cwd: process.cwd()
    })
    
    try {
      // 强制重新创建目录结构 - 解决容器重启问题
      if (isRailwayProd) {
        // Railway环境：确保核心目录存在
        const coreDirectories = ['/tmp/uploads', '/tmp/uploads/products', '/tmp/uploads/categories', '/tmp/uploads/news', '/tmp/uploads/banners']
        for (const dir of coreDirectories) {
          if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true })
            console.log('🔧 重建目录:', dir)
          }
        }
      }
      
      if (!existsSync(fullUploadPath)) {
        await mkdir(fullUploadPath, { recursive: true })
        console.log('✅ 目录创建成功:', fullUploadPath)
      }

      // 創建縮略圖目錄
      const thumbnailPath = join(fullUploadPath, 'thumbnails')
      if (!existsSync(thumbnailPath)) {
        await mkdir(thumbnailPath, { recursive: true })
        console.log('✅ 缩略图目录创建成功:', thumbnailPath)
      }
    } catch (error) {
      console.error('❌ 目录创建失败:', error)
      // Railway环境下如果目录创建失败，尝试直接保存到tmp根目录
      if (isRailwayProd) {
        fullUploadPath = '/tmp'
        console.log('🔄 回退到 /tmp 目录')
        
        // 确保tmp目录存在
        try {
          await mkdir('/tmp', { recursive: true })
        } catch (tmpError) {
          console.error('❌ 连 /tmp 目录都创建失败:', tmpError)
          throw new Error('文件系统不可用')
        }
      }
    }

    // 保存原始檔案
    const filePath = join(fullUploadPath, fileName)
    console.log('💾 保存文件到:', filePath)
    await writeFile(filePath, buffer)
    console.log('✅ 文件保存成功, 大小:', buffer.length, '字节')
    console.log('🔍 文件存在检查:', existsSync(filePath))

    // 生成公開 URL - Railway 环境适配
    const isRailwayProduction = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT
    let publicUrl: string
    
    if (isRailwayProduction) {
      // Railway: 通过API访问，提取类型目录名
      const uploadTypeFromPath = uploadPath.includes('/') ? uploadPath.split('/').pop() : uploadPath.replace(/^.*uploads[\/\\]/, '')
      publicUrl = `/api/files/${uploadTypeFromPath}/${fileName}`
      console.log('🌐 Railway URL生成:', { uploadPath, uploadTypeFromPath, publicUrl })
    } else {
      // 本地: 直接访问
      publicUrl = `/${uploadPath.replace('public/', '')}/${fileName}`
      console.log('🌐 本地 URL生成:', publicUrl)
    }

    let thumbnailUrl = publicUrl

    // 為 GIF 和圖片創建縮略圖（暫時使用原檔）
    if (mediaType === 'image' || mediaType === 'gif') {
      try {
        const thumbnailFileName = fileName
        const thumbnailFilePath = join(thumbnailPath, thumbnailFileName)
        
        // 暫時直接複製原檔作為縮略圖
        await writeFile(thumbnailFilePath, buffer)
        
        thumbnailUrl = isRailwayProduction
          ? `/api/files/${uploadPath.split('/').pop()}/thumbnails/${thumbnailFileName}`
          : `/${uploadPath.replace('public/', '')}/thumbnails/${thumbnailFileName}`
      } catch (error) {
        console.error('創建縮略圖失敗:', error)
        // 使用原檔作為縮略圖
        thumbnailUrl = publicUrl
      }
    }
    
    // 影片檔案使用預設縮略圖
    if (mediaType === 'video') {
      thumbnailUrl = '/images/video-placeholder.svg'
    }

    const result = {
      mainFile: publicUrl,
      thumbnail: thumbnailUrl,
      mediaType
    }
    
    console.log('🎯 返回结果:', result)
    return result
  } catch (error) {
    console.error('處理媒體檔案時發生錯誤:', error)
    throw error
  }
} 