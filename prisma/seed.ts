import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 創建管理員用戶 - 使用環境變數
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@drcarcold.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  
  const hashedPassword = await bcrypt.hash(adminPassword, 10)
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: '系統管理員',
      role: 'ADMIN'
    }
  })

  // 創建新的商品分類
  const categories = [
    {
      name: '1700F冷氣系統保養機',
      nameEn: '1700F AC System Maintenance Machine',
      slug: 'ac-maintenance-machine',
      description: '專業級冷氣系統保養維修設備',
      image: '/images/categories/ac-machine.jpg'
    },
    {
      name: '巨化 JH R-134A 環保冷媒',
      nameEn: 'JH R-134A Eco-Friendly Refrigerant',
      slug: 'r134a-refrigerant',
      description: '高品質環保汽車冷媒',
      image: '/images/categories/refrigerant.jpg'
    },
    {
      name: '快速接頭',
      nameEn: 'Quick Couplers',
      slug: 'quick-couplers',
      description: '各式快速接頭與轉接頭',
      image: '/images/categories/couplers.jpg'
    },
    {
      name: '冷凍機油 / 其他油品',
      nameEn: 'Refrigeration Oil / Other Oils',
      slug: 'oils',
      description: '專業冷凍機油與相關油品',
      image: '/images/categories/oils.jpg'
    },
    {
      name: '工具 / 耗品零件',
      nameEn: 'Tools / Consumables',
      slug: 'tools-consumables',
      description: '維修工具與耗材零件',
      image: '/images/categories/tools.jpg'
    },
    {
      name: '冷媒管 / 錶組',
      nameEn: 'Refrigerant Hoses / Gauge Sets',
      slug: 'hoses-gauges',
      description: '冷媒管路與壓力錶組',
      image: '/images/categories/gauges.jpg'
    },
    {
      name: '其他相關輔助工具',
      nameEn: 'Other Auxiliary Tools',
      slug: 'auxiliary-tools',
      description: '其他專業輔助工具',
      image: '/images/categories/auxiliary.jpg'
    }
  ]

  // 刪除現有產品和分類
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})

  // 創建新分類
  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image
      }
    })
    createdCategories.push(created)
  }

  console.log({ categories: createdCategories })

  // 創建示範產品
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: '1700F 冷媒回收充填機',
        slug: 'refrigerant-recovery-machine-1700f',
        description: '專業汽車冷媒回收充填機，適用於各種車型的冷媒系統保養',
        categoryId: createdCategories[0].id,
        price: 88000,
        images: JSON.stringify([]),
        features: JSON.stringify(['自動回收', '精準充填', '真空測試', '電子秤計量']),
        specifications: JSON.stringify({
          '型號': '1700F',
          '適用冷媒': 'R134a / R1234yf',
          '回收速度': '200g/min',
          '充填精度': '±5g',
          '電源': '110V/220V',
        }),
        stock: 5,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: '巨化 R-134a 汽車冷媒 13.6kg',
        slug: 'jh-r134a-refrigerant-13kg',
        description: '高品質汽車專用環保冷媒，純度99.9%以上',
        categoryId: createdCategories[1].id,
        price: 2800,
        images: JSON.stringify([]),
        features: JSON.stringify(['純度99.9%', '環保認證', '原廠品質', '附安全閥']),
        specifications: JSON.stringify({
          '品牌': '巨化 JH',
          '型號': 'R-134a',
          '容量': '13.6kg',
          '純度': '99.9%',
          '包裝': '鋼瓶',
        }),
        stock: 50,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: '快速接頭組 (高低壓)',
        slug: 'quick-coupler-set',
        description: '汽車冷媒系統專用快速接頭，高低壓一組',
        categoryId: createdCategories[2].id,
        price: 650,
        images: JSON.stringify([]),
        features: JSON.stringify(['防漏設計', '耐高壓', '快速連接', '通用規格']),
        specifications: JSON.stringify({
          '材質': '黃銅',
          '規格': 'R134a標準',
          '耐壓': '600PSI',
          '組合': '高壓+低壓',
        }),
        stock: 100,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'PAG 46 冷凍油 250ml',
        slug: 'pag-46-oil-250ml',
        description: '汽車冷媒系統專用冷凍油，適用於R134a/R1234yf系統',
        categoryId: createdCategories[3].id,
        price: 380,
        images: JSON.stringify([]),
        features: JSON.stringify(['高潤滑性', '防腐蝕', '相容性佳', '原廠規格']),
        specifications: JSON.stringify({
          '類型': 'PAG 46',
          '容量': '250ml',
          '適用': 'R134a/R1234yf',
          '黏度': 'ISO 46',
        }),
        stock: 80,
        isActive: true,
      },
    }),
  ])

  console.log({ products })

  // 刪除現有冷媒
  await prisma.refrigerant.deleteMany({})

  // 創建冷媒資料
  const refrigerants = await Promise.all([
    prisma.refrigerant.create({
      data: {
        name: 'R-410A',
        code: 'R410A',
        type: 'HFC',
        gwp: 2088,
        odp: 0,
        boilingPoint: -51.4,
        criticalTemp: 71.3,
        properties: JSON.stringify({
          chemicalFormula: 'CH2F2/CHF2CF3',
          molecularWeight: 72.6,
          flammability: 'A1 (不可燃)',
        }),
        applications: JSON.stringify(['家用空調', '商用空調', '熱泵']),
        safety: JSON.stringify({
          classification: 'A1',
          precautions: ['避免吸入', '保持通風', '穿戴防護裝備'],
          firstAid: '吸入過量時移至通風處',
          storage: '存放於陰涼乾燥處',
        }),
        isActive: true,
      },
    }),
    prisma.refrigerant.create({
      data: {
        name: 'R-32',
        code: 'R32',
        type: 'HFC',
        gwp: 675,
        odp: 0,
        boilingPoint: -51.7,
        criticalTemp: 78.1,
        properties: JSON.stringify({
          chemicalFormula: 'CH2F2',
          molecularWeight: 52.0,
          flammability: 'A2L (微燃)',
        }),
        applications: JSON.stringify(['家用空調', '商用空調']),
        safety: JSON.stringify({
          classification: 'A2L',
          precautions: ['避免明火', '保持通風', '使用防爆設備'],
          firstAid: '吸入過量時移至通風處',
          storage: '遠離火源，存放於通風處',
        }),
        isActive: true,
      },
    }),
  ])

  console.log({ refrigerants })

  // 刪除現有新聞
  await prisma.news.deleteMany({})

  // 創建新聞文章
  const news = await Promise.all([
    prisma.news.create({
      data: {
        title: '2024年最新環保冷媒規範解析',
        slug: '2024-eco-refrigerant-regulations',
        content: '隨著全球對環境保護的重視，2024年將實施更嚴格的冷媒使用規範...',
        excerpt: '了解2024年最新的環保冷媒規範，為您的設備選擇合適的冷媒',
        author: '技術部',
        tags: JSON.stringify(['冷媒', '環保', '法規']),
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
    prisma.news.create({
      data: {
        title: '夏季冷氣保養小技巧',
        slug: 'summer-ac-maintenance-tips',
        content: '夏季來臨前，做好冷氣保養可以確保設備正常運作，延長使用壽命...',
        excerpt: '5個簡單的冷氣保養技巧，讓您的冷氣在夏季保持最佳狀態',
        author: '服務部',
        tags: JSON.stringify(['保養', '冷氣', '技巧']),
        isPublished: true,
        publishedAt: new Date(),
      },
    }),
  ])

  console.log({ news })

  // 創建網站設定
  const settings = await Promise.all([
    prisma.setting.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: JSON.stringify({ name: '車冷博士', tagline: '專業冷凍空調解決方案' }),
      },
    }),
    prisma.setting.upsert({
      where: { key: 'contact_info' },
      update: {},
      create: {
        key: 'contact_info',
        value: JSON.stringify({
          phone: '04-26301915',
          fax: '04-26301510',
          mobile: '0903-049150',
          lineId: '0903049150',
          email: 'hongshun.TW@gmail.com',
          address: '台中市龍井區忠和里海尾路278巷33弄8號',
          businessHours: '週一至週五 09:30 - 17:30',
        }),
      },
    }),
  ])

  console.log({ settings })

  // 刪除現有車輛資料
  // @ts-ignore
  await prisma.vehicleModel.deleteMany({})
  // @ts-ignore
  await prisma.vehicleBrand.deleteMany({})

  // 創建車輛品牌 - 一般車輛
  // @ts-ignore
  const toyotaBrand = await prisma.vehicleBrand.create({
    data: {
      name: '豐田',
      nameEn: 'TOYOTA',
      category: 'regular',
      order: 1,
    },
  })

  // @ts-ignore
  const hondaBrand = await prisma.vehicleBrand.create({
    data: {
      name: '本田',
      nameEn: 'HONDA',
      category: 'regular',
      order: 2,
    },
  })

  // @ts-ignore
  const nissanBrand = await prisma.vehicleBrand.create({
    data: {
      name: '日產',
      nameEn: 'NISSAN',
      category: 'regular',
      order: 3,
    },
  })

  // @ts-ignore
  const mazda = await prisma.vehicleBrand.create({
    data: {
      name: '馬自達',
      nameEn: 'MAZDA',
      category: 'regular',
      order: 4,
    },
  })

  // 創建車輛品牌 - 大型車
  // @ts-ignore
  const hinoBrand = await prisma.vehicleBrand.create({
    data: {
      name: '日野',
      nameEn: 'HINO',
      category: 'truck',
      order: 1,
    },
  })

  // @ts-ignore
  const mitsubishiFusoBrand = await prisma.vehicleBrand.create({
    data: {
      name: '三菱扶桑',
      nameEn: 'MITSUBISHI FUSO',
      category: 'truck',
      order: 2,
    },
  })

  // 創建車輛品牌 - 馬來西亞車
  // @ts-ignore
  const protonBrand = await prisma.vehicleBrand.create({
    data: {
      name: '寶騰',
      nameEn: 'PROTON',
      category: 'malaysia',
      order: 1,
    },
  })

  // @ts-ignore
  const peroduaBrand = await prisma.vehicleBrand.create({
    data: {
      name: '第二國產車',
      nameEn: 'PERODUA',
      category: 'malaysia',
      order: 2,
    },
  })

  console.log('已創建車輛品牌')

  // 創建車型資料 - Toyota
  // @ts-ignore
  await prisma.vehicleModel.createMany({
    data: [
      {
        brandId: toyotaBrand.id,
        modelName: 'ALTIS',
        year: '2014-2018',
        engineType: '1.8L/2.0L',
        refrigerantType: 'R134a',
        fillAmount: '500±25g',
        oilType: 'ND-OIL 8',
        oilAmount: '150±10ml',
      },
      {
        brandId: toyotaBrand.id,
        modelName: 'CAMRY',
        year: '2012-2017',
        engineType: '2.0L/2.5L',
        refrigerantType: 'R134a',
        fillAmount: '550±25g',
        oilType: 'ND-OIL 8',
        oilAmount: '150±10ml',
      },
      {
        brandId: toyotaBrand.id,
        modelName: 'RAV4',
        year: '2013-2018',
        engineType: '2.0L/2.5L',
        refrigerantType: 'R134a',
        fillAmount: '525±25g',
        oilType: 'ND-OIL 8',
        oilAmount: '150±10ml',
      },
      {
        brandId: toyotaBrand.id,
        modelName: 'YARIS',
        year: '2014-2020',
        engineType: '1.5L',
        refrigerantType: 'R134a',
        fillAmount: '450±25g',
        oilType: 'ND-OIL 8',
        oilAmount: '130±10ml',
      },
      {
        brandId: toyotaBrand.id,
        modelName: 'SIENNA',
        year: '2011-2020',
        engineType: '3.5L',
        refrigerantType: 'R134a',
        fillAmount: '700±25g',
        oilType: 'ND-OIL 8',
        oilAmount: '180±10ml',
        notes: '後座有獨立空調系統',
      },
    ],
  })

  // 創建車型資料 - Honda
  // @ts-ignore
  await prisma.vehicleModel.createMany({
    data: [
      {
        brandId: hondaBrand.id,
        modelName: 'CIVIC',
        year: '2016-2021',
        engineType: '1.5T/1.8L',
        refrigerantType: 'R1234yf',
        fillAmount: '450±20g',
        oilType: 'PAG 46',
        oilAmount: '120±10ml',
        notes: '新款採用環保冷媒',
      },
      {
        brandId: hondaBrand.id,
        modelName: 'CR-V',
        year: '2017-2022',
        engineType: '1.5T',
        refrigerantType: 'R1234yf',
        fillAmount: '500±20g',
        oilType: 'PAG 46',
        oilAmount: '130±10ml',
        notes: '新款採用環保冷媒',
      },
      {
        brandId: hondaBrand.id,
        modelName: 'ACCORD',
        year: '2013-2017',
        engineType: '2.4L',
        refrigerantType: 'R134a',
        fillAmount: '520±25g',
        oilType: 'PAG 46',
        oilAmount: '140±10ml',
      },
      {
        brandId: hondaBrand.id,
        modelName: 'FIT',
        year: '2014-2020',
        engineType: '1.5L',
        refrigerantType: 'R134a',
        fillAmount: '430±25g',
        oilType: 'PAG 46',
        oilAmount: '120±10ml',
      },
    ],
  })

  // 創建車型資料 - Hino (大車)
  // @ts-ignore
  await prisma.vehicleModel.createMany({
    data: [
      {
        brandId: hinoBrand.id,
        modelName: '300系列',
        year: '2011-2020',
        engineType: '4.0L柴油',
        refrigerantType: 'R134a',
        fillAmount: '750±50g',
        oilType: 'ND-OIL 8',
        oilAmount: '200±20ml',
        notes: '雙蒸發器系統',
      },
      {
        brandId: hinoBrand.id,
        modelName: '500系列',
        year: '2011-2020',
        engineType: '6.4L柴油',
        refrigerantType: 'R134a',
        fillAmount: '850±50g',
        oilType: 'ND-OIL 8',
        oilAmount: '220±20ml',
        notes: '雙蒸發器系統',
      },
      {
        brandId: hinoBrand.id,
        modelName: '700系列',
        year: '2011-2020',
        engineType: '12.9L柴油',
        refrigerantType: 'R134a',
        fillAmount: '1000±50g',
        oilType: 'ND-OIL 8',
        oilAmount: '250±20ml',
        notes: '雙蒸發器系統，駕駛室臥舖空調',
      },
    ],
  })

  // 創建車型資料 - Proton (馬來西亞)
  // @ts-ignore
  await prisma.vehicleModel.createMany({
    data: [
      {
        brandId: protonBrand.id,
        modelName: 'SAGA',
        year: '2016-2022',
        engineType: '1.3L',
        refrigerantType: 'R134a',
        fillAmount: '450±25g',
        oilType: 'PAG 100',
        oilAmount: '120±10ml',
      },
      {
        brandId: protonBrand.id,
        modelName: 'X70',
        year: '2018-2022',
        engineType: '1.8T',
        refrigerantType: 'R134a',
        fillAmount: '550±25g',
        oilType: 'PAG 46',
        oilAmount: '150±10ml',
      },
      {
        brandId: protonBrand.id,
        modelName: 'PERSONA',
        year: '2016-2022',
        engineType: '1.6L',
        refrigerantType: 'R134a',
        fillAmount: '480±25g',
        oilType: 'PAG 100',
        oilAmount: '130±10ml',
      },
    ],
  })

  console.log('已創建車型資料')

  // 創建示範橫幅
  const bannerData = [
    {
      title: '專業冷媒回收充填設備',
      description: '提供最先進的冷媒回收充填機，確保環保與效率',
      image: '/images/product-placeholder.svg',
      thumbnail: '/images/product-placeholder.svg', 
      link: '/products',
      position: 'homepage',
      order: 1,
      isActive: true,
    },
    {
      title: '高品質汽車冷媒',
      description: '巨化 R-134a 環保冷媒，純度 99.9% 以上',
      image: '/images/product-placeholder.svg',
      thumbnail: '/images/product-placeholder.svg',
      link: '/products?category=refrigerant',
      position: 'homepage', 
      order: 2,
      isActive: true,
    },
    {
      title: '專業技術支援',
      description: '提供完整的技術支援與售後服務',
      image: '/images/product-placeholder.svg',
      thumbnail: '/images/product-placeholder.svg',
      link: '/contact',
      position: 'homepage',
      order: 3,
      isActive: true,
    },
  ]

  // 先刪除現有的橫幅（避免重複）
  await prisma.banner.deleteMany({
    where: { position: 'homepage' }
  })

  const banners = []
  for (const banner of bannerData) {
    const createdBanner = await prisma.banner.create({
      data: banner,
    })
    banners.push(createdBanner)
  }

  console.log({ banners })
  console.log('已創建示範橫幅')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 