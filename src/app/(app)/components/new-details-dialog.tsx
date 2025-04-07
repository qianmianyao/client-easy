'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Field, Label } from '@/components/fieldset'
import { Input } from '@/components/input'
import { createDetails } from '@/lib/actions'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function NewDetailsDialog({
  userName,
  customerId,
  onTransactionAdded,
}: {
  userName: string
  customerId: number
  onTransactionAdded?: () => void
}) {
  let [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quantity, setQuantity] = useState<number>(0)
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0)
  const router = useRouter()

  // 计算总金额
  useEffect(() => {
    setCalculatedAmount(quantity * unitPrice)
  }, [quantity, unitPrice])

  // 处理数量变化
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : 0
    setQuantity(value)
  }

  // 处理单价变化
  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0
    setUnitPrice(value)
  }

  // 关闭对话框并重置状态
  const handleClose = () => {
    setIsOpen(false)
    setError('')
    setQuantity(0)
    setUnitPrice(0)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    const formData = new FormData(event.currentTarget)
    console.log(formData)

    try {
      await createDetails(formData)
      setIsOpen(false)

      // 调用父组件的回调函数（如果提供了）
      if (onTransactionAdded) {
        onTransactionAdded()
      }

      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : '创建记录失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 格式化金额为美元格式
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <button
          className="flex h-5 w-5 items-center justify-center rounded-full bg-lime-100 transition-colors hover:bg-lime-200 dark:bg-lime-900 dark:hover:bg-lime-800"
          onClick={() => setIsOpen(true)}
        >
          <PlusIcon className="h-3 w-3 text-lime-700 dark:text-lime-300" />
        </button>
      </div>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>添加 {userName} 的成交明细</DialogTitle>
          <DialogDescription>请输入成交明细信息，如果客户有多次成交，请多次添加</DialogDescription>
          <DialogBody>
            {/* 表单部分 */}
            <div className="space-y-4">
              {error && <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>}

              {/* 添加隐藏的客户ID字段 */}
              <input type="hidden" name="customerId" value={customerId} />

              <div className="space-y-4 pt-2">
                <Field>
                  <Label>商品名称</Label>
                  <Input type="text" name="productName" placeholder="输入商品名称" required />
                </Field>
                <Field>
                  <Label>成交数量</Label>
                  <Input
                    type="number"
                    name="quantity"
                    placeholder="输入成交数量"
                    required
                    onChange={handleQuantityChange}
                  />
                </Field>
                <Field>
                  <Label>单价</Label>
                  <Input
                    type="number"
                    name="unitPrice"
                    placeholder="输入商品单价"
                    required
                    onChange={handleUnitPriceChange}
                  />
                </Field>
                <Field>
                  <Label>
                    成交金额{' '}
                    {calculatedAmount > 0 && (
                      <span className="text-muted-foreground text-sm">
                        （自动计算：{formatCurrency(calculatedAmount)}）
                      </span>
                    )}
                  </Label>
                  <Input type="number" name="totalAmount" placeholder="输入成交金额或留空自动计算" />
                </Field>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button plain onClick={handleClose} type="button" disabled={isSubmitting}>
              关闭提交窗口
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '提交中...' : '提交一条记录'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
