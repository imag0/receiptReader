import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/database'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Get user from database
          const user = await db.getUserByEmail(credentials.email)

          if (!user) {
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            subscription_tier: user.subscription_tier || 'free'
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.subscription_tier = user.subscription_tier
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub!
        session.user.subscription_tier = token.subscription_tier as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
})

export { handler as GET, handler as POST }
