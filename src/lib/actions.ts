'use server'

import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

/**
 * 获取客户列表
 * @param searchQuery 搜索查询
 * @param page 当前页码
 * @param itemsPerPage 每页显示的记录数
 * @returns 客户列表、总记录数和总页数
 */
export async function getCustomers(searchQuery?: string, page: number = 1, itemsPerPage: number = 10) {
  // 计算分页的偏移量
  const skip = (page - 1) * itemsPerPage

  // 基础查询条件
  let whereCondition = {}

  // 如果有搜索查询，添加搜索条件
  if (searchQuery && searchQuery.trim() !== '') {
    const searchTerm = searchQuery.trim()

    whereCondition = {
      OR: [
        { customerName: { contains: searchTerm } },
        { phoneNumber: { contains: searchTerm } },
        { affiliation: { contains: searchTerm } },
        { customerStatus: { contains: searchTerm } },
        { transactionStatus: { contains: searchTerm } },
        { notes: { contains: searchTerm } },
        { submitUser: { contains: searchTerm } },
      ],
    }
  }

  // 获取符合条件的总记录数
  const totalCount = await prisma.customer.count({
    where: whereCondition,
  })

  // 计算总页数
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // 获取当前页的数据
  const customers = await prisma.customer.findMany({
    where: whereCondition,
    orderBy: {
      submitTime: 'desc',
    },
    skip,
    take: itemsPerPage,
  })

  // 返回客户数据、总记录数和总页数
  return {
    customers,
    totalCount,
    totalPages,
    currentPage: page,
  }
}

/**
 * 创建新客户记录
 * @param formData 表单数据
 * @returns 新客户记录
 */
export async function createCustomer(formData: FormData) {
  // 获取当前登录用户信息
  const session = await getServerSession(authOptions)
  const username = session?.user?.name || '未知用户'

  // 从表单中提取数据
  const customerName = formData.get('customerName') as string
  const phoneNumber = formData.get('phoneNumber') as string
  const affiliation = (formData.get('affiliation') as string) || ''
  const customerStatus = (formData.get('customerStatus') as string) || '新客户'
  const transactionStatus = (formData.get('transactionStatus') as string) || '未成交'
  const notes = (formData.get('notes') as string) || ''

  // 验证必填字段
  if (!customerName || !phoneNumber) {
    throw new Error('客户名称和手机号是必填项')
  }

  try {
    // 创建新客户记录
    const newCustomer = await prisma.customer.create({
      data: {
        customerName,
        phoneNumber,
        affiliation,
        customerStatus,
        transactionStatus,
        notes,
        submitTime: Date.now(),
        submitUser: username, // 使用当前登录用户名
      },
    })

    return newCustomer
  } catch (error: unknown) {
    // 如果出现唯一约束错误，可能是手机号已存在
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      throw new Error('该客户信息已存在，请检查手机号是否重复')
    }

    throw new Error('创建客户记录失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 用户注册的服务器操作
 * @param formData 表单数据
 * @returns 注册结果
 */
export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const username = formData.get('name') as string
  const password = formData.get('password') as string

  // 验证必填字段
  if (!email || !username || !password) {
    throw new Error('邮箱、姓名和密码是必填项')
  }

  try {
    // 检查邮箱是否已被注册
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('该邮箱已被注册')
    }

    // 检查用户名是否已被使用
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      throw new Error('该用户名已被使用')
    }

    // 加密密码
    const hashedPassword = await hash(password, 10)

    // 创建新用户
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'staff', // 默认角色为普通员工
        createdAt: Date.now(),
      },
    })

    // 注册成功，返回成功状态
    return { success: true }
  } catch (error: unknown) {
    // 检查是否是重定向错误
    if (error && typeof error === 'object' && 'message' in error && String(error.message).includes('NEXT_REDIRECT')) {
      throw error // 重新抛出重定向错误，让Next.js处理
    }

    throw new Error('注册失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}
