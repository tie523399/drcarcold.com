// 處理智能調度配置應用到自動服務的API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function applySmartScheduleToAutoService(config: any) {
  try {
    // 更新自動服務配置
    const configUpdates = [
      { key: 'crawlerInterval', value: config.crawlerInterval.toString() },
      { key: 'seoGeneratorInterval', value: config.seoGeneratorInterval.toString() },
      { key: 'seoGeneratorCount', value: config.seoGeneratorCount.toString() },
      { key: 'maxArticleCount', value: config.maxArticleCount.toString() },
      { key: 'cleanupInterval', value: config.cleanupInterval.toString() },
      { key: 'smartScheduleEnabled', value: 'true' },
      { key: 'lastSmartScheduleUpdate', value: new Date().toISOString() }
    ]

    // 批量更新設定
    for (const update of configUpdates) {
      await prisma.setting.upsert({
        where: { key: update.key },
        create: {
          key: update.key,
          value: update.value
        },
        update: {
          value: update.value
        }
      })
    }

    console.log('✅ 智能調度配置已成功應用到自動服務')
    
    return {
      success: true,
      message: '智能調度配置已成功應用到自動服務',
      config: config
    }

  } catch (error) {
    console.error('應用智能調度配置失敗:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '應用配置失敗'
    }
  }
}
