'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    // 導航
    'nav.home': '首頁',
    'nav.products': '產品展示',
    'nav.refrigerant-lookup': '冷媒填充查詢',
    'nav.news': '最新消息',
    'nav.about': '關於我們',
    'nav.contact': '聯絡我們',
    
    // 首頁
    'home.hero.title': '專業汽車冷媒與設備供應商',
    'home.hero.subtitle': '車冷博士提供高品質汽車冷媒、保養設備及相關工具',
    'home.hero.cta.products': '瀏覽產品',
    'home.hero.cta.contact': '聯絡我們',
    'home.lookup.title': '汽車冷媒填充查詢',
    'home.lookup.subtitle': '快速查詢各品牌車型的冷媒充填量資訊',
    'home.lookup.regular': '一般車輛',
    'home.lookup.regular.desc': 'Toyota、Honda、Nissan 等品牌',
    'home.lookup.truck': '大型車輛',
    'home.lookup.truck.desc': 'Hino、三菱扶桑等卡車品牌',
    'home.lookup.malaysia': '馬來西亞車',
    'home.lookup.malaysia.desc': 'Proton、Perodua 等品牌',
    'home.lookup.cta': '立即查詢',
    'home.why.title': '為什麼選擇車冷博士',
    'home.why.subtitle': '我們是專業的汽車冷媒與保養設備供應商，提供最優質的產品給汽車維修業者',
    'home.feature.equipment': '優質產品',
    'home.feature.equipment.desc': '提供各式汽車冷媒、冷凍油、保養設備等專業產品',
    'home.feature.support': '技術諮詢',
    'home.feature.support.desc': '專業團隊提供產品選購建議與技術支援',
    'home.feature.customer': '庫存充足',
    'home.feature.customer.desc': '完整的產品線與充足庫存，快速供貨',
    'home.cta.title': '需要汽車冷媒或保養設備嗎？',
    'home.cta.subtitle': '立即聯絡我們，讓車冷博士為您提供最優質的產品',
    'home.cta.button': '立即諮詢',
    
    // 產品頁面
    'products.title': '產品展示',
    'products.subtitle': '我們提供各式汽車冷媒、保養設備及相關工具',
    'products.category.machine': '1700F冷氣系統保養機',
    'products.category.refrigerant': '巨化 JH R-134A 環保冷媒',
    'products.category.connector': '快速接頭',
    'products.category.oil': '冷凍機油/其他油品',
    'products.category.tools': '工具/耗品零件',
    'products.category.pipe': '冷媒管/錶組',
    'products.category.other': '其他相關輔助工具',
    
    // 冷媒查詢頁面
    'lookup.title': '汽車冷媒填充查詢系統',
    'lookup.subtitle': '快速查詢各品牌車型的冷媒充填量資訊',
    'lookup.category.regular': '一般車輛冷媒填充',
    'lookup.category.regular.desc': '各品牌汽車冷媒充填資訊',
    'lookup.category.truck': '大型車冷媒填充',
    'lookup.category.truck.desc': '卡車、巴士等大型車輛',
    'lookup.category.malaysia': '馬來西亞車冷媒填充',
    'lookup.category.malaysia.desc': '馬來西亞品牌車輛',
    'lookup.search.title': '查詢車輛冷媒資訊',
    'lookup.search.brand': '選擇品牌',
    'lookup.search.brand.placeholder': '請選擇品牌',
    'lookup.search.model': '搜尋車型',
    'lookup.search.model.placeholder': '輸入車型名稱',
    'lookup.search.button': '搜尋',
    'lookup.search.loading': '搜尋中...',
    'lookup.results.title': '搜尋結果',
    'lookup.results.model': '車型',
    'lookup.results.year': '年份',
    'lookup.results.engine': '引擎型式',
    'lookup.results.refrigerant': '冷媒種類',
    'lookup.results.amount': '充填量',
    'lookup.results.oil': '冷凍油',
    'lookup.results.notes': '備註',
    'lookup.no.results': '請選擇品牌或輸入車型進行搜尋',
    
    // 關於我們頁面
    'about.title': '關於車冷博士',
    'about.subtitle': '專業汽車冷媒與保養設備供應商，為汽車維修業者提供最優質的產品',
    'about.intro.title': '公司簡介',
    'about.intro.p1': '車冷博士成立於台中市龍井區，是一家專業從事汽車冷媒及冷媒保養維修設備銷售的公司。我們致力於為汽車維修業者提供高品質的冷媒產品和專業設備。',
    'about.intro.p2': '多年來，我們不斷累積經驗，建立了完整的汽車冷媒產品線，包括各種規格的R134a、R1234yf環保冷媒，以及專業的冷媒回收充填機、檢測設備、快速接頭、冷凍油等相關產品。',
    'about.intro.p3': '我們的客戶遍布全台各地的汽車維修廠、保養廠和汽車經銷商。憑藉優質的產品品質和專業的技術支援，贏得了業界的信賴與好評。',
    'about.intro.p4': '車冷博士不僅是產品供應商，更是您在汽車冷媒領域的專業夥伴。我們提供完整的產品諮詢服務，協助您選擇最適合的設備和冷媒產品。',
    'about.values.title': '我們的價值觀',
    'about.values.subtitle': '這些核心價值觀指引著我們的每一個決策和行動',
    'about.value.quality': '品質第一',
    'about.value.quality.desc': '我們堅持提供最高品質的汽車冷媒和專業設備，所有產品均通過嚴格檢驗。',
    'about.value.eco': '致力環保',
    'about.value.eco.desc': '我們深知冷媒對環境的影響，提供符合環保標準的R134a和R1234yf等新型冷媒。',
    'about.value.customer': '客戶至上',
    'about.value.customer.desc': '以客戶需求為中心，提供專業的產品諮詢和技術支援，協助您選擇最適合的設備。',
    'about.value.professional': '專業設備',
    'about.value.professional.desc': '提供全方位的汽車冷媒保養設備，從回收充填機到各式工具，滿足專業維修廠需求。',
    'about.products.title': '我們的產品',
    'about.products.equipment': '汽車冷媒保養設備',
    'about.products.refrigerant': '汽車冷媒產品',
    'about.products.tools': '配件與工具',
    'about.cta.title': '成為我們的客戶',
    'about.cta.subtitle': '選擇車冷博士，獲得最優質的汽車冷媒產品與專業設備',
    
    // 聯絡我們頁面
    'contact.title': '聯絡我們',
    'contact.subtitle': '歡迎與我們聯繫，我們將竭誠為您服務',
    'contact.info.title': '聯絡資訊',
    'contact.info.subtitle': '您可以透過以下方式聯絡我們',
    'contact.address': '地址',
    'contact.address.value': '台灣台中市龍井區忠和里海尾路278巷33弄8號',
    'contact.phone': '電話',
    'contact.phone.value': '04-26301915',
    'contact.fax': '傳真：04-26301510',
    'contact.mobile': '手機',
    'contact.mobile.value': '0903-049150',
    'contact.line': 'LINE ID',
    'contact.line.value': '0903049150',
    'contact.email': 'Email',
    'contact.email.value': 'hongshun.TW@gmail.com',
    'contact.hours': '營業時間',
    'contact.hours.weekday': '週一至週五',
    'contact.hours.time': '上午 09:30 - 下午 05:30',
    'contact.form.title': '傳送訊息',
    'contact.form.subtitle': '請填寫以下表單，我們會盡快回覆您',
    'contact.form.name': '姓名',
    'contact.form.email': '電子郵件',
    'contact.form.phone': '電話',
    'contact.form.subject': '主旨',
    'contact.form.message': '訊息內容',
    'contact.form.send': '發送訊息',
    'contact.form.sending': '發送中...',
    'contact.form.success': '感謝您的來信，我們會盡快回覆您！',
    
    // Footer
    'footer.quickLinks': '快速連結',
    'footer.contact': '聯絡資訊',
    'footer.hours': '營業時間：週一至週五 09:30 - 17:30',
    'footer.copyright': '© 2024 車冷博士. 版權所有.',
    
    // SEO
    'seo.title.suffix': ' | 車冷博士 - 專業汽車冷媒與設備供應商',
    'seo.description.default': '車冷博士提供專業的汽車冷媒、冷媒填充設備、冷凍油及相關工具銷售。提供各品牌汽車、大型車輛、馬來西亞車的冷媒資訊查詢服務。',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.refrigerant-lookup': 'Refrigerant Lookup',
    'nav.news': 'News',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    
    // Homepage
    'home.hero.title': 'Professional Automotive Refrigerant & Equipment Supplier',
    'home.hero.subtitle': 'Dr. Car Cold provides high-quality automotive refrigerants, maintenance equipment and tools',
    'home.hero.cta.products': 'View Products',
    'home.hero.cta.contact': 'Contact Us',
    'home.lookup.title': 'Automotive Refrigerant Lookup',
    'home.lookup.subtitle': 'Quick search for refrigerant capacity information across vehicle brands',
    'home.lookup.regular': 'Regular Vehicles',
    'home.lookup.regular.desc': 'Toyota, Honda, Nissan and more',
    'home.lookup.truck': 'Heavy Vehicles',
    'home.lookup.truck.desc': 'Hino, Mitsubishi Fuso trucks',
    'home.lookup.malaysia': 'Malaysian Vehicles',
    'home.lookup.malaysia.desc': 'Proton, Perodua brands',
    'home.lookup.cta': 'Search Now',
    'home.why.title': 'Why Choose Dr. Car Cold',
    'home.why.subtitle': 'We are professional automotive refrigerant and maintenance equipment suppliers, providing quality products to auto repair shops',
    'home.feature.equipment': 'Quality Products',
    'home.feature.equipment.desc': 'Various automotive refrigerants, oils, maintenance equipment and professional products',
    'home.feature.support': 'Technical Consultation',
    'home.feature.support.desc': 'Professional team provides product selection advice and technical support',
    'home.feature.customer': 'Sufficient Stock',
    'home.feature.customer.desc': 'Complete product line with sufficient inventory for quick delivery',
    'home.cta.title': 'Need Automotive Refrigerant or Equipment?',
    'home.cta.subtitle': 'Contact us now for the best quality products from Dr. Car Cold',
    'home.cta.button': 'Get Consultation',
    
    // Products Page
    'products.title': 'Products',
    'products.subtitle': 'We provide various automotive refrigerants, maintenance equipment and related tools',
    'products.category.machine': '1700F A/C System Maintenance Machine',
    'products.category.refrigerant': 'Juhua JH R-134A Eco-Friendly Refrigerant',
    'products.category.connector': 'Quick Connectors',
    'products.category.oil': 'Refrigeration Oil/Other Oils',
    'products.category.tools': 'Tools/Consumable Parts',
    'products.category.pipe': 'Refrigerant Pipes/Gauge Sets',
    'products.category.other': 'Other Related Auxiliary Tools',
    
    // Refrigerant Lookup Page
    'lookup.title': 'Automotive Refrigerant Lookup System',
    'lookup.subtitle': 'Quick search for refrigerant capacity information',
    'lookup.category.regular': 'Regular Vehicle Refrigerant',
    'lookup.category.regular.desc': 'Car brands refrigerant information',
    'lookup.category.truck': 'Heavy Vehicle Refrigerant',
    'lookup.category.truck.desc': 'Trucks and buses',
    'lookup.category.malaysia': 'Malaysian Vehicle Refrigerant',
    'lookup.category.malaysia.desc': 'Malaysian vehicle brands',
    'lookup.search.title': 'Search Vehicle Refrigerant Info',
    'lookup.search.brand': 'Select Brand',
    'lookup.search.brand.placeholder': 'Please select a brand',
    'lookup.search.model': 'Search Model',
    'lookup.search.model.placeholder': 'Enter model name',
    'lookup.search.button': 'Search',
    'lookup.search.loading': 'Searching...',
    'lookup.results.title': 'Search Results',
    'lookup.results.model': 'Model',
    'lookup.results.year': 'Year',
    'lookup.results.engine': 'Engine Type',
    'lookup.results.refrigerant': 'Refrigerant Type',
    'lookup.results.amount': 'Fill Amount',
    'lookup.results.oil': 'Refrigerant Oil',
    'lookup.results.notes': 'Notes',
    'lookup.no.results': 'Please select brand or enter model to search',
    
    // About Us Page
    'about.title': 'About Dr. Car Cold',
    'about.subtitle': 'Professional automotive refrigerant and maintenance equipment supplier, providing quality products to auto repair shops',
    'about.intro.title': 'Company Introduction',
    'about.intro.p1': 'Dr. Car Cold, established in Longjing District, Taichung City, is a professional company specializing in automotive refrigerants and refrigerant maintenance equipment sales. We are committed to providing high-quality refrigerant products and professional equipment to automotive repair shops.',
    'about.intro.p2': 'Over the years, we have continuously accumulated experience and established a complete automotive refrigerant product line, including various specifications of R134a, R1234yf eco-friendly refrigerants, as well as professional refrigerant recovery and filling machines, testing equipment, quick connectors, refrigeration oils and other related products.',
    'about.intro.p3': 'Our customers span across automotive repair shops, maintenance shops and car dealers throughout Taiwan. With high-quality products and professional technical support, we have earned the trust and praise of the industry.',
    'about.intro.p4': 'Dr. Car Cold is not just a product supplier, but also your professional partner in the automotive refrigerant field. We provide complete product consultation services to help you choose the most suitable equipment and refrigerant products.',
    'about.values.title': 'Our Values',
    'about.values.subtitle': 'These core values guide our every decision and action',
    'about.value.quality': 'Quality First',
    'about.value.quality.desc': 'We insist on providing the highest quality automotive refrigerants and professional equipment, all products pass strict inspection.',
    'about.value.eco': 'Environmental Commitment',
    'about.value.eco.desc': 'We understand the environmental impact of refrigerants and provide eco-friendly standard R134a and R1234yf new refrigerants.',
    'about.value.customer': 'Customer First',
    'about.value.customer.desc': 'Customer-centric, providing professional product consultation and technical support to help you choose the most suitable equipment.',
    'about.value.professional': 'Professional Equipment',
    'about.value.professional.desc': 'Providing comprehensive automotive refrigerant maintenance equipment, from recovery filling machines to various tools, meeting professional repair shop needs.',
    'about.products.title': 'Our Products',
    'about.products.equipment': 'Automotive Refrigerant Maintenance Equipment',
    'about.products.refrigerant': 'Automotive Refrigerant Products',
    'about.products.tools': 'Accessories & Tools',
    'about.cta.title': 'Become Our Customer',
    'about.cta.subtitle': 'Choose Dr. Car Cold for the best quality automotive refrigerant products and professional equipment',
    
    // Contact Page
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Welcome to contact us, we will serve you wholeheartedly',
    'contact.info.title': 'Contact Information',
    'contact.info.subtitle': 'You can contact us through the following methods',
    'contact.address': 'Address',
    'contact.address.value': 'No. 8, Alley 33, Lane 278, Haiwei Rd., Zhonghe Village, Longjing Dist., Taichung City, Taiwan',
    'contact.phone': 'Phone',
    'contact.phone.value': '04-26301915',
    'contact.fax': 'Fax: 04-26301510',
    'contact.mobile': 'Mobile',
    'contact.mobile.value': '0903-049150',
    'contact.line': 'LINE ID',
    'contact.line.value': '0903049150',
    'contact.email': 'Email',
    'contact.email.value': 'hongshun.TW@gmail.com',
    'contact.hours': 'Business Hours',
    'contact.hours.weekday': 'Monday to Friday',
    'contact.hours.time': '09:30 AM - 05:30 PM',
    'contact.form.title': 'Send Message',
    'contact.form.subtitle': 'Please fill out the form below and we will reply as soon as possible',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.phone': 'Phone',
    'contact.form.subject': 'Subject',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send Message',
    'contact.form.sending': 'Sending...',
    'contact.form.success': 'Thank you for your message, we will reply as soon as possible!',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.contact': 'Contact Info',
    'footer.hours': 'Business Hours: Monday-Friday 09:30 - 17:30',
    'footer.copyright': '© 2024 Dr. Car Cold. All rights reserved.',
    
    // SEO
    'seo.title.suffix': ' | Dr. Car Cold - Professional Automotive Refrigerant & Equipment Supplier',
    'seo.description.default': 'Dr. Car Cold provides professional automotive refrigerants, refrigerant filling equipment, refrigeration oils and related tools. We offer refrigerant information lookup for all vehicle brands, heavy vehicles, and Malaysian vehicles.',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
      setLanguage(savedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['zh']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 