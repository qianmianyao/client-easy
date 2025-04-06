'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { Listbox, ListboxLabel, ListboxOption } from '@/components/listbox'
import { Textarea } from '@/components/textarea'
import { createCustomer } from '@/lib/actions'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function NewCustomerDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 关闭对话框并重置状态
  const handleClose = () => {
    setIsOpen(false)
    setError('')
  }

  // 客户情况选项
  const customerStatusOptions = ['新客户', '老客户', '重点客户', '流失客户']

  // 成交记录选项
  const transactionStatusOptions = ['已成交', '未成交', '待跟进', '已取消']

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    try {
      await createCustomer(formData)
      setIsOpen(false)
      // 刷新页面数据以显示新记录
      router.refresh()
    } catch (error) {
      console.error('Error creating record:', error)
      setError(error instanceof Error ? error.message : '创建记录失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)}>
        <PlusIcon />
        添加
      </Button>
      <Dialog open={isOpen} onClose={handleClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>新建客户</DialogTitle>
          <DialogDescription>填写信息以创建新的客户记录。</DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

              <div className="space-y-4 pt-2">
                <Field>
                  <Label>客户名称</Label>
                  <Input name="customerName" placeholder="输入客户名称" required />
                </Field>
                <Field>
                  <Label>手机号</Label>
                  <Input name="phoneNumber" placeholder="输入客户手机号" required />
                </Field>
                <Field>
                  <Label>客户归属</Label>
                  <Input name="affiliation" placeholder="输入客户归属" />
                </Field>
                <Field>
                  <Label>客户情况</Label>
                  <Listbox name="customerStatus" defaultValue="新客户">
                    {customerStatusOptions.map((option) => (
                      <ListboxOption key={option} value={option}>
                        <ListboxLabel>{option}</ListboxLabel>
                      </ListboxOption>
                    ))}
                  </Listbox>
                </Field>
                <Field>
                  <Label>成交记录</Label>
                  <Listbox name="transactionStatus" defaultValue="未成交">
                    {transactionStatusOptions.map((option) => (
                      <ListboxOption key={option} value={option}>
                        <ListboxLabel>{option}</ListboxLabel>
                      </ListboxOption>
                    ))}
                  </Listbox>
                </Field>
                <Field>
                  <Label>备注</Label>
                  <Textarea name="description" placeholder="添加备注信息" />
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
