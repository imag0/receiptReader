import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    email: string
    subscription_tier: string
  }

  interface Session {
    user: {
      id: string
      email: string
      subscription_tier: string
      name?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    subscription_tier?: string
  }
}
