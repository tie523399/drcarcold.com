import { Metadata } from 'next'
import ProductList from './product-list'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'products' })
  
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '汽車冷媒產品批發 | R134a R1234yf 冷凍油 PAG46 PAG100 充填機 - 台灣最齊全'
      : 'Automotive Refrigerant Products Wholesale | R134a R1234yf PAG Oil Filling Machine - Complete Supply',
    
    description: isZh 
      ? '🏆台灣最專業汽車冷媒批發商！提供R134a環保冷媒、R1234yf新式冷媒、PAG46/PAG100冷凍油、冷媒充填機、回收機、快速接頭、冷媒錶組。30年經驗，全台配送，價格優惠，品質保證。專業汽車冷氣維修工具一次購足！'
      : '🏆Taiwan\'s most professional automotive refrigerant wholesaler! R134a eco-friendly refrigerant, R1234yf new refrigerant, PAG oil, filling machines, recovery machines, quick connectors, gauge sets. 30 years experience, nationwide delivery, competitive prices, quality guaranteed!',
    
    keywords: isZh ? [
      // 主要產品關鍵字
      '汽車冷媒批發', 'R134a冷媒價格', 'R1234yf冷媒', '汽車冷凍油批發',
      'PAG46冷凍油', 'PAG100冷凍油', 'PAG150冷凍油', '冷媒充填機',
      '冷媒回收機', '汽車冷媒工具', '快速接頭', '冷媒管', '冷媒錶組',
      
      // 品牌關鍵字
      '巨化冷媒', 'Chemours冷媒', 'Honeywell冷媒', 'Dupont冷媒',
      'Denso冷凍油', 'Suniso冷凍油', 'ND-8冷凍油', 'ND-12冷凍油',
      
      // 長尾關鍵字
      '汽車冷媒多少錢', '冷媒價格比較', '汽車冷氣冷媒種類',
      '冷媒批發價格', '汽車冷媒供應商', '冷媒充填設備',
      '汽車冷氣維修工具', '冷媒檢測工具', '冷媒壓力錶',
      
      // 地區關鍵字
      '台北汽車冷媒', '新北冷媒批發', '桃園汽車冷媒',
      '台中冷媒供應商', '台南汽車冷媒', '高雄冷媒批發',
      
      // 問題型關鍵字
      '汽車冷媒哪裡買', '冷媒充填多少錢', 'R134a哪裡有賣',
      '汽車冷凍油推薦', '冷媒工具推薦', '汽車冷氣保養用品',
      
      // 技術關鍵字
      '環保冷媒', 'HFC冷媒', 'HFO冷媒', '低GWP冷媒',
      '汽車空調冷媒', '車用冷媒規格', '冷媒相容性',
      '冷媒安全資料表', 'MSDS冷媒', '冷媒儲存',
      
      // 服務關鍵字
      '冷媒技術支援', '汽車冷媒教育訓練', '冷媒證照',
      '汽車冷氣檢修', '冷媒回收服務', '環保冷媒處理'
    ] : [
      'automotive refrigerant wholesale', 'R134a refrigerant price', 'R1234yf refrigerant',
      'PAG oil wholesale', 'PAG46 oil', 'PAG100 oil', 'refrigerant filling machine',
      'refrigerant recovery machine', 'automotive AC tools', 'quick connectors',
      'refrigerant hoses', 'manifold gauge sets', 'eco-friendly refrigerant',
      'HFC refrigerant', 'HFO refrigerant', 'low GWP refrigerant'
    ],
    
    openGraph: {
      title: isZh 
        ? '汽車冷媒產品批發 - R134a R1234yf 冷凍油 充填機 | DrCarCold'
        : 'Automotive Refrigerant Products Wholesale | DrCarCold',
      description: isZh 
        ? '台灣最專業汽車冷媒批發商！R134a、R1234yf冷媒，PAG冷凍油，充填機，30年經驗，全台配送'
        : 'Taiwan\'s most professional automotive refrigerant wholesaler! R134a, R1234yf refrigerant, PAG oil, filling machines',
      url: 'https://drcarcold.com/products',
      images: [
        {
          url: '/images/og-products.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 汽車冷媒產品 - R134a R1234yf PAG油' : 'DrCarCold Automotive Refrigerant Products',
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? '汽車冷媒產品批發 - R134a R1234yf 冷凍油'
        : 'Automotive Refrigerant Products Wholesale',
      description: isZh 
        ? '台灣最專業汽車冷媒批發商！30年經驗，全台配送，品質保證'
        : 'Taiwan\'s most professional automotive refrigerant wholesaler!',
      images: ['/images/twitter-products.jpg'],
    },
    
    alternates: {
      canonical: `https://drcarcold.com/${locale}/products`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/products',
        'en': 'https://drcarcold.com/en/products',
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
    
    category: 'automotive products',
    classification: 'Business Directory',
    
    other: {
      'product-type': 'automotive-refrigerant',
      'business-category': 'wholesale',
      'service-area': 'Taiwan',
      'price-range': '$$',
      'experience-years': '30',
    },
  }
}

export default function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'zh' ? 'DrCarCold 汽車冷媒產品' : 'DrCarCold Automotive Refrigerant Products',
    description: locale === 'zh' 
      ? '專業汽車冷媒產品，包含R134a、R1234yf冷媒，PAG冷凍油，充填設備等'
      : 'Professional automotive refrigerant products including R134a, R1234yf refrigerant, PAG oil, filling equipment',
    numberOfItems: 50,
    itemListElement: [
      {
        '@type': 'Product',
        position: 1,
        name: 'R134a 汽車冷媒',
        description: '環保型汽車冷媒，適用於1994年後車輛',
        category: '汽車冷媒',
        brand: {
          '@type': 'Brand',
          name: 'DrCarCold'
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '150',
          priceCurrency: 'TWD',
          seller: {
            '@type': 'Organization',
            name: 'DrCarCold'
          }
        }
      },
      {
        '@type': 'Product',
        position: 2,
        name: 'R1234yf 新式冷媒',
        description: '最新環保冷媒，適用於2013年後新車',
        category: '汽車冷媒',
        brand: {
          '@type': 'Brand',
          name: 'DrCarCold'
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '300',
          priceCurrency: 'TWD',
          seller: {
            '@type': 'Organization',
            name: 'DrCarCold'
          }
        }
      },
      {
        '@type': 'Product',
        position: 3,
        name: 'PAG46 冷凍油',
        description: '高品質汽車冷氣壓縮機專用油',
        category: '冷凍油',
        brand: {
          '@type': 'Brand',
          name: 'DrCarCold'
        },
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          price: '250',
          priceCurrency: 'TWD',
          seller: {
            '@type': 'Organization',
            name: 'DrCarCold'
          }
        }
      }
    ],
    mainEntity: {
      '@type': 'WebPage',
      '@id': 'https://drcarcold.com/products',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: '首頁',
            item: 'https://drcarcold.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: '產品',
            item: 'https://drcarcold.com/products'
          }
        ]
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      {/* JSON-LD 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* SEO 優化的頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {locale === 'zh' ? (
            <>
              <span className="text-blue-600">汽車冷媒產品批發</span> | 
              R134a R1234yf PAG冷凍油 充填機
            </>
          ) : (
            'Automotive Refrigerant Products Wholesale'
          )}
        </h1>
        
        {/* SEO 優化的描述段落 */}
        <div className="text-lg text-gray-600 mb-6 leading-relaxed">
          {locale === 'zh' ? (
            <p>
              🏆 <strong>台灣最專業汽車冷媒批發商</strong>！提供完整的
              <strong className="text-blue-600">R134a環保冷媒</strong>、
              <strong className="text-blue-600">R1234yf新式冷媒</strong>、
              <strong className="text-blue-600">PAG46/PAG100冷凍油</strong>、
              冷媒充填機、回收機等專業設備。30年豐富經驗，全台配送服務，
              價格優惠，品質保證。是您汽車冷氣維修的最佳夥伴！
            </p>
          ) : (
            <p>
              🏆 <strong>Taiwan's most professional automotive refrigerant wholesaler</strong>! 
              Complete supply of R134a eco-friendly refrigerant, R1234yf new refrigerant, 
              PAG oils, filling machines, and recovery equipment. 30 years of experience, 
              nationwide delivery, competitive prices, quality guaranteed!
            </p>
          )}
        </div>
        
        {/* 關鍵特色 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">30+</div>
            <div className="text-sm text-gray-600">年專業經驗</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">500+</div>
            <div className="text-sm text-gray-600">種產品選擇</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">全台</div>
            <div className="text-sm text-gray-600">配送服務</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">品質保證</div>
          </div>
        </div>
      </div>
      
      <ProductList />
    </div>
  )
} 