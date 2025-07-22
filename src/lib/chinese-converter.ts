// 繁體中文檢查和轉換工具

// 常見的簡體字到繁體字對照表（部分）
const simplifiedToTraditional: Record<string, string> = {
  // 常用字
  '们': '們', '来': '來', '时': '時', '为': '為', '会': '會',
  '说': '說', '对': '對', '将': '將', '开': '開', '关': '關',
  '进': '進', '这': '這', '过': '過', '还': '還', '经': '經',
  '给': '給', '见': '見', '问': '問', '间': '間', '让': '讓',
  '认': '認', '别': '別', '没': '沒', '发': '發', '当': '當',
  '动': '動', '现': '現', '实': '實', '话': '話', '头': '頭',
  '无': '無', '产': '產', '车': '車', '电': '電', '号': '號',
  '东': '東', '马': '馬', '风': '風', '龙': '龍', '点': '點',
  '业': '業', '资': '資', '价': '價', '尔': '爾', '达': '達',
  '场': '場', '书': '書', '长': '長', '学': '學', '体': '體',
  '机': '機', '国': '國', '从': '從', '后': '後', '应': '應',
  '条': '條', '务': '務', '连': '連', '总': '總', '统': '統',
  '设': '設', '备': '備', '内': '內', '两': '兩', '线': '線',
  '专': '專', '区': '區', '记': '記', '处': '處', '办': '辦',
  '级': '級', '转': '轉', '变': '變', '热': '熱',
  '标': '標', '质': '質', '选': '選',
  '运': '運', '远': '遠', '环': '環', '报': '報', '济': '濟',
  
  // 汽車相關
  '轮': '輪', '驾': '駕', '驶': '駛', '载': '載', '辆': '輛',
  '刹': '剎', '档': '檔', '灯': '燈', '胎': '胎', '钥': '鑰',
  
  // 冷媒相關
  '压': '壓', '温': '溫', '冻': '凍', '凝': '凝', '气': '氣',
  '液': '液', '缩': '縮', '胀': '脹', '阀': '閥', '管': '管',
  
  // 技術相關
  '检': '檢', '测': '測', '维': '維', '修': '修', '护': '護',
  '装': '裝', '换': '換', '调': '調', '试': '試', '验': '驗',
  
  // 業務相關
  '询': '詢', '购': '購', '销': '銷', '营': '營', '库': '庫'
}

// 建立反向對照表（繁體到簡體）
const traditionalToSimplified: Record<string, string> = {}
for (const [simp, trad] of Object.entries(simplifiedToTraditional)) {
  traditionalToSimplified[trad] = simp
}

/**
 * 檢查文本中是否包含簡體字
 * @param text 要檢查的文本
 * @returns 包含簡體字的陣列
 */
export function detectSimplifiedChinese(text: string): string[] {
  const simplifiedChars: string[] = []
  for (const char of text) {
    if (simplifiedToTraditional[char]) {
      simplifiedChars.push(char)
    }
  }
  return [...new Set(simplifiedChars)]
}

/**
 * 將簡體中文轉換為繁體中文
 * @param text 要轉換的文本
 * @returns 轉換後的繁體中文文本
 */
export function convertToTraditional(text: string): string {
  let result = text
  for (const [simp, trad] of Object.entries(simplifiedToTraditional)) {
    result = result.replace(new RegExp(simp, 'g'), trad)
  }
  return result
}

/**
 * 檢查並自動轉換文本為繁體中文
 * @param text 要處理的文本
 * @returns 處理結果
 */
export function ensureTraditionalChinese(text: string): {
  text: string
  hasSimplified: boolean
  simplifiedChars: string[]
  converted: boolean
} {
  const simplifiedChars = detectSimplifiedChinese(text)
  const hasSimplified = simplifiedChars.length > 0
  
  if (hasSimplified) {
    const convertedText = convertToTraditional(text)
    return {
      text: convertedText,
      hasSimplified: true,
      simplifiedChars,
      converted: true
    }
  }
  
  return {
    text,
    hasSimplified: false,
    simplifiedChars: [],
    converted: false
  }
}

/**
 * 驗證文本是否為純繁體中文
 * @param text 要驗證的文本
 * @returns 是否為純繁體中文
 */
export function isTraditionalChinese(text: string): boolean {
  return detectSimplifiedChinese(text).length === 0
}

/**
 * 計算文本的簡體字比例
 * @param text 要分析的文本
 * @returns 簡體字比例（0-1）
 */
export function getSimplifiedRatio(text: string): number {
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  if (chineseChars.length === 0) return 0
  
  const simplifiedCount = chineseChars.filter(char => 
    simplifiedToTraditional[char]
  ).length
  
  return simplifiedCount / chineseChars.length
}

/**
 * 批量轉換文本陣列
 * @param texts 要轉換的文本陣列
 * @returns 轉換後的文本陣列
 */
export function batchConvertToTraditional(texts: string[]): string[] {
  return texts.map(text => convertToTraditional(text))
}

/**
 * 生成轉換報告
 * @param text 原始文本
 * @returns 詳細的轉換報告
 */
export function generateConversionReport(text: string): {
  originalText: string
  convertedText: string
  simplifiedChars: string[]
  simplifiedCount: number
  totalChineseChars: number
  simplifiedRatio: number
  conversionMap: Record<string, string>
} {
  const simplifiedChars = detectSimplifiedChinese(text)
  const convertedText = convertToTraditional(text)
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  
  const conversionMap: Record<string, string> = {}
  simplifiedChars.forEach(char => {
    conversionMap[char] = simplifiedToTraditional[char] || char
  })
  
  return {
    originalText: text,
    convertedText,
    simplifiedChars,
    simplifiedCount: simplifiedChars.length,
    totalChineseChars: chineseChars.length,
    simplifiedRatio: getSimplifiedRatio(text),
    conversionMap
  }
} 