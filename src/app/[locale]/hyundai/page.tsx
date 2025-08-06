import { Metadata } from 'next'
import Link from 'next/link'

// SEO 設定
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  const seoData = {
    zh: {
      title: 'Hyundai 現代汽車冷媒充填服務 | R134a R1234yf 冷媒產品批發 | DrCarCold 專業冷氣維修',
      description: '專業 Hyundai 現代汽車冷媒充填服務！提供 R134a、R1234yf 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。涵蓋 Elantra、Tucson、Santa Fe、i30、Venue 等全車系冷氣維修。30年經驗，韓系車專精，品質保證。',
      keywords: 'Hyundai冷媒充填,現代汽車冷氣維修,R134a冷媒,R1234yf冷媒,PAG冷凍油,冷媒充填機,汽車冷媒產品批發,Elantra冷媒,Tucson冷氣,Santa Fe冷媒,i30冷氣,Venue冷媒,現代冷氣不冷,Hyundai空調維修,韓系車冷媒',
      ogTitle: 'Hyundai 現代汽車冷媒充填 | 專業 R134a R1234yf 冷媒產品批發',
      ogDescription: '專業 Hyundai 現代汽車冷媒充填服務，提供 R134a、R1234yf 環保冷媒產品批發。全車系冷氣維修，30年經驗，品質保證。'
    },
    en: {
      title: 'Hyundai Refrigerant Filling Service | R134a R1234yf Wholesale | DrCarCold Professional AC Repair',
      description: 'Professional Hyundai refrigerant filling service! We provide R134a, R1234yf eco-friendly refrigerants, PAG oil, and charging equipment wholesale. Covers all Hyundai models including Elantra, Tucson, Santa Fe, i30, Venue. 30 years experience, Korean car specialist.',
      keywords: 'Hyundai refrigerant,Hyundai AC repair,R134a refrigerant,R1234yf refrigerant,PAG oil,refrigerant charging machine,automotive refrigerant wholesale,Elantra refrigerant,Tucson AC,Santa Fe refrigerant,i30 AC,Hyundai AC not cold,Korean car refrigerant',
      ogTitle: 'Hyundai Refrigerant Filling | Professional R134a R1234yf Wholesale',
      ogDescription: 'Professional Hyundai refrigerant filling service with R134a, R1234yf eco-friendly refrigerant wholesale. All models covered, 30 years experience, quality guaranteed.'
    }
  }

  const data = seoData[isZh ? 'zh' : 'en']
  
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    openGraph: {
      title: data.ogTitle,
      description: data.ogDescription,
      url: `https://drcarcold.com/${locale}/hyundai`,
      siteName: 'DrCarCold',
      images: [
        {
          url: '/images/hyundai-refrigerant-service.jpg',
          width: 1200,
          height: 630,
          alt: 'Hyundai 現代汽車冷媒充填服務',
        },
      ],
      locale: isZh ? 'zh_TW' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.ogTitle,
      description: data.ogDescription,
      images: ['/images/hyundai-refrigerant-service.jpg'],
    },
    alternates: {
      canonical: `https://drcarcold.com/${locale}/hyundai`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/hyundai',
        'en': 'https://drcarcold.com/en/hyundai',
      },
    },
  }
}

interface HyundaiPageProps {
  params: {
    locale: string
  }
}

export default function HyundaiPage({ params: { locale } }: HyundaiPageProps) {
  const isZh = locale === 'zh'

  // 模擬 Hyundai 車型資料
  const mockModels = [
    { modelName: 'Elantra', year: '2021-2024', refrigerantType: 'R1234yf', fillAmount: '460g', oilType: 'PAG 46' },
    { modelName: 'Tucson', year: '2020-2024', refrigerantType: 'R1234yf', fillAmount: '520g', oilType: 'PAG 46' },
    { modelName: 'Santa Fe', year: '2019-2024', refrigerantType: 'R1234yf', fillAmount: '580g', oilType: 'PAG 100' },
    { modelName: 'i30', year: '2018-2024', refrigerantType: 'R134a', fillAmount: '380g', oilType: 'PAG 46' },
    { modelName: 'Venue', year: '2020-2024', refrigerantType: 'R1234yf', fillAmount: '350g', oilType: 'PAG 46' },
    { modelName: 'Ioniq', year: '2017-2024', refrigerantType: 'R134a', fillAmount: '400g', oilType: 'PAG 46' }
  ]

  const content = {
    zh: {
      title: 'Hyundai 現代汽車冷媒充填服務',
      subtitle: 'R134a R1234yf 冷媒產品批發 | PAG冷凍油 | 韓系車專精',
      heroDescription: '專業 Hyundai 現代汽車冷媒充填服務，提供 R134a、R1234yf 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。30年韓系車服務經驗，熟悉現代汽車創新技術與冷氣系統設計。',
      featuresTitle: '🎯 Hyundai 冷媒服務特色',
      features: [
        {
          icon: '🇰🇷',
          title: '韓系車專精',
          description: '30年韓系車服務經驗，深度了解 Hyundai 冷氣系統特性'
        },
        {
          icon: '🚗',
          title: '全車系支援',
          description: 'Elantra、Tucson、Santa Fe、i30、Venue 等全車系規格'
        },
        {
          icon: '🔋',
          title: '智慧系統',
          description: '支援 Hyundai 智慧冷氣控制系統，精準診斷與調校'
        },
        {
          icon: '⚡',
          title: '高效節能',
          description: '使用環保冷媒，提升冷氣效能，符合現代節能理念'
        }
      ],
      modelsTitle: '🚗 Hyundai 熱門車型冷媒規格',
      modelsDescription: '以下是 Hyundai 熱門車型的冷媒充填規格參考：',
      viewAllModels: '查看所有 Hyundai 車型',
      productsTitle: '🛒 Hyundai 專用冷媒產品',
      innovationTitle: '🔬 Hyundai 冷氣系統創新技術',
      innovations: [
        {
          title: '智慧溫控系統',
          description: 'Hyundai 先進的智慧溫控技術，精準控制車室溫度'
        },
        {
          title: '多區域控制',
          description: '高階車型配備多區域獨立溫控，前後座個別調節'
        },
        {
          title: '空氣淨化',
          description: '結合負離子與多層過濾，提供潔淨空氣品質'
        },
        {
          title: '節能模式',
          description: '智慧節能模式，在保持舒適的同時降低油耗'
        }
      ],
      contactTitle: '💬 Hyundai 專業技術諮詢',
      contactDescription: '需要 Hyundai 冷媒技術支援？我們的韓系車專業團隊隨時為您服務！'
    },
    en: {
      title: 'Hyundai Refrigerant Filling Service',
      subtitle: 'R134a R1234yf Refrigerant Wholesale | PAG Oil | Korean Car Specialist',
      heroDescription: 'Professional Hyundai refrigerant filling service with R134a, R1234yf eco-friendly refrigerants, PAG oil, and charging equipment wholesale. 30 years Korean car service experience, familiar with Hyundai innovative technology and AC system design.',
      featuresTitle: '🎯 Hyundai Refrigerant Service Features',
      features: [
        {
          icon: '🇰🇷',
          title: 'Korean Car Specialist',
          description: '30 years Korean car service experience, deep understanding of Hyundai AC systems'
        },
        {
          icon: '🚗',
          title: 'All Models Supported',
          description: 'Complete specifications for Elantra, Tucson, Santa Fe, i30, Venue and more'
        },
        {
          icon: '🔋',
          title: 'Smart Systems',
          description: 'Support for Hyundai smart AC control systems with precise diagnosis and tuning'
        },
        {
          icon: '⚡',
          title: 'High Efficiency',
          description: 'Use eco-friendly refrigerants to improve AC efficiency, aligned with modern energy concepts'
        }
      ],
      modelsTitle: '🚗 Popular Hyundai Models Refrigerant Specs',
      modelsDescription: 'Here are the refrigerant filling specifications for popular Hyundai models:',
      viewAllModels: 'View All Hyundai Models',
      productsTitle: '🛒 Hyundai Specific Refrigerant Products',
      innovationTitle: '🔬 Hyundai AC System Innovation Technology',
      innovations: [
        {
          title: 'Smart Temperature Control',
          description: "Hyundai's advanced smart temperature control technology for precise cabin climate"
        },
        {
          title: 'Multi-Zone Control',
          description: 'High-end models feature multi-zone independent temperature control for front and rear'
        },
        {
          title: 'Air Purification',
          description: 'Combined negative ion and multi-layer filtration for clean air quality'
        },
        {
          title: 'Energy Saving Mode',
          description: 'Smart energy-saving mode that maintains comfort while reducing fuel consumption'
        }
      ],
      contactTitle: '💬 Hyundai Professional Technical Support',
      contactDescription: 'Need Hyundai refrigerant technical support? Our Korean car specialists are ready to serve you!'
    }
  }

  const t = content[isZh ? 'zh' : 'en']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-700 to-purple-700">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-blue-100">
              {t.subtitle}
            </p>
            <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              {t.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.featuresTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Section */}
      <section className="py-16 bg-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.innovationTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {t.innovations.map((innovation, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-purple-700">{innovation.title}</h3>
                <p className="text-gray-600">{innovation.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hyundai Models Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {t.modelsTitle}
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t.modelsDescription}
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockModels.map((model, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  Hyundai {model.modelName}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">年份:</span> {model.year}</p>
                  <p><span className="font-medium">冷媒類型:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      model.refrigerantType === 'R1234yf' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {model.refrigerantType}
                    </span>
                  </p>
                  <p><span className="font-medium">充填量:</span> {model.fillAmount}</p>
                  <p><span className="font-medium">冷凍油:</span> {model.oilType}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link 
              href={`/${locale}/refrigerant-lookup?brand=Hyundai`}
              className="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              {t.viewAllModels}
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.productsTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'R134a 冷媒 13.6kg',
                description: 'Hyundai 經典車型專用冷媒',
                price: 'NT$ 2,800',
                features: ['純度99.9%', '韓系車專用', '原廠規格'],
                badge: '經典車型'
              },
              {
                title: 'R1234yf 冷媒 10kg',
                description: '新世代 Hyundai 環保冷媒',
                price: 'NT$ 4,200',
                features: ['低GWP值', '環保認證', '智慧系統'],
                badge: '新車型'
              },
              {
                title: 'PAG 46/100 冷凍油',
                description: 'Hyundai 多規格冷凍油',
                price: 'NT$ 420',
                features: ['多規格', '韓系配方', '智慧相容'],
                badge: '智慧系統'
              },
              {
                title: 'Hyundai 診斷工具',
                description: '專業 Hyundai 診斷設備',
                price: 'NT$ 8,500',
                features: ['智慧診斷', '多系統', '韓系專用'],
                badge: '診斷專用'
              }
            ].map((product, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                    {product.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{product.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                <p className="text-xl font-bold text-purple-600 mb-4">{product.price}</p>
                <ul className="space-y-1 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-600">✓ {feature}</li>
                  ))}
                </ul>
                <Link 
                  href={`/${locale}/products`}
                  className="block text-center bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition-colors text-sm"
                >
                  查看詳情
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-blue-700 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">{t.contactTitle}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{t.contactDescription}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href={`/${locale}/contact`}
              className="bg-white text-blue-700 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              立即聯繫
            </Link>
            <Link 
              href={`/${locale}/products`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-700 transition-colors font-semibold"
            >
              查看產品
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}