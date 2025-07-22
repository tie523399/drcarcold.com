import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ui/use-toast'
import '@/lib/init-app' // 自動初始化應用
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://drcarcold.com'),
  title: {
    default: '汽車冷媒專家 DrCarCold | R134a R1234yf 冷媒充填維修服務',
    template: '%s | DrCarCold 汽車冷媒專家'
  },
  description: '台灣最專業汽車冷媒供應商！提供R134a、R1234yf冷媒充填、汽車冷氣維修、冷氣不冷檢測。30年經驗，全台服務，冷媒價格優惠，品質保證。立即預約汽車冷氣保養服務！',
  keywords: [
    '汽車冷媒', '冷氣冷媒', 'R134a', 'R1234yf', '汽車冷氣維修',
    '冷媒充填', '汽車冷氣不冷', '冷媒價格', '環保冷媒', '汽車保養',
    '冷氣保養', '台北汽車冷媒', '新北冷氣維修', '桃園汽車保養',
    '台中冷媒充填', '高雄汽車冷氣', '冷媒種類', '冷媒更換',
    '汽車冷氣系統', '冷氣壓縮機', '冷氣散熱器', '冷氣濾網'
  ],
  authors: [{ name: 'DrCarCold Team' }],
  creator: 'DrCarCold',
  publisher: 'DrCarCold',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: 'https://drcarcold.com',
    title: '汽車冷媒專家 DrCarCold - R134a R1234yf 冷媒充填維修服務',
    description: '台灣最專業汽車冷媒供應商！提供R134a、R1234yf冷媒充填、汽車冷氣維修、冷氣不冷檢測。30年經驗，全台服務，品質保證！',
    siteName: 'DrCarCold 汽車冷媒專家',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'DrCarCold 汽車冷媒專家 - 專業 R134a R1234yf 冷媒服務',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '汽車冷媒專家 DrCarCold - R134a R1234yf 冷媒充填',
    description: '台灣最專業汽車冷媒供應商！30年經驗，全台服務，品質保證！',
    creator: '@DrCarCold',
    images: ['/images/twitter-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://drcarcold.com',
    languages: {
      'zh-TW': 'https://drcarcold.com/zh',
      'zh-HK': 'https://drcarcold.com/zh',
      'en': 'https://drcarcold.com/en',
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    yahoo: 'your-yahoo-verification',
    other: {
      'msvalidate.01': 'your-bing-verification',
      'facebook-domain-verification': 'your-facebook-verification',
    },
  },
  category: 'automotive',
  classification: 'Business',
  referrer: 'origin-when-cross-origin',
}

// 在服務器啟動時初始化自動服務
// 自動初始化已在 init-app 模組中處理

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <head>
        {/* JSON-LD 結構化資料 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://drcarcold.com/#organization",
                  "name": "DrCarCold 汽車冷媒專家",
                  "alternateName": "德瑞卡冷氣系統",
                  "url": "https://drcarcold.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://drcarcold.com/images/logo.png",
                    "width": 300,
                    "height": 100
                  },
                  "description": "台灣最專業汽車冷媒供應商，提供R134a、R1234yf冷媒充填、汽車冷氣維修服務",
                  "foundingDate": "1990",
                  "areaServed": ["台灣", "台北", "新北", "桃園", "台中", "高雄"],
                  "serviceArea": {
                    "@type": "GeoCircle",
                    "geoMidpoint": {
                      "@type": "GeoCoordinates",
                      "latitude": 25.0330,
                      "longitude": 121.5654
                    },
                    "geoRadius": 500000
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+886-2-xxxx-xxxx",
                    "contactType": "customer service",
                    "areaServed": "TW",
                    "availableLanguage": ["zh-TW", "en"]
                  },
                  "sameAs": [
                    "https://www.facebook.com/drcarcold",
                    "https://www.instagram.com/drcarcold",
                    "https://www.youtube.com/drcarcold"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://drcarcold.com/#website",
                  "url": "https://drcarcold.com",
                  "name": "DrCarCold 汽車冷媒專家",
                  "description": "台灣最專業汽車冷媒供應商",
                  "publisher": {
                    "@id": "https://drcarcold.com/#organization"
                  },
                  "potentialAction": [
                    {
                      "@type": "SearchAction",
                      "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": "https://drcarcold.com/refrigerant-lookup?q={search_term_string}"
                      },
                      "query-input": "required name=search_term_string"
                    }
                  ]
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://drcarcold.com/#localbusiness",
                  "name": "DrCarCold 汽車冷媒專家",
                  "image": "https://drcarcold.com/images/logo.png",
                  "priceRange": "$$",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "待補充地址",
                    "addressLocality": "台北市",
                    "addressRegion": "台北市",
                    "postalCode": "10001",
                    "addressCountry": "TW"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 25.0330,
                    "longitude": 121.5654
                  },
                  "url": "https://drcarcold.com",
                  "telephone": "+886-2-xxxx-xxxx",
                  "openingHoursSpecification": [
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": [
                        "Monday",
                        "Tuesday", 
                        "Wednesday",
                        "Thursday",
                        "Friday"
                      ],
                      "opens": "08:00",
                      "closes": "18:00"
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": "Saturday",
                      "opens": "09:00", 
                      "closes": "17:00"
                    }
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "150"
                  }
                }
              ]
            })
          }}
        />
        
        {/* 額外的 SEO 標籤 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        
        {/* Preload 重要資源 */}
        <link rel="preload" href="/images/logo.png" as="image" type="image/png" />
        
        {/* 地理位置標記 */}
        <meta name="geo.region" content="TW" />
        <meta name="geo.position" content="25.0330;121.5654" />
        <meta name="ICBM" content="25.0330, 121.5654" />
        
        {/* 業務分類 */}
        <meta name="business-category" content="Automotive Service" />
        <meta name="business-type" content="Car Air Conditioning Service" />
        
        {/* Apple 相關 */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DrCarCold" />
        
        {/* Microsoft 相關 */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* PWA 相關 */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="DrCarCold" />
        
        {/* 安全性標頭 */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
} 