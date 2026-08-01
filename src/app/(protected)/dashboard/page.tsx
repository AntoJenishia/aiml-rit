"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRole } from "@/lib/hooks/useRole"
import { useUser } from "@/lib/hooks/useUser"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function DashboardPage() {
  const { isLoading } = useAuth()
  const { role } = useRole()
  const { uid } = useUser()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (isLoading || !role) return

    // Staff and HOD go directly to their dashboards
    if (role === "staff") { router.replace("/dashboard/faculty"); return }
    if (role === "hod") { router.replace("/dashboard/hod"); return }

    // Students: check if profile is complete via API route
    if (role === "student" && uid) {
      fetch(`/api/users?uid=${uid}`)
        .then((res) => res.ok ? res.json() : null)
        .then((profile) => {
          if (!profile || !profile.profileComplete) {
            router.replace("/onboarding")
          } else {
            router.replace("/dashboard/student")
          }
        }).catch(() => {
          router.replace("/onboarding")
        }).finally(() => setChecking(false))
      return
    }

    setChecking(false)
  }, [role, isLoading, uid, router])

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="text-sm text-slate-400">Loading your portal…</p>
      </div>
    </div>
  )
}
