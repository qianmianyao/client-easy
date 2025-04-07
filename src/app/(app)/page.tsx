import { EditableNotes } from '@/components/editable-notes'
import { EditableStatus } from '@/components/editable-status'
import { Heading } from '@/components/heading'
import { Input, InputGroup } from '@/components/input'
import {
  Pagination,
  PaginationGap,
  PaginationList,
  PaginationNext,
  PaginationPage,
  PaginationPrevious,
} from '@/components/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Strong } from '@/components/text'
import { getCustomers, getDashboardStats } from '@/lib/actions'
import { authOptions } from '@/lib/auth'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { getServerSession } from 'next-auth'
import { AffiliationDialog } from './components/affiliation-dialog'
import { DashboardStatsWrapper } from './components/dashboard-stats'
import { DeleteCustomerDialog } from './components/delete-customer-dialog'
import { DetailsDialog } from './components/details-dialog'
import { ExportCustomersButton } from './components/export-customers-button'
import { NewAffiliationDialog } from './components/new-affiliation-dialog'
import { NewCustomerDialog } from './components/new-customer-dialog'

export default async function Home({
  searchParams,
}: {
  searchParams: {
    search?: string
    page?: string
    period?: string
  }
}) {
  // 获取搜索查询
  const searchQuery = searchParams.search || ''

  // 获取当前页码，默认为1
  const currentPage = parseInt(searchParams.page || '1', 10)

  // 获取选择的时间周期，默认为上周
  const selectedPeriod = searchParams.period || 'last_week'

  // 每页显示的记录数
  const itemsPerPage = 10

  // 获取客户数据和分页信息
  const { customers, totalPages } = await getCustomers(searchQuery, currentPage, itemsPerPage)

  // 获取仪表盘统计数据（初始数据）
  const dashboardStats = await getDashboardStats(selectedPeriod)

  const session = await getServerSession(authOptions)
  const userName = session?.user?.name || '访客'

  // 客户情况选项
  const customerStatusOptions = ['进群', '已退群', '已圈上', '被拉黑', '封号失联', '重复', '返回']

  // 成交记录选项
  const transactionStatusOptions = ['已成交', '未成交', '待跟进']

  // 根据一天中的时间选择问候语和表情符号
  const currentHour = new Date().getHours()
  let greeting = ''
  let emoji = ''

  if (currentHour >= 5 && currentHour < 12) {
    greeting = '早上好'
    emoji = '🌞'
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = '下午好'
    emoji = '☀️'
  } else {
    greeting = '晚上好'
    emoji = '🌙'
  }

  // 生成分页链接的工具函数
  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    params.set('page', pageNum.toString())

    // 保持周期选择
    if (selectedPeriod) {
      params.set('period', selectedPeriod)
    }

    return `?${params.toString()}`
  }

  // 生成分页项
  const renderPaginationItems = () => {
    const items = []

    // 最多显示5个页码按钮
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    // 调整startPage确保显示足够的页码
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationPage key={i} href={getPageUrl(i)} current={i === currentPage}>
          {i}
        </PaginationPage>
      )
    }

    // 如果不是从第一页开始，添加第一页和省略号
    if (startPage > 1) {
      items.unshift(
        <PaginationPage key={1} href={getPageUrl(1)}>
          1
        </PaginationPage>
      )

      if (startPage > 2) {
        items.splice(1, 0, <PaginationGap key="gap1" />)
      }
    }

    // 如果不是到最后一页结束，添加最后一页和省略号
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<PaginationGap key="gap2" />)
      }

      items.push(
        <PaginationPage key={totalPages} href={getPageUrl(totalPages)}>
          {totalPages}
        </PaginationPage>
      )
    }

    return items
  }

  return (
    <>
      <Heading>
        {greeting}, {userName} {emoji}
      </Heading>
      <div className="mt-8">
        <DashboardStatsWrapper initialPeriod={selectedPeriod} initialStats={dashboardStats} />
      </div>
      <div className="mt-14 flex items-center justify-between">
        <div className="w-72">
          <form className="relative">
            <InputGroup>
              <MagnifyingGlassIcon />
              <Input name="search" placeholder="开始全局搜索，支持任意字段&hellip;" defaultValue={searchQuery} />
              {searchQuery && (
                <a href="?search=" className="absolute top-1/2 right-2 -translate-y-1/2 p-1">
                  <XMarkIcon className="h-4 w-4 text-zinc-500 hover:text-zinc-700" />
                </a>
              )}
            </InputGroup>
          </form>
        </div>
        <div className="flex items-center space-x-2">
          <ExportCustomersButton searchQuery={searchQuery} />
          <NewAffiliationDialog />
          <NewCustomerDialog />
        </div>
      </div>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>操作</TableHeader>
            <TableHeader>客户名称</TableHeader>
            <TableHeader>手机号</TableHeader>
            <TableHeader>客户归属</TableHeader>
            <TableHeader>客户情况</TableHeader>
            <TableHeader>成交情况</TableHeader>
            <TableHeader>成交明细</TableHeader>
            <TableHeader>备注</TableHeader>
            <TableHeader>提交用户</TableHeader>
            <TableHeader>提交时间</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell>
                <DeleteCustomerDialog customerId={customer.id} phoneNumber={customer.phoneNumber || ''} />
              </TableCell>
              <TableCell>
                <Strong>{customer.customerName}</Strong>
              </TableCell>
              <TableCell>{customer.phoneNumber}</TableCell>
              <TableCell>
                <AffiliationDialog
                  phoneNumber={customer.phoneNumber || ''}
                  customerId={customer.id}
                  initialAffiliation={customer.affiliation}
                />
              </TableCell>
              <TableCell>
                <EditableStatus
                  initialValue={customer.customerStatus}
                  customerId={customer.id}
                  options={customerStatusOptions}
                  color="lime"
                  type="customerStatus"
                />
              </TableCell>
              <TableCell>
                <EditableStatus
                  initialValue={customer.transactionStatus}
                  customerId={customer.id}
                  options={transactionStatusOptions}
                  color="purple"
                  type="transactionStatus"
                />
              </TableCell>
              <TableCell>
                <DetailsDialog userName={customer.phoneNumber || ''} customerId={customer.id} />
              </TableCell>
              <TableCell>
                <EditableNotes initialValue={customer.notes} customerId={customer.id} />
              </TableCell>
              <TableCell>{customer.submitUser}</TableCell>
              <TableCell>{new Date(Number(customer.submitTime)).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-6 flex justify-center">
        {totalPages > 1 && (
          <Pagination>
            {currentPage > 1 && <PaginationPrevious href={getPageUrl(currentPage - 1)}>上一页</PaginationPrevious>}
            <PaginationList>{renderPaginationItems()}</PaginationList>
            {currentPage < totalPages && <PaginationNext href={getPageUrl(currentPage + 1)}>下一页</PaginationNext>}
          </Pagination>
        )}
      </div>
    </>
  )
}
