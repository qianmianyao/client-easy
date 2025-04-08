import { getDashboardStats } from '@/lib/actions'
import { NextRequest, NextResponse } from 'next/server'

// 声明此路由为动态路由，确保在构建时不会尝试静态生成
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 获取URL参数
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'current_week'

    // 获取统计数据
    const stats = await getDashboardStats(period)

    // 返回JSON响应
    return NextResponse.json(stats)
  } catch (error) {
    console.error('API获取仪表板统计数据失败:', error)
    return NextResponse.json(
      { error: '获取统计数据失败', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
