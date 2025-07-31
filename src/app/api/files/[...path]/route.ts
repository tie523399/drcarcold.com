import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

// 文件服务API - 为Railway环境提供文件访问
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    
    // 安全检查：防止路径遍历攻击
    if (path.includes('..') || path.includes('~')) {
      return NextResponse.json(
        { error: '无效的文件路径' },
        { status: 400 }
      )
    }

    // 构建文件路径
    const isRailwayProduction = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT
    const basePath = isRailwayProduction ? '/tmp/uploads' : 'public/uploads'
    const filePath = join(basePath, path)

    console.log('文件服务请求:', { path, filePath, exists: existsSync(filePath) })

    // 检查文件是否存在
    if (!existsSync(filePath)) {
      console.log('文件不存在:', filePath)
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      )
    }

    // 读取文件
    const fileBuffer = await readFile(filePath)
    
    // 确定MIME类型
    const extension = path.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'png':
        contentType = 'image/png'
        break
      case 'webp':
        contentType = 'image/webp'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
      case 'mp4':
        contentType = 'video/mp4'
        break
      case 'webm':
        contentType = 'video/webm'
        break
    }

    // 返回文件
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('文件服务错误:', error)
    return NextResponse.json(
      { error: '文件读取失败' },
      { status: 500 }
    )
  }
}