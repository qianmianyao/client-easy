'use client'

import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import { updateUserPassword } from '@/lib/actions'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// 用户角色中文名称映射
const roleLabels: Record<string, string> = {
  admin: '系统管理员',
  manager: '部门管理员',
  staff: '普通员工',
  guest: '访客',
}

export default function Settings() {
  const router = useRouter()
  const { data: session } = useSession()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<boolean>(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState<boolean>(false)

  // 获取用户角色
  const userRole = session?.user?.role || 'guest'
  const roleLabel = roleLabels[userRole] || '未知身份'

  const resetPassword = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setPasswordError(null)
    setPasswordSuccess(false)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setPasswordError(null)
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPasswordLoading(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    // 验证两次输入的密码是否一致
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('两次输入的新密码不一致')
      setIsPasswordLoading(false)
      return
    }

    try {
      const formDataObj = new FormData()
      formDataObj.append('currentPassword', passwordData.currentPassword)
      formDataObj.append('newPassword', passwordData.newPassword)

      const result = await updateUserPassword(formDataObj)
      if (result.success) {
        setPasswordSuccess(true)
        resetPassword()
      }
    } catch (error) {
      console.error('更新密码时出错:', error)
      setPasswordError(error instanceof Error ? error.message : '更新密码失败')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <Heading>个人资料信息</Heading>
        <Divider className="my-10 mt-6" />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>当前身份</Subheading>
            <Text>您在系统中的角色</Text>
          </div>
          <div>
            <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-zinc-700">
              {roleLabel}
            </div>
          </div>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>用户名</Subheading>
            <Text>您的登录用户名</Text>
          </div>
          <div>
            <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-zinc-700">
              {session?.user?.name || ''}
            </div>
          </div>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>登录邮箱</Subheading>
            <Text>您的登录邮箱</Text>
          </div>
          <div>
            <div className="flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50 px-3 text-zinc-700">
              {session?.user?.email || ''}
            </div>
          </div>
        </section>
      </div>

      <form onSubmit={handlePasswordSubmit}>
        <Heading>修改密码</Heading>
        <Divider className="my-10 mt-6" />

        {passwordError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-700">
            <p>{passwordError}</p>
          </div>
        )}

        {passwordSuccess && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
            <p>密码已成功更新</p>
          </div>
        )}

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>当前密码</Subheading>
            <Text>请输入你的当前密码</Text>
          </div>
          <div>
            <Input
              type="password"
              aria-label="当前密码"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>新密码</Subheading>
            <Text>请输入你的新密码</Text>
          </div>
          <div>
            <Input
              type="password"
              aria-label="新密码"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
        </section>

        <Divider className="my-10" soft />

        <section className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div className="space-y-1">
            <Subheading>确认新密码</Subheading>
            <Text>请再次输入你的新密码</Text>
          </div>
          <div>
            <Input
              type="password"
              aria-label="确认新密码"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
        </section>

        <Divider className="my-10" soft />

        <div className="flex justify-end gap-4">
          <Button type="button" plain onClick={resetPassword} disabled={isPasswordLoading}>
            重置
          </Button>
          <Button type="submit" disabled={isPasswordLoading}>
            {isPasswordLoading ? '更新中...' : '更新密码'}
          </Button>
        </div>
      </form>
    </div>
  )
}
