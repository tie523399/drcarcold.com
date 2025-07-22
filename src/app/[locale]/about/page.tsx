import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users, Target, Award, Truck, Clock, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '關於DrCarCold | 30年汽車冷媒專家 R134a R1234yf 專業維修團隊 - 台灣第一品牌'
      : 'About DrCarCold | 30 Years Automotive Refrigerant Expert - Taiwan Leading Brand',
    
    description: isZh 
      ? '🏆 DrCarCold創立於1990年，台灣汽車冷媒領導品牌！30年專業經驗，服務超過10萬台車輛。專精R134a、R1234yf冷媒技術，擁有專業技師團隊、完整檢測設備。提供汽車冷氣維修、冷媒充填、系統檢測等全方位服務，是您最信賴的汽車冷氣專家！'
      : '🏆 DrCarCold established in 1990, Taiwan\'s leading automotive refrigerant brand! 30 years of professional experience, serving over 100,000 vehicles. Specializing in R134a, R1234yf refrigerant technology with professional technician team and complete testing equipment.',
    
    keywords: isZh ? [
      // 公司品牌關鍵字
      'DrCarCold', '車冷博士', '德瑞卡冷氣', '汽車冷媒專家', '台灣汽車冷媒',
      '汽車冷氣專家', '冷媒技術專家', '汽車冷氣品牌', '汽車冷媒品牌',
      
      // 歷史與信任關鍵字
      '30年經驗', '1990年創立', '汽車冷媒老店', '資深汽車冷氣',
      '台灣第一品牌', '汽車冷媒領導者', '信賴品牌', '老字號汽車冷氣',
      
      // 技術專業關鍵字
      'R134a專家', 'R1234yf專家', '汽車冷媒技術', '冷氣系統專家',
      '專業汽車冷氣', '冷媒充填專家', '汽車冷氣檢測', '冷氣故障診斷',
      '汽車冷氣維修專家', '冷媒回收專家', '環保冷媒專家',
      
      // 服務範圍關鍵字
      '全台服務', '台北汽車冷媒', '新北汽車冷氣', '桃園冷媒服務',
      '台中汽車冷氣', '台南冷媒專家', '高雄汽車冷氣', '宜蘭冷媒',
      
      // 客戶見證關鍵字
      '10萬台車', '客戶見證', '服務實績', '滿意客戶', '口碑推薦',
      '專業認證', '技師團隊', '品質保證', '服務保障',
      
      // 設備技術關鍵字
      '專業設備', '檢測設備', '冷媒充填機', '冷媒回收機',
      '壓力檢測', '洩漏檢測', '真空抽取', '冷媒純度檢測',
      
      // 競爭優勢關鍵字
      '價格合理', '快速服務', '專業技術', '品質保證',
      '售後服務', '技術支援', '教育訓練', '證照認證',
      
      // 企業使命關鍵字
      '環保責任', '永續經營', '技術創新', '客戶至上',
      '專業服務', '誠信經營', '品質第一', '安全第一'
    ] : [
      'DrCarCold', 'automotive refrigerant expert', 'Taiwan leading brand',
      '30 years experience', 'R134a expert', 'R1234yf expert', 'professional team',
      'automotive AC specialist', 'refrigerant technology', 'quality service',
      'Taiwan automotive refrigerant', 'professional certification'
    ],
    
    openGraph: {
      title: isZh 
        ? '關於DrCarCold - 30年汽車冷媒專家 台灣第一品牌'
        : 'About DrCarCold - 30 Years Automotive Refrigerant Expert',
      description: isZh 
        ? 'DrCarCold創立於1990年，台灣汽車冷媒領導品牌！30年專業經驗，10萬台車服務實績'
        : 'DrCarCold established in 1990, Taiwan\'s leading automotive refrigerant brand! 30 years experience',
      url: 'https://drcarcold.com/about',
      images: [
        {
          url: '/images/og-about.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 關於我們 - 30年汽車冷媒專家' : 'DrCarCold About Us - 30 Years Expert',
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? 'DrCarCold - 30年汽車冷媒專家'
        : 'DrCarCold - 30 Years Automotive Refrigerant Expert',
      description: isZh 
        ? '台灣汽車冷媒領導品牌，30年專業經驗，值得信賴'
        : 'Taiwan\'s leading automotive refrigerant brand, 30 years experience',
      images: ['/images/twitter-about.jpg'],
    },
    
    alternates: {
      canonical: `https://drcarcold.com/${locale}/about`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/about',
        'en': 'https://drcarcold.com/en/about',
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
    
    category: 'company information',
    classification: 'About Page',
    
    other: {
      'company-founded': '1990',
      'years-experience': '30+',
      'vehicles-served': '100000+',
      'company-type': 'automotive-service',
    },
  }
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale })
  const isZh = locale === 'zh'

  // 生成公司頁面的結構化資料
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    mainEntity: {
      '@type': 'Organization',
      '@id': 'https://drcarcold.com/#organization',
      name: 'DrCarCold',
      alternateName: ['車冷博士', '德瑞卡冷氣系統'],
      description: isZh 
        ? 'DrCarCold創立於1990年，是台灣汽車冷媒領導品牌，專精R134a、R1234yf冷媒技術，提供專業汽車冷氣維修服務'
        : 'DrCarCold established in 1990, Taiwan\'s leading automotive refrigerant brand, specializing in R134a, R1234yf refrigerant technology',
      foundingDate: '1990',
      url: 'https://drcarcold.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://drcarcold.com/images/logo.png',
        width: 300,
        height: 100
      },
      image: 'https://drcarcold.com/images/company-photo.jpg',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '待補充地址',
        addressLocality: '台北市',
        addressRegion: '台北市',
        postalCode: '10001',
        addressCountry: 'TW'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+886-2-xxxx-xxxx',
        contactType: 'customer service',
        areaServed: 'TW',
        availableLanguage: ['zh-TW', 'en']
      },
      sameAs: [
        'https://www.facebook.com/drcarcold',
        'https://www.instagram.com/drcarcold',
        'https://www.youtube.com/drcarcold',
        'https://line.me/ti/p/drcarcold'
      ],
      serviceArea: {
        '@type': 'Country',
        name: 'Taiwan'
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isZh ? '汽車冷媒服務' : 'Automotive Refrigerant Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isZh ? 'R134a冷媒充填' : 'R134a Refrigerant Filling',
              description: isZh ? '專業R134a冷媒充填服務' : 'Professional R134a refrigerant filling service'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service', 
              name: isZh ? 'R1234yf冷媒充填' : 'R1234yf Refrigerant Filling',
              description: isZh ? '新型環保R1234yf冷媒充填' : 'New eco-friendly R1234yf refrigerant filling'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isZh ? '汽車冷氣檢測' : 'Automotive AC Testing',
              description: isZh ? '專業汽車冷氣系統檢測' : 'Professional automotive AC system testing'
            }
          }
        ]
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '1500',
        bestRating: '5',
        worstRating: '1'
      },
      review: [
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: '王先生'
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5'
          },
          reviewBody: '服務很專業，冷媒充填後車子冷氣明顯變冷了，價格也很合理，推薦！'
        }
      ],
      knowsAbout: [
        'R134a冷媒', 'R1234yf冷媒', '汽車冷氣維修', 'PAG冷凍油',
        '汽車冷氣檢測', '冷媒回收', '環保冷媒技術'
      ],
      memberOf: {
        '@type': 'Organization',
        name: '台灣汽車維修業公會'
      }
    }
  }

  const features = [
    {
      icon: Shield,
      title: isZh ? '品質保證' : 'Quality Assurance',
      description: isZh ? '30年品質保證，使用原廠規格冷媒' : '30 years quality guarantee with OEM spec refrigerants'
    },
    {
      icon: Truck,
      title: isZh ? '全台服務' : 'Nationwide Service',
      description: isZh ? '全台各地專業服務據點' : 'Professional service points nationwide'
    },
    {
      icon: Clock,
      title: isZh ? '快速服務' : 'Fast Service',
      description: isZh ? '專業快速，當天完成維修' : 'Professional and fast, same-day repair completion'
    },
    {
      icon: Award,
      title: isZh ? '專業認證' : 'Professional Certified',
      description: isZh ? '技師團隊擁有專業證照' : 'Technician team with professional certifications'
    }
  ]

  return (
    <div className="container mx-auto py-8">
      {/* JSON-LD 結構化資料 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-6">
          {isZh ? (
            <>
              🏆 關於 <span className="text-blue-600">DrCarCold</span><br />
              <span className="text-2xl text-gray-600">30年汽車冷媒專家 | 台灣第一品牌</span>
            </>
          ) : (
            <>
              🏆 About <span className="text-blue-600">DrCarCold</span><br />
              <span className="text-2xl text-gray-600">30 Years Automotive Refrigerant Expert</span>
            </>
          )}
        </h1>
        
        <div className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
          {isZh ? (
            <p>
              <strong className="text-blue-600">DrCarCold創立於1990年</strong>，
              是台灣汽車冷媒技術的領導品牌。我們擁有
              <strong className="text-green-600">30年豐富經驗</strong>，
              服務超過<strong className="text-orange-600">10萬台車輛</strong>，
              專精於<strong className="text-purple-600">R134a、R1234yf冷媒技術</strong>，
              提供最專業的汽車冷氣維修服務。從傳統HFC冷媒到最新環保HFO冷媒，
              我們始終站在技術最前線，是您最值得信賴的汽車冷氣專家！
            </p>
          ) : (
            <p>
              <strong className="text-blue-600">DrCarCold established in 1990</strong>, 
              is Taiwan's leading automotive refrigerant technology brand. 
              With <strong className="text-green-600">30 years of rich experience</strong>, 
              serving over <strong className="text-orange-600">100,000 vehicles</strong>, 
              specializing in <strong className="text-purple-600">R134a, R1234yf refrigerant technology</strong>, 
              providing the most professional automotive AC repair services.
            </p>
          )}
        </div>
        
        {/* 核心數據 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">1990</div>
            <div className="text-sm text-gray-600">創立年份</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="text-3xl font-bold text-green-600">30+</div>
            <div className="text-sm text-gray-600">年專業經驗</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">10萬+</div>
            <div className="text-sm text-gray-600">服務車輛</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">100%</div>
            <div className="text-sm text-gray-600">客戶滿意</div>
          </div>
        </div>
      </div>

      {/* 企業使命 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isZh ? '企業使命與願景' : 'Mission & Vision'}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6">
            <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isZh ? '技術創新' : 'Technical Innovation'}
            </h3>
            <p className="text-gray-600">
              {isZh ? '持續研發最新冷媒技術，提供客戶最佳解決方案' : 'Continuously develop latest refrigerant technology'}
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isZh ? '客戶至上' : 'Customer First'}
            </h3>
            <p className="text-gray-600">
              {isZh ? '以客戶需求為導向，提供貼心專業的服務體驗' : 'Customer-oriented professional service experience'}
            </p>
          </Card>
          
          <Card className="text-center p-6">
            <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isZh ? '環保責任' : 'Environmental Responsibility'}
            </h3>
            <p className="text-gray-600">
              {isZh ? '推廣環保冷媒技術，為地球環境盡一份心力' : 'Promote eco-friendly refrigerant technology'}
            </p>
          </Card>
        </div>
      </div>

      {/* 核心優勢 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isZh ? '為什麼選擇 DrCarCold？' : 'Why Choose DrCarCold?'}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 專業技術 */}
      <div className="mb-12 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isZh ? '專業技術領域' : 'Professional Technical Fields'}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-blue-600">
              {isZh ? '冷媒技術專精' : 'Refrigerant Technology Expertise'}
            </h3>
            <ul className="space-y-2">
              {[
                isZh ? 'R134a傳統冷媒技術' : 'R134a Traditional Refrigerant Technology',
                isZh ? 'R1234yf新型環保冷媒' : 'R1234yf New Eco-friendly Refrigerant', 
                isZh ? 'CO2自然冷媒研發' : 'CO2 Natural Refrigerant Development',
                isZh ? 'PAG冷凍油技術' : 'PAG Refrigerant Oil Technology'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              {isZh ? '檢測設備先進' : 'Advanced Testing Equipment'}
            </h3>
            <ul className="space-y-2">
              {[
                isZh ? '高精度冷媒充填設備' : 'High-precision Refrigerant Filling Equipment',
                isZh ? '真空度檢測系統' : 'Vacuum Level Detection System',
                isZh ? '冷媒純度分析儀' : 'Refrigerant Purity Analyzer',
                isZh ? '洩漏檢測設備' : 'Leak Detection Equipment'
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 客戶見證 */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          {isZh ? '客戶見證' : 'Customer Testimonials'}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: '王先生 - Toyota車主',
              comment: '服務很專業，冷媒充填後車子冷氣明顯變冷了，價格也很合理，推薦！',
              rating: 5
            },
            {
              name: '李小姐 - BMW車主', 
              comment: '技師很專業，詳細解釋R1234yf冷媒的優點，服務品質很好。',
              rating: 5
            },
            {
              name: '陳先生 - 計程車司機',
              comment: '開計程車最怕冷氣壞，DrCarCold維修快速又可靠，是我的首選。',
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">⭐</span>
                ))}
              </div>
              <p className="text-gray-600 mb-3 italic">"{testimonial.comment}"</p>
              <p className="text-sm font-medium text-gray-800">— {testimonial.name}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-blue-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          {isZh ? '立即體驗專業服務' : 'Experience Professional Service Now'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isZh ? '30年經驗，值得信賴。立即聯繫我們獲得專業的汽車冷氣服務！' : '30 years experience, trustworthy. Contact us now for professional automotive AC service!'}
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href={`/${locale}/contact`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isZh ? '立即聯繫' : 'Contact Now'}
          </Link>
          <Link 
            href={`/${locale}/refrigerant-lookup`}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {isZh ? '冷媒查詢' : 'Refrigerant Lookup'}
          </Link>
        </div>
      </div>
    </div>
  )
}
