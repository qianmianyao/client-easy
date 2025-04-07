'use client'

import { updateCustomerNotes } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Input } from './input'

interface EditableNotesProps {
  initialValue: string | null
  customerId: number
}

export function EditableNotes({ initialValue, customerId }: EditableNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')
  const [originalValue, setOriginalValue] = useState(initialValue || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClick = () => {
    if (!isEditing && !isUpdating) {
      setIsEditing(true)
    }
  }

  const handleBlur = async () => {
    // 如果值没有变化，不执行更新
    if (value === originalValue) {
      setIsEditing(false)
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('customerId', customerId.toString())
      formData.append('notes', value)

      await updateCustomerNotes(formData)
      setOriginalValue(value)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新备注失败')
      console.error(err)
    } finally {
      setIsUpdating(false)
      setIsEditing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      inputRef.current?.blur()
    } else if (e.key === 'Escape') {
      setValue(originalValue) // 重置为原始值
      setIsEditing(false)
    }
  }

  // Handle outside clicks
  useEffect(() => {
    if (!isEditing) return

    function handleOutsideClick(event: PointerEvent) {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleBlur()
      }
    }

    document.addEventListener('pointerdown', handleOutsideClick)
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isEditing, value, originalValue])

  if (isEditing) {
    return (
      <div style={{ minHeight: '32px' }}>
        <Input
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          ref={inputRef}
          className="min-h-[32px]"
        />
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
    )
  }

  return (
    <div onClick={handleClick} className="min-h-6 cursor-pointer" style={{ minHeight: '32px', padding: '6px 0' }}>
      {isUpdating ? (
        <div className="flex items-center">
          <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <span className="text-sm text-zinc-500">更新中...</span>
        </div>
      ) : (
        <span className="text-sm text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white">
          {value || '点击添加备注'}
        </span>
      )}
    </div>
  )
}
