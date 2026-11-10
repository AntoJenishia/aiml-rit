"use client"
import { useState, useEffect } from "react"
import { useUser } from "@/lib/hooks/useUser"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Bell, Search, Settings, Menu } from "lucide-react"

export default function AdminTopbar() {
  const { name, image } = useUser()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "dashboard"

  const [time, setTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format breadcrumb title
  const formatTabName = (tab: string) => {
    if (tab === "dashboard") return "Overview Dashboard"
    if (tab === "od") return "OD Management"
    if (tab === "leave") return "Leave Approvals"
    if (tab === "activity") return "Activity Monitor"
    if (["batches", "semesters", "sections", "class-allocation"].includes(tab)) return "Batches & Classes"
    return tab.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  return (
    <header className="bg-[#003087] border-b-4 border-amber-500 h-16 flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-40 shadow-md">
      {/* Left: Hamburger (Mobile) & Institution Branding */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("toggle-admin-nav"))}
          className="p-2 -ml-1 rounded-xl text-white hover:bg-white/10 md:hidden flex items-center justify-center min-w-[42px] min-h-[42px] transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="bg-white rounded p-1 hidden sm:block shrink-0">
          <div className="relative h-7 w-24">
            <Image src="/new-logo.png" alt="RIT" fill sizes="100px" className="object-contain" priority />
          </div>
        </div>

        <div className="flex flex-col text-white min-w-0">
          <span className="text-xs sm:text-sm font-black tracking-wide uppercase leading-tight truncate">
            Rajalakshmi Institute of Technology
          </span>
          <span className="text-[9px] sm:text-[10px] text-blue-200 font-bold tracking-widest uppercase truncate">
            Academic Management System
          </span>
        </div>
      </div>

      {/* Center: Module Title (Desktop Only) */}
      <div className="hidden lg:flex items-center justify-center flex-1 px-4">
        <span className="text-white/90 font-bold text-xs tracking-widest uppercase px-4 py-1 border border-white/20 rounded-full bg-white/10 truncate">
          {formatTabName(currentTab)}
        </span>
      </div>

      {/* Right: Clock & Profile */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* Clock (Desktop) */}
        <div className="hidden md:block text-right">
          <div className="text-sm font-mono font-bold text-white leading-tight">
            {time ? time.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </div>
          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none mt-0.5">
            {time ? time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "Loading..."}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 sm:border-l sm:border-blue-800 sm:pl-6">
          <button
            type="button"
            className="text-blue-200 hover:text-white transition-colors relative p-1.5 rounded-lg"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute 1 top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#003087]"></span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-2" suppressHydrationWarning>
            <div className="text-right hidden sm:block text-white" suppressHydrationWarning>
              <div className="text-sm font-bold leading-tight" suppressHydrationWarning>
                {!name || name.toLowerCase().includes("test")
                  ? "Dr. Selvakumaran S."
                  : name.toLowerCase().includes("dr.") ? name : `Dr. ${name}`}
              </div>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">HOD, AIML</div>
            </div>
            {mounted && image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="Profile" className="w-8 h-8 rounded-full border-2 border-white/20 object-cover bg-white shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white text-[#003087] flex items-center justify-center font-bold text-sm shadow-sm shrink-0" suppressHydrationWarning>
                {name?.[0] ?? "S"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
