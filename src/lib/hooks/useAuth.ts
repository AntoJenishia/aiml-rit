"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useAuth(redirectIfUnauthenticated = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (redirectIfUnauthenticated && status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router, redirectIfUnauthenticated])

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  }
}
