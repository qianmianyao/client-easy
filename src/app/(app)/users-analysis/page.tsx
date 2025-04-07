'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { getUsersAnalysisData } from '@/lib/actions'
import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { useCallback, useEffect, useState } from 'react'

type SortField =
  | 'username'
  | 'role'
  | 'totalCustomers'
  | 'conversionRate'
  | 'totalAmount'
  | 'avgCustomerValue'
  | 'recentCustomers'
  | 'recentRevenue'
  | 'monthlyCustomers'
  | 'monthlyRevenue'

type SortDirection = 'asc' | 'desc'

type UserStat = {
  id: number
  username: string
  email: string
  role: string
  lastLoginTime?: bigint | null
  customers: {
    total: number
    进群: { count: number; percentage: number }
    已退群: { count: number; percentage: number }
    已圈上: { count: number; percentage: number }
    被拉黑: { count: number; percentage: number }
    封号失联: { count: number; percentage: number }
    重复: { count: number; percentage: number }
    返回: { count: number; percentage: number }
  }
  transactions: {
    已成交: { count: number; percentage: number }
    未成交: { count: number; percentage: number }
    待跟进: { count: number; percentage: number }
    totalAmount: number
  }
  performance: {
    avgCustomerValue: number
    conversionRate: number
    recentCustomers: number
    recentRevenue: number
    monthlyCustomers: number
    monthlyRevenue: number
  }
}

export default function UsersAnalysis() {
  const [userStats, setUserStats] = useState<UserStat[]>([])
  const [sortField, setSortField] = useState<SortField>('totalAmount')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getUsersAnalysisData()
        setUserStats(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort data
  const sortData = useCallback((data: UserStat[], field: SortField, direction: SortDirection) => {
    return [...data].sort((a, b) => {
      let valueA, valueB

      switch (field) {
        case 'username':
          valueA = a.username
          valueB = b.username
          break
        case 'role':
          valueA = a.role
          valueB = b.role
          break
        case 'totalCustomers':
          valueA = a.customers.total
          valueB = b.customers.total
          break
        case 'conversionRate':
          valueA = a.performance.conversionRate
          valueB = b.performance.conversionRate
          break
        case 'totalAmount':
          valueA = a.transactions.totalAmount
          valueB = b.transactions.totalAmount
          break
        case 'avgCustomerValue':
          valueA = a.performance.avgCustomerValue
          valueB = b.performance.avgCustomerValue
          break
        case 'recentCustomers':
          valueA = a.performance.recentCustomers
          valueB = b.performance.recentCustomers
          break
        case 'recentRevenue':
          valueA = a.performance.recentRevenue
          valueB = b.performance.recentRevenue
          break
        case 'monthlyCustomers':
          valueA = a.performance.monthlyCustomers
          valueB = b.performance.monthlyCustomers
          break
        case 'monthlyRevenue':
          valueA = a.performance.monthlyRevenue
          valueB = b.performance.monthlyRevenue
          break
        default:
          valueA = a.transactions.totalAmount
          valueB = b.transactions.totalAmount
      }

      if (direction === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
      }
    })
  }, [])

  // Handle sort click
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, set default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sorted data
  const sortedData = sortData(userStats, sortField, sortDirection)

  // Format functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`
  }

  // Format date from BigInt
  const formatDate = (timestamp: bigint | null | undefined) => {
    if (!timestamp) return '从未登录'
    return new Date(Number(timestamp)).toLocaleString()
  }

  // Sort indicator component
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (field !== sortField) {
      return <ArrowsUpDownIcon className="ml-1 inline-block h-4 w-4 text-gray-400" />
    }

    return sortDirection === 'asc' ? (
      <ArrowUpIcon className="ml-1 inline-block h-4 w-4 text-blue-500" />
    ) : (
      <ArrowDownIcon className="ml-1 inline-block h-4 w-4 text-blue-500" />
    )
  }

  // Render sort header
  const renderSortHeader = (label: string, field: SortField) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center text-left font-medium hover:text-blue-600 focus:outline-none"
    >
      {label}
      <SortIndicator field={field} />
    </button>
  )

  // Export to Excel function
  const exportToExcel = async () => {
    try {
      setExporting(true)

      // 辅助函数：处理文本以避免编码错误
      const sanitizeText = (text: string | null | undefined): string => {
        if (!text) return ''
        // 只返回ASCII字符和常见中文字符，过滤掉可能导致问题的特殊字符
        return String(text).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '')
      }

      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('员工业绩分析')

      // Define columns based on table headers
      worksheet.columns = [
        { key: 'username', width: 15 },
        { key: 'role', width: 12 },
        { key: 'totalCustomers', width: 15 },
        { key: 'conversionRate', width: 15 },
        { key: 'totalAmount', width: 15 },
        { key: 'avgValue', width: 20 },
        { key: 'recentCustomers', width: 15 },
        { key: 'recentRevenue', width: 15 },
        { key: 'monthlyCustomers', width: 15 },
        { key: 'monthlyRevenue', width: 15 },
      ]

      // 添加表头行 - 确保表头显示
      worksheet.getRow(4).values = [
        '员工姓名',
        '角色',
        '总客户数',
        '转化率',
        '总成交金额',
        '平均客户价值',
        '近7天客户',
        '近7天业绩',
        '近30天客户',
        '近30天业绩',
      ]

      // Style header row
      const headerRow = worksheet.getRow(4)
      headerRow.font = { bold: true }
      headerRow.height = 24
      headerRow.alignment = { horizontal: 'center', vertical: 'middle' }
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E6F8' },
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      })

      // Add rows from data
      sortedData.forEach((stat) => {
        worksheet.addRow({
          username: sanitizeText(stat.username),
          role: sanitizeText(stat.role),
          totalCustomers: stat.customers.total,
          conversionRate: `${stat.performance.conversionRate.toFixed(2)}%`,
          totalAmount: stat.transactions.totalAmount,
          avgValue: stat.performance.avgCustomerValue,
          recentCustomers: stat.performance.recentCustomers,
          recentRevenue: stat.performance.recentRevenue,
          monthlyCustomers: stat.performance.monthlyCustomers,
          monthlyRevenue: stat.performance.monthlyRevenue,
        })
      })

      // Style data rows
      for (let i = 5; i < 5 + sortedData.length; i++) {
        const row = worksheet.getRow(i)
        row.height = 22
        row.alignment = { vertical: 'middle' }

        // Set border
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })

        // Center some columns
        row.getCell(2).alignment = { horizontal: 'center' } // role
        row.getCell(3).alignment = { horizontal: 'center' } // totalCustomers
        row.getCell(4).alignment = { horizontal: 'center' } // conversionRate
        row.getCell(7).alignment = { horizontal: 'center' } // recentCustomers
        row.getCell(9).alignment = { horizontal: 'center' } // monthlyCustomers

        // Format the currency columns
        const amountCell = row.getCell(5)
        amountCell.numFmt = '"$"#,##0.00'

        const avgValueCell = row.getCell(6)
        avgValueCell.numFmt = '"$"#,##0.00'

        const recentRevenueCell = row.getCell(8)
        recentRevenueCell.numFmt = '"$"#,##0.00'

        const monthlyRevenueCell = row.getCell(10)
        monthlyRevenueCell.numFmt = '"$"#,##0.00'
      }

      // Add total row
      const totalRow = worksheet.addRow({
        username: '总计',
        totalCustomers: sortedData.reduce((sum, stat) => sum + stat.customers.total, 0),
        totalAmount: sortedData.reduce((sum, stat) => sum + stat.transactions.totalAmount, 0),
        recentCustomers: sortedData.reduce((sum, stat) => sum + stat.performance.recentCustomers, 0),
        recentRevenue: sortedData.reduce((sum, stat) => sum + stat.performance.recentRevenue, 0),
        monthlyCustomers: sortedData.reduce((sum, stat) => sum + stat.performance.monthlyCustomers, 0),
        monthlyRevenue: sortedData.reduce((sum, stat) => sum + stat.performance.monthlyRevenue, 0),
      })

      // Style total row
      totalRow.font = { bold: true }
      totalRow.height = 24
      totalRow.getCell(1).alignment = { horizontal: 'right' }

      // Format currency cells in total row
      totalRow.getCell(5).numFmt = '"$"#,##0.00' // totalAmount
      totalRow.getCell(8).numFmt = '"$"#,##0.00' // recentRevenue
      totalRow.getCell(10).numFmt = '"$"#,##0.00' // monthlyRevenue

      totalRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' },
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' },
        }
      })

      // Generate and save the file
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      FileSaver.saveAs(blob, `员工业绩分析_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
      console.error('导出Excel失败:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Heading>员工数据分析</Heading>
        <Button outline onClick={exportToExcel} disabled={loading || exporting}>
          <ArrowDownTrayIcon />
          {exporting ? '导出中...' : '导出Excel'}
        </Button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-56">{renderSortHeader('员工姓名', 'username')}</TableHeader>
                <TableHeader>{renderSortHeader('角色', 'role')}</TableHeader>
                <TableHeader>{renderSortHeader('总客户数', 'totalCustomers')}</TableHeader>
                <TableHeader>{renderSortHeader('转化率', 'conversionRate')}</TableHeader>
                <TableHeader>{renderSortHeader('总成交金额', 'totalAmount')}</TableHeader>
                <TableHeader>{renderSortHeader('平均客户价值', 'avgCustomerValue')}</TableHeader>
                <TableHeader>{renderSortHeader('近7天客户', 'recentCustomers')}</TableHeader>
                <TableHeader>{renderSortHeader('近7天业绩', 'recentRevenue')}</TableHeader>
                <TableHeader>{renderSortHeader('近30天客户', 'monthlyCustomers')}</TableHeader>
                <TableHeader>{renderSortHeader('近30天业绩', 'monthlyRevenue')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar initials={stat.username.charAt(0).toUpperCase()} className="h-8 w-8" />
                      <div>
                        <div className="font-medium">{stat.username}</div>
                        <div className="text-xs text-gray-500">{stat.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        stat.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : stat.role === 'manager'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {stat.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">{stat.customers.total}</TableCell>
                  <TableCell className="text-center">{formatPercentage(stat.performance.conversionRate)}</TableCell>
                  <TableCell>{formatCurrency(stat.transactions.totalAmount)}</TableCell>
                  <TableCell>{formatCurrency(stat.performance.avgCustomerValue)}</TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${stat.performance.recentCustomers > 0 ? 'text-green-600' : ''}`}>
                      {stat.performance.recentCustomers}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${stat.performance.recentRevenue > 0 ? 'text-green-600' : ''}`}>
                      {formatCurrency(stat.performance.recentRevenue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-medium ${stat.performance.monthlyCustomers > 0 ? 'text-green-600' : ''}`}>
                      {stat.performance.monthlyCustomers}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${stat.performance.monthlyRevenue > 0 ? 'text-green-600' : ''}`}>
                      {formatCurrency(stat.performance.monthlyRevenue)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {!loading && sortedData.length > 0 && (
        <div className="mt-8">
          <Heading className="mb-4">客户状态分布统计</Heading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {sortedData.map((stat) => (
              <div
                key={`status-${stat.id}`}
                className="bg-card rounded-lg border p-4 shadow-sm dark:border-[#27272A] dark:bg-[#18181B]"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Avatar initials={stat.username.charAt(0).toUpperCase()} className="h-8 w-8" />
                  <div className="font-semibold dark:text-gray-200">{stat.username}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">进群</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.进群.count} ({formatPercentage(stat.customers.进群.percentage)})
                    </span>
                  </div>
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">已退群</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.已退群.count} ({formatPercentage(stat.customers.已退群.percentage)})
                    </span>
                  </div>
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">已圈上</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.已圈上.count} ({formatPercentage(stat.customers.已圈上.percentage)})
                    </span>
                  </div>
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">被拉黑</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.被拉黑.count} ({formatPercentage(stat.customers.被拉黑.percentage)})
                    </span>
                  </div>
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">封号失联</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.封号失联.count} ({formatPercentage(stat.customers.封号失联.percentage)})
                    </span>
                  </div>
                  <div className="flex justify-between rounded border-0 bg-gray-50 px-3 py-2 dark:bg-[#27272A]">
                    <span className="text-sm text-gray-600 dark:text-gray-300">重复/返回</span>
                    <span className="text-sm font-medium dark:text-gray-200">
                      {stat.customers.重复.count + stat.customers.返回.count} (
                      {formatPercentage(stat.customers.重复.percentage + stat.customers.返回.percentage)})
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center rounded border-0 bg-gray-100 px-3 py-2 dark:bg-[#09090B]">
                    <span className="text-xs text-gray-700 dark:text-gray-300">已成交</span>
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {stat.transactions.已成交.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatPercentage(stat.transactions.已成交.percentage)})
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded border-0 bg-gray-100 px-3 py-2 dark:bg-[#09090B]">
                    <span className="text-xs text-gray-700 dark:text-gray-300">待跟进</span>
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {stat.transactions.待跟进.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatPercentage(stat.transactions.待跟进.percentage)})
                    </span>
                  </div>
                  <div className="flex flex-col items-center rounded border-0 bg-gray-100 px-3 py-2 dark:bg-[#09090B]">
                    <span className="text-xs text-gray-700 dark:text-gray-300">未成交</span>
                    <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {stat.transactions.未成交.count}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({formatPercentage(stat.transactions.未成交.percentage)})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
