'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { createCustomerAffiliation } from '@/lib/actions'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function NewAffiliationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 关闭对话框并重置状态
  const handleClose = () => {
    setIsOpen(false)
    setError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    try {
      await createCustomerAffiliation(formData)
      setIsOpen(false)
      // 刷新页面数据以显示新记录
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建客户归属失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button outline onClick={() => setIsOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        添加归属
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>新建客户归属</DialogTitle>
          <DialogDescription>填写信息以创建新的客户归属，您创建的归属仅自己可见。</DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

              <div className="space-y-4 pt-2">
                <Field>
                  <Label>归属名称</Label>
                  <Input name="name" placeholder="输入归属名称" required />
                </Field>
                <Field>
                  <Label>头像地址</Label>
                  <Input name="avatar" placeholder="输入头像URL地址（可选）" />
                </Field>
                <Field>
                  <Label>链接</Label>
                  <Input name="link" placeholder="输入相关链接（可选）" />
                </Field>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={handleClose} type="button" disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '创建'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
