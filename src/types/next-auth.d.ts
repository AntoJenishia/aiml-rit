import NextAuth from "next-auth"
import type { DefaultSession } from "next-auth"
import type { UserRole } from "@/lib/auth"

declare module "next-auth" {
  interface Session {
    user: {
      role?: UserRole
      uid?: string
      staffCode?: string
      username?: string
      registerNumber?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: UserRole
    uid?: string
    staffCode?: string
    username?: string
    registerNumber?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole
    uid?: string
    staffCode?: string
    username?: string
    registerNumber?: string
  }
}
