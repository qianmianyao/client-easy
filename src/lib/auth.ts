import { compare } from 'bcryptjs'
import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: '邮箱或用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // 通过邮箱查找
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          // 如果找不到，通过用户名查找
          if (!user) {
            user = await prisma.user.findUnique({
              where: { username: credentials.email },
            })
          }

          if (!user) return null

          // 比较密码
          const passwordMatch = await compare(credentials.password, user.password)
          if (!passwordMatch) return null

          return {
            id: String(user.id),
            name: user.username,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error('验证错误:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
