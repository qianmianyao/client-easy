import { Heading, Subheading } from '@/components/heading'
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
import { getUsers } from '@/lib/actions'
import { authOptions } from '@/lib/auth'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/16/solid'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ChangePasswordDialog } from '../components/change-password-dialog'
import { DeleteUserDialog } from '../components/delete-user-dialog'

export default async function Admin({
  searchParams,
}: {
  searchParams: {
    search?: string
    page?: string
  }
}) {
  // 获取当前会话
  const session = await getServerSession(authOptions)

  // 检查用户权限
  if (!session?.user || session.user.role !== 'admin') {
    // 如果不是管理员，重定向到首页
    redirect('/')
  }

  // 获取搜索查询和当前页码
  const searchQuery = searchParams.search || ''
  const currentPage = parseInt(searchParams.page || '1', 10)
  const itemsPerPage = 10

  // 获取用户列表和分页信息
  const { users, totalPages } = await getUsers(searchQuery, currentPage, itemsPerPage)

  // 角色中文名称映射
  const roleLabels: Record<string, string> = {
    admin: '系统管理员',
    manager: '部门管理员',
    staff: '普通员工',
    guest: '访客',
  }

  // 生成分页链接的工具函数
  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams()
    if (searchQuery) {
      params.set('search', searchQuery)
    }
    params.set('page', pageNum.toString())
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
      <Heading>用户管理</Heading>
      <Subheading className="mt-6">管理所有用户账户</Subheading>

      {/* 搜索栏 */}
      <div className="mt-6 w-72">
        <form className="relative">
          <InputGroup>
            <MagnifyingGlassIcon />
            <Input name="search" placeholder="搜索用户名、邮箱或角色..." defaultValue={searchQuery} />
            {searchQuery && (
              <a href="?search=" className="absolute top-1/2 right-2 -translate-y-1/2 p-1">
                <XMarkIcon className="h-4 w-4 text-zinc-500 hover:text-zinc-700" />
              </a>
            )}
          </InputGroup>
        </form>
      </div>

      {/* 用户表格 */}
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>操作</TableHeader>
            <TableHeader>用户名</TableHeader>
            <TableHeader>邮箱</TableHeader>
            <TableHeader>角色</TableHeader>
            <TableHeader>创建时间</TableHeader>
            <TableHeader>最后登录</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <DeleteUserDialog userId={user.id} username={user.username} />
                  <ChangePasswordDialog userId={user.id} username={user.username} />
                </div>
              </TableCell>
              <TableCell>
                <Strong>{user.username}</Strong>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{roleLabels[user.role]}</TableCell>
              <TableCell>{new Date(Number(user.createdAt)).toLocaleString()}</TableCell>
              <TableCell>{user.lastLogin ? new Date(Number(user.lastLogin)).toLocaleString() : '从未登录'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 分页控件 */}
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
