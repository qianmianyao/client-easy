import { Logo } from '@/app/logo'
import { Heading } from '@/components/heading'
import { Strong, Text, TextLink } from '@/components/text'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '忘记密码',
}

export default function Login() {
  return (
    <form action="" method="POST" className="grid w-full max-w-sm grid-cols-1 gap-8">
      <Link href="/">
        <Logo className="h-6 text-zinc-950 dark:text-white forced-colors:text-[CanvasText]" />
      </Link>
      <Heading>重置您的密码</Heading>
      <Text>请联系你的管理员帮你重置密码</Text>
      <Text>
        还没有账户？{' '}
        <TextLink href="/register">
          <Strong>注册</Strong>
        </TextLink>
      </Text>
    </form>
  )
}
