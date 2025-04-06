import { NextResponse } from 'next/server'

// 这个路由处理程序将捕获所有对 /api/auth/error 的请求
// 并将它们重定向回登录页面
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  // 重定向到登录页面，并传递错误信息
  return NextResponse.redirect(new URL(`/login?authError=${error || 'unknown'}`, request.url))
}

// 也处理POST请求以防万一
export async function POST(request: Request) {
  return GET(request)
}
