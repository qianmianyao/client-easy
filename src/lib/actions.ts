'use server'

import prisma from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'
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
  // 获取当前登录用户信息
  const session = await getServerSession(authOptions)
  const username = session?.user?.name || '未知用户'
  const userRole = session?.user?.role || 'guest'

  // 计算分页的偏移量
  const skip = (page - 1) * itemsPerPage

  // 基础查询条件
  let whereCondition: any = {}

  // 基于用户角色设置查询条件
  // 只有管理员(admin)和经理(manager)可以查看所有客户数据
  // 普通员工(staff)和其他角色只能查看自己提交的客户
  if (userRole !== 'admin' && userRole !== 'manager') {
    whereCondition.submitUser = username
  }

  // 如果有搜索查询，添加搜索条件
  if (searchQuery && searchQuery.trim() !== '') {
    const searchTerm = searchQuery.trim()

    // 将搜索条件与角色条件结合
    if (userRole !== 'admin' && userRole !== 'manager') {
      // 普通员工只能搜索自己的客户
      whereCondition = {
        AND: [
          { submitUser: username },
          {
            OR: [
              { customerName: { contains: searchTerm } },
              { phoneNumber: { contains: searchTerm } },
              { affiliation: { contains: searchTerm } },
              { customerStatus: { contains: searchTerm } },
              { transactionStatus: { contains: searchTerm } },
              { notes: { contains: searchTerm } },
            ],
          },
        ],
      }
    } else {
      // 管理员和经理可以搜索所有客户
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
  }

  try {
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
  } catch (error) {
    console.error('获取客户列表失败:', error)
    throw new Error('获取客户列表失败: ' + (error instanceof Error ? error.message : String(error)))
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
  const isAdmin = formData.get('isAdmin') as string

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

    // 确定用户角色
    const role = isAdmin === 'true' ? 'admin' : 'staff'

    // 创建新用户
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role, // 使用确定的角色
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

/**
 * 验证用户是否有权限操作指定客户
 * @param customerId 客户ID
 * @returns 是否有权限
 */
async function hasPermissionForCustomer(customerId: number): Promise<boolean> {
  // 获取当前登录用户信息
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error('未登录，无法执行操作')
  }

  const username = session.user.name
  const userRole = session.user.role

  // 管理员和经理拥有所有权限
  if (userRole === 'admin' || userRole === 'manager') {
    return true
  }

  // 普通用户只能操作自己创建的客户
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { submitUser: true },
    })

    if (!customer) {
      throw new Error('客户不存在')
    }

    return customer.submitUser === username
  } catch (error) {
    console.error('验证客户权限失败:', error)
    throw new Error('验证操作权限失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 创建新成交记录
 * @param formData 表单数据
 * @returns 新成交记录
 */
export async function createDetails(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string)

  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限为此客户添加成交记录')
  }

  const productName = formData.get('productName') as string
  const quantity = parseInt(formData.get('quantity') as string)
  const unitPrice = parseFloat(formData.get('unitPrice') as string)
  let totalAmount = formData.get('totalAmount') as string
  const transactionTime = Date.now()

  // 自动计算总金额，如果未提供或为空
  const calculatedAmount = quantity * unitPrice
  const finalAmount = !totalAmount || totalAmount.trim() === '' ? calculatedAmount : parseFloat(totalAmount)

  try {
    // 创建新的成交明细
    const newDetails = await prisma.transactionDetail.create({
      data: {
        customerId,
        productName,
        quantity,
        unitPrice,
        totalAmount: finalAmount,
        transactionTime,
      },
    })

    // 更新客户的成交状态为"已成交"
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        transactionStatus: '已成交',
        // 强制触发客户端刷新，确保状态更新立即显示
        submitTime: Date.now(),
      },
    })

    return newDetails
  } catch (error) {
    throw new Error('创建记录失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 获取客户的所有成交明细
 * @param customerId 客户ID
 * @returns 成交明细及统计数据
 */
export async function getCustomerTransactionDetails(customerId: number) {
  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限查看此客户的成交明细')
  }

  try {
    const details = await prisma.transactionDetail.findMany({
      where: {
        customerId: customerId,
      },
      orderBy: {
        transactionTime: 'desc',
      },
    })

    // 计算统计数据
    if (details.length === 0) {
      return {
        details: [],
        totalQuantity: 0,
        totalUnitPrice: 0,
        totalAmount: 0,
        products: [],
        hasDetails: false,
      }
    }

    // 计算总数量
    const totalQuantity = details.reduce((sum, detail) => sum + detail.quantity, 0)

    // 计算单价总和
    const totalUnitPrice = details.reduce((sum, detail) => sum + detail.unitPrice, 0)

    // 计算成交总金额
    const totalAmount = details.reduce((sum, detail) => sum + detail.totalAmount, 0)

    // 提取所有商品名称
    const products = details.map((detail) => detail.productName)

    return {
      details,
      totalQuantity,
      totalUnitPrice,
      totalAmount,
      products,
      hasDetails: true,
    }
  } catch (error) {
    throw new Error('获取成交明细失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 更新客户情况状态
 * @param customerId 客户ID
 * @param status 新的客户情况状态
 * @returns 更新后的客户信息
 */
export async function updateCustomerStatus(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string)

  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限更新此客户的状态')
  }

  const status = formData.get('status') as string

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        customerStatus: status,
        // 更新时间戳，确保客户端刷新
        submitTime: Date.now(),
      },
    })

    return updatedCustomer
  } catch (error) {
    throw new Error('更新客户状态失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 更新成交情况状态
 * @param customerId 客户ID
 * @param status 新的成交情况状态
 * @returns 更新后的客户信息
 */
export async function updateTransactionStatus(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string)

  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限更新此客户的成交状态')
  }

  const status = formData.get('status') as string

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        transactionStatus: status,
      },
    })

    return updatedCustomer
  } catch (error) {
    throw new Error('更新成交情况失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 更新客户备注
 * @param customerId 客户ID
 * @param notes 新的备注内容
 * @returns 更新后的客户信息
 */
export async function updateCustomerNotes(formData: FormData) {
  const customerId = parseInt(formData.get('customerId') as string)

  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限更新此客户的备注')
  }

  const notes = formData.get('notes') as string

  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        notes: notes,
      },
    })

    return updatedCustomer
  } catch (error) {
    throw new Error('更新备注失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 更新用户密码
 * @param formData 表单数据
 * @returns 更新结果
 */
export async function updateUserPassword(formData: FormData) {
  // 获取当前登录用户信息
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    throw new Error('未登录，无法更新密码')
  }

  const userId = parseInt(session.user.id)
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string

  // 验证必填字段
  if (!currentPassword || !newPassword) {
    throw new Error('当前密码和新密码是必填项')
  }

  try {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 验证当前密码是否正确
    const isCurrentPasswordValid = await compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      throw new Error('当前密码不正确')
    }

    // 加密新密码
    const hashedNewPassword = await hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('更新密码失败:', error)
    throw new Error('更新密码失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 删除客户记录
 * @param customerId 客户ID
 * @returns 删除结果
 */
export async function deleteCustomer(customerId: number) {
  // 验证用户是否有权限操作该客户
  const hasPermission = await hasPermissionForCustomer(customerId)
  if (!hasPermission) {
    throw new Error('没有权限删除此客户')
  }

  try {
    // 由于设置了级联删除 (onDelete: Cascade)，删除客户时会自动删除相关的成交明细
    const deletedCustomer = await prisma.customer.delete({
      where: { id: customerId },
    })

    return { success: true, deletedCustomer }
  } catch (error) {
    console.error('删除客户失败:', error)
    throw new Error('删除客户失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 获取用户列表 (仅限管理员)
 * @param searchQuery 搜索查询
 * @param page 当前页码
 * @param itemsPerPage 每页显示的记录数
 * @returns 用户列表、总记录数和总页数
 */
export async function getUsers(searchQuery?: string, page: number = 1, itemsPerPage: number = 10) {
  // 获取当前登录用户信息并验证是否有管理员权限
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('无权限访问，仅限管理员操作')
  }

  // 计算分页的偏移量
  const skip = (page - 1) * itemsPerPage

  // 基础查询条件
  let whereCondition: any = {}

  // 如果有搜索查询，添加搜索条件
  if (searchQuery && searchQuery.trim() !== '') {
    const searchTerm = searchQuery.trim()
    whereCondition = {
      OR: [{ username: { contains: searchTerm } }, { email: { contains: searchTerm } }],
    }
  }

  try {
    // 获取符合条件的总记录数
    const totalCount = await prisma.user.count({
      where: whereCondition,
    })

    // 计算总页数
    const totalPages = Math.ceil(totalCount / itemsPerPage)

    // 获取当前页的数据（不返回密码信息）
    const users = await prisma.user.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        lastLogin: true,
        password: false, // 不返回密码
      },
      skip,
      take: itemsPerPage,
    })

    // 返回用户数据、总记录数和总页数
    return {
      users,
      totalCount,
      totalPages,
      currentPage: page,
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    throw new Error('获取用户列表失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 管理员更新用户密码
 * @param formData 表单数据
 * @returns 更新结果
 */
export async function adminUpdateUserPassword(formData: FormData) {
  // 获取当前登录用户信息并验证是否有管理员权限
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('无权限执行此操作，仅限管理员操作')
  }

  const userId = parseInt(formData.get('userId') as string)
  const newPassword = formData.get('newPassword') as string

  // 验证必填字段
  if (!userId || !newPassword) {
    throw new Error('用户ID和新密码是必填项')
  }

  try {
    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 加密新密码
    const hashedNewPassword = await hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    })

    return { success: true }
  } catch (error: unknown) {
    console.error('更新用户密码失败:', error)
    throw new Error('更新用户密码失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * 删除用户（仅限管理员）
 * @param userId 用户ID
 * @returns 删除结果
 */
export async function deleteUser(userId: number) {
  // 获取当前登录用户信息并验证是否有管理员权限
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('无权限执行此操作，仅限管理员操作')
  }

  // 防止删除自己
  if (parseInt(session.user.id) === userId) {
    throw new Error('不能删除自己的账户')
  }

  try {
    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 删除用户
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    })

    return { success: true, deletedUser }
  } catch (error) {
    console.error('删除用户失败:', error)
    throw new Error('删除用户失败: ' + (error instanceof Error ? error.message : String(error)))
  }
}
