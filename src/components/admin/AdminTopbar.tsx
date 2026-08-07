"use client"
import { useState, useEffect } from "react"
import { useUser } from "@/lib/hooks/useUser"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Bell, Search, Settings } from "lucide-react"

export default function AdminTopbar() {
  const { name, image } = useUser()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "dashboard"
  
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Format breadcrumb title
  const formatTabName = (tab: string) => {
    if (tab === "dashboard") return "Overview Dashboard"
    if (tab === "od") return "OD Management"
    return tab.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  }

  return (
    <header className="bg-[#003087] border-b-4 border-amber-500 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-50 shadow-md">
      {/* Left: Institution Branding */}
      <div className="flex items-center gap-4">
        <div className="bg-white rounded p-1 hidden sm:block">
          <div className="relative h-7 w-24">
            <Image src="/new-logo.png" alt="RIT" fill sizes="100px" className="object-contain" />
          </div>
        </div>
        <div className="flex flex-col text-white">
          <span className="text-sm font-black tracking-wide uppercase leading-tight">Rajalakshmi Institute of Technology</span>
          <span className="text-[10px] text-blue-200 font-bold tracking-widest uppercase">Academic Management System</span>
        </div>
      </div>

      {/* Center: Module Title (Optional) */}
      <div className="hidden lg:flex items-center justify-center flex-1">
        <span className="text-white/80 font-bold text-sm tracking-widest uppercase px-4 py-1 border border-white/20 rounded bg-white/10">
          {formatTabName(currentTab)}
        </span>
      </div>

      {/* Right: Clock & Profile */}
      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="hidden md:block text-right">
          <div className="text-sm font-mono font-bold text-white leading-tight">
            {time ? time.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "--:--:--"}
          </div>
          <div className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none mt-0.5">
            {time ? time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Loading..."}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-l border-blue-800 pl-6">
          <button className="text-blue-200 hover:text-white transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full border border-[#003087]"></span>
          </button>
          
          <div className="flex items-center gap-3 ml-2">
            <div className="text-right hidden sm:block text-white">
              <div className="text-sm font-bold leading-tight">Dr. {name || "HOD"}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">HOD, AIML & AI&DS</div>
            </div>
            {image ? (
              <Image src={image} alt="Profile" width={32} height={32} className="w-8 h-8 rounded border-2 border-white/20 object-cover bg-white" />
            ) : (
              <div className="w-8 h-8 rounded bg-white text-[#003087] flex items-center justify-center font-bold text-sm shadow-sm">
                {name?.[0] ?? "H"}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
