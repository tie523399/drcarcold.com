import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // 檢查是否為管理後台路徑
  const isAdminPath = path.startsWith('/admin')
  
  // 如果是管理後台路徑，進行認證檢查
  if (isAdminPath) {
    const isLoginPath = path === '/admin/login'
    const token = request.cookies.get('auth-token')
    
    if (!isLoginPath && !token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    if (isLoginPath && token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    return NextResponse.next()
  }
  
  // 對於非管理員路徑，使用國際化中間件
  return intlMiddleware(request);
}

export const config = {
  // Match internationalized pathnames and admin routes
  matcher: ['/', '/(zh|en)/:path*', '/admin/:path*']
}; 