'use client'

import { updateCustomerStatus, updateTransactionStatus } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Badge } from './badge'

interface EditableStatusProps {
  initialValue: string | null
  customerId: number
  options: string[]
  color?:
    | 'amber'
    | 'blue'
    | 'cyan'
    | 'emerald'
    | 'fuchsia'
    | 'indigo'
    | 'lime'
    | 'orange'
    | 'pink'
    | 'purple'
    | 'red'
    | 'rose'
    | 'sky'
    | 'teal'
    | 'violet'
    | 'yellow'
  type: 'customerStatus' | 'transactionStatus'
}

export function EditableStatus({ initialValue, customerId, options, color = 'blue', type }: EditableStatusProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const router = useRouter()

  const handleClick = () => {
    if (!isEditing && !isUpdating) {
      setIsEditing(true)
      // 延迟聚焦，确保select元素已经渲染
      setTimeout(() => {
        selectRef.current?.focus()
      }, 10)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value

    // 如果值没有变化，不执行更新
    if (newValue === value) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customerId.toString())
      formData.append('status', newValue)

      if (type === 'customerStatus') {
        await updateCustomerStatus(formData)
      } else {
        await updateTransactionStatus(formData)
      }

      setValue(newValue)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败')
      console.error(err)
    } finally {
      setIsUpdating(false)
      setIsEditing(false)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  // 根据状态选择颜色
  const getColorForStatus = (status: string): EditableStatusProps['color'] => {
    if (type === 'customerStatus') {
      switch (status) {
        case '进群':
          return 'emerald'
        case '已退群':
          return 'amber'
        case '已圈上':
          return 'blue'
        case '被拉黑':
          return 'red'
        case '封号失联':
          return 'orange'
        case '重复':
          return 'yellow'
        case '返回':
          return 'indigo'
        default:
          return 'blue'
      }
    } else {
      // transactionStatus
      switch (status) {
        case '已成交':
          return 'lime'
        case '未成交':
          return 'red'
        case '待跟进':
          return 'amber'
        default:
          return 'purple'
      }
    }
  }

  // 获取当前状态的颜色
  const currentColor = getColorForStatus(value)

  if (isEditing) {
    return (
      <div className="relative" style={{ minHeight: '32px' }}>
        <select
          ref={selectRef}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          autoFocus
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
    )
  }

  return (
    <div onClick={handleClick} className="cursor-pointer" style={{ minHeight: '32px' }}>
      {isUpdating ? (
        <div className="flex items-center">
          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <span className="text-sm text-zinc-500">更新中...</span>
        </div>
      ) : (
        <Badge color={currentColor}>{value || '点击选择'}</Badge>
      )}
    </div>
  )
}
