const { PrismaClient } = require('@prisma/client')

async function fixVideoBanners() {
  const prisma = new PrismaClient()
  
  try {
    console.log('檢查需要修復的橫幅...')
    
    // 查找所有以 .mp4 結尾但 mediaType 不是 'video' 的橫幅
    const videoBanners = await prisma.banner.findMany({
      where: {
        OR: [
          { image: { endsWith: '.mp4' } },
          { image: { contains: '.mp4' } }
        ]
      }
    })
    
    console.log(`找到 ${videoBanners.length} 個影片橫幅`)
    
    for (const banner of videoBanners) {
      console.log(`修復橫幅: ${banner.title}`)
      console.log(`檔案: ${banner.image}`)
      
      await prisma.banner.update({
        where: { id: banner.id },
        data: { 
          mediaType: 'video',
          thumbnail: banner.thumbnail || '/images/video-placeholder.svg'
        }
      })
      
      console.log(`✅ 已修復: ${banner.title}`)
    }
    
    console.log('🎉 所有影片橫幅修復完成！')
    
  } catch (error) {
    console.error('修復失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixVideoBanners() 