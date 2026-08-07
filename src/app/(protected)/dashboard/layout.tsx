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
  Bell, CalendarDays, FolderOpen, HelpCircle,
} from "lucide-react"
import clsx from "clsx"

const ROLE_ACCENT: Record<string, { headerBg: string; headerText: string; badgeText: string; activeColor: string; activeBg: string; activeBorder: string }> = {
  hod:     { headerBg: "bg-[#1a1a2e]", headerText: "HOD",     badgeText: "HOD Portal",     activeColor: "text-slate-900",  activeBg: "bg-slate-50",    activeBorder: "border-slate-900" },
  staff:   { headerBg: "bg-[#312e81]", headerText: "Faculty", badgeText: "Faculty Portal", activeColor: "text-[#4F46E5]",  activeBg: "bg-indigo-50",   activeBorder: "border-[#4F46E5]" },
  student: { headerBg: "bg-[#003087]", headerText: "Student", badgeText: "Student Portal", activeColor: "text-[#003087]",  activeBg: "bg-blue-50",     activeBorder: "border-[#003087]" },
}

const getNavItems = (role?: string, isClassIncharge?: boolean) => {
  if (role === "hod") {
    return [
      { href: "/admin",                                label: "Dashboard",           icon: LayoutDashboard, exact: true, tab: "dashboard" },
      { href: "/admin?tab=department-overview",        label: "Dept. Overview",      icon: BarChart3,       exact: false, tab: "department-overview" },
      { href: "/admin?tab=students",                   label: "Students",            icon: GraduationCap,   exact: false, tab: "students" },
      { href: "/admin?tab=staff",                      label: "Staff",               icon: Users,           exact: false, tab: "staff" },
      { href: "/admin?tab=batches",                    label: "Batches",             icon: FolderOpen,      exact: false, tab: "batches" },
      { href: "/admin?tab=semesters",                  label: "Semesters",           icon: CalendarDays,    exact: false, tab: "semesters" },
      { href: "/admin?tab=sections",                   label: "Sections",            icon: User,            exact: false, tab: "sections" },
      { href: "/admin?tab=class-allocation",           label: "Class Allocation",    icon: Briefcase,       exact: false, tab: "class-allocation" },
      { href: "/admin?tab=od",                         label: "OD Management",       icon: Clock,           exact: false, tab: "od" },
      { href: "/admin?tab=achievements",               label: "Achievements",        icon: Award,           exact: false, tab: "achievements" },
      { href: "/admin?tab=events",                     label: "Events & Activities", icon: CalendarPlus,    exact: false, tab: "events" },
      { href: "/admin?tab=faculty-portfolios",         label: "Faculty Portfolios",  icon: FileText,        exact: false, tab: "faculty-portfolios" },
      { href: "/admin?tab=reports",                    label: "Reports",             icon: TrendingUp,      exact: false, tab: "reports" },
      { href: "/admin?tab=audit-logs",                 label: "Audit Logs",          icon: Shield,          exact: false, tab: "audit-logs" },
      { href: "/admin?tab=notifications",              label: "Notifications",       icon: Bell,            exact: false, tab: "notifications" },
      { href: "/admin?tab=settings",                   label: "Settings",            icon: Settings,        exact: false, tab: "settings" },
    ]
  }
  if (role === "staff") {
    return [
      { href: "/dashboard/faculty",                    label: "Dashboard",       icon: LayoutDashboard, exact: true },
      { href: "/dashboard/faculty?tab=profile",        label: "My Profile",      icon: User,            exact: false, tab: "profile" },
      { href: "/dashboard/faculty?tab=students",       label: "My Students",     icon: Users,           exact: false, tab: "students" },
      { href: "/dashboard/faculty?tab=od",             label: "OD Requests",     icon: Clock,           exact: false, tab: "od" },
      { href: "/dashboard/faculty?tab=achievements",   label: "Achievements",    icon: Award,           exact: false, tab: "achievements" },
      { href: "/dashboard/faculty?tab=events",         label: "Events & Activities", icon: CalendarDays, exact: false, tab: "events" },
      { href: "/dashboard/faculty?tab=reports",        label: "Reports",         icon: BarChart3,       exact: false, tab: "reports" },
      { href: "/dashboard/faculty?tab=notifications",  label: "Notifications",   icon: Bell,            exact: false, tab: "notifications" },
    ]
  }
  // student (default)
  return [
    { href: "/dashboard/student",                    label: "Dashboard",      icon: LayoutDashboard, exact: true },
    { href: "/dashboard/student?tab=profile",        label: "My Profile",     icon: User,            exact: false, tab: "profile" },
    { href: "/dashboard/student?tab=od",             label: "My OD",          icon: FileText,        exact: false, tab: "od" },
    { href: "/dashboard/student?tab=achievements",   label: "My Achievements", icon: Award,          exact: false, tab: "achievements" },
    { href: "/dashboard/student?tab=events",         label: "My Events",      icon: CalendarDays,    exact: false, tab: "events" },
    { href: "/dashboard/student?tab=certificates",   label: "My Certificates", icon: FolderOpen,     exact: false, tab: "certificates" },
    { href: "/dashboard/student?tab=notifications",  label: "Notifications",  icon: Bell,            exact: false, tab: "notifications" },
  ]
}

import { Suspense } from "react"

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const { isClassIncharge } = useUser()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => setSidebarOpen(false), [pathname])

  const navItems = getNavItems(user?.role, isClassIncharge)
  const roleConfig = ROLE_ACCENT[user?.role ?? "student"] ?? ROLE_ACCENT.student

  const homeHref = user?.role === "hod" ? "/admin" : user?.role === "staff" ? "/dashboard/faculty" : "/dashboard/student"

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-[#F0F2F5] text-[#111827] overflow-hidden">

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] shadow-sm">
        <Link href={homeHref} className="block">
          <div className="relative h-12 w-48">
            <Image src="/new-logo.png" alt="RIT AIML" fill sizes="192px" className="object-contain object-left" />
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
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-out md:sticky md:top-0 md:translate-x-0 md:shrink-0 md:h-[100dvh] border-r border-[#D1D5DB] bg-white shadow-sm",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Sidebar Header — institutional navy bar with logo */}
        <div className={clsx("shrink-0", roleConfig.headerBg)}>
          <div className="px-4 py-4 flex items-center justify-between">
            <Link href={homeHref} className="block">
              <div className="bg-white rounded-lg px-2.5 py-2 shadow-sm">
                <div className="relative h-11 w-44">
                  <Image src="/new-logo.png" alt="RIT AIML" fill sizes="176px" className="object-contain object-left" />
                </div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10"
              aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User identity strip */}
          {!isLoading && user && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2.5 bg-white/10 rounded-lg px-3 py-2.5">
                {user.image ? (
                  <Image src={user.image} alt={user.name ?? ""} width={32} height={32}
                    className="rounded-full ring-1 ring-white/40 w-8 h-8 object-cover shrink-0" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {user.name?.[0] ?? "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate leading-tight">{user.name}</p>
                  <p className="text-white/60 text-[10px] uppercase tracking-wider mt-0.5">{roleConfig.badgeText}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            let active = false
            if (user?.role === "hod") {
              const itemAny = item as any
              if (itemAny.tab) {
                const currentTab = searchParams.get("tab") || "dashboard"
                active = pathname === "/admin" && currentTab === itemAny.tab
              } else {
                active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/"
              }
            } else if (user?.role === "staff") {
              const itemAny = item as any
              if (itemAny.tab) {
                const currentTab = searchParams.get("tab") || (isClassIncharge ? "class" : "portfolio")
                active = pathname.startsWith("/dashboard/faculty") && currentTab === itemAny.tab
              } else {
                active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && item.href !== "/"
              }
            } else {
              const itemAny = item as any
              if (itemAny.tab) {
                const currentTab = searchParams.get("tab")
                active = pathname.startsWith("/dashboard/student") && currentTab === itemAny.tab
              } else {
                const currentTab = searchParams.get("tab")
                active = item.exact ? (pathname === item.href && !currentTab) : pathname.startsWith(item.href) && item.href !== "/"
              }
            }
            const isPublic = item.href === "/"
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-150 min-h-[40px] border-l-2",
                  active
                    ? clsx(roleConfig.activeBg, roleConfig.activeColor, roleConfig.activeBorder, "font-semibold")
                    : isPublic
                    ? "border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}>
                <item.icon className={clsx(
                  "h-4 w-4 shrink-0",
                  active ? roleConfig.activeColor : "text-slate-400 group-hover:text-slate-600"
                )} />
                <span className="flex-1 text-[13px]">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-[#E5E7EB] px-2 pb-3 pt-2 space-y-0.5">
          {user?.role === "student" && (
            <Link
              href="/contact"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 min-h-[40px] text-[13px] font-medium text-slate-500 border-l-2 border-transparent transition-all hover:bg-slate-50 hover:text-slate-700"
            >
              <HelpCircle className="h-4 w-4 shrink-0 text-slate-400" />
              Help / Contact Dept.
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2.5 min-h-[40px] text-[13px] font-medium text-red-500 border-l-2 border-transparent transition-all hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto min-w-0 p-4 md:p-6 bg-[#F0F2F5]">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="h-screen bg-[#F5F6FA] flex items-center justify-center">Loading...</div>}>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </Suspense>
  )
}
