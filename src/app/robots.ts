import { MetadataRoute } from 'next'

// 🎯 Robots.txt 強力優化 - 汽車冷媒SEO
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drcarcold.com'
  
  return {
    rules: [
      // 🎯 Google 爬蟲特別優化
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/zh/',
          '/en/',
          '/products/',
          '/zh/products/',
          '/en/products/',
          '/refrigerant-lookup/',
          '/zh/refrigerant-lookup/',
          '/en/refrigerant-lookup/',
          '/news/',
          '/zh/news/',
          '/en/news/',
          '/about/',
          '/zh/about/',
          '/en/about/',
          '/contact/',
          '/zh/contact/',
          '/en/contact/',
          '/images/',
          '/r134a-refrigerant/',
          '/r1234yf-refrigerant/',
          '/toyota-refrigerant/',
          '/honda-refrigerant/',
          '/bmw-refrigerant/',
          '/mercedes-refrigerant/',
          '/refrigerant-guide/',
          '/ac-repair-guide/',
          '/maintenance-tips/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/temp/',
          '/uploads/temp/',
          '/test/',
          '/draft/',
          '/preview/*',
          '/*?preview=*',
          '/*?draft=*'
        ],
        crawlDelay: 0,
      },
      // 🎯 Google Mobile 爬蟲優化
      {
        userAgent: 'Googlebot-Mobile',
        allow: [
          '/',
          '/zh/',
          '/en/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/',
          '/images/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/temp/'
        ],
        crawlDelay: 0,
      },
      // 🎯 Google 圖片爬蟲優化
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/images/',
          '/uploads/',
          '/public/',
          '/*.jpg',
          '/*.jpeg',
          '/*.png',
          '/*.gif',
          '/*.webp',
          '/*.svg'
        ],
        disallow: [
          '/admin/',
          '/private/',
          '/temp/',
          '/uploads/temp/'
        ],
        crawlDelay: 0,
      },
      // 🎯 Bing 爬蟲優化
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/zh/',
          '/en/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/',
          '/images/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/temp/',
          '/uploads/temp/'
        ],
        crawlDelay: 1,
      },
      // 🎯 Yahoo 爬蟲優化
      {
        userAgent: 'Slurp',
        allow: [
          '/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/'
        ],
        crawlDelay: 2,
      },
      // 🎯 百度爬蟲優化 (針對台灣市場)
      {
        userAgent: 'Baiduspider',
        allow: [
          '/',
          '/zh/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/en/' // 百度主要針對中文內容
        ],
        crawlDelay: 2,
      },
      // 🎯 社交媒體爬蟲優化
      {
        userAgent: [
          'facebookexternalhit',
          'Twitterbot',
          'LinkedInBot',
          'WhatsApp',
          'TelegramBot',
          'SkypeUriPreview',
          'Slackbot',
          'DiscordBot'
        ],
        allow: [
          '/',
          '/products/',
          '/news/',
          '/about/',
          '/contact/',
          '/images/',
          '/refrigerant-lookup/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/temp/'
        ],
        crawlDelay: 1,
      },
      // 🎯 其他搜索引擎
      {
        userAgent: [
          'DuckDuckBot',
          'YandexBot',
          'NaverBot',
          'SogouSpider'
        ],
        allow: [
          '/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/'
        ],
        crawlDelay: 3,
      },
      // 🎯 AI 爬蟲限制
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'PerplexityBot',
          'YouBot',
          'AI2Bot'
        ],
        disallow: '/',
      },
      // 🎯 SEO 工具爬蟲
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'SiteAuditBot'
        ],
        allow: [
          '/',
          '/products/',
          '/news/',
          '/about/',
          '/contact/',
          '/refrigerant-lookup/'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/'
        ],
        crawlDelay: 5,
      },
      // 🎯 通用規則 (最後執行)
      {
        userAgent: '*',
        allow: [
          '/',
          '/zh/',
          '/en/',
          '/products/',
          '/refrigerant-lookup/',
          '/news/',
          '/about/',
          '/contact/',
          '/images/',
          '/sitemap.xml'
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/temp/',
          '/uploads/temp/',
          '/test/',
          '/draft/',
          '/preview/*',
          '*?*utm_*',
          '*?*ref=*',
          '*?*fbclid=*',
          '*?*gclid=*',
          '*?*preview=*',
          '*?*draft=*',
          '/search?*'
        ],
        crawlDelay: 2,
      }
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-news.xml`,
      `${baseUrl}/sitemap-products.xml`,
      `${baseUrl}/sitemap-images.xml`
    ],
    host: baseUrl,
  }
} 