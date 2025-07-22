import { NextRequest, NextResponse } from 'next/server'
import { 
  validateMediaFile, 
  generateSafeFileName, 
  processAndSaveMediaSimple as processAndSaveMedia, 
  UPLOAD_PATHS 
} from '@/lib/media-utils-simple'

export async function POST(request: NextRequest) {
  try {
    console.log('收到上傳請求')
    
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const uploadType = formData.get('type') as string || 'products'
    const acceptVideo = formData.get('acceptVideo') === 'true'
    const acceptGif = formData.get('acceptGif') === 'true'
    
    console.log('上傳參數:', { filesCount: files.length, uploadType, acceptVideo, acceptGif })
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: '請選擇要上傳的檔案' },
        { status: 400 }
      )
    }

    // 驗證上傳類型
    const allowedTypes = ['products', 'categories', 'news', 'banners']
    if (!allowedTypes.includes(uploadType)) {
      return NextResponse.json(
        { error: '不支援的上傳類型' },
        { status: 400 }
      )
    }

    const uploadedMedia = []
    const errors = []

    for (const file of files) {
      try {
        console.log('處理檔案:', file.name, file.type, file.size)
        
        // 驗證檔案
        const validation = validateMediaFile(file)
        if (!validation.isValid) {
          errors.push(`${file.name}: ${validation.error}`)
          continue
        }

        // 檢查是否接受該媒體類型
        if (validation.mediaType === 'video' && !acceptVideo) {
          errors.push(`${file.name}: 不接受影片檔案`)
          continue
        }
        if (validation.mediaType === 'gif' && !acceptGif) {
          errors.push(`${file.name}: 不接受 GIF 檔案`)
          continue
        }

        // 生成安全的檔案名稱
        const safeFileName = generateSafeFileName(file.name, validation.mediaType!)
        console.log('生成檔案名:', safeFileName)
        
        // 獲取檔案內容
        const buffer = Buffer.from(await file.arrayBuffer())
        console.log('檔案 buffer 大小:', buffer.length)
        
        // 選擇上傳路徑
        const uploadPath = UPLOAD_PATHS[uploadType as keyof typeof UPLOAD_PATHS]
        console.log('上傳路徑:', uploadPath)

        // 處理並保存媒體檔案
        const { mainFile, thumbnail, mediaType } = await processAndSaveMedia(
          buffer,
          safeFileName,
          uploadPath,
          validation.mediaType!
        )

        console.log('處理完成:', { mainFile, thumbnail, mediaType })

        uploadedMedia.push({
          original: file.name,
          filename: safeFileName,
          url: mainFile,
          thumbnail: thumbnail,
          size: file.size,
          type: file.type,
          mediaType: mediaType
        })
      } catch (error) {
        console.error('處理檔案時發生錯誤:', error)
        errors.push(`${file.name}: 處理失敗 - ${error}`)
      }
    }

    console.log('上傳結果:', { uploadedCount: uploadedMedia.length, errorsCount: errors.length })

    // 返回結果
    return NextResponse.json({
      success: true,
      media: uploadedMedia,
      errors: errors.length > 0 ? errors : undefined,
      message: `成功上傳 ${uploadedMedia.length} 個檔案${errors.length > 0 ? `，${errors.length} 個失敗` : ''}`
    })

  } catch (error) {
    console.error('上傳 API 錯誤:', error)
    return NextResponse.json(
      { error: `檔案上傳時發生錯誤: ${error}` },
      { status: 500 }
    )
  }
} 