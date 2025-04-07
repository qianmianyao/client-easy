'use client'

import { Alert, AlertActions, AlertBody, AlertTitle } from '@/components/alert'
import { Button } from '@/components/button'
import { Strong, Text } from '@/components/text'
import { deleteUser } from '@/lib/actions'
import { TrashIcon } from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteUserDialog({ userId, username }: { userId: number; username: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        setIsOpen(false)
        // 刷新页面以更新用户列表
        router.refresh()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '删除用户失败')
      console.error('删除用户失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <span className="cursor-pointer text-zinc-500 underline decoration-zinc-400/50 transition-colors duration-200 hover:text-red-500 hover:decoration-red-500/70 dark:text-zinc-400 dark:decoration-zinc-400/50 dark:hover:text-red-400 dark:hover:decoration-red-400/70">
        <TrashIcon className="h-4 w-4" onClick={() => setIsOpen(true)} />
      </span>
      <Alert open={isOpen} onClose={setIsOpen}>
        <AlertTitle>删除用户</AlertTitle>
        <AlertBody>
          <Text>
            你确定要删除用户 <Strong>{username}</Strong> 吗？
          </Text>
          <Text>删除用户后无法恢复，该用户将无法再登录系统。</Text>
          {error && <Text className="mt-2 text-red-600">{error}</Text>}
        </AlertBody>
        <AlertActions>
          <Button color="rose" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? '删除中...' : '确定删除'}
          </Button>
          <Button onClick={() => setIsOpen(false)} disabled={isDeleting}>
            取消
          </Button>
        </AlertActions>
      </Alert>
    </>
  )
}
