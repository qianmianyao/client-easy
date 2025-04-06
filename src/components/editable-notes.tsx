'use client'

import { useState } from 'react'
import { Input } from './input'

interface EditableNotesProps {
  initialValue: string | null
  customerId: number
}

export function EditableNotes({ initialValue, customerId }: EditableNotesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    // Here you would typically save the value to the database
    // For example: updateCustomerNotes(customerId, value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  if (isEditing) {
    return <Input value={value} onChange={handleChange} onBlur={handleBlur} autoFocus />
  }

  return (
    <div onClick={handleClick} className="min-h-6 cursor-pointer">
      {value || '点击添加备注'}
    </div>
  )
}
