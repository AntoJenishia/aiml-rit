"use client"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { useState, useEffect } from "react"
import {
  GraduationCap, Users, FileText, Award, LogOut, ChevronRight, Globe, Menu, X, LayoutDashboard,
  FolderOpen, CalendarDays, User, Briefcase, CalendarPlus, TrendingUp, Shield, Bell, Settings
} from "lucide-react"
import clsx from "clsx"

const navGroups = [
  {
    title: "MAIN",
    items: [
      { href: "/admin",                                label: "Dashboard",           icon: LayoutDashboard },
    ]
  },
  {
    title: "ACADEMICS",
    items: [
      { href: "/admin?tab=students",                   label: "Students",            icon: GraduationCap },
      { href: "/admin?tab=staff",                      label: "Faculty",             icon: Users },
      { href: "/admin?tab=batches",                    label: "Batches",             icon: FolderOpen },
      { href: "/admin?tab=semesters",                  label: "Semesters",           icon: CalendarDays },
      { href: "/admin?tab=sections",                   label: "Sections",            icon: User },
      { href: "/admin?tab=class-allocation",           label: "Class Allocation",    icon: Briefcase },
    ]
  },
  {
    title: "APPROVALS & RECORDS",
    items: [
      { href: "/admin?tab=od",                         label: "OD Management",       icon: FileText },
      { href: "/admin?tab=achievements",               label: "Achievements",        icon: Award },
      { href: "/admin?tab=events",                     label: "Events & Activities", icon: CalendarPlus },
      { href: "/admin?tab=faculty-portfolios",         label: "Faculty Portfolios",  icon: FileText },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin?tab=reports",                    label: "Reports",             icon: TrendingUp },
      { href: "/admin?tab=audit-logs",                 label: "Audit Logs",          icon: Shield },
      { href: "/admin?tab=settings",                   label: "Settings",            icon: Settings },
    ]
  }
]

export default function AdminNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { name, image } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => setSidebarOpen(false), [pathname, searchParams])

  const currentTab = searchParams.get("tab") || "dashboard"

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0A192F] border-b border-[#1E2D4A] sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="block">
            <div className="bg-white rounded px-1.5 py-1">
              <div className="relative h-6 w-20">
                <Image src="/new-logo.png" alt="RIT AIML" fill sizes="80px" className="object-contain object-center" />
              </div>
            </div>
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            HOD
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar backdrop (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "z-40 w-64 flex flex-col h-full bg-[#0A192F] border-r border-[#1E2D4A] shadow-lg",
        "fixed inset-y-0 left-0 transition-transform duration-300 ease-out md:relative md:translate-x-0 md:shrink-0",
        sidebarOpen ? "translate-x-0 top-16" : "-translate-x-full"
      )}>

        {/* Profile (Compact) */}
        <div className="px-5 py-4 border-b border-[#1E2D4A] bg-[#071324]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded bg-[#003087] border border-[#1E2D4A] flex items-center justify-center text-white font-black shrink-0">
              {name?.[0] ?? "H"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate tracking-wide">{name || "Administrator"}</p>
              <p className="text-amber-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">Control Panel</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const itemUrl = new URL(item.href, "http://localhost")
                  const itemTab = itemUrl.searchParams.get("tab") || "dashboard"
                  const active = pathname === "/admin" && itemTab === currentTab

                  return (
                    <Link key={item.href} href={item.href}
                      className={clsx(
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold transition-all duration-200",
                        active
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-[#1E2D4A] mt-4 px-2">
            <Link href="/"
              className="group flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
              <Globe className="h-4 w-4 shrink-0" />
              Public Site
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4 shrink-0">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all">
            <LogOut className="h-4 w-4 shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
