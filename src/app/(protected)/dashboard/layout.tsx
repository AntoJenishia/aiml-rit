"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { LayoutDashboard, User, BookOpen, LogOut, ChevronRight } from "lucide-react"
import clsx from "clsx"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/about", label: "Department", icon: BookOpen },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(160deg, #f8faff 0%, #eef2ff 35%, #f5f8ff 65%, #f8faff 100%)" }}>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col"
        style={{ background: "linear-gradient(180deg, #0f1e3d 0%, #1a2f5e 60%, #0d2247 100%)" }}>

        {/* Brand */}
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/" className="block">
            <div className="relative h-10 w-full">
              <Image src="/rit-header.png" alt="RIT AIML" fill className="object-contain object-left brightness-0 invert" />
            </div>
          </Link>
          <p className="text-blue-300/60 text-xs mt-2 font-medium uppercase tracking-widest">Student Portal</p>
        </div>

        {/* User info */}
        {!isLoading && user && (
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? ""} width={40} height={40} className="rounded-full ring-2 ring-blue-500/50" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {user.name?.[0] ?? "U"}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                  bg-blue-500/20 text-blue-300 border border-blue-500/30 mt-0.5">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-blue-600/30 text-white border border-blue-500/40"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-blue-400" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
