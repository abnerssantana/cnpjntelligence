import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    subscriptionStatus: string
    subscriptionExpiresAt: string
    isSubscriptionActive: boolean
  }

  interface Session {
    user: {
      id: string
      subscriptionStatus: string
      subscriptionExpiresAt: string
      isSubscriptionActive: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscriptionStatus: string
    subscriptionExpiresAt: string
    isSubscriptionActive: boolean
  }
}