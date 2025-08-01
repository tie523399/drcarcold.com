import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // 檢查是否為管理後台路徑 (優先處理後台邏輯)
  const isAdminPath = path.startsWith('/admin')
  
  // 如果是管理後台路徑，進行認證檢查
  if (isAdminPath) {
    const isLoginPath = path === '/admin/login'
    const token = request.cookies.get('auth-token')
    
    // 後台路徑的HTTPS重定向處理
    if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_PUBLIC_DOMAIN) {
      const forwardedProto = request.headers.get('x-forwarded-proto')
      const isHTTP = forwardedProto === 'http'
      
      if (isHTTP) {
        const httpsUrl = new URL(request.url)
        httpsUrl.protocol = 'https:'
        httpsUrl.host = process.env.RAILWAY_PUBLIC_DOMAIN
        
        console.log(`後台HTTPS重定向: ${request.url} → ${httpsUrl.toString()}`)
        return NextResponse.redirect(httpsUrl, 301)
      }
    }
    
    if (!isLoginPath && !token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    if (isLoginPath && token) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    
    return NextResponse.next()
  }
  
  // 對於非後台路徑的HTTPS重定向
  if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_PUBLIC_DOMAIN) {
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isHTTP = forwardedProto === 'http'
    
    if (isHTTP) {
      const httpsUrl = new URL(request.url)
      httpsUrl.protocol = 'https:'
      httpsUrl.host = process.env.RAILWAY_PUBLIC_DOMAIN
      
      console.log(`前台HTTPS重定向: ${request.url} → ${httpsUrl.toString()}`)
      return NextResponse.redirect(httpsUrl, 301)
    }
  }
  
  // 對於非管理員路徑，使用國際化中間件
  return intlMiddleware(request);
}

export const config = {
  // 匹配所有路径，除了API和静态资源
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|uploads).*)'
  ]
}; 