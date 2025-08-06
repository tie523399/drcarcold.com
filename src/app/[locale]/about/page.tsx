import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEOBanner } from '@/components/seo/seo-banner'
import { SimpleGoogleMap } from '@/components/google-map-simple'
import { 
  Users, 
  Award, 
  Wrench, 
  ShieldCheck, 
  Globe, 
  Phone,
  Mail,
  MapPin,
  Car,
  Snowflake,
  CheckCircle,
  Target
} from 'lucide-react'

export const metadata: Metadata = {
  title: '關於車冷博士 | 台中汽車冷媒專業供應商 | 9年專業經驗值得信賴',
  description: '深入了解車冷博士專業歷程！2015年成立於台中龍井，專業汽車冷媒與設備供應商。秉持品質第一、服務至上理念，與全台汽車維修廠建立長期穩定合作關係，提供R134a、R1234yf等優質產品。',
  keywords: '關於車冷博士,公司介紹,台中汽車冷媒,專業供應商,品質第一,服務至上,維修廠合作,R134a,R1234yf,龍井,2015年成立'
}

const companyFeatures = [
  {
    icon: <Award className="h-8 w-8 text-yellow-500" />,
    title: '專業資質',
    description: '多年汽車冷媒行業經驗，專業技術團隊'
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-green-500" />,
    title: '品質保證',
    description: '所有產品均符合國際標準，品質可靠'
  },
  {
    icon: <Globe className="h-8 w-8 text-blue-500" />,
    title: '全球供應',
    description: '涵蓋全球主要汽車品牌，規格齊全'
  },
  {
    icon: <Users className="h-8 w-8 text-purple-500" />,
    title: '專業團隊',
    description: '經驗豐富的技術支援和客服團隊'
  }
]

const services = [
  '汽車冷媒規格查詢',
  'R134a 冷媒供應',
  'R1234yf 環保冷媒',
  '冷凍油配套服務',
  '技術諮詢支援',
  '批發零售服務'
]

const stats = [
  { label: '服務年數', value: '10+', icon: <Award className="h-6 w-6" /> },
  { label: '車型覆蓋', value: '2000+', icon: <Car className="h-6 w-6" /> },
  { label: '品牌支援', value: '50+', icon: <Globe className="h-6 w-6" /> },
  { label: '客戶滿意度', value: '98%', icon: <CheckCircle className="h-6 w-6" /> }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Snowflake className="h-8 w-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-600">車冷博士</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            專業汽車冷媒專家
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            致力於提供最專業的汽車冷媒解決方案，為全球汽車維修行業提供優質的產品和服務。
            我們擁有豐富的經驗和專業的技術團隊，是您值得信賴的合作夥伴。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              專業可靠
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <ShieldCheck className="h-4 w-4 mr-2" />
              品質保證
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              全球服務
            </Badge>
          </div>
        </div>
      </section>

      {/* SEO增強橫幅 */}
      <SEOBanner type="page-top" variant="compact" />

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              為什麼選擇車冷博士
            </h2>
            <p className="text-xl text-gray-600">
              我們的專業優勢讓您的業務更成功
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                我們的服務
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                提供全方位的汽車冷媒解決方案，從規格查詢到產品供應，
                我們都能為您提供專業的服務和支援。
              </p>
              <div className="grid grid-cols-1 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-blue-50">
                <Snowflake className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold mb-2">R134a 冷媒</h3>
                <p className="text-sm text-gray-600">傳統冷媒規格完整支援</p>
              </Card>
              <Card className="p-6 bg-green-50">
                <ShieldCheck className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold mb-2">R1234yf 冷媒</h3>
                <p className="text-sm text-gray-600">環保新型冷媒解決方案</p>
              </Card>
              <Card className="p-6 bg-purple-50">
                <Wrench className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold mb-2">技術支援</h3>
                <p className="text-sm text-gray-600">專業技術諮詢服務</p>
              </Card>
              <Card className="p-6 bg-yellow-50">
                <Globe className="h-8 w-8 text-yellow-600 mb-4" />
                <h3 className="font-semibold mb-2">全球配送</h3>
                <p className="text-sm text-gray-600">快速可靠的物流服務</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Company Mission */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            我們的使命
          </h2>
          <p className="text-xl leading-relaxed">
            成為全球汽車冷媒行業的領導者，透過創新的技術和卓越的服務，
            為客戶提供最優質的汽車冷媒解決方案，推動行業的可持續發展，
            讓每一台汽車都能享受到最專業的冷媒服務。
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              聯絡我們
            </h2>
            <p className="text-xl text-gray-600">
              有任何問題或需求，歡迎隨時與我們聯繫
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <Phone className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">電話聯絡</h3>
              <p className="text-gray-600">+886-2-1234-5678</p>
              <p className="text-sm text-gray-500 mt-2">週一至週五 9:00-18:00</p>
            </Card>

            <Card className="text-center p-8">
              <Mail className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">電子郵件</h3>
              <p className="text-gray-600">info@drcarcold.com</p>
              <p className="text-sm text-gray-500 mt-2">24小時內回覆</p>
            </Card>

            <Card className="text-center p-8">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">公司地址</h3>
              <p className="text-gray-600">台北市信義區信義路五段</p>
              <p className="text-sm text-gray-500 mt-2">歡迎預約參訪</p>
            </Card>
          </div>
        </div>
      </section>

      {/* 公司位置與聯絡資訊 */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              聯絡我們 & 公司位置
            </h2>
            <p className="text-xl text-gray-600">
              歡迎聯絡車冷博士，我們竭誠為您提供專業服務
            </p>
          </div>
          
          <SimpleGoogleMap showInfo={true} height="500px" />
        </div>
      </section>
    </div>
  )
}