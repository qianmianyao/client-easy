'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { adminUpdateUserPassword } from '@/lib/actions'
import { KeyIcon } from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function ChangePasswordDialog({ userId, username }: { userId: number; username: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const router = useRouter()

  // 关闭对话框并重置状态
  const handleClose = () => {
    setIsOpen(false)
    setError(null)
    setSuccess(false)
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    })
  }

  // 表单字段更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  // 提交表单
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const { newPassword, confirmPassword } = passwordData

    // 验证密码
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      setIsSubmitting(false)
      return
    }

    if (newPassword.length < 6) {
      setError('密码长度不能少于6位')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('userId', userId.toString())
      formData.append('newPassword', newPassword)

      const result = await adminUpdateUserPassword(formData)

      if (result.success) {
        setSuccess(true)
        // 重置表单
        setPasswordData({
          newPassword: '',
          confirmPassword: '',
        })
        // 3秒后自动关闭对话框
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
        }, 3000)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '更新密码失败')
      console.error('更新密码失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <span className="cursor-pointer text-zinc-500 underline decoration-zinc-400/50 transition-colors duration-200 hover:text-blue-500 hover:decoration-blue-500/70 dark:text-zinc-400 dark:decoration-zinc-400/50 dark:hover:text-blue-400 dark:hover:decoration-blue-400/70">
        <KeyIcon className="h-4 w-4" onClick={() => setIsOpen(true)} />
      </span>
      <Dialog open={isOpen} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>修改用户密码</DialogTitle>
          <DialogDescription>为用户 {username} 设置新密码</DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}
              {success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">密码修改成功！</div>}

              <div className="space-y-4 pt-2">
                <Field>
                  <Label>新密码</Label>
                  <Input
                    type="password"
                    name="newPassword"
                    placeholder="输入新密码"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={isSubmitting || success}
                  />
                </Field>
                <Field>
                  <Label>确认密码</Label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="再次输入新密码"
                    value={passwordData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    disabled={isSubmitting || success}
                  />
                </Field>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={handleClose} type="button" disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || success}>
              {isSubmitting ? '提交中...' : '更新密码'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
