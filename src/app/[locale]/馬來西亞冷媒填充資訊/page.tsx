import { Metadata } from 'next'
import Link from 'next/link'

// SEO 設定
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  const seoData = {
    zh: {
      title: '馬來西亞汽車冷媒填充資訊 | R134a R1234yf 冷媒產品批發 | DrCarCold 東南亞冷氣維修',
      description: '專業馬來西亞汽車冷媒填充服務指南！提供 R134a、R1234yf、HC-12a 環保冷媒、PAG 冷凍油、冷媒充填機等產品批發。涵蓋 Malaysia 全車系冷氣維修技術資訊、當地法規、氣候適應性。東南亞30年經驗，品質保證。',
      keywords: '馬來西亞冷媒填充,Malaysia汽車冷氣維修,R134a冷媒,R1234yf冷媒,HC-12a冷媒,PAG冷凍油,冷媒充填機,汽車冷媒產品批發,東南亞冷媒,Malaysia法規,熱帶氣候冷媒,吉隆坡冷氣維修,檳城汽車冷媒,新山冷氣服務',
      ogTitle: '馬來西亞汽車冷媒填充資訊 | 專業 R134a R1234yf 冷媒產品批發',
      ogDescription: '專業馬來西亞汽車冷媒填充服務指南，提供 R134a、R1234yf、HC-12a 環保冷媒產品批發。熱帶氣候專用，30年經驗，品質保證。'
    },
    en: {
      title: 'Malaysia Car Refrigerant Filling Information | R134a R1234yf Wholesale | DrCarCold Southeast Asia AC Repair',
      description: 'Professional Malaysia car refrigerant filling service guide! We provide R134a, R1234yf, HC-12a eco-friendly refrigerants, PAG oil, and charging equipment wholesale. Covers all Malaysia vehicle AC repair technical information, local regulations, climate adaptation. 30 years Southeast Asia experience.',
      keywords: 'Malaysia refrigerant filling,Malaysia car AC repair,R134a refrigerant,R1234yf refrigerant,HC-12a refrigerant,PAG oil,refrigerant charging machine,automotive refrigerant wholesale,Southeast Asia refrigerant,Malaysia regulations,tropical climate refrigerant,Kuala Lumpur AC repair',
      ogTitle: 'Malaysia Car Refrigerant Filling Information | Professional R134a R1234yf Wholesale',
      ogDescription: 'Professional Malaysia car refrigerant filling service guide with R134a, R1234yf, HC-12a eco-friendly refrigerant wholesale. Tropical climate specialized, 30 years experience, quality guaranteed.'
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
      url: `https://drcarcold.com/${locale}/馬來西亞冷媒填充資訊`,
      siteName: 'DrCarCold',
      images: [
        {
          url: '/images/malaysia-refrigerant-service.jpg',
          width: 1200,
          height: 630,
          alt: '馬來西亞汽車冷媒填充服務',
        },
      ],
      locale: isZh ? 'zh_TW' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.ogTitle,
      description: data.ogDescription,
      images: ['/images/malaysia-refrigerant-service.jpg'],
    },
    alternates: {
      canonical: `https://drcarcold.com/${locale}/馬來西亞冷媒填充資訊`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/馬來西亞冷媒填充資訊',
        'en': 'https://drcarcold.com/en/馬來西亞冷媒填充資訊',
      },
    },
  }
}

interface MalaysiaPageProps {
  params: {
    locale: string
  }
}

export default function MalaysiaPage({ params: { locale } }: MalaysiaPageProps) {
  const isZh = locale === 'zh'

  const content = {
    zh: {
      title: '馬來西亞汽車冷媒填充資訊',
      subtitle: 'R134a R1234yf HC-12a 冷媒產品批發 | 熱帶氣候專用 | 東南亞技術支援',
      heroDescription: '專業馬來西亞汽車冷媒填充服務指南，提供適合熱帶氣候的 R134a、R1234yf、HC-12a 環保冷媒解決方案。30年東南亞服務經驗，深度了解馬來西亞當地法規與氣候特性。',
      featuresTitle: '🎯 馬來西亞冷媒服務特色',
      features: [
        {
          icon: '🌴',
          title: '熱帶氣候專用',
          description: '針對馬來西亞高溫高濕環境，提供最適合的冷媒配方與技術'
        },
        {
          icon: '📋',
          title: '當地法規認證',
          description: '符合馬來西亞環保法規與 SIRIM 認證標準'
        },
        {
          icon: '🌿',
          title: '環保冷媒優先',
          description: 'HC-12a、R1234yf 等環保冷媒，符合馬來西亞綠色政策'
        },
        {
          icon: '🔧',
          title: '在地技術支援',
          description: '提供馬來西亞當地技術支援與培訓服務'
        }
      ],
      climateTitle: '🌡️ 熱帶氣候冷媒考量',
      climateFactors: [
        {
          title: '高溫環境適應',
          description: '馬來西亞全年溫度 25-35°C，需要高效能冷媒系統',
          tips: ['選用耐高溫冷媒', '加強散熱設計', '提高冷媒純度']
        },
        {
          title: '高濕度防護',
          description: '相對濕度 70-90%，防止系統結露與腐蝕',
          tips: ['使用防腐蝕添加劑', '定期除濕保養', '選用合適密封材料']
        },
        {
          title: '頻繁使用優化',
          description: '全年需要冷氣，系統負荷較重',
          tips: ['定期系統檢查', '使用長效冷媒', '強化系統穩定性']
        }
      ],
      regulationsTitle: '📜 馬來西亞冷媒法規',
      regulations: [
        {
          title: 'SIRIM 認證標準',
          content: '所有冷媒產品需通過 SIRIM（馬來西亞標準與工業研究院）認證'
        },
        {
          title: '環保部門規範',
          content: '符合 Department of Environment (DOE) 環保法規，限制 ODP 和 GWP 值'
        },
        {
          title: 'MS 2678:2017 標準',
          content: '易燃冷媒系統安全操作規範，特別針對 HC 冷媒使用'
        },
        {
          title: '進口許可要求',
          content: '冷媒進口需要 Ministry of International Trade and Industry (MITI) 許可'
        }
      ],
      productsTitle: '🛒 馬來西亞專用冷媒產品',
      contactTitle: '💬 馬來西亞技術支援',
      contactDescription: '需要馬來西亞冷媒技術支援？我們的東南亞專業團隊提供在地服務！',
      locationsTitle: '📍 馬來西亞服務據點',
      locations: [
        { city: '吉隆坡 Kuala Lumpur', services: '技術支援、產品批發、培訓服務' },
        { city: '檳城 Penang', services: '技術諮詢、設備維修、零件供應' },
        { city: '新山 Johor Bahru', services: '跨境服務、物流配送、技術交流' },
        { city: '怡保 Ipoh', services: '區域服務、技術培訓、客戶支援' }
      ]
    },
    en: {
      title: 'Malaysia Car Refrigerant Filling Information',
      subtitle: 'R134a R1234yf HC-12a Refrigerant Wholesale | Tropical Climate Specialized | Southeast Asia Support',
      heroDescription: 'Professional Malaysia car refrigerant filling service guide with tropical climate-suitable R134a, R1234yf, HC-12a eco-friendly refrigerant solutions. 30 years Southeast Asia service experience, deep understanding of Malaysia local regulations and climate characteristics.',
      featuresTitle: '🎯 Malaysia Refrigerant Service Features',
      features: [
        {
          icon: '🌴',
          title: 'Tropical Climate Specialized',
          description: 'Optimal refrigerant formulations and technology for Malaysia high temperature and humidity environment'
        },
        {
          icon: '📋',
          title: 'Local Regulation Certified',
          description: 'Compliant with Malaysia environmental regulations and SIRIM certification standards'
        },
        {
          icon: '🌿',
          title: 'Eco-Friendly Priority',
          description: 'HC-12a, R1234yf eco-friendly refrigerants aligned with Malaysia green policies'
        },
        {
          icon: '🔧',
          title: 'Local Technical Support',
          description: 'Provide Malaysia local technical support and training services'
        }
      ],
      climateTitle: '🌡️ Tropical Climate Refrigerant Considerations',
      climateFactors: [
        {
          title: 'High Temperature Adaptation',
          description: 'Malaysia year-round temperature 25-35°C requires high-performance refrigerant systems',
          tips: ['Select heat-resistant refrigerants', 'Enhanced cooling design', 'Improve refrigerant purity']
        },
        {
          title: 'High Humidity Protection',
          description: 'Relative humidity 70-90%, prevent system condensation and corrosion',
          tips: ['Use anti-corrosion additives', 'Regular dehumidification maintenance', 'Select suitable sealing materials']
        },
        {
          title: 'Frequent Use Optimization',
          description: 'Year-round AC usage, heavy system load',
          tips: ['Regular system inspection', 'Use long-lasting refrigerants', 'Enhance system stability']
        }
      ],
      regulationsTitle: '📜 Malaysia Refrigerant Regulations',
      regulations: [
        {
          title: 'SIRIM Certification Standards',
          content: 'All refrigerant products must pass SIRIM (Standards and Industrial Research Institute of Malaysia) certification'
        },
        {
          title: 'Environmental Department Regulations',
          content: 'Comply with Department of Environment (DOE) environmental regulations, limiting ODP and GWP values'
        },
        {
          title: 'MS 2678:2017 Standards',
          content: 'Flammable refrigerant system safety operation standards, specifically for HC refrigerant use'
        },
        {
          title: 'Import License Requirements',
          content: 'Refrigerant imports require Ministry of International Trade and Industry (MITI) permits'
        }
      ],
      productsTitle: '🛒 Malaysia Specialized Refrigerant Products',
      contactTitle: '💬 Malaysia Technical Support',
      contactDescription: 'Need Malaysia refrigerant technical support? Our Southeast Asia professional team provides local services!',
      locationsTitle: '📍 Malaysia Service Locations',
      locations: [
        { city: 'Kuala Lumpur 吉隆坡', services: 'Technical support, product wholesale, training services' },
        { city: 'Penang 檳城', services: 'Technical consultation, equipment repair, parts supply' },
        { city: 'Johor Bahru 新山', services: 'Cross-border service, logistics distribution, technical exchange' },
        { city: 'Ipoh 怡保', services: 'Regional service, technical training, customer support' }
      ]
    }
  }

  const t = content[isZh ? 'zh' : 'en']

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="container mx-auto px-4">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t.title}
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-green-100">
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
              <div key={index} className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Climate Considerations Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.climateTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {t.climateFactors.map((factor, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">{factor.title}</h3>
                <p className="text-gray-600 mb-4">{factor.description}</p>
                <div className="space-y-1">
                  <h4 className="font-medium text-gray-700 text-sm">技術要點:</h4>
                  {factor.tips.map((tip, idx) => (
                    <p key={idx} className="text-sm text-gray-600">• {tip}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulations Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.regulationsTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {t.regulations.map((regulation, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-green-700">{regulation.title}</h3>
                <p className="text-gray-600 text-sm">{regulation.content}</p>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'HC-12a 環保冷媒',
                description: '天然碳氫冷媒，適合熱帶氣候',
                price: 'RM 180',
                features: ['零ODP', '低GWP', '高效能', 'SIRIM認證'],
                badge: '環保首選'
              },
              {
                title: 'R134a 熱帶配方',
                description: '熱帶氣候專用 R134a 冷媒',
                price: 'RM 220',
                features: ['耐高溫', '防腐蝕', '長效型', '當地認證'],
                badge: '熱帶專用'
              },
              {
                title: 'R1234yf 新世代',
                description: '最新環保冷媒，低 GWP 值',
                price: 'RM 350',
                features: ['超低GWP', '環保認證', '高效能', '未來標準'],
                badge: '未來趨勢'
              },
              {
                title: 'PAG 熱帶油',
                description: '熱帶氣候專用冷凍油',
                price: 'RM 45',
                features: ['耐高溫', '防氧化', '長壽命', '相容性佳'],
                badge: '氣候適應'
              }
            ].map((product, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg relative">
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                    {product.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">{product.title}</h3>
                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                <p className="text-xl font-bold text-green-600 mb-4">{product.price}</p>
                <ul className="space-y-1 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-600">✓ {feature}</li>
                  ))}
                </ul>
                <Link 
                  href={`/${locale}/products`}
                  className="block text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors text-sm"
                >
                  查看詳情
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            {t.locationsTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {t.locations.map((location, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-3 text-green-700">{location.city}</h3>
                <p className="text-gray-600">{location.services}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">{t.contactTitle}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">{t.contactDescription}</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href={`/${locale}/contact`}
              className="bg-white text-green-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              立即聯繫
            </Link>
            <Link 
              href={`/${locale}/products`}
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-green-600 transition-colors font-semibold"
            >
              查看產品
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}