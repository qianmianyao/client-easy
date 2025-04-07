'use client'

import { Stat } from '@/app/stat'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/listbox'
import { Suspense, useEffect, useRef, useState } from 'react'

// 统计数据类型定义
type StatsData = {
  transactionAmount: {
    value: number
    change: string
  }
  avgOrderValue: {
    value: number
    change: string
  }
  transactionCount: {
    value: number
    change: string
  }
  customerCount: {
    value: number
    change: string
  }
  periodInfo: {
    startDate: string
    endDate: string
    period: string
  }
}

function DashboardStats({ initialPeriod, initialStats }: { initialPeriod: string; initialStats: StatsData }) {
  const [period, setPeriod] = useState(initialPeriod)
  const [stats, setStats] = useState<StatsData>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const initialRender = useRef(true)

  // 格式化货币
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // 当周期变化时获取新的统计数据
  useEffect(() => {
    // 如果是初始渲染，跳过获取数据
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    async function fetchStats() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/dashboard-stats?period=${period}`)
        if (!response.ok) {
          throw new Error('获取统计数据失败')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('加载统计数据出错:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [period]) // 移除 stats 和 initialStats 依赖，使用 useRef 解决初始化问题

  // 处理周期变更
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)

    // 更新URL，但不刷新页面
    const url = new URL(window.location.href)
    url.searchParams.set('period', newPeriod)
    window.history.pushState({}, '', url.toString())
  }

  return (
    <>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold">数据概览</span>
        <div>
          <Listbox name="period" value={period} onChange={handlePeriodChange}>
            <ListboxOption value="last_week">
              <ListboxLabel>上周</ListboxLabel>
            </ListboxOption>
            <ListboxOption value="last_two">
              <ListboxLabel>过去两周</ListboxLabel>
            </ListboxOption>
            <ListboxOption value="last_month">
              <ListboxLabel>上个月</ListboxLabel>
            </ListboxOption>
            <ListboxOption value="last_quarter">
              <ListboxLabel>上季度</ListboxLabel>
            </ListboxOption>
          </Listbox>
        </div>
      </div>
      <div className={`mt-4 grid gap-8 sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? 'opacity-60' : ''}`}>
        <Stat
          title="成交金额"
          value={formatCurrency(stats.transactionAmount.value)}
          change={`${parseFloat(stats.transactionAmount.change) > 0 ? '+' : ''}${stats.transactionAmount.change}%`}
        />
        <Stat
          title="平均订单价值"
          value={formatCurrency(stats.avgOrderValue.value)}
          change={`${parseFloat(stats.avgOrderValue.change) > 0 ? '+' : ''}${stats.avgOrderValue.change}%`}
        />
        <Stat
          title="成交数量"
          value={String(stats.transactionCount.value)}
          change={`${parseFloat(stats.transactionCount.change) > 0 ? '+' : ''}${stats.transactionCount.change}%`}
        />
        <Stat
          title="客户数量"
          value={String(stats.customerCount.value)}
          change={`${parseFloat(stats.customerCount.change) > 0 ? '+' : ''}${stats.customerCount.change}%`}
        />
      </div>
    </>
  )
}

export function DashboardStatsWrapper({
  initialPeriod,
  initialStats,
}: {
  initialPeriod: string
  initialStats: StatsData
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardStats initialPeriod={initialPeriod} initialStats={initialStats} />
    </Suspense>
  )
}
