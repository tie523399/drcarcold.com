import axios from 'axios'
import * as cheerio from 'cheerio'
import { getSiteSelectors, trySelectors } from './crawler-selectors'

// 延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 重試配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 2000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

export async function simpleScrapeArticle(url: string) {
  let lastError: Error | null = null
  
  // 重試機制
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
  try {
      console.log(`爬取嘗試 ${attempt}/${RETRY_CONFIG.maxRetries}: ${url}`)
      
      // 計算延遲時間
      if (attempt > 1) {
        const delayTime = Math.min(
          RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 2),
          RETRY_CONFIG.maxDelay
        )
        console.log(`等待 ${delayTime}ms 後重試...`)
        await delay(delayTime)
      }
    
    // 使用 axios 獲取頁面
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
      },
      timeout: 30000,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 300 // 只接受 2xx 狀態碼
        }
    })

    const $ = cheerio.load(response.data)
    
    // 移除不需要的元素
    $('script, style, nav, header, footer, .ad, .advertisement, .sidebar, .related-posts').remove()
    
    // 獲取網站特定的選擇器
    const siteSelectors = getSiteSelectors(url)
    
    // 提取標題
    const title = trySelectors($, siteSelectors.title) || 
                  $('title').text().trim() || 
                  '未知標題'
    
    console.log(`標題: ${title}`)
    
    // 提取內容
    let content = ''
    if (siteSelectors.content) {
      // 嘗試使用網站特定的內容選擇器
      for (const selector of siteSelectors.content) {
      const element = $(selector).first()
      if (element.length > 0) {
          // 獲取段落文本，保持結構
          const paragraphs: string[] = []
          element.find('p').each((_, elem) => {
            const text = $(elem).text().trim()
            if (text && text.length > 20) { // 過濾太短的段落
              paragraphs.push(text)
            }
          })
          
          if (paragraphs.length > 0) {
            content = paragraphs.join('\n\n')
            console.log(`使用選擇器 "${selector}" 找到 ${paragraphs.length} 個段落`)
            break
          } else {
            // 如果沒有段落標籤，獲取整個內容
        content = element.text().trim()
            if (content) {
              console.log(`使用選擇器 "${selector}" 找到內容`)
        break
            }
          }
        }
      }
    }
    
    // 如果沒找到內容，嘗試獲取最大的文本塊
    if (!content) {
      console.log('使用備用方法尋找內容...')
      let maxLength = 0
      let maxText = ''
      
      $('div, section, article, main').each((_, elem) => {
        const text = $(elem).text().trim()
        if (text.length > maxLength && text.length > 200) {
          maxLength = text.length
          maxText = text
        }
      })
      
      content = maxText
    }
    
    // 清理內容
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\r/g, '')
      .trim()
    
    // 確保內容不要太長
    if (content.length > 5000) {
      content = content.substring(0, 5000) + '...'
    }
    
    // 提取其他信息
    const author = trySelectors($, siteSelectors.author) || 
                   $('meta[name="author"]').attr('content') || 
                   ''
    
    const publishDate = trySelectors($, siteSelectors.date) || 
                        $('meta[property="article:published_time"]').attr('content') || 
                        ''
    
    const excerpt = content.substring(0, 200).replace(/\n/g, ' ') + '...'
    
    // 提取圖片
    let coverImage = ''
    if (siteSelectors.image) {
      const img = $(siteSelectors.image.join(', ')).first()
      if (img.length > 0) {
        coverImage = img.attr('src') || ''
        // 轉換為絕對 URL
        if (coverImage && !coverImage.startsWith('http')) {
          coverImage = new URL(coverImage, url).toString()
        }
      }
    }
    
    // 如果沒找到圖片，嘗試 og:image
    if (!coverImage) {
      coverImage = $('meta[property="og:image"]').attr('content') || ''
    }
    
    // 提取標籤
    const tags: string[] = []
    
    // 從 meta keywords 提取
    $('meta[name="keywords"]').each((_, elem) => {
      const keywords = $(elem).attr('content')
      if (keywords) {
        tags.push(...keywords.split(',').map(k => k.trim()).filter(k => k))
      }
    })
    
    // 從文章標籤提取
    $('.tags a, .tag, [rel="tag"]').each((_, elem) => {
      const tag = $(elem).text().trim()
      if (tag && !tags.includes(tag)) {
        tags.push(tag)
      }
    })
    
    return {
      title,
      content,
      excerpt,
      author,
      publishDate,
      tags,
      url,
      source: new URL(url).hostname,
      coverImage,
      crawledAt: new Date().toISOString()
    }
    
  } catch (error) {
      lastError = error as Error
      console.error(`爬取嘗試 ${attempt} 失敗:`, error)
      
      // 檢查錯誤類型
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const errorMessage = `HTTP ${status}: ${error.response?.statusText || '未知錯誤'}`
        
        // 處理特定狀態碼
        if (status === 503) {
          console.log('服務暫時不可用 (503)，將重試...')
        } else if (status === 429) {
          console.log('請求過於頻繁 (429)，將延長等待時間...')
          // 對於 429 錯誤，使用更長的延遲
          if (attempt < RETRY_CONFIG.maxRetries) {
            await delay(RETRY_CONFIG.maxDelay)
          }
        } else if (status === 404) {
          throw new Error(`文章不存在 (404): ${url}`)
        } else if (status && status >= 500) {
          console.log(`服務器錯誤 (${status})，將重試...`)
        }
        
        lastError = new Error(errorMessage)
      }
      
      // 如果不是最後一次嘗試，繼續循環
      if (attempt < RETRY_CONFIG.maxRetries) {
        continue
      }
    }
  }
  
  // 所有嘗試都失敗
  throw new Error(`爬取失敗（已重試 ${RETRY_CONFIG.maxRetries} 次）: ${lastError?.message || '未知錯誤'}`)
}