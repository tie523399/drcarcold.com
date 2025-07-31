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

    // 构建文件路径 - 改进的Railway适配
    const isRailwayProduction = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT
    let basePath: string
    let filePath: string
    
    if (isRailwayProduction) {
      // Railway环境：先尝试完整路径，再尝试tmp根目录
      basePath = '/tmp/uploads'
      filePath = join(basePath, path)
      
      // 如果标准路径不存在，尝试在tmp根目录查找
      if (!existsSync(filePath)) {
        const fallbackPath = join('/tmp', path.split('/').pop() || '')
        console.log('🔄 尝试回退路径:', fallbackPath)
        if (existsSync(fallbackPath)) {
          filePath = fallbackPath
          basePath = '/tmp'
        }
      }
    } else {
      basePath = 'public/uploads'
      filePath = join(basePath, path)
    }

    console.log('🔍 文件服务请求:', { 
      originalPath: path, 
      constructedPath: filePath, 
      basePath,
      isRailwayProduction,
      exists: existsSync(filePath),
      env: process.env.NODE_ENV,
      railwayEnv: process.env.RAILWAY_ENVIRONMENT
    })

    // 如果文件不存在，尝试检查目录结构
    if (!existsSync(filePath)) {
      const directory = join(basePath, path.split('/')[0])
      console.log('📁 检查目录:', { 
        directory, 
        dirExists: existsSync(directory),
        files: existsSync(directory) ? require('fs').readdirSync(directory).slice(0, 5) : '目录不存在'
      })
      
      console.log('❌ 文件不存在:', filePath)
      return NextResponse.json(
        { 
          error: '文件不存在',
          debug: {
            requestedPath: path,
            fullPath: filePath,
            basePath,
            environment: process.env.NODE_ENV
          }
        },
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