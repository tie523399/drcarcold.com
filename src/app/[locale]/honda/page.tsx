import { Metadata } from 'next'
import Link from 'next/link'

// SEO 設定
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  const seoData = {
    zh: {
      title: 'Honda 本田汽車冷媒充填服務 | R134a R1234yf 冷媒產品批發 | DrCarCold 專業冷氣維修',
      description: '專業 Honda 本田汽車冷媒充填服務！提供 R134a、R1234yf 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。涵蓋 Civic、Accord、CR-V、HR-V、Fit 等全車系冷氣維修。30年經驗，日系車專精，品質保證。',
      keywords: 'Honda冷媒充填,本田汽車冷氣維修,R134a冷媒,R1234yf冷媒,PAG冷凍油,冷媒充填機,汽車冷媒產品批發,Civic冷媒,Accord冷氣,CR-V冷媒,HR-V冷氣,Fit冷媒,本田冷氣不冷,Honda空調維修,日系車冷媒',
      ogTitle: 'Honda 本田汽車冷媒充填 | 專業 R134a R1234yf 冷媒產品批發',
      ogDescription: '專業 Honda 本田汽車冷媒充填服務，提供 R134a、R1234yf 環保冷媒產品批發。全車系冷氣維修，30年經驗，品質保證。'
    },
    en: {
      title: 'Honda Refrigerant Filling Service | R134a R1234yf Wholesale | DrCarCold Professional AC Repair',
      description: 'Professional Honda refrigerant filling service! We provide R134a, R1234yf eco-friendly refrigerants, PAG oil, and charging equipment wholesale. Covers all Honda models including Civic, Accord, CR-V, HR-V, Fit. 30 years experience, Japanese car specialist.',
      keywords: 'Honda refrigerant,Honda AC repair,R134a refrigerant,R1234yf refrigerant,PAG oil,refrigerant charging machine,automotive refrigerant wholesale,Civic refrigerant,Accord AC,CR-V refrigerant,HR-V AC,Honda AC not cold,Japanese car refrigerant',
      ogTitle: 'Honda Refrigerant Filling | Professional R134a R1234yf Wholesale',
      ogDescription: 'Professional Honda refrigerant filling service with R134a, R1234yf eco-friendly refrigerant wholesale. All models covered, 30 years experience, quality guaranteed.'
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
      url: `https://drcarcold.com/${locale}/honda`,
      siteName: 'DrCarCold',
      images: [
        {
          url: '/images/honda-refrigerant-service.jpg',
          width: 1200,
          height: 630,
          alt: 'Honda 本田汽車冷媒充填服務',
        },
      ],
      locale: isZh ? 'zh_TW' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.ogTitle,
      description: data.ogDescription,
      images: ['/images/honda-refrigerant-service.jpg'],
    },
    alternates: {
      canonical: `https://drcarcold.com/${locale}/honda`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/honda',
        'en': 'https://drcarcold.com/en/honda',
      },
    },
  }
}

interface HondaPageProps {
  params: {
    locale: string
  }
}

export default function HondaPage({ params: { locale } }: HondaPageProps) {
  const isZh = locale === 'zh'

  // 模擬 Honda 車型資料
  const mockModels = [
    { modelName: 'Civic', year: '2019-2024', refrigerantType: 'R1234yf', fillAmount: '420g', oilType: 'PAG 46' },
    { modelName: 'Accord', year: '2018-2024', refrigerantType: 'R1234yf', fillAmount: '520g', oilType: 'PAG 46' },
    { modelName: 'CR-V', year: '2017-2024', refrigerantType: 'R134a', fillAmount: '480g', oilType: 'PAG 46' },
    { modelName: 'HR-V', year: '2020-2024', refrigerantType: 'R1234yf', fillAmount: '380g', oilType: 'PAG 46' },
    { modelName: 'Fit', year: '2020-2024', refrigerantType: 'R134a', fillAmount: '320g', oilType: 'PAG 46' },
    { modelName: 'Odyssey', year: '2018-2024', refrigerantType: 'R134a', fillAmount: '600g', oilType: 'PAG 100' }
  ]

  const content = {
    zh: {
      title: 'Honda 本田汽車冷媒充填服務',
      subtitle: 'R134a R1234yf 冷媒產品批發 | PAG冷凍油 | 日系車專精',
      heroDescription: '專業 Honda 本田汽車冷媒充填服務，提供 R134a、R1234yf 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。30年日系車服務經驗，熟悉 Honda 各車型冷氣系統特性。',
      featuresTitle: '🎯 Honda 冷媒服務特色',
      features: [
        {
          icon: '🇯🇵',
          title: '日系車專精',
          description: '30年 Honda 車系服務經驗，深度了解日系車冷氣系統特性'
        },
        {
          icon: '🔧',
          title: '全車系支援',
          description: 'Civic、Accord、CR-V、HR-V、Fit 等全車系冷媒規格'
        },
        {
          icon: '🌿',
          title: '環保優先',
          description: 'R134a、R1234yf 環保冷媒，符合 Honda 環保理念'
        },
        {
          icon: '⚡',
          title: '高效服務',
          description: '快速診斷、精準充填，恢復 Honda 冷氣最佳性能'
        }
      ],
      modelsTitle: '🚗 Honda 熱門車型冷媒規格',
      modelsDescription: '以下是 Honda 熱門車型的冷媒充填規格參考：',
      viewAllModels: '查看所有 Honda 車型',
      productsTitle: '🛒 Honda 專用冷媒產品',
      tipTitle: '💡 Honda 冷氣保養小貼士',
      tips: [
        '定期檢查冷媒量，避免系統空轉損壞壓縮機',
        'Honda 車型建議每 2-3 年進行冷氣系統清潔',
        '使用原廠規格 PAG 冷凍油，確保系統潤滑',
        '注意 Honda 車型特有的膨脹閥設計，需專業調整'
      ],
      contactTitle: '💬 Honda 專業技術諮詢',
      contactDescription: '需要 Honda 冷媒技術支援？我們的日系車專業團隊隨時為您服務！'
    },
    en: {
      title: 'Honda Refrigerant Filling Service',
      subtitle: 'R134a R1234yf Refrigerant Wholesale | PAG Oil | Japanese Car Specialist',
      heroDescription: 'Professional Honda refrigerant filling service with R134a, R1234yf eco-friendly refrigerants, PAG oil, and charging equipment wholesale. 30 years Japanese car service experience, familiar with Honda AC system characteristics.',
      featuresTitle: '🎯 Honda Refrigerant Service Features',
      features: [
        {
          icon: '🇯🇵',
          title: 'Japanese Car Specialist',
          description: '30 years Honda service experience, deep understanding of Japanese car AC systems'
        },
        {
          icon: '🔧',
          title: 'All Models Supported',
          description: 'Complete refrigerant specifications for Civic, Accord, CR-V, HR-V, Fit and more'
        },
        {
          icon: '🌿',
          title: 'Eco-Friendly Priority',
          description: 'R134a, R1234yf eco-friendly refrigerants aligned with Honda environmental values'
        },
        {
          icon: '⚡',
          title: 'Efficient Service',
          description: 'Quick diagnosis, precise filling, restore Honda AC optimal performance'
        }
      ],
      modelsTitle: '🚗 Popular Honda Models Refrigerant Specs',
      modelsDescription: 'Here are the refrigerant filling specifications for popular Honda models:',
      viewAllModels: 'View All Honda Models',
      productsTitle: '🛒 Honda Specific Refrigerant Products',
      tipTitle: '💡 Honda AC Maintenance Tips',
      tips: [
        'Regularly check refrigerant levels to prevent compressor damage from dry running',
        'Honda models recommend AC system cleaning every 2-3 years',
        'Use OEM specification PAG oil to ensure proper system lubrication',
        'Pay attention to Honda-specific expansion valve design requiring professional adjustment'
      ],
      contactTitle: '💬 Honda Professional Technical Support',
      contactDescription: 'Need Honda refrigerant technical support? Our Japanese car specialists are ready to serve you!'
    }
  }

  const t = content[isZh ? 'zh' : 'en']

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-red-100">
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
              <div key={index} className="text-center p-6 bg-red-50 rounded-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Honda Models Section */}
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
                  Honda {model.modelName}
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
              href={`/${locale}/refrigerant-lookup?brand=Honda`}
              className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              {t.viewAllModels}
            </Link>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-orange-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.tipTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {t.tips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg">
                <div className="text-orange-600 text-xl">💡</div>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.productsTitle}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'R134a 冷媒 13.6kg',
                description: 'Honda 經典車型專用冷媒',
                price: 'NT$ 2,800',
                features: ['純度99.9%', '日系車專用', '原廠規格']
              },
              {
                title: 'R1234yf 冷媒 10kg',
                description: '新世代 Honda 環保冷媒',
                price: 'NT$ 4,200',
                features: ['低GWP值', '環保認證', '新車標準']
              },
              {
                title: 'PAG 46 冷凍油',
                description: 'Honda 系統專用冷凍油',
                price: 'NT$ 380',
                features: ['高潤滑性', '日系配方', '系統保護']
              },
              {
                title: 'Honda 快速接頭組',
                description: 'Honda 專用快速接頭',
                price: 'NT$ 750',
                features: ['精密接合', '防漏設計', '快速作業']
              },
              {
                title: '冷媒檢漏儀',
                description: '專業冷媒洩漏檢測',
                price: 'NT$ 3,500',
                features: ['高靈敏度', '精準定位', '多氣體檢測']
              },
              {
                title: 'Honda 壓力錶組',
                description: 'Honda 系統專用錶組',
                price: 'NT$ 1,200',
                features: ['日系規格', '精準測量', '耐用可靠']
              }
            ].map((product, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{product.title}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-2xl font-bold text-red-600 mb-4">{product.price}</p>
                <ul className="space-y-1 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-gray-600">✓ {feature}</li>
                  ))}
                </ul>
                <Link 
                  href={`/${locale}/products`}
                  className="block text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors"
                >
                  查看詳情
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">{t.contactTitle}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{t.contactDescription}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href={`/${locale}/contact`}
              className="bg-white text-red-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              立即聯繫
            </Link>
            <Link 
              href={`/${locale}/products`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-red-600 transition-colors font-semibold"
            >
              查看產品
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}