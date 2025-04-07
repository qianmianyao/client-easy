'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Heading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { TextLink } from '@/components/text'
import { getCustomerStatsByAffiliation } from '@/lib/actions'
import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '@heroicons/react/16/solid'
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { useCallback, useEffect, useState } from 'react'

type SortField =
  | 'name'
  | 'count'
  | 'inGroup'
  | 'leftGroup'
  | 'circled'
  | 'blacklisted'
  | 'lostContact'
  | 'transacted'
  | 'amount'
  | 'submitUser'

type SortDirection = 'asc' | 'desc'

type AffiliationStat = {
  name: string
  avatar?: string | null
  link?: string | null
  submitUser?: string | null
  customers: {
    count: number
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
}

export default function DataAnalysis() {
  const [affiliationStats, setAffiliationStats] = useState<AffiliationStat[]>([])
  const [sortField, setSortField] = useState<SortField>('amount')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getCustomerStatsByAffiliation()
        setAffiliationStats(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Sort data
  const sortData = useCallback((data: AffiliationStat[], field: SortField, direction: SortDirection) => {
    return [...data].sort((a, b) => {
      let valueA, valueB

      switch (field) {
        case 'name':
          valueA = a.name
          valueB = b.name
          break
        case 'count':
          valueA = a.customers.count
          valueB = b.customers.count
          break
        case 'inGroup':
          valueA = a.customers.进群.count
          valueB = b.customers.进群.count
          break
        case 'leftGroup':
          valueA = a.customers.已退群.count
          valueB = b.customers.已退群.count
          break
        case 'circled':
          valueA = a.customers.已圈上.count
          valueB = b.customers.已圈上.count
          break
        case 'blacklisted':
          valueA = a.customers.被拉黑.count
          valueB = b.customers.被拉黑.count
          break
        case 'lostContact':
          valueA = a.customers.封号失联.count
          valueB = b.customers.封号失联.count
          break
        case 'transacted':
          valueA = a.transactions.已成交.count
          valueB = b.transactions.已成交.count
          break
        case 'amount':
          valueA = a.transactions.totalAmount
          valueB = b.transactions.totalAmount
          break
        case 'submitUser':
          valueA = a.submitUser || ''
          valueB = b.submitUser || ''
          break
        default:
          valueA = a.name
          valueB = b.name
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
  const sortedData = sortData(affiliationStats, sortField, sortDirection)

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

  // Get avatar placeholder for affiliations without an avatar
  const getInitial = (name: string) => {
    return name.charAt(0).toUpperCase()
  }

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
      const worksheet = workbook.addWorksheet('客户归属数据分析')

      // Define columns based on table headers
      worksheet.columns = [
        { key: 'name', width: 20 },
        { key: 'count', width: 12 },
        { key: 'inGroup', width: 20 },
        { key: 'leftGroup', width: 20 },
        { key: 'circled', width: 20 },
        { key: 'blacklisted', width: 20 },
        { key: 'lostContact', width: 20 },
        { key: 'transacted', width: 20 },
        { key: 'amount', width: 15 },
        { key: 'submitUser', width: 15 },
      ]

      // 添加表头行 - 确保表头显示
      worksheet.getRow(4).values = [
        '归属名称',
        '客户数量',
        '进群',
        '已退群',
        '已圈上',
        '被拉黑',
        '封号失联',
        '已成交',
        '总成交金额',
        '提交用户',
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
          name: sanitizeText(stat.name),
          count: stat.customers.count,
          inGroup: `${stat.customers.进群.count} (${stat.customers.进群.percentage.toFixed(2)}%)`,
          leftGroup: `${stat.customers.已退群.count} (${stat.customers.已退群.percentage.toFixed(2)}%)`,
          circled: `${stat.customers.已圈上.count} (${stat.customers.已圈上.percentage.toFixed(2)}%)`,
          blacklisted: `${stat.customers.被拉黑.count} (${stat.customers.被拉黑.percentage.toFixed(2)}%)`,
          lostContact: `${stat.customers.封号失联.count} (${stat.customers.封号失联.percentage.toFixed(2)}%)`,
          transacted: `${stat.transactions.已成交.count} (${stat.transactions.已成交.percentage.toFixed(2)}%)`,
          amount: stat.transactions.totalAmount,
          submitUser: sanitizeText(stat.submitUser || '-'),
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

        // Center the number columns
        row.getCell(2).alignment = { horizontal: 'center' }

        // Format the currency column
        const amountCell = row.getCell(9)
        amountCell.numFmt = '"$"#,##0.00'
      }

      // Add total row
      const totalRow = worksheet.addRow({
        name: '总计',
        count: sortedData.reduce((sum, stat) => sum + stat.customers.count, 0),
        amount: sortedData.reduce((sum, stat) => sum + stat.transactions.totalAmount, 0),
      })

      // Style total row
      totalRow.font = { bold: true }
      totalRow.height = 24
      totalRow.getCell(1).alignment = { horizontal: 'right' }
      totalRow.getCell(9).numFmt = '"$"#,##0.00'

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
      FileSaver.saveAs(blob, `客户归属数据分析_${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
      console.error('导出Excel失败:', error)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Heading>客户归属数据分析</Heading>
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
                <TableHeader>{renderSortHeader('归属名称', 'name')}</TableHeader>
                <TableHeader>{renderSortHeader('客户数量', 'count')}</TableHeader>
                <TableHeader>{renderSortHeader('进群', 'inGroup')}</TableHeader>
                <TableHeader>{renderSortHeader('已退群', 'leftGroup')}</TableHeader>
                <TableHeader>{renderSortHeader('已圈上', 'circled')}</TableHeader>
                <TableHeader>{renderSortHeader('被拉黑', 'blacklisted')}</TableHeader>
                <TableHeader>{renderSortHeader('封号失联', 'lostContact')}</TableHeader>
                <TableHeader>{renderSortHeader('已成交', 'transacted')}</TableHeader>
                <TableHeader>{renderSortHeader('总成交金额', 'amount')}</TableHeader>
                <TableHeader>{renderSortHeader('提交用户', 'submitUser')}</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((stat) => (
                <TableRow key={stat.name}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={stat.avatar || undefined}
                        alt={stat.name}
                        initials={getInitial(stat.name)}
                        className="h-8 w-8"
                      />
                      <TextLink
                        href={stat.link || '#'}
                        className="font-medium transition-colors"
                        title={stat.link ? `访问 ${stat.name} 链接` : ''}
                      >
                        {stat.name}
                      </TextLink>
                    </div>
                  </TableCell>
                  <TableCell>{stat.customers.count}</TableCell>
                  <TableCell>
                    {stat.customers.进群.count} ({formatPercentage(stat.customers.进群.percentage)})
                  </TableCell>
                  <TableCell>
                    {stat.customers.已退群.count} ({formatPercentage(stat.customers.已退群.percentage)})
                  </TableCell>
                  <TableCell>
                    {stat.customers.已圈上.count} ({formatPercentage(stat.customers.已圈上.percentage)})
                  </TableCell>
                  <TableCell>
                    {stat.customers.被拉黑.count} ({formatPercentage(stat.customers.被拉黑.percentage)})
                  </TableCell>
                  <TableCell>
                    {stat.customers.封号失联.count} ({formatPercentage(stat.customers.封号失联.percentage)})
                  </TableCell>
                  <TableCell>
                    {stat.transactions.已成交.count} ({formatPercentage(stat.transactions.已成交.percentage)})
                  </TableCell>
                  <TableCell>{formatCurrency(stat.transactions.totalAmount)}</TableCell>
                  <TableCell>{stat.submitUser || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}
