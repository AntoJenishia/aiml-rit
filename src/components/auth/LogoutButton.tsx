"use client"
import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

interface Props {
  className?: string
}

export default function LogoutButton({ className = "" }: Props) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={`flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white active:scale-95 ${className}`}
    >
      <LogOut className="h-4 w-4" />
      Logout
    </button>
  )
}
