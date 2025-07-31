import { NextRequest, NextResponse } from 'next/server'
import { existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'

// 文件系统健康检查API - 确保上传目录可用
export async function GET(request: NextRequest) {
  try {
    const isRailwayProd = process.env.NODE_ENV === 'production' && process.env.RAILWAY_ENVIRONMENT
    
    // 检查和创建必要的目录
    const requiredDirs = isRailwayProd 
      ? ['/tmp/uploads', '/tmp/uploads/products', '/tmp/uploads/categories', '/tmp/uploads/news', '/tmp/uploads/banners']
      : ['public/uploads', 'public/uploads/products', 'public/uploads/categories', 'public/uploads/news', 'public/uploads/banners']
    
    const status = {
      environment: process.env.NODE_ENV,
      isRailwayProd,
      directories: {} as Record<string, { exists: boolean, created?: boolean, error?: string }>,
      timestamp: new Date().toISOString()
    }
    
    // 检查每个目录
    for (const dir of requiredDirs) {
      try {
        const exists = existsSync(dir)
        status.directories[dir] = { exists }
        
        // 如果目录不存在，尝试创建
        if (!exists) {
          await mkdir(dir, { recursive: true })
          status.directories[dir].created = true
          console.log('🔧 健康检查：创建目录', dir)
        }
      } catch (error) {
        status.directories[dir].error = error instanceof Error ? error.message : '未知错误'
        console.error('❌ 健康检查：目录创建失败', dir, error)
      }
    }
    
    // 检查是否所有目录都可用
    const allDirectoriesOk = Object.values(status.directories).every(
      dir => dir.exists || dir.created
    )
    
    return NextResponse.json({
      status: allDirectoriesOk ? 'healthy' : 'unhealthy',
      message: allDirectoriesOk ? '文件系统正常' : '文件系统有问题',
      details: status
    }, { 
      status: allDirectoriesOk ? 200 : 500 
    })
    
  } catch (error) {
    console.error('健康检查API错误:', error)
    return NextResponse.json({
      status: 'error',
      message: '健康检查失败',
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}