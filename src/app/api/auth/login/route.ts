import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 驗證輸入
    const validatedData = loginSchema.parse(body)
    
    // 查找用戶
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })
    
    if (!user) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }
    
    // 驗證密碼
    const passwordValid = await bcrypt.compare(validatedData.password, user.password)
    
    if (!passwordValid) {
      return NextResponse.json(
        { error: '電子郵件或密碼錯誤' },
        { status: 401 }
      )
    }
    
    // 生成 JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    )
    
    // 設置 cookie
    const response = NextResponse.json({
      message: '登入成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: '登入時發生錯誤' },
      { status: 500 }
    )
  }
} 