'use client'

import { useState } from 'react'
import { Badge } from './badge'
import { Listbox, ListboxOption } from './listbox'

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
}

export function EditableStatus({ initialValue, customerId, options, color = 'blue' }: EditableStatusProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue || '')

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleChange = (newValue: string) => {
    setValue(newValue)
    setIsEditing(false)
    // Here you would typically save the value to the database
    // For example: updateCustomerStatus(customerId, newValue)
  }

  if (isEditing) {
    return (
      <Listbox name="status" value={value} onChange={handleChange} autoFocus>
        {options.map((option) => (
          <ListboxOption key={option} value={option}>
            {option}
          </ListboxOption>
        ))}
      </Listbox>
    )
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <Badge color={color}>{value || '点击选择'}</Badge>
    </div>
  )
}
