"use client"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { useState, useEffect } from "react"
import {
  GraduationCap, Users, FileText, Award, LogOut, ChevronRight, Globe, Menu, X, LayoutDashboard,
  FolderOpen, CalendarDays, User, Briefcase, CalendarPlus, TrendingUp, Shield, Bell, Settings,
  BarChart3, Clock
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
      { href: "/admin?tab=batches",                    label: "Batches & Classes",   icon: FolderOpen },
      { href: "/admin?tab=attendance",                 label: "Attendance Tracker",  icon: CalendarDays },
    ]
  },
  {
    title: "APPROVALS & RECORDS",
    items: [
      { href: "/admin?tab=od",                         label: "OD Management",       icon: Clock },
      { href: "/admin?tab=leave",                      label: "Leave Approvals",     icon: CalendarDays },
      { href: "/admin?tab=achievements",               label: "Achievements",        icon: Award },
      { href: "/admin?tab=events",                     label: "Events & Activities", icon: CalendarPlus },
    ]
  },
  {
    title: "SYSTEM",
    items: [
      { href: "/admin?tab=activity",                   label: "Activity Monitor",    icon: BarChart3 },
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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for custom event from AdminTopbar hamburger button on mobile
  useEffect(() => {
    const handleToggle = () => setSidebarOpen((prev) => !prev)
    const handleClose = () => setSidebarOpen(false)
    window.addEventListener("toggle-admin-nav", handleToggle)
    window.addEventListener("close-admin-nav", handleClose)
    return () => {
      window.removeEventListener("toggle-admin-nav", handleToggle)
      window.removeEventListener("close-admin-nav", handleClose)
    }
  }, [])

  // Close sidebar on route change
  useEffect(() => setSidebarOpen(false), [pathname, searchParams])

  const currentTab = searchParams.get("tab") || "dashboard"

  return (
    <>
      {/* Sidebar Backdrop (Mobile Drawer) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Permanent + Mobile Slide-Over Drawer) */}
      <aside
        className={clsx(
          "flex flex-col h-full bg-[#0A192F] border-r border-[#1E2D4A] shadow-2xl transition-transform duration-300 ease-out",
          "fixed inset-y-0 left-0 z-50 w-72 md:relative md:w-64 md:translate-x-0 md:z-0 md:shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Mobile Header with Close Button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3.5 border-b border-[#1E2D4A] bg-[#071324]">
          <div className="flex items-center gap-2.5">
            <div className="bg-white rounded px-1.5 py-0.5">
              <div className="relative h-5 w-16">
                <Image src="/new-logo.png" alt="RIT AIML" fill sizes="70px" className="object-contain" priority />
              </div>
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider">HOD Portal</span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile (Compact) */}
        <div className="px-5 py-4 border-b border-[#1E2D4A] bg-[#071324]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#003087] border border-[#1E2D4A] flex items-center justify-center text-white font-black shrink-0 overflow-hidden shadow-sm" suppressHydrationWarning>
              {mounted && image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name?.[0] ?? "S"
              )}
            </div>
            <div className="min-w-0" suppressHydrationWarning>
              <p className="text-white text-xs font-bold truncate tracking-wide" suppressHydrationWarning>
                {!name || name.toLowerCase().includes("test") ? "Dr. Selvakumaran S." : name}
              </p>
              <p className="text-amber-400 text-[10px] uppercase font-bold tracking-widest mt-0.5">Control Panel</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-2 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const itemUrl = new URL(item.href, "http://localhost")
                  const itemTab = itemUrl.searchParams.get("tab") || "dashboard"
                  const isBatchesMatch = itemTab === "batches" && ["batches", "semesters", "sections", "class-allocation"].includes(currentTab)
                  const active = pathname === "/admin" && (itemTab === currentTab || isBatchesMatch)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all duration-200",
                        active
                          ? "bg-indigo-500/15 text-indigo-400 font-bold border border-indigo-500/30"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-[#1E2D4A] mt-4 px-2">
            <Link
              href="/"
              onClick={() => setSidebarOpen(false)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
            >
              <Globe className="h-4 w-4 shrink-0" />
              <span>Public Site</span>
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-4 pt-2 border-t border-[#1E2D4A]/60 shrink-0">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/ops" })}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
