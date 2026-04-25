"use client"
import { useSession } from "next-auth/react"

export function useRole() {
  const { data: session } = useSession()
  const role = session?.user?.role ?? "guest"

  return {
    role,
    isStudent: role === "student",
    isStaff: role === "staff",
    isHOD: role === "hod",
    isGuest: role === "guest",
  }
}
