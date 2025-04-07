'use client'

import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import { registerUser } from '@/lib/actions'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [showAdminKeyField, setShowAdminKeyField] = useState(false)
  const ADMIN_KEY = 'xxt-admin0011889'

  // 监听用户名变化
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    setShowAdminKeyField(value === 'admin')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)

      // 检查是否为管理员注册
      if (username === 'admin') {
        const adminKey = formData.get('adminKey') as string
        if (adminKey !== ADMIN_KEY) {
          setError('管理员密钥不正确')
          setLoading(false)
          return
        }
        // 添加管理员角色标记
        formData.append('isAdmin', 'true')
      }

      const result = await registerUser(formData)

      if (result?.success) {
        // 注册成功，显示成功消息
        setError('')
        // 在延迟后重定向到登录页面，给用户时间看到成功消息
        setTimeout(() => {
          router.push('/login?registered=true')
        }, 1000)
      }
    } catch (err) {
      console.error('注册时发生错误', err)
      setError(err instanceof Error ? err.message : '注册时发生错误，请稍后再试')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Link href="/">
        <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      </Link>
      <Heading>创建您的账户</Heading>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

      <Field>
        <Label>
          用户名 <Text>请注意，设置后无法更改</Text>
        </Label>
        <Input name="name" disabled={loading} required value={username} onChange={handleUsernameChange} />
      </Field>

      {showAdminKeyField && (
        <Field>
          <Label>
            管理员密钥 <Text>请输入管理员密钥</Text>
          </Label>
          <Input name="adminKey" type="password" disabled={loading} required />
        </Field>
      )}

      <Field>
        <Label>
          邮箱 <Text>请输入您的邮箱</Text>
        </Label>
        <Input type="email" name="email" disabled={loading} required />
      </Field>
      <Field>
        <Label>
          密码 <Text>密码不能少于 6 位</Text>
        </Label>
        <Input type="password" name="password" autoComplete="new-password" disabled={loading} required minLength={6} />
      </Field>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '创建中...' : '创建账户'}
      </Button>
      <Text>
        已有账户？{' '}
        <TextLink href="/login">
          <Strong>登录</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
