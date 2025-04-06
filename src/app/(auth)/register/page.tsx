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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
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
        <Label>邮箱</Label>
        <Input type="email" name="email" disabled={loading} required />
      </Field>
      <Field>
        <Label>用户名</Label>
        <Input name="name" disabled={loading} required />
      </Field>
      <Field>
        <Label>密码</Label>
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
