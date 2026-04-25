"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRole } from "@/lib/hooks/useRole"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { isLoading } = useAuth()
  const { role } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (role === "student") router.replace("/dashboard/student")
    else if (role === "staff") router.replace("/dashboard/staff")
    else if (role === "hod") router.replace("/admin")
  }, [role, isLoading, router])

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-slate-400">Loading your portal…</p>
      </div>
    </div>
  )
}
