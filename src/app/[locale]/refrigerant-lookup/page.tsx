import { Metadata } from 'next'
import RefrigerantLookupClient from './refrigerant-lookup-client'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '汽車冷媒查詢工具 | 免費查詢R134a R1234yf充填量 車型冷媒規格 - DrCarCold'
      : 'Automotive Refrigerant Lookup Tool | Free R134a R1234yf Capacity Search - DrCarCold',
    
    description: isZh 
      ? '🔍 台灣最完整汽車冷媒查詢系統！免費查詢2000+車型冷媒充填量：Toyota豐田、Honda本田、Nissan日產、Mazda馬自達、BMW、Benz賓士等。包含R134a、R1234yf冷媒規格、PAG油量、壓縮機油規格。專業汽車冷氣維修必備工具！'
      : '🔍 Taiwan\'s most complete automotive refrigerant lookup system! Free search for 2000+ vehicle models: Toyota, Honda, Nissan, Mazda, BMW, Mercedes-Benz. Including R134a, R1234yf refrigerant specifications, PAG oil capacity, compressor oil specs.',
    
    keywords: isZh ? [
      // 主要功能關鍵字
      '汽車冷媒查詢', '冷媒充填量查詢', '汽車冷媒規格', '車型冷媒查詢',
      '冷媒容量查詢', '汽車冷氣冷媒量', '冷媒填充量', '冷媒資料庫',
      
      // 冷媒類型關鍵字
      'R134a充填量', 'R1234yf充填量', '環保冷媒查詢', 'HFC冷媒規格',
      'HFO冷媒規格', '冷媒類型查詢', '冷媒規格表', '冷媒相容性',
      
      // 車品牌關鍵字 - 日系
      'Toyota冷媒查詢', 'Honda冷媒規格', 'Nissan冷媒容量', 'Mazda冷媒量',
      'Mitsubishi冷媒', 'Subaru冷媒', 'Suzuki冷媒', 'Isuzu冷媒',
      'Daihatsu冷媒', 'Lexus冷媒規格', 'Infiniti冷媒', 'Acura冷媒',
      
      // 車品牌關鍵字 - 歐系
      'BMW冷媒查詢', 'Benz冷媒規格', 'Audi冷媒容量', 'VW冷媒量',
      'Porsche冷媒', 'Volvo冷媒', 'SAAB冷媒', 'Peugeot冷媒',
      'Citroen冷媒', 'Renault冷媒', 'Fiat冷媒', 'Alfa Romeo冷媒',
      
      // 車品牌關鍵字 - 美系
      'Ford冷媒查詢', 'GM冷媒規格', 'Chevrolet冷媒', 'Cadillac冷媒',
      'Buick冷媒', 'Chrysler冷媒', 'Jeep冷媒', 'Dodge冷媒',
      
      // 車品牌關鍵字 - 韓系
      'Hyundai冷媒查詢', 'Kia冷媒規格', 'Genesis冷媒', 'Daewoo冷媒',
      
      // 車品牌關鍵字 - 國產
      '裕隆冷媒', '中華冷媒', '福特六和冷媒', '和泰汽車冷媒',
      
      // 車品牌關鍵字 - 其他亞洲
      'Proton冷媒', 'Perodua冷媒', 'Tata冷媒', 'Mahindra冷媒',
      
      // 商用車關鍵字
      'Hino冷媒查詢', '三菱扶桑冷媒', 'Isuzu貨車冷媒', '大型車冷媒',
      '卡車冷媒規格', '巴士冷媒容量', '商用車冷媒', '貨車冷氣冷媒',
      
      // 冷凍油相關關鍵字
      'PAG油查詢', '冷凍油規格', 'PAG46油量', 'PAG100油量', 'PAG150油量',
      '壓縮機油規格', '冷凍油容量', '冷凍油類型', 'ND油規格', 'UV油規格',
      
      // 年份相關關鍵字
      '2023年車款冷媒', '2022年新車冷媒', '新車冷媒規格', '舊車冷媒',
      '1994年後冷媒', '2013年後冷媒', '新款車冷媒', '經典車冷媒',
      
      // 功能性關鍵字
      '冷媒查詢系統', '免費冷媒查詢', '線上冷媒查詢', '冷媒規格搜尋',
      '汽車維修工具', '冷氣維修查詢', '專業冷媒工具', '維修廠必備',
      
      // 問題解決關鍵字
      '汽車冷媒多少', '我的車用什麼冷媒', '冷媒要加多少', '冷媒規格怎麼查',
      '車款冷媒查詢', '冷媒容量確認', '正確冷媒量', '冷媒充填標準'
    ] : [
      'automotive refrigerant lookup', 'refrigerant capacity search', 'car refrigerant specs',
      'vehicle refrigerant query', 'R134a capacity lookup', 'R1234yf capacity search',
      'refrigerant database', 'car AC refrigerant amount', 'refrigerant specification table',
      'Toyota refrigerant', 'Honda refrigerant', 'Nissan refrigerant', 'BMW refrigerant',
      'Mercedes refrigerant', 'PAG oil lookup', 'compressor oil specs'
    ],
    
    openGraph: {
      title: isZh 
        ? '汽車冷媒查詢工具 - 免費查詢2000+車型冷媒規格 | DrCarCold'
        : 'Automotive Refrigerant Lookup Tool - Free Search 2000+ Vehicle Specs | DrCarCold',
      description: isZh 
        ? '台灣最完整汽車冷媒查詢系統！支援所有車品牌，免費查詢冷媒充填量和規格'
        : 'Taiwan\'s most complete automotive refrigerant lookup system! All car brands supported',
      url: 'https://drcarcold.com/refrigerant-lookup',
      images: [
        {
          url: '/images/og-lookup.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒查詢工具' : 'DrCarCold Automotive Refrigerant Lookup Tool',
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? '汽車冷媒查詢工具 - 免費查詢2000+車型'
        : 'Automotive Refrigerant Lookup Tool',
      description: isZh 
        ? '台灣最完整汽車冷媒查詢系統！免費使用'
        : 'Taiwan\'s most complete automotive refrigerant lookup system!',
      images: ['/images/twitter-lookup.jpg'],
    },
    
    alternates: {
      canonical: `https://drcarcold.com/${locale}/refrigerant-lookup`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/refrigerant-lookup',
        'en': 'https://drcarcold.com/en/refrigerant-lookup',
      },
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    category: 'automotive tools',
    classification: 'Technical Tool',
    
    other: {
      'tool-type': 'refrigerant-lookup',
      'database-size': '2000+',
      'coverage': 'global-vehicles',
      'update-frequency': 'monthly',
    },
  }
}

export default function RefrigerantLookupPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === 'zh'
  
  // 生成工具頁面的結構化資料
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isZh ? 'DrCarCold 汽車冷媒查詢工具' : 'DrCarCold Automotive Refrigerant Lookup Tool',
    description: isZh 
      ? '免費線上汽車冷媒查詢系統，支援2000+車型，查詢R134a、R1234yf冷媒充填量與PAG油規格'
      : 'Free online automotive refrigerant lookup system, supporting 2000+ vehicle models for R134a, R1234yf refrigerant capacity and PAG oil specifications',
    url: 'https://drcarcold.com/refrigerant-lookup',
    applicationCategory: 'AutomotiveApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TWD',
      description: isZh ? '完全免費使用' : 'Completely free to use'
    },
    provider: {
      '@type': 'Organization',
      '@id': 'https://drcarcold.com/#organization',
      name: 'DrCarCold'
    },
    featureList: [
      isZh ? '2000+車型資料庫' : '2000+ vehicle database',
      isZh ? 'R134a冷媒規格查詢' : 'R134a refrigerant specifications',
      isZh ? 'R1234yf冷媒規格查詢' : 'R1234yf refrigerant specifications', 
      isZh ? 'PAG冷凍油規格查詢' : 'PAG oil specifications',
      isZh ? '即時搜尋結果' : 'Real-time search results',
      isZh ? '免費使用' : 'Free to use'
    ],
    audience: {
      '@type': 'Audience',
      audienceType: isZh ? '汽車維修技師' : 'Automotive technicians'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://drcarcold.com/refrigerant-lookup?search={search_term}'
      },
      'query-input': 'required name=search_term'
    },
    mainEntity: {
      '@type': 'Dataset',
      name: isZh ? '汽車冷媒規格資料庫' : 'Automotive Refrigerant Specifications Database',
      description: isZh 
        ? '包含全球主要汽車品牌的冷媒充填量、冷媒類型、PAG油規格等完整資訊'
        : 'Complete information including refrigerant capacity, refrigerant type, PAG oil specifications for major global automotive brands',
      creator: {
        '@type': 'Organization',
        '@id': 'https://drcarcold.com/#organization'
      },
      distribution: {
        '@type': 'DataDownload',
        contentUrl: 'https://drcarcold.com/refrigerant-lookup',
        encodingFormat: 'application/json'
      },
      keywords: [
        'automotive refrigerant', 'R134a', 'R1234yf', 'PAG oil', 
        'vehicle specifications', 'refrigerant capacity'
      ]
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: isZh ? '首頁' : 'Home',
          item: 'https://drcarcold.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: isZh ? '冷媒查詢工具' : 'Refrigerant Lookup Tool',
          item: 'https://drcarcold.com/refrigerant-lookup'
        }
      ]
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* JSON-LD 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* SEO 優化的頁面介紹 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          {isZh ? (
            <>
              🔍 <span className="text-blue-600">汽車冷媒查詢工具</span> | 
              免費查詢 2000+ 車型規格
            </>
          ) : (
            <>
              🔍 <span className="text-blue-600">Automotive Refrigerant Lookup Tool</span> | 
              Free Search 2000+ Vehicle Specs
            </>
          )}
        </h1>
        
        <div className="text-lg text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed">
          {isZh ? (
            <p>
              ⚡ <strong>台灣最完整的汽車冷媒查詢系統</strong>！支援
              <strong className="text-blue-600">Toyota豐田、Honda本田、Nissan日產、BMW、Benz賓士</strong>
              等全球主要品牌，快速查詢
              <strong className="text-green-600">R134a、R1234yf冷媒充填量</strong>、
              <strong className="text-orange-600">PAG冷凍油規格</strong>。
              專業汽車維修技師必備工具，完全免費使用！
            </p>
          ) : (
            <p>
              ⚡ <strong>Taiwan's most complete automotive refrigerant lookup system</strong>! 
              Supporting major global brands like Toyota, Honda, Nissan, BMW, Mercedes-Benz. 
              Quickly search R134a, R1234yf refrigerant capacity and PAG oil specifications. 
              Essential tool for professional automotive technicians, completely free!
            </p>
          )}
        </div>
        
        {/* 功能特色 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">2000+</div>
            <div className="text-sm text-gray-600">車型資料庫</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">汽車品牌</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">免費</div>
            <div className="text-sm text-gray-600">完全免費</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">即時</div>
            <div className="text-sm text-gray-600">搜尋結果</div>
          </div>
        </div>
        
        {/* 支援品牌展示 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            {isZh ? '支援品牌 (部分展示)' : 'Supported Brands (Partial Display)'}
          </h2>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {[
              'Toyota', 'Honda', 'Nissan', 'Mazda', 'Mitsubishi', 'Subaru',
              'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Porsche',
              'Ford', 'Chevrolet', 'Hyundai', 'Kia', 'Volvo'
            ].map((brand, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <RefrigerantLookupClient />
      
      {/* SEO 優化的底部說明 */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isZh ? '如何使用汽車冷媒查詢工具？' : 'How to Use the Automotive Refrigerant Lookup Tool?'}
        </h2>
        <div className="grid md:grid-cols-3 gap-4 text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
            <h3 className="font-medium mb-1">
              {isZh ? '選擇車輛品牌' : 'Select Vehicle Brand'}
            </h3>
            <p className="text-sm">
              {isZh ? '從下拉選單選擇您的車輛品牌' : 'Choose your vehicle brand from dropdown'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
            <h3 className="font-medium mb-1">
              {isZh ? '選擇車型年份' : 'Select Model Year'}
            </h3>
            <p className="text-sm">
              {isZh ? '選擇對應的車型和年份' : 'Select corresponding model and year'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
            <h3 className="font-medium mb-1">
              {isZh ? '獲取規格資訊' : 'Get Specifications'}
            </h3>
            <p className="text-sm">
              {isZh ? '立即顯示冷媒和冷凍油規格' : 'Instantly display refrigerant and oil specs'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 