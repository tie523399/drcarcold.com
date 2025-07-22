import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { z } from 'zod'

// 表單驗證 schema
const contactSchema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  email: z.string().email('請輸入有效的電子郵件'),
  phone: z.string().optional(),
  subject: z.string().min(1, '請輸入主旨'),
  message: z.string().min(1, '請輸入訊息內容'),
})

// 創建郵件發送器
const createTransporter = () => {
  // 使用 Gmail SMTP
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'hongshun.TW@gmail.com',
      pass: process.env.EMAIL_PASS, // 需要使用應用程式密碼
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證表單資料
    const validatedData = contactSchema.parse(body)
    
    // 創建郵件內容
    const mailOptions = {
      from: `"${validatedData.name}" <${process.env.EMAIL_USER || 'hongshun.TW@gmail.com'}>`,
      to: 'hongshun.TW@gmail.com', // 收件人信箱
      subject: `[網站聯絡表單] ${validatedData.subject}`,
      html: `
        <h2>網站聯絡表單</h2>
        <p><strong>姓名：</strong> ${validatedData.name}</p>
        <p><strong>電子郵件：</strong> ${validatedData.email}</p>
        <p><strong>電話：</strong> ${validatedData.phone || '未提供'}</p>
        <p><strong>主旨：</strong> ${validatedData.subject}</p>
        <hr>
        <p><strong>訊息內容：</strong></p>
        <p style="white-space: pre-wrap;">${validatedData.message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          此郵件由車冷博士網站聯絡表單自動發送<br>
          發送時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
        </p>
      `,
      text: `
網站聯絡表單

姓名：${validatedData.name}
電子郵件：${validatedData.email}
電話：${validatedData.phone || '未提供'}
主旨：${validatedData.subject}

訊息內容：
${validatedData.message}

---
此郵件由車冷博士網站聯絡表單自動發送
發送時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
      `,
    }

    // 如果沒有設定郵件密碼，則只記錄但不發送
    if (!process.env.EMAIL_PASS) {
      console.log('聯絡表單提交（未設定郵件密碼，僅記錄）：', validatedData)
      
      // 仍然返回成功，讓使用者體驗保持一致
      return NextResponse.json({
        success: true,
        message: '感謝您的來信，我們會盡快回覆您！',
        data: validatedData,
      })
    }

    // 發送郵件
    const transporter = createTransporter()
    await transporter.sendMail(mailOptions)
    
    return NextResponse.json({
      success: true,
      message: '感謝您的來信，我們會盡快回覆您！',
    })
  } catch (error) {
    console.error('聯絡表單錯誤：', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '表單資料驗證失敗',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '發送訊息時發生錯誤，請稍後再試或直接聯絡我們',
      },
      { status: 500 }
    )
  }
} 