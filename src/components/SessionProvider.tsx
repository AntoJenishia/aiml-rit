"use client"
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      // Re-fetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Re-fetch when the browser tab regains focus
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
