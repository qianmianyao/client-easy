import { Badge } from '@/components/badge'
import { Divider } from '@/components/divider'
import { EmptyStates } from '@/components/empty-states'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { Text, TextLink } from '@/components/text'
import { getCustomerTransactionDetails } from '@/lib/actions'
import prisma from '@/lib/prisma'
import { ChevronLeftIcon } from '@heroicons/react/16/solid'
import { PhoneIcon } from '@heroicons/react/20/solid'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const customerId = parseInt(params.id)
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })

  return {
    title: customer ? `${customer.customerName} 的成交明细` : '成交明细',
  }
}

export default async function Details({ params }: { params: { id: string } }) {
  const customerId = parseInt(params.id)

  // 获取客户信息
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  })

  // 获取成交明细
  const transactionData = await getCustomerTransactionDetails(customerId)

  // 格式化金额为美元格式
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  // 格式化成交时间
  const formatDateTime = (timestamp: number | bigint) => {
    return new Date(Number(timestamp)).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          返回客户列表
        </Link>
      </div>

      <div className="mt-4 lg:mt-8">
        <div className="flex items-center gap-4">
          <Heading className="flex items-center gap-2">
            <span>{customer ? `Details #${customer.customerName}` : 'Details #Unknown'}</span>
            <Badge color="lime" className="translate-y-[0.5px]">
              Successful
            </Badge>
          </Heading>
        </div>

        <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
          <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
            {customer && (
              <span className="inline-flex items-center gap-2 text-sm text-zinc-900 transition-colors hover:text-zinc-700 dark:text-zinc-100 dark:hover:text-white">
                <PhoneIcon className="size-4 flex-shrink-0 text-zinc-400 dark:text-zinc-500" />
                <Text>PhoneNumber</Text>
                <TextLink href="#" className="truncate font-medium hover:underline">
                  {customer.phoneNumber || '未提供'}
                </TextLink>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Subheading>成交明细记录</Subheading>
        <Divider className="mt-4" />

        {!transactionData.hasDetails ? (
          <EmptyStates />
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    商品名称
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    成交数量
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    单价
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    成交金额
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-zinc-500 uppercase dark:text-zinc-400"
                  >
                    成交时间
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {transactionData.details.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {transaction.productName}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {transaction.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(transaction.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(transaction.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                      {formatDateTime(transaction.transactionTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {transactionData.hasDetails && (
          <div className="mt-6 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">总成交数量</p>
                <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {transactionData.totalQuantity}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">平均单价</p>
                <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(transactionData.totalUnitPrice / transactionData.details.length)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">总金额</p>
                <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(transactionData.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">成交次数</p>
                <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  {transactionData.details.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
