'use client'

import { Logo } from '@/app/logo'
import { Button } from '@/components/button'
import { Checkbox, CheckboxField } from '@/components/checkbox'
import { Field, Label } from '@/components/fieldset'
import { Heading } from '@/components/heading'
import { Input } from '@/components/input'
import { Strong, Text, TextLink } from '@/components/text'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// Component that uses search params
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const registered = searchParams.get('registered') === 'true'
  const authError = searchParams.get('authError')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [passwordValue, setPasswordValue] = useState('')

  // 检查URL参数
  useEffect(() => {
    // 注册成功提示
    if (registered) {
      setSuccess('注册成功！请使用您的凭据登录。')
    }

    // 来自auth错误页的错误
    if (authError) {
      if (authError === 'CredentialsSignin') {
        setError('登录失败，账号或密码错误')
      } else {
        setError(`登录失败: ${authError}`)
      }
      // 清除URL中的错误参数，保持URL干净
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('authError')

      // 使用history API替换当前URL，保留callbackUrl
      if (callbackUrl && callbackUrl !== '/') {
        newUrl.searchParams.set('callbackUrl', callbackUrl)
      }

      window.history.replaceState({}, '', newUrl)
    }

    // 检查是否有错误参数
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'CredentialsSignin') {
        setError('登录失败，请检查您的账号和密码')
      } else {
        setError(`登录出错: ${errorParam}`)
      }

      // 清除URL中的错误参数
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('error')

      // 保留callbackUrl
      if (callbackUrl && callbackUrl !== '/') {
        newUrl.searchParams.set('callbackUrl', callbackUrl)
      }

      window.history.replaceState({}, '', newUrl)
    }
  }, [registered, authError, searchParams, callbackUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (!emailOrUsername || !passwordValue) {
        setError('请填写账号和密码')
        setLoading(false)
        return
      }

      // 使用 redirect: false 确保不会发生自动重定向
      const result = await signIn('credentials', {
        redirect: false,
        email: emailOrUsername,
        password: passwordValue,
      })

      if (!result?.ok) {
        // 处理各种错误情况
        if (result?.error === 'CredentialsSignin') {
          setError('登录失败，账号或密码错误')
        } else if (result?.error) {
          setError(`登录失败: ${result.error}`)
        } else {
          setError('登录失败，请稍后再试')
        }
        setLoading(false)
        return
      }
      // 登录成功，手动重定向到指定页面
      console.log('登录成功，重定向到:', callbackUrl)

      // 使用window.location进行硬重定向，而不是router.push
      window.location.href = callbackUrl
    } catch (err) {
      console.error('登录过程中发生异常:', err)
      setError('登录时发生错误，请稍后再试')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Link href="/">
        <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      </Link>
      <Heading>登录您的账户</Heading>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}
      {success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">{success}</div>}

      <Field>
        <Label>邮箱或用户名</Label>
        <Input
          type="text"
          name="email"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          disabled={loading}
          placeholder="请输入邮箱或用户名"
        />
      </Field>
      <Field>
        <Label>密码</Label>
        <Input
          type="password"
          name="password"
          value={passwordValue}
          onChange={(e) => setPasswordValue(e.target.value)}
          disabled={loading}
          placeholder="请输入密码"
        />
      </Field>
      <div className="flex items-center justify-between">
        <CheckboxField>
          <Checkbox name="remember" disabled={loading} />
          <Label>记住我</Label>
        </CheckboxField>
        <Text>
          <TextLink href="/forgot-password">
            <Strong>忘记密码？</Strong>
          </TextLink>
        </Text>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>
      <Text>
        还没有账户？{' '}
        <TextLink href="/register">
          <Strong>注册</Strong>
        </TextLink>
      </Text>
    </form>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
