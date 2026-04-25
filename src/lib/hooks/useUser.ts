"use client"
import { useSession } from "next-auth/react"

export function useUser() {
  const { data: session, status } = useSession()
  const user = session?.user

  return {
    user,
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? "",
    role: user?.role ?? "guest",
    uid: user?.uid ?? "",
    isLoading: status === "loading",
  }
}
