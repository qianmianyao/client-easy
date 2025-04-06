export async function getOrder(id: string) {
  return (await getOrders()).find((order) => order.id.toString() === id)!
}

export async function getRecentOrders() {
  return (await getOrders()).slice(0, 10)
}

export async function getOrders() {
  return [
    {
      id: 3000,
      url: '/details/3000',
      date: 'May 9, 2024',
      amount: {
        usd: '$80.00',
        cad: '￥109.47',
        fee: '$3.28',
        net: '￥106.19',
      },
      payment: {
        transactionId: 'ch_2HLf8DfYJ0Db7asfCC5T546TY',
        card: {
          number: '1254',
          type: 'American Express',
          expiry: '01 / 2025',
        },
      },
      customer: {
        name: 'Leslie Alexander',
        email: 'leslie.alexander@example.com',
        address: '123 Main St. Toronto, ON',
        country: 'Canada',
        countryFlagUrl: '/flags/ca.svg',
      },
    },
    {
      id: 13,
      url: '/details/13',
      date: 'May 9, 2024',
      amount: {
        usd: '$80.00',
        cad: '￥109.47',
        fee: '$3.28',
        net: '￥106.19',
      },
      payment: {
        transactionId: 'ch_2HLf8DfYJ0Db7asfCC5T546TY',
        card: {
          number: '1254',
          type: 'American Express',
          expiry: '01 / 2025',
        },
      },
      customer: {
        name: 'Leslie Alexander',
        email: 'leslie.alexander@example.com',
        address: '123 Main St. Toronto, ON',
        country: 'Canada',
        countryFlagUrl: '/flags/ca.svg',
      },
    },
  ]
}
