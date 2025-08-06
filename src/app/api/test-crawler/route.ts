import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// 簡單的文章爬取函數
async function simpleScrapeArticle(url: string): Promise<any> {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)
  
  // 基本的文章內容提取
  const title = $('h1').first().text() || $('title').text() || '無標題'
  const content = $('article, .content, .post-content, .entry-content, main p').text().slice(0, 2000) || '無內容'
  const author = $('meta[name="author"]').attr('content') || $('.author').text() || '未知作者'
  
  return {
    title: title.trim(),
    content: content.trim(),
    author: author.trim(),
    url,
    tags: []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: '請提供要爬取的 URL' },
        { status: 400 }
      )
    }

    console.log('開始爬取:', url)
    
    // 測試簡化版爬蟲
    const result = await simpleScrapeArticle(url)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('爬蟲錯誤:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知錯誤',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}