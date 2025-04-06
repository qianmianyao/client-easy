import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// 自定义重定向函数，用于处理未认证用户的重定向
function handleUnauthenticated(req: NextRequest) {
  // 获取当前请求的URL
  const requestedUrl = req.nextUrl.pathname

  // 对于任何路径，保留callbackUrl以便登录后返回
  const loginUrl = new URL('/login', req.url)
  // 对于非登录页面，添加回调URL
  if (requestedUrl !== '/login' && requestedUrl !== '/register') {
    loginUrl.searchParams.set('callbackUrl', requestedUrl)
  }
  return NextResponse.redirect(loginUrl)
}

// 中间件主函数
export async function middleware(req: NextRequest) {
  // 获取当前路径
  const path = req.nextUrl.pathname

  // 检查用户是否已登录
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const isAuthenticated = !!token

  // 匹配身份验证页面
  const authPaths = ['/login', '/register', '/forgot-password']
  const isAuthPath = authPaths.includes(path) || authPaths.some((p) => path.startsWith(`${p}/`))

  // API路径
  const isApiAuthPath = path.startsWith('/api/auth')

  // 静态资源路径
  const isStaticPath = path.startsWith('/_next') || path.startsWith('/fonts') || path.startsWith('/public')

  // 对静态资源不做处理
  if (isStaticPath) {
    return NextResponse.next()
  }

  // 1. 已登录用户访问身份验证页面 -> 重定向到首页
  if (isAuthPath && isAuthenticated) {
    console.log(`已登录用户访问身份验证页面: ${path}，重定向到首页`)
    return NextResponse.redirect(new URL('/', req.url))
  }

  // 2. 未登录用户访问非身份验证页面且非API路径 -> 重定向到登录页
  if (!isAuthPath && !isApiAuthPath && !isAuthenticated) {
    console.log(`未登录用户访问受保护页面: ${path}，重定向到登录页面`)
    return handleUnauthenticated(req)
  }

  // 其他情况正常访问
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * /_next (Next.js静态文件)
     * /fonts (静态资源)
     * /public (静态资源)
     * /api/auth (NextAuth API路由)
     */
    '/((?!_next|fonts|public|favicon.ico).*)',
  ],
}
