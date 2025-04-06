import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/description-list'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Link } from '@/components/link'
import { getOrder, getOrders } from '@/data'
import { CalendarIcon, ChevronLeftIcon, CreditCardIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  let order = await getOrder(params.id)

  return {
    title: order && `订单 #${order.id}`,
  }
}

export default async function Order({ params }: { params: { id: string } }) {
  let orders = await getOrders()

  // if (!order) {
  //   notFound()
  // }

  return (
    <>
      <div className="max-lg:hidden">
        <Link href="/" className="inline-flex items-center gap-2 text-sm/6 text-zinc-500 dark:text-zinc-400">
          <ChevronLeftIcon className="size-4 fill-zinc-400 dark:fill-zinc-500" />
          返回图表
        </Link>
      </div>
      {orders.map((order) => (
        <div key={order.id}>
          <div className="mt-4 lg:mt-8">
            <div className="flex items-center gap-4">
              <Heading>订单 #{order.id}</Heading>
            </div>
            <div className="isolate mt-2.5 flex flex-wrap justify-between gap-x-6 gap-y-4">
              <div className="flex flex-wrap gap-x-10 gap-y-4 py-1.5">
                <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                  <CreditCardIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span className="inline-flex gap-3">支付方式 USDT</span>
                </span>
                <span className="flex items-center gap-3 text-base/6 text-zinc-950 sm:text-sm/6 dark:text-white">
                  <CalendarIcon className="size-4 shrink-0 fill-zinc-400 dark:fill-zinc-500" />
                  <span>成交时间 {order.date}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <Subheading>摘要</Subheading>
            <Divider className="mt-4" />
            <DescriptionList>
              <DescriptionTerm>客户</DescriptionTerm>
              <DescriptionDetails>{order.customer.name}</DescriptionDetails>
              <DescriptionTerm>商品</DescriptionTerm>
              <DescriptionDetails>nike air yeezy 2</DescriptionDetails>
              <DescriptionTerm>单价</DescriptionTerm>
              <DescriptionDetails>{order.amount.usd}</DescriptionDetails>
              <DescriptionTerm>成交金额</DescriptionTerm>
              <DescriptionDetails>{order.amount.usd}</DescriptionDetails>
              <DescriptionTerm>汇率后金额</DescriptionTerm>
              <DescriptionDetails>{order.amount.cad}</DescriptionDetails>
              <DescriptionTerm>损耗</DescriptionTerm>
              <DescriptionDetails>{order.amount.usd}</DescriptionDetails>
              <DescriptionTerm>净额</DescriptionTerm>
              <DescriptionDetails>
                {order.amount.usd} &rarr; {order.amount.cad}
              </DescriptionDetails>
            </DescriptionList>
          </div>
        </div>
      ))}
    </>
  )
}
