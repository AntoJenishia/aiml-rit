"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

export function useAuth(redirectIfUnauthenticated = true) {
  const { data: session, status } = useSession()
  const router = useRouter()
  // Prevent redirect on very first mount while NextAuth restores from cookie
  const hasChecked = useRef(false)

  useEffect(() => {
    // Only redirect AFTER we've confirmed the session check is complete
    // (status goes loading → authenticated/unauthenticated)
    if (status === "loading") return

    // Mark that we've completed at least one auth check
    if (!hasChecked.current) {
      hasChecked.current = true
    }

    if (redirectIfUnauthenticated && status === "unauthenticated" && hasChecked.current) {
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
