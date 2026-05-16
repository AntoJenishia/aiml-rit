"use client"
import Link from "next/link"
import Image from "next/image"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useUser } from "@/lib/hooks/useUser"
import { useState, useEffect } from "react"
import {
  LayoutDashboard, Megaphone, Users, CalendarDays,
  BarChart3, Settings, LogOut, ChevronRight, Globe, Menu, X,
} from "lucide-react"
import clsx from "clsx"

const navItems = [
  { href: "/admin",                 label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { href: "/admin/announcements",   label: "Announcements",  icon: Megaphone },
  { href: "/admin/users",           label: "Users",          icon: Users },
  { href: "/admin/events",          label: "Events",         icon: CalendarDays },
  { href: "/admin/reports",         label: "Reports",        icon: BarChart3 },
  { href: "/admin/settings",        label: "Settings",       icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { name, image } = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change
  useEffect(() => setSidebarOpen(false), [pathname])

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f1e] border-b border-white/10 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link href="/" className="block">
            <div className="bg-white rounded-lg px-1.5 py-1">
              <div className="relative h-7 w-24">
                <Image src="/rit-header.png" alt="RIT AIML" fill sizes="100px" className="object-contain object-left" />
              </div>
            </div>
          </Link>
          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">
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
        "fixed inset-y-0 left-0 z-50 w-64 flex flex-col min-h-screen transition-transform duration-300 ease-out md:relative md:translate-x-0 md:shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
        style={{ background: "linear-gradient(180deg, #0a0f1e 0%, #0f1e3d 50%, #091428 100%)" }}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="block flex-1">
              {/* White bg card so the banner image (white bg, dark text) shows correctly on dark sidebar */}
              <div className="bg-white rounded-xl px-2 py-1.5">
                <div className="relative h-9 w-full">
                  <Image src="/rit-header.png" alt="RIT AIML" fill
                    sizes="200px"
                    className="object-contain object-left" />
                </div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 ml-2 rounded text-white/50 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/80 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              HOD Panel
            </span>
          </div>
        </div>

        {/* Profile */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            {image ? (
              <Image src={image} alt={name} width={40} height={40}
                className="rounded-full ring-2 ring-amber-400/40" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                {name?.[0] ?? "H"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{name}</p>
              <p className="text-amber-400/70 text-xs font-medium">Head of Department</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 min-h-[44px]",
                  active
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                )}>
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
                {active && <ChevronRight className="h-3.5 w-3.5 ml-auto text-amber-400" />}
              </Link>
            )
          })}

          <div className="pt-4 border-t border-white/10 mt-4">
            <Link href="/"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all min-h-[44px]">
              <Globe className="h-4 w-4 shrink-0" />
              Public Site
            </Link>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 min-h-[44px] text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
