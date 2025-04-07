'use client'

import { Button } from '@/components/button'
import { getCustomers, getCustomerTransactionDetails } from '@/lib/actions'
import { ArrowDownTrayIcon } from '@heroicons/react/16/solid'
import ExcelJS from 'exceljs'
import FileSaver from 'file-saver'
import { useState } from 'react'

export function ExportCustomersButton({ searchQuery }: { searchQuery?: string }) {
  const [exporting, setExporting] = useState(false)

  const exportToExcel = async () => {
    try {
      setExporting(true)

      // 辅助函数：处理文本以避免编码错误
      const sanitizeText = (text: string | null | undefined): string => {
        if (!text) return ''
        // 只返回ASCII字符和常见中文字符，过滤掉可能导致问题的特殊字符
        return String(text).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE\uFFFF]/g, '')
      }

      // 创建工作簿和工作表
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Client Easy'
      workbook.lastModifiedBy = 'Client Easy Export'
      workbook.created = new Date()
      workbook.modified = new Date()

      const worksheet = workbook.addWorksheet('客户数据')

      // 定义列
      worksheet.columns = [
        { key: 'customerName', width: 20 },
        { key: 'phoneNumber', width: 15 },
        { key: 'affiliation', width: 15 },
        { key: 'customerStatus', width: 15 },
        { key: 'transactionStatus', width: 15 },
        { key: 'totalAmount', width: 15 },
        { key: 'notes', width: 30 },
        { key: 'submitUser', width: 15 },
        { key: 'submitTime', width: 20 },
      ]

      // 添加表头行 - 确保表头显示
      worksheet.getRow(4).values = [
        '客户名称',
        '手机号',
        '客户归属',
        '客户情况',
        '成交情况',
        '成交金额',
        '备注',
        '提交用户',
        '提交时间',
      ]

      // 设置表头样式
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

      // 获取所有客户数据（不分页，用于导出）
      const { customers: allCustomers } = await getCustomers(searchQuery || '', 1, 1000)

      // 添加客户数据行
      const rows = await Promise.all(
        allCustomers.map(async (customer) => {
          // 使用现有的actions获取客户交易明细
          let totalAmount = 0

          try {
            // 尝试获取客户成交明细
            const transactionDetails = await getCustomerTransactionDetails(customer.id)
            totalAmount = transactionDetails.totalAmount || 0
          } catch (error) {
            console.error(`获取客户 ${customer.id} 成交明细失败:`, error)
          }

          return {
            customerName: sanitizeText(customer.customerName),
            phoneNumber: sanitizeText(customer.phoneNumber),
            affiliation: sanitizeText(customer.affiliation),
            customerStatus: sanitizeText(customer.customerStatus),
            transactionStatus: sanitizeText(customer.transactionStatus),
            totalAmount, // 数字不需要净化
            notes: sanitizeText(customer.notes),
            submitUser: sanitizeText(customer.submitUser),
            submitTime: sanitizeText(new Date(Number(customer.submitTime)).toISOString()),
          }
        })
      )

      // 添加数据行
      rows.forEach((row) => worksheet.addRow(row))

      // 设置数据行样式
      for (let i = 5; i < 5 + rows.length; i++) {
        const row = worksheet.getRow(i)
        row.height = 22
        row.alignment = { vertical: 'middle' }

        // 设置边框
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })

        // 格式化成交金额列
        const amountCell = row.getCell(6)
        amountCell.numFmt = '"$"#,##0.00'
      }

      // 添加总计行
      const totalRow = worksheet.addRow({
        customerName: '总计',
        totalAmount: rows.reduce((sum, row) => sum + row.totalAmount, 0),
      })

      // 样式化总计行
      totalRow.font = { bold: true }
      totalRow.getCell(1).alignment = { horizontal: 'right' }
      totalRow.getCell(6).numFmt = '"$"#,##0.00'
      totalRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' },
        }
      })

      // 生成并保存文件 - 使用客户端方式
      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const fileName = `客户数据_${new Date().toISOString().slice(0, 10)}.xlsx`
      FileSaver.saveAs(blob, fileName)
    } catch (error) {
      console.error('导出Excel失败:', error)
      alert('导出失败，请稍后重试')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Button outline onClick={exportToExcel} disabled={exporting}>
      <ArrowDownTrayIcon />
      {exporting ? '导出中...' : '导出Excel'}
    </Button>
  )
}
