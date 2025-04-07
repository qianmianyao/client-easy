'use client'

import { Avatar } from '@/components/avatar'
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@/components/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@/components/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'
import { SidebarLayout } from '@/components/sidebar-layout'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  DocumentChartBarIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid'
import { signOut, useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

// 用户角色中文名称映射
const roleLabels: Record<string, string> = {
  admin: '系统管理员',
  manager: '部门管理员',
  staff: '普通员工',
  guest: '访客',
}

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  return (
    <DropdownMenu className="min-w-64" anchor={anchor}>
      <DropdownItem href="/settings">
        <UserCircleIcon />
        <DropdownLabel>我的信息</DropdownLabel>
      </DropdownItem>
      <DropdownDivider />
      <DropdownItem onClick={() => signOut({ callbackUrl: '/login' })}>
        <ArrowRightStartOnRectangleIcon />
        <DropdownLabel>退出登录</DropdownLabel>
      </DropdownItem>
    </DropdownMenu>
  )
}

export function ApplicationLayout({ children }: { children: React.ReactNode }) {
  let pathname = usePathname()
  const { data: session, status } = useSession()

  // 获取用户信息
  const username = session?.user?.name || '用户'
  const email = session?.user?.email || ''
  const role = session?.user?.role || 'guest'
  const roleLabel = roleLabels[role] || '未知身份'

  // 根据用户名首字母创建头像初始字母
  const initials = username ? username.charAt(0).toUpperCase() : 'U'

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <Avatar initials={initials} square />
              </DropdownButton>
              <AccountDropdownMenu anchor="bottom end" />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <Avatar src="/teams/catalyst.svg" />
                <SidebarLabel>客户管理系统</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/settings">
                  <Cog8ToothIcon />
                  <DropdownLabel>设置</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/">
                  <Avatar slot="icon" src="/teams/catalyst.svg" />
                  <DropdownLabel>客户管理</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" current={pathname === '/'}>
                <HomeIcon />
                <SidebarLabel>主页</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/data-analysis" current={pathname === '/data-analysis'}>
                <DocumentChartBarIcon />
                <SidebarLabel>数据分析</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/settings" current={pathname.startsWith('/settings')}>
                <Cog6ToothIcon />
                <SidebarLabel>设置</SidebarLabel>
              </SidebarItem>
              {(role === 'admin' || role === 'manager') && (
                <SidebarItem href="/admin" current={pathname.startsWith('/admin')}>
                  <UserGroupIcon />
                  <SidebarLabel>管理员</SidebarLabel>
                </SidebarItem>
              )}
            </SidebarSection>
            <SidebarSpacer />
            {/* 底部 */}
            <SidebarSection>
              <SidebarItem href="/help">
                <QuestionMarkCircleIcon />
                <SidebarLabel>帮助</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/updateLog">
                <SparklesIcon />
                <SidebarLabel>更新日志</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar initials={initials} className="size-10" square alt="" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      {username} <small className="text-xs text-zinc-500">({roleLabel})</small>
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      {email}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
