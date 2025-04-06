'use client'

import { Button } from '@/components/button'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { EmptyStates } from '@/components/empty-states'
import { PlusIcon } from '@heroicons/react/16/solid'
import { useState } from 'react'

export function NewDetailsDialog({ userName }: { userName: string }) {
  let [isOpen, setIsOpen] = useState(false)

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
        <DialogTitle>添加 {userName} 的成交明细</DialogTitle>
        <DialogDescription>请输入成交明细信息，如果客户有多次成交，请多次添加</DialogDescription>
        <DialogBody>
          <EmptyStates />
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
