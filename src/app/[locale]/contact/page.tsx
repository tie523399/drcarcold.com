import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import ContactForm from './contact-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Mail, MapPin, Clock, Smartphone, MessageSquare, Navigation, Star } from 'lucide-react'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const isZh = locale === 'zh'
  
  return {
    title: isZh 
      ? '聯絡DrCarCold | 台北汽車冷媒專家 R134a R1234yf 維修服務預約 - 立即聯繫'
      : 'Contact DrCarCold | Taipei Automotive Refrigerant Expert - Book R134a R1234yf Service',
    
    description: isZh 
      ? '📞 立即聯繫DrCarCold汽車冷媒專家！台北市專業汽車冷氣維修服務，R134a、R1234yf冷媒充填，免費估價。營業時間週一至週六8:00-18:00，提供24小時緊急服務。電話：02-xxxx-xxxx，Line官方帳號快速諮詢，全台到府服務！'
      : '📞 Contact DrCarCold automotive refrigerant experts now! Professional car AC repair service in Taipei, R134a, R1234yf refrigerant filling, free quotes. Business hours Mon-Sat 8:00-18:00, 24-hour emergency service available.',
    
    keywords: isZh ? [
      // 聯絡相關關鍵字
      'DrCarCold聯絡方式', '汽車冷媒專家電話', '台北汽車冷氣維修', 
      '汽車冷媒服務預約', '冷氣維修聯絡', '汽車冷氣報價',
      
      // 地址位置關鍵字
      '台北汽車冷媒', '台北市汽車冷氣', '汽車冷媒台北', 
      '台北冷氣維修', '台北汽車保養', '台北車冷媒',
      
      // 服務時間關鍵字
      '汽車冷氣營業時間', '24小時汽車冷氣', '緊急汽車冷氣',
      '假日汽車冷氣', '週末冷氣維修', '急修汽車冷氣',
      
      // 聯繫方式關鍵字
      '汽車冷媒電話', '冷氣維修電話', 'Line汽車冷氣',
      '汽車冷氣Line', '冷媒專家聯絡', '汽車冷氣諮詢',
      
      // 服務範圍關鍵字
      '台北汽車冷媒維修', '新北汽車冷氣', '桃園汽車冷媒',
      '基隆汽車冷氣', '宜蘭冷媒服務', '到府汽車冷氣',
      
      // 免費服務關鍵字
      '免費汽車冷氣檢測', '免費冷媒估價', '免費汽車冷氣諮詢',
      '汽車冷氣免費報價', '冷媒免費評估',
      
      // 緊急服務關鍵字
      '緊急汽車冷氣', '急修冷氣', '24小時冷氣維修',
      '假日冷氣急修', '夜間汽車冷氣', '道路救援冷氣',
      
      // 品質保證關鍵字
      '保證汽車冷氣', '專業冷媒技師', '認證汽車冷氣',
      '品質保證冷媒', '原廠認證維修', '保固汽車冷氣'
    ] : [
      'DrCarCold contact', 'automotive refrigerant expert phone', 'Taipei car AC repair',
      'refrigerant service booking', 'car AC contact', 'automotive refrigerant quote',
      'Taipei automotive service', 'professional car AC', '24-hour emergency service'
    ],
    
    openGraph: {
      title: isZh 
        ? '聯絡DrCarCold - 台北汽車冷媒專家 立即預約服務'
        : 'Contact DrCarCold - Taipei Automotive Refrigerant Expert',
      description: isZh 
        ? '立即聯繫DrCarCold！台北專業汽車冷氣維修，免費估價，24小時緊急服務'
        : 'Contact DrCarCold now! Professional car AC repair in Taipei, free quotes, 24-hour emergency service',
      url: 'https://drcarcold.com/contact',
      images: [
        {
          url: '/images/og-contact.jpg',
          width: 1200,
          height: 630,
          alt: isZh ? 'DrCarCold 聯絡我們 - 台北汽車冷媒專家' : 'DrCarCold Contact Us - Taipei Expert',
        },
      ],
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: isZh 
        ? 'DrCarCold聯絡我們 - 台北汽車冷媒專家'
        : 'Contact DrCarCold - Taipei Automotive Expert',
      description: isZh 
        ? '立即聯繫台北汽車冷媒專家，專業服務值得信賴'
        : 'Contact Taipei automotive refrigerant expert now',
      images: ['/images/twitter-contact.jpg'],
    },
    
    alternates: {
      canonical: `https://drcarcold.com/${locale}/contact`,
      languages: {
        'zh-TW': 'https://drcarcold.com/zh/contact',
        'en': 'https://drcarcold.com/en/contact',
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
    
    category: 'business contact',
    classification: 'Contact Page',
    
    other: {
      'business-type': 'automotive-service',
      'service-area': 'taipei-taiwan',
      'emergency-service': 'available',
      'free-quote': 'available',
    },
  }
}

export default async function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale })
  const isZh = locale === 'zh'

  // 本地商家結構化資料
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: {
      '@type': 'LocalBusiness',
      '@id': 'https://drcarcold.com/#localbusiness',
      name: 'DrCarCold 汽車冷媒專家',
      alternateName: ['車冷博士', '德瑞卡冷氣系統'],
      description: isZh 
        ? '台北專業汽車冷媒服務，提供R134a、R1234yf冷媒充填、汽車冷氣維修、系統檢測等服務'
        : 'Professional automotive refrigerant service in Taipei, providing R134a, R1234yf filling, car AC repair',
      
      // 地址資訊
      address: {
        '@type': 'PostalAddress',
        streetAddress: '待補充詳細地址',
        addressLocality: '台北市',
        addressRegion: '台北市',
        postalCode: '10001',
        addressCountry: 'TW'
      },
      
      // 地理座標
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 25.0330,
        longitude: 121.5654
      },
      
      // 聯絡資訊
      telephone: '+886-2-xxxx-xxxx',
      email: 'info@drcarcold.com',
      url: 'https://drcarcold.com',
      
      // 營業時間
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Saturday',
          opens: '09:00',
          closes: '17:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: 'Sunday',
          opens: '10:00',
          closes: '16:00'
        }
      ],
      
      // 服務項目
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: isZh ? '汽車冷媒服務項目' : 'Automotive Refrigerant Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isZh ? 'R134a冷媒充填' : 'R134a Refrigerant Filling',
              description: isZh ? '傳統車款R134a冷媒專業充填服務' : 'Professional R134a filling for traditional vehicles'
            },
            priceRange: '$$',
            areaServed: '台灣'
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isZh ? 'R1234yf冷媒充填' : 'R1234yf Refrigerant Filling',
              description: isZh ? '新型環保冷媒R1234yf專業充填' : 'Professional eco-friendly R1234yf filling'
            },
            priceRange: '$$$',
            areaServed: '台灣'
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: isZh ? '汽車冷氣系統檢測' : 'Car AC System Diagnosis',
              description: isZh ? '專業汽車冷氣系統全面檢測' : 'Comprehensive car AC system diagnosis'
            },
            priceRange: '$',
            areaServed: '台灣'
          }
        ]
      },
      
      // 服務區域
      areaServed: [
        {
          '@type': 'City',
          name: '台北市',
          containedInPlace: {
            '@type': 'AdministrativeArea',
            name: '台灣'
          }
        },
        {
          '@type': 'City',
          name: '新北市'
        },
        {
          '@type': 'City',
          name: '桃園市'
        },
        {
          '@type': 'City',
          name: '基隆市'
        }
      ],
      
      // 聯絡點
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+886-2-xxxx-xxxx',
          contactType: 'customer service',
          areaServed: 'TW',
          availableLanguage: ['zh-TW', 'en'],
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '08:00',
            closes: '22:00'
          }
        },
        {
          '@type': 'ContactPoint',
          telephone: '+886-9-xxxx-xxxx',
          contactType: 'emergency',
          areaServed: 'TW',
          availableLanguage: 'zh-TW',
          hoursAvailable: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59'
          }
        }
      ],
      
      // 社群媒體
      sameAs: [
        'https://www.facebook.com/drcarcold',
        'https://www.instagram.com/drcarcold',
        'https://line.me/ti/p/drcarcold',
        'https://www.youtube.com/drcarcold'
      ],
      
      // 評價
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '500',
        bestRating: '5',
        worstRating: '1'
      },
      
      // 價格範圍
      priceRange: '$$',
      
      // 付款方式
      paymentAccepted: ['Cash', 'Credit Card', 'Line Pay', 'Apple Pay'],
      
      // 特色服務
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: isZh ? '免費估價' : 'Free Quote',
          value: true
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: isZh ? '到府服務' : 'Mobile Service',
          value: true
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: isZh ? '24小時緊急服務' : '24-Hour Emergency Service',
          value: true
        }
      ]
    }
  }

  const contactMethods = [
    {
      icon: Phone,
      title: isZh ? '服務專線' : 'Service Hotline',
      content: '+886-2-xxxx-xxxx',
      description: isZh ? '週一至週六 08:00-18:00' : 'Mon-Sat 08:00-18:00',
      action: 'tel:+886-2-xxxx-xxxx'
    },
    {
      icon: Smartphone,
      title: isZh ? '24小時緊急專線' : '24-Hour Emergency',
      content: '+886-9-xxxx-xxxx',
      description: isZh ? '全年無休緊急服務' : '24/7 Emergency Service',
      action: 'tel:+886-9-xxxx-xxxx'
    },
    {
      icon: MessageSquare,
      title: isZh ? 'Line 官方帳號' : 'Official Line Account',
      content: '@drcarcold',
      description: isZh ? '快速諮詢回覆' : 'Quick Response',
      action: 'https://line.me/ti/p/@drcarcold'
    },
    {
      icon: Mail,
      title: isZh ? '電子信箱' : 'Email',
      content: 'info@drcarcold.com',
      description: isZh ? '24小時內回覆' : 'Reply within 24 hours',
      action: 'mailto:info@drcarcold.com'
    }
  ]

  const serviceAreas = [
    { name: '台北市', coverage: '100%', response: '30分鐘' },
    { name: '新北市', coverage: '95%', response: '45分鐘' },
    { name: '桃園市', coverage: '90%', response: '60分鐘' },
    { name: '基隆市', coverage: '85%', response: '75分鐘' }
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
              📞 聯絡 <span className="text-blue-600">DrCarCold</span><br />
              <span className="text-2xl text-gray-600">台北汽車冷媒專家 | 立即預約服務</span>
            </>
          ) : (
            <>
              📞 Contact <span className="text-blue-600">DrCarCold</span><br />
              <span className="text-2xl text-gray-600">Taipei Automotive Refrigerant Expert</span>
            </>
          )}
        </h1>
        
        <div className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
          {isZh ? (
            <p>
              🚗 <strong className="text-blue-600">需要汽車冷氣維修服務嗎？</strong>
              立即聯繫台北最專業的汽車冷媒專家！我們提供
              <strong className="text-green-600">R134a、R1234yf冷媒充填</strong>、
              <strong className="text-orange-600">免費估價</strong>、
              <strong className="text-purple-600">24小時緊急服務</strong>。
              30年經驗，值得信賴，全台到府服務，立即預約享優惠！
            </p>
          ) : (
            <p>
              🚗 <strong className="text-blue-600">Need automotive AC repair service?</strong>
              Contact Taipei's most professional automotive refrigerant experts now! 
              We provide R134a, R1234yf refrigerant filling, free quotes, 
              24-hour emergency service. 30 years experience, trustworthy!
            </p>
          )}
        </div>
        
        {/* 快速聯絡按鈕 */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <a 
            href="tel:+886-2-xxxx-xxxx"
            className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
          >
            <Phone className="h-5 w-5" />
            {isZh ? '立即撥打' : 'Call Now'}
          </a>
          <a 
            href="https://line.me/ti/p/@drcarcold"
            className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            {isZh ? 'Line 諮詢' : 'Line Chat'}
          </a>
          <a 
            href="#contact-form"
            className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            {isZh ? '線上預約' : 'Book Online'}
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* 聯絡方式 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {isZh ? '多種聯絡方式' : 'Contact Methods'}
          </h2>
          
          <div className="grid gap-4 mb-8">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <method.icon className="h-6 w-6 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{method.title}</CardTitle>
                      <CardDescription>{method.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-600">{method.content}</span>
                    <a 
                      href={method.action}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                    >
                      {isZh ? '立即聯絡' : 'Contact'}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 營業時間 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {isZh ? '營業時間' : 'Business Hours'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{isZh ? '週一至週五' : 'Mon - Fri'}</span>
                  <span className="font-medium">08:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{isZh ? '週六' : 'Saturday'}</span>
                  <span className="font-medium">09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span>{isZh ? '週日' : 'Sunday'}</span>
                  <span className="font-medium">10:00 - 16:00</span>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between text-red-600">
                    <span>{isZh ? '緊急服務' : 'Emergency'}</span>
                    <span className="font-medium">24/7</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 服務區域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                {isZh ? '服務區域' : 'Service Areas'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{area.name}</div>
                      <div className="text-sm text-gray-600">
                        {isZh ? '覆蓋率' : 'Coverage'}: {area.coverage}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">
                        {isZh ? '回應時間' : 'Response'}
                      </div>
                      <div className="text-sm">{area.response}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 聯絡表單 */}
        <div>
          <h2 className="text-2xl font-bold mb-6" id="contact-form">
            {isZh ? '線上預約服務' : 'Online Service Booking'}
          </h2>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {isZh ? '🎉 立即預約享優惠' : '🎉 Book Now for Special Offers'}
              </CardTitle>
              <CardDescription>
                {isZh ? '填寫表單預約服務，享受專業汽車冷媒維修' : 'Fill out the form to book professional automotive refrigerant service'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm locale={locale} />
            </CardContent>
          </Card>

          {/* 為什麼選擇我們 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isZh ? '為什麼選擇 DrCarCold？' : 'Why Choose DrCarCold?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: Star, text: isZh ? '30年專業經驗，值得信賴' : '30 years professional experience' },
                  { icon: Phone, text: isZh ? '24小時緊急服務，隨時待命' : '24-hour emergency service' },
                  { icon: MapPin, text: isZh ? '全台到府服務，方便快速' : 'Nationwide mobile service' },
                  { icon: Mail, text: isZh ? '免費估價諮詢，透明收費' : 'Free quotes and transparent pricing' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 