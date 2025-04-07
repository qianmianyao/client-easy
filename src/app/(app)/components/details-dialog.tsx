'use client'

import { Button } from '@/components/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '@/components/dialog'
import { EmptyStates } from '@/components/empty-states'
import { Text, TextLink } from '@/components/text'
import { getCustomerTransactionDetails } from '@/lib/actions'
import { useEffect, useState } from 'react'
import { NewDetailsDialog } from './new-details-dialog'

export function DetailsDialog({ userName, customerId }: { userName: string; customerId: number }) {
  let [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailsData, setDetailsData] = useState<{
    details: any[]
    totalQuantity: number
    totalUnitPrice: number
    totalAmount: number
    products: string[]
    hasDetails: boolean
  } | null>(null)

  // 获取成交明细数据
  const fetchTransactionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getCustomerTransactionDetails(customerId)
      setDetailsData(data)
    } catch (err) {
      setError('获取成交明细失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 当对话框打开时获取数据
  useEffect(() => {
    if (isOpen) {
      fetchTransactionDetails()
    }
  }, [isOpen, customerId])

  // 处理对话框打开
  const handleDialogOpen = () => {
    if (!loading) {
      setIsOpen(true)
    }
  }

  // 格式化金额为美元格式
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <span
          className={`cursor-pointer text-zinc-950 underline decoration-zinc-950/50 hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:hover:decoration-white ${loading ? 'pointer-events-none opacity-50' : ''}`}
          onClick={handleDialogOpen}
        >
          {loading ? '加载中...' : '查看明细'}
        </span>
        <NewDetailsDialog userName={userName} customerId={customerId} onTransactionAdded={fetchTransactionDetails} />
      </div>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>{userName} 的成交明细</DialogTitle>
        <DialogDescription>
          当前页面的明细是多个成交的总和数据展示，只包含成交总数量，单价总和，成交总金额
        </DialogDescription>
        <DialogBody>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-lime-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
          ) : detailsData && !detailsData.hasDetails ? (
            <EmptyStates />
          ) : (
            detailsData && (
              <>
                <DescriptionList>
                  <DescriptionTerm>成交总数量</DescriptionTerm>
                  <DescriptionDetails>{detailsData.totalQuantity}</DescriptionDetails>
                  <DescriptionTerm>单价总金额</DescriptionTerm>
                  <DescriptionDetails>{formatCurrency(detailsData.totalUnitPrice)}</DescriptionDetails>
                  <DescriptionTerm>成交总金额</DescriptionTerm>
                  <DescriptionDetails>{formatCurrency(detailsData.totalAmount)}</DescriptionDetails>
                  <DescriptionTerm>商品</DescriptionTerm>
                  <DescriptionDetails>
                    <div className="flex flex-col">
                      {detailsData.products.map((product, index) => (
                        <span key={index}>{product}</span>
                      ))}
                    </div>
                  </DescriptionDetails>
                </DescriptionList>

                <Text className="mt-10">
                  整体成交明细的所有数据可以点击链接去详细页面查看 &rarr; &nbsp;
                  <TextLink href={`/details/${customerId}`}>点击查看</TextLink>.
                </Text>
              </>
            )
          )}
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
