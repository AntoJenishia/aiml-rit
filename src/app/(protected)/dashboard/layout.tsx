"use client"
import { useAuth } from "@/lib/hooks/useAuth"
import { useUser } from "@/lib/hooks/useUser"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, User, LogOut, Menu, X,
  Settings, Users, FileText, ChevronRight, Home,
  GraduationCap, Shield, TrendingUp, Megaphone,
  CalendarPlus, BarChart3, Award, Clock, Briefcase,
} from "lucide-react"
import clsx from "clsx"

const ROLE_ACCENT: Record<string, { gradient: string; badge: string; badgeText: string }> = {
  hod:     { gradient: "from-slate-900 to-slate-800",    badge: "bg-white/10 text-white border border-white/20",       badgeText: "HOD Portal" },
  staff:   { gradient: "from-[#7C3AED] to-[#4F46E5]",   badge: "bg-white/10 text-white border border-white/20",       badgeText: "Faculty Portal" },
  student: { gradient: "from-[#3B5BFF] to-[#2563EB]",   badge: "bg-white/10 text-white border border-white/20",       badgeText: "Student Portal" },
}

const getNavItems = (role?: string, isClassIncharge?: boolean) => {
  if (role === "hod") {
    return [
      { href: "/admin",                   label: "Students",        icon: GraduationCap,   exact: true },
      { href: "/admin?tab=faculty",       label: "Faculty",         icon: Users,           exact: false },
      { href: "/admin?tab=od",            label: "OD Approvals",    icon: FileText,        exact: false },
      { href: "/admin?tab=achievements",  label: "Achievements",    icon: Award,           exact: false },
      { href: "/profile",                 label: "My Profile",      icon: User,            exact: false },
      { href: "/",                        label: "Public Site",     icon: Home,            exact: false },
    ]
  }
  if (role === "staff") {
    const baseItems = [
      { href: "/dashboard/faculty?tab=portfolio", label: "My Portfolio",      icon: Briefcase,        exact: false, tab: "portfolio" },
      { href: "/dashboard/faculty?tab=profile",  label: "My Profile",        icon: User,             exact: false, tab: "profile" },
    ]
    if (isClassIncharge) {
      return [
        { href: "/dashboard/faculty?tab=class",     label: "My Class",          icon: Users,            exact: false, tab: "class" },
        { href: "/dashboard/faculty?tab=od",        label: "OD Approvals",      icon: Clock,            exact: false, tab: "od" },
        ...baseItems,
      ]
    }
    return baseItems
  }
  // student (default)
  return [
    { href: "/dashboard/student", label: "My Dashboard",   icon: LayoutDashboard, exact: false },
    { href: "/profile",           label: "My Profile",     icon: User,            exact: false },
    { href: "/events",            label: "Events",         icon: FileText,        exact: false },
  ]
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { isClassIncharge } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => setSidebarOpen(false), [pathname])

  const navItems = getNavItems(user?.role, isClassIncharge)
  const roleConfig = ROLE_ACCENT[user?.role ?? "student"] ?? ROLE_ACCENT.student

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#F5F6FA] text-[#111827] overflow-hidden">

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] shadow-sm">
        <Link href="/" className="block">
          <div className="relative h-8 w-32">
            <Image src="/rit-header.png" alt="RIT AIML" fill sizes="128px" className="object-contain object-left" />
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F5F6FA] transition-colors"
          aria-label="Toggle menu">
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-out md:sticky md:top-0 md:translate-x-0 md:shrink-0 md:h-screen",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Sidebar top — gradient brand + user info */}
        <div className={clsx("bg-gradient-to-b", roleConfig.gradient)}>
          {/* Brand */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between">
            <Link href="/" className="block flex-1">
              <div className="bg-white rounded-2xl px-3 py-2.5 shadow-sm">
                <div className="relative h-16 w-full">
                  <Image src="/rit-header.png" alt="RIT AIML" fill sizes="200px"
                    className="object-contain object-left"
                    style={user?.role === "hod" ? { filter: "brightness(0) invert(1)" } : {}} />
                </div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User info */}
          {!isLoading && user && (
            <div className="px-5 pb-5">
              <div className="flex items-center gap-3">
                {user.image ? (
                  <Image src={user.image} alt={user.name ?? ""} width={40} height={40}
                    className="rounded-full ring-2 ring-white/30 w-10 h-10 object-cover shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {user.name?.[0] ?? "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-sm font-bold truncate">{user.name}</p>
                  <span className={clsx(
                    "inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-0.5",
                    roleConfig.badge
                  )}>
                    {roleConfig.badgeText}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 bg-white px-3 py-4 space-y-0.5 overflow-y-auto border-r border-[#E5E7EB]">
          {navItems.map((item) => {
            let active = false
            if (user?.role === "hod") {
              const itemUrl = new URL(item.href, "http://localhost")
              const itemTab = itemUrl.searchParams.get("tab") || "students"
              const currentTab = searchParams.get("tab") || "students"
              active = pathname === "/admin" && itemTab === currentTab && item.href.startsWith("/admin")
              if (item.href === "/profile") active = pathname === "/profile"
              if (item.href === "/") active = pathname === "/"
            } else if (user?.role === "staff") {
              const itemAny = item as any
              if (itemAny.tab) {
                const currentTab = searchParams.get("tab") || (isClassIncharge ? "class" : "portfolio")
                active = pathname.startsWith("/dashboard/faculty") && currentTab === itemAny.tab
              } else {
                active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/"
              }
            } else {
              active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/"
            }
            const isPublic = item.href === "/"
            return (
              <Link key={item.href} href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-150 min-h-[44px]",
                  active
                    ? "bg-[#3B5BFF]/10 text-[#3B5BFF]"
                    : isPublic
                    ? "text-[#94A3B8] hover:bg-[#F5F6FA] hover:text-[#6B7280]"
                    : "text-[#6B7280] hover:bg-[#F5F6FA] hover:text-[#111827]"
                )}>
                <item.icon className={clsx(
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-[#3B5BFF]" : isPublic ? "text-[#94A3B8]" : "text-[#94A3B8] group-hover:text-[#6B7280]"
                )} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-[#3B5BFF]" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="bg-white border-r border-t border-[#E5E7EB] px-3 pb-4 pt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-semibold text-[#EF4444] transition-all hover:bg-[#EF4444]/10">
            <LogOut className="h-5 w-5 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto min-w-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
