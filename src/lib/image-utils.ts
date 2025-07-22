import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// 支援的圖片格式
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

// 圖片配置
export const IMAGE_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 80,
  thumbnailSize: 300,
  thumbnailQuality: 70
}

// 圖片上傳路徑
export const UPLOAD_PATHS = {
  products: 'public/uploads/products',
  categories: 'public/uploads/categories',
  news: 'public/uploads/news'
}

/**
 * 驗證圖片檔案
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // 檢查檔案類型
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: '不支援的圖片格式。請使用 JPG、PNG、WebP 或 GIF 格式。'
    }
  }

  // 檢查檔案大小
  if (file.size > IMAGE_CONFIG.maxFileSize) {
    return {
      isValid: false,
      error: `圖片檔案過大。最大允許大小為 ${IMAGE_CONFIG.maxFileSize / (1024 * 1024)}MB。`
    }
  }

  return { isValid: true }
}

/**
 * 生成安全的檔案名稱
 */
export function generateSafeFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const nameWithoutExt = path.basename(originalName, ext)
  const safeName = nameWithoutExt
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .substring(0, 50)
  
  return `${safeName}_${uuidv4()}${ext}`
}

/**
 * 確保目錄存在
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true })
  }
}

/**
 * 處理並保存圖片
 */
export async function processAndSaveImage(
  buffer: Buffer,
  fileName: string,
  uploadPath: string
): Promise<{ mainImage: string; thumbnail: string }> {
  await ensureDirectoryExists(uploadPath)
  await ensureDirectoryExists(path.join(uploadPath, 'thumbnails'))

  const mainImagePath = path.join(uploadPath, fileName)
  const thumbnailPath = path.join(uploadPath, 'thumbnails', fileName)

  // 處理主圖片
  const processedImage = await sharp(buffer)
    .resize(IMAGE_CONFIG.maxWidth, IMAGE_CONFIG.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: IMAGE_CONFIG.quality })
    .toBuffer()

  // 生成縮圖
  const thumbnailImage = await sharp(buffer)
    .resize(IMAGE_CONFIG.thumbnailSize, IMAGE_CONFIG.thumbnailSize, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: IMAGE_CONFIG.thumbnailQuality })
    .toBuffer()

  // 保存檔案
  await writeFile(mainImagePath, processedImage)
  await writeFile(thumbnailPath, thumbnailImage)

  // 返回相對路徑（用於存儲到數據庫）
  const relativePath = uploadPath.replace('public', '')
  return {
    mainImage: path.join(relativePath, fileName).replace(/\\/g, '/'),
    thumbnail: path.join(relativePath, 'thumbnails', fileName).replace(/\\/g, '/')
  }
}

/**
 * 刪除圖片檔案
 */
export async function deleteImageFiles(imagePath: string): Promise<void> {
  try {
    const fs = require('fs').promises
    const fullPath = path.join('public', imagePath)
    const thumbnailPath = fullPath.replace(/([^/\\]+)$/, 'thumbnails/$1')
    
    // 刪除主圖片
    try {
      await fs.unlink(fullPath)
    } catch (error) {
      console.warn('無法刪除主圖片:', fullPath)
    }
    
    // 刪除縮圖
    try {
      await fs.unlink(thumbnailPath)
    } catch (error) {
      console.warn('無法刪除縮圖:', thumbnailPath)
    }
  } catch (error) {
    console.error('刪除圖片時發生錯誤:', error)
  }
}

/**
 * 獲取圖片URL
 */
export function getImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`
}

/**
 * 獲取縮圖URL
 */
export function getThumbnailUrl(imagePath: string | null): string | null {
  if (!imagePath) return null
  const thumbnailPath = imagePath.replace(/([^/\\]+)$/, 'thumbnails/$1')
  return thumbnailPath.startsWith('/') ? thumbnailPath : `/${thumbnailPath}`
} 