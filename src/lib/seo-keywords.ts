/**
 * 🎯 汽車冷媒 SEO 關鍵字策略庫
 * 
 * 針對台灣汽車冷媒市場的專業SEO關鍵字優化
 */

// 主要關鍵字 - 高搜索量，高競爭度
export const PRIMARY_KEYWORDS = [
  '汽車冷媒',
  '冷氣冷媒',
  '汽車冷氣維修',
  'R134a',
  'R1234yf',
  '冷媒充填',
  '汽車空調維修',
  '冷氣不冷',
  '汽車冷氣保養',
  '冷媒更換'
]

// 長尾關鍵字 - 中等搜索量，較低競爭度，高轉換率
export const LONG_TAIL_KEYWORDS = [
  '汽車冷媒種類比較',
  '汽車冷氣冷媒價格',
  'R134a冷媒充填費用',
  'R1234yf環保冷媒',
  '汽車冷氣冷媒漏氣',
  '冷媒添加劑推薦',
  '汽車冷氣系統清洗',
  '冷氣壓縮機維修',
  '汽車冷氣濾網更換',
  'DIY汽車冷氣維修',
  '汽車冷氣效能提升',
  '夏季汽車保養',
  '電動車冷氣系統',
  '汽車冷氣故障診斷',
  '冷媒壓力檢測'
]

// 地區關鍵字 - 結合地理位置
export const LOCAL_KEYWORDS = [
  '台北汽車冷氣維修',
  '新北冷媒充填',
  '桃園汽車保養',
  '台中冷氣維修',
  '台南汽車冷媒',
  '高雄冷氣保養',
  '新竹汽車維修',
  '基隆冷氣充填',
  '宜蘭汽車保養',
  '花蓮冷氣維修'
]

// 品牌車款關鍵字
export const BRAND_KEYWORDS = [
  'Toyota冷氣維修',
  'Honda汽車冷媒',
  'Nissan冷氣保養',
  'BMW冷媒充填',
  'Mercedes冷氣系統',
  'Audi汽車冷媒',
  'Lexus冷氣維修',
  'Mazda冷媒更換',
  'Hyundai冷氣保養',
  'Ford汽車冷媒',
  'Tesla電動車冷氣',
  'Volvo冷氣系統'
]

// 技術關鍵字
export const TECHNICAL_KEYWORDS = [
  '冷媒回收機',
  '冷媒檢漏儀',
  '冷氣真空泵',
  '冷媒壓力表',
  '冷氣壓縮機油',
  '膨脹閥更換',
  '冷凝器清洗',
  '蒸發器維修',
  '冷氣管路清洗',
  '冷媒純度檢測',
  'PAG冷凍油',
  '冷氣系統檢測'
]

// 問題導向關鍵字
export const PROBLEM_KEYWORDS = [
  '汽車冷氣不涼',
  '冷氣有異味',
  '冷氣噪音大',
  '冷氣風量小',
  '冷氣不冷怎麼辦',
  '冷媒漏光症狀',
  '壓縮機不運轉',
  '冷氣開關壞掉',
  '冷氣溫度不穩',
  '冷氣耗電增加',
  '冷氣管路結冰',
  '冷氣系統故障'
]

// 季節性關鍵字
export const SEASONAL_KEYWORDS = [
  '夏天汽車冷氣',
  '冬季汽車保養',
  '梅雨季冷氣除濕',
  '高溫冷氣保養',
  '換季汽車檢查',
  '夏季出遊準備',
  '炎熱天氣冷氣',
  '冷氣夏季使用',
  '高溫下冷氣效能',
  '夏日行車舒適'
]

// 價格相關關鍵字
export const PRICE_KEYWORDS = [
  '汽車冷媒價格',
  '冷氣維修費用',
  '冷媒充填多少錢',
  '冷氣保養價錢',
  '便宜冷媒哪裡買',
  '冷氣維修報價',
  '冷媒更換成本',
  '汽車保養預算',
  '冷氣系統維修價格',
  'DIY冷媒費用'
]

// 競爭對手分析關鍵字
export const COMPETITOR_KEYWORDS = [
  '汽車冷媒推薦',
  '最好的冷媒品牌',
  '冷媒品質比較',
  '專業冷媒廠商',
  '可靠的維修廠',
  '優質冷氣保養',
  '信譽良好車廠',
  '專業汽車技師',
  '認證維修中心',
  '保固維修服務'
]

// 關鍵字密度建議
export const KEYWORD_DENSITY = {
  PRIMARY: 2.5, // 2-3%
  LONG_TAIL: 1.5, // 1-2%
  LOCAL: 1.0, // 0.5-1%
  BRAND: 0.8, // 0.5-1%
  TECHNICAL: 1.2, // 1-1.5%
  PROBLEM: 1.0, // 0.5-1%
}

// SEO 頁面標題模板
export const TITLE_TEMPLATES = {
  HOME: '{品牌} - 專業汽車冷媒 | {主關鍵字} | {地區}第一品牌',
  PRODUCT: '{產品名稱} - {品牌} | 專業{類別} | 品質保證',
  NEWS: '{標題} | {品牌}汽車冷媒專業資訊 | 最新技術分享',
  CATEGORY: '{類別} - {品牌} | 專業{主關鍵字}解決方案',
  LOCATION: '{地區}{服務} - {品牌} | 專業{主關鍵字}服務'
}

// Meta Description 模板
export const META_TEMPLATES = {
  HOME: '【{品牌}】台灣專業{主關鍵字}領導品牌，提供{服務1}、{服務2}、{服務3}。{年數}年經驗，{特色}，免費諮詢專線{電話}',
  PRODUCT: '【{產品名稱}】{品牌}專業{類別}，{特點1}、{特點2}、{特點3}。品質保證，專業安裝，全台服務。立即了解優惠價格！',
  NEWS: '{摘要} | {品牌}專業{領域}資訊分享，提供最新技術、維修技巧、保養知識。專業團隊為您解答所有問題。',
  CATEGORY: '{品牌}{類別}專業服務，包含{項目1}、{項目2}、{項目3}。經驗豐富技師團隊，品質保證，價格合理。免費估價諮詢。'
}

// 結構化數據關鍵字
export const SCHEMA_KEYWORDS = {
  BUSINESS_TYPE: 'AutomotiveService',
  SERVICE_TYPES: [
    'AutoRepair',
    'AutomotiveMaintenance', 
    'AirConditioningService',
    'RefrigerantService'
  ],
  PRODUCTS: [
    'AutomotiveRefrigerant',
    'R134aRefrigerant', 
    'R1234yfRefrigerant',
    'ACSystemParts'
  ]
}

// 內部連結錨文本
export const INTERNAL_LINK_ANCHORS = [
  '汽車冷媒專業服務',
  '冷氣系統維修',
  '冷媒充填服務',
  'R134a冷媒',
  'R1234yf環保冷媒',
  '汽車冷氣保養',
  '專業維修團隊',
  '冷媒品質保證',
  '快速維修服務',
  '全台服務據點'
]

// 圖片 Alt 文字模板
export const IMAGE_ALT_TEMPLATES = {
  PRODUCT: '{品牌} {產品名稱} - 專業{類別} {型號}',
  SERVICE: '{服務名稱} - {品牌}專業{領域}服務',
  TEAM: '{品牌}專業{領域}技師團隊',
  FACILITY: '{品牌}{設施}專業維修設備',
  PROCESS: '{服務流程} - {品牌}專業{服務}步驟'
}

// 內容主題建議
export const CONTENT_TOPICS = [
  '汽車冷媒種類完整指南',
  'R134a vs R1234yf 詳細比較',
  '汽車冷氣系統維修步驟',
  '冷媒充填注意事項',
  '如何判斷冷媒不足',
  '汽車冷氣保養週期',
  '環保冷媒趨勢分析',
  '夏季汽車冷氣使用技巧',
  '冷氣故障常見原因',
  '選擇冷媒維修廠指南'
]

// 地理定位SEO
export const GEO_TARGETING = {
  TAIWAN_CITIES: [
    '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
    '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣',
    '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣',
    '澎湖縣', '金門縣', '連江縣'
  ],
  SERVICE_AREAS: [
    '大台北地區', '桃竹苗地區', '中彰投地區', '雲嘉南地區',
    '高屏地區', '宜花東地區', '離島地區'
  ]
}

/**
 * 根據頁面類型獲取相關關鍵字
 */
export function getKeywordsForPage(pageType: string): string[] {
  const baseKeywords = [...PRIMARY_KEYWORDS]
  
  switch (pageType) {
    case 'home':
      return [...baseKeywords, ...LONG_TAIL_KEYWORDS.slice(0, 5), ...LOCAL_KEYWORDS.slice(0, 3)]
    
    case 'products':
      return [...baseKeywords, ...TECHNICAL_KEYWORDS, ...BRAND_KEYWORDS.slice(0, 5)]
    
    case 'news':
      return [...baseKeywords, ...PROBLEM_KEYWORDS, ...SEASONAL_KEYWORDS.slice(0, 3)]
    
    case 'services':
      return [...baseKeywords, ...LONG_TAIL_KEYWORDS, ...PRICE_KEYWORDS.slice(0, 3)]
    
    case 'about':
      return [...baseKeywords, ...COMPETITOR_KEYWORDS, ...LOCAL_KEYWORDS.slice(0, 5)]
    
    default:
      return baseKeywords
  }
}

/**
 * 生成 SEO 優化的標題
 */
export function generateSEOTitle(
  template: string, 
  data: Record<string, string>
): string {
  let title = template
  
  Object.entries(data).forEach(([key, value]) => {
    title = title.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  
  // 確保標題長度不超過60字符
  if (title.length > 60) {
    title = title.substring(0, 57) + '...'
  }
  
  return title
}

/**
 * 生成 SEO 優化的描述
 */
export function generateSEODescription(
  template: string,
  data: Record<string, string>
): string {
  let description = template
  
  Object.entries(data).forEach(([key, value]) => {
    description = description.replace(new RegExp(`{${key}}`, 'g'), value)
  })
  
  // 確保描述長度在150-160字符之間
  if (description.length > 160) {
    description = description.substring(0, 157) + '...'
  }
  
  return description
}

/**
 * 檢查關鍵字密度
 */
export function checkKeywordDensity(content: string, keyword: string): number {
  const totalWords = content.split(/\s+/).length
  const keywordCount = (content.match(new RegExp(keyword, 'gi')) || []).length
  
  return (keywordCount / totalWords) * 100
}

/**
 * 獲取相關關鍵字建議
 */
export function getRelatedKeywords(mainKeyword: string): string[] {
  const related: string[] = []
  
  // 從所有關鍵字庫中尋找相關的
  const allKeywords = [
    ...PRIMARY_KEYWORDS,
    ...LONG_TAIL_KEYWORDS,
    ...TECHNICAL_KEYWORDS,
    ...PROBLEM_KEYWORDS
  ]
  
  const mainTerms = mainKeyword.toLowerCase().split(/\s+/)
  
  allKeywords.forEach(keyword => {
    const keywordTerms = keyword.toLowerCase().split(/\s+/)
    const hasCommonTerm = mainTerms.some(term => 
      keywordTerms.some(kTerm => kTerm.includes(term) || term.includes(kTerm))
    )
    
    if (hasCommonTerm && keyword !== mainKeyword) {
      related.push(keyword)
    }
  })
  
  return related.slice(0, 10) // 返回前10個相關關鍵字
} 