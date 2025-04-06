'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export function useAuth({ required = true, redirectTo = '/login' } = {}) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  // 如果需要认证但未认证，则重定向
  if (required && !isLoading && !isAuthenticated) {
    redirect(redirectTo)
  }

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
  }
}
