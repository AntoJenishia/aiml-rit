"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Shield, Building2, Bell, Loader2 } from "lucide-react"
import HodOverviewTab from "./hod/HodOverviewTab"
import HodStaffTab from "./hod/HodStaffTab"
import HodStudentsTab from "./hod/HodStudentsTab"
import HodOdTab from "./hod/HodOdTab"
import HodAchievementsTab from "./hod/HodAchievementsTab"
import HodFacultyPortfoliosTab from "./hod/HodFacultyPortfoliosTab"

// ── Department Filter ──

function HodDashInner() {
  const { name } = useUser()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "dashboard"

  const [departmentFilter, setDepartmentFilter] = useState<"ALL" | "AIML" | "AIDS">("ALL")
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchMetrics = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/admin/overview")
        if (res.ok) {
          const data = await res.json()
          if (isMounted) { setMetrics(data); setError(null) }
        } else {
          const errData = await res.json().catch(() => ({}))
          if (isMounted) setError(errData.error || "Failed to load metrics")
        }
      } catch (err: any) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchMetrics()
    return () => { isMounted = false }
  }, [])

  // Derive display metrics based on filter
  const displayMetrics = metrics ? {
    ...metrics,
    totalStudents: departmentFilter === "ALL" ? metrics.totalStudents : (departmentFilter === "AIML" ? metrics.aiml.students : metrics.aids.students),
    totalFaculty: departmentFilter === "ALL" ? metrics.totalFaculty : (departmentFilter === "AIML" ? metrics.aiml.faculty : metrics.aids.faculty),
    pendingOD: departmentFilter === "ALL" ? metrics.pendingOD : (departmentFilter === "AIML" ? metrics.aiml.pendingOD : metrics.aids.pendingOD),
    pendingAchievements: departmentFilter === "ALL" ? metrics.pendingAchievements : (departmentFilter === "AIML" ? metrics.aiml.achievements : metrics.aids.achievements),
  } : null

  return (
    <div className="space-y-6 pb-20">
      {/* ── Academic Portal Banner ── */}
      <div className="bg-[#003087] rounded border border-[#002266] shadow-sm p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Building2 className="w-40 h-40 text-white -translate-y-8 translate-x-4" />
        </div>
        
        <div className="relative z-10">
          <p className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-1">Academic Dashboard</p>
          <h1 className="text-2xl font-black text-white">Welcome, Dr. {name || "HOD"}</h1>
          <p className="text-blue-100 text-sm mt-1">Head of Department • AIML & AI&DS</p>
        </div>

        {/* ── Sleek Institutional Filter Bar (Moved inside Banner for compactness) ── */}
        <div className="relative z-10 flex items-center gap-1 bg-white/10 p-1 rounded border border-white/20 self-start md:self-auto">
          <button 
            onClick={() => setDepartmentFilter("ALL")}
            className={`px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${departmentFilter === "ALL" ? "bg-white text-[#003087] shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"}`}
          >
            Global View
          </button>
          <button 
            onClick={() => setDepartmentFilter("AIML")}
            className={`px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${departmentFilter === "AIML" ? "bg-white text-[#003087] shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"}`}
          >
            AIML
          </button>
          <button 
            onClick={() => setDepartmentFilter("AIDS")}
            className={`px-5 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded transition-all ${departmentFilter === "AIDS" ? "bg-white text-[#003087] shadow-sm" : "text-white/80 hover:bg-white/20 hover:text-white"}`}
          >
            AI&DS
          </button>
        </div>
      </div>

      {/* ── Tabs Layout ── */}
      {activeTab === "dashboard" ? (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : error || !displayMetrics ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-bold shadow-sm border border-red-100">
            Error loading dashboard data: {error || "Unknown error"}
          </div>
        ) : (
          <HodOverviewTab departmentFilter={departmentFilter} metrics={displayMetrics} />
        )
      ) : activeTab === "staff" ? (
        <HodStaffTab departmentFilter={departmentFilter} />
      ) : activeTab === "students" ? (
        <HodStudentsTab departmentFilter={departmentFilter} />
      ) : activeTab === "od" ? (
        <HodOdTab departmentFilter={departmentFilter} />
      ) : activeTab === "achievements" ? (
        <HodAchievementsTab previewDoc={(url) => window.open(url, '_blank')} />
      ) : activeTab === "faculty-portfolios" ? (
        <HodFacultyPortfoliosTab departmentFilter={departmentFilter} />
      ) : (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 capitalize">{activeTab.replace("-", " ")} Module</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            This module is part of the HOD Master Dashboard Phase 2+ implementation plan.
          </p>
        </div>
      )}
    </div>
  )
}

export default function HodDash() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>}>
      <HodDashInner />
    </Suspense>
  )
}
