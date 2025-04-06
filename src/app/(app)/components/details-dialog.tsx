'use client'

import { Button } from '@/components/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { Text, TextLink } from '@/components/text'
import { useState } from 'react'
import { NewDetailsDialog } from './new-details-dialog'

export function DetailsDialog({ userName, userId }: { userName: string; userId: number }) {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="flex items-center space-x-4">
        <span
          className="cursor-pointer text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white"
          onClick={() => setIsOpen(true)}
        >
          查看明细
        </span>
        <NewDetailsDialog userName={userName} />
      </div>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>{userName} 的成交明细</DialogTitle>
        <DialogDescription>
          当前页面的明细是多个成交的总和数据展示，只包含成交总数量，单价总和，成交总金额
        </DialogDescription>
        <DialogBody>
          <DescriptionList>
            <DescriptionTerm>成交总数量</DescriptionTerm>
            <DescriptionDetails>2</DescriptionDetails>
            <DescriptionTerm>单价总金额</DescriptionTerm>
            <DescriptionDetails>$1000</DescriptionDetails>
            <DescriptionTerm>成交总金额</DescriptionTerm>
            <DescriptionDetails>$150.00 USD</DescriptionDetails>
            <DescriptionTerm>商品</DescriptionTerm>
            <DescriptionDetails>
              <div className="flex flex-col">
                <span>nike air yeezy 2</span>
                <span>nike air yeezy 1</span>
              </div>
            </DescriptionDetails>
          </DescriptionList>

          <Text className="mt-10">
            整体成交明细的所有数据可以点击链接去详细页面查看 &rarr; &nbsp;
            <TextLink href={`/details/${userId}`}>点击查看</TextLink>.
          </Text>
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
