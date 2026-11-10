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
import HodBatchesTab from "./hod/HodBatchesTab"
import HodAttendanceTab from "./hod/HodAttendanceTab"
import HodActivityTab from "./hod/HodActivityTab"
import HodLeaveTab from "./hod/HodLeaveTab"
import HodAuditLogsTab from "./hod/HodAuditLogsTab"
import DocumentPreviewModal from "@/components/common/DocumentPreviewModal"

function HodDashInner() {
  const { name } = useUser()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "dashboard"

  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 max-w-full overflow-hidden">
      {/* ── Academic Portal Banner ── */}
      <div className="bg-[#003087] rounded-2xl border border-[#002266] shadow-sm p-4 sm:p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subtle Watermark */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Building2 className="w-32 h-32 sm:w-40 sm:h-40 text-white -translate-y-8 translate-x-4" />
        </div>
        
        <div className="relative z-10 min-w-0">
          <p className="text-blue-200 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-1">Academic Dashboard</p>
          <h1 className="text-xl sm:text-2xl font-black text-white truncate">
            Welcome, {!name || name.toLowerCase().includes("test")
              ? "Dr. Selvakumaran S."
              : (name.toLowerCase().includes("dr.") ? name : `Dr. ${name}`)}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">Head of Department • Artificial Intelligence &amp; Machine Learning (AIML)</p>
        </div>

        {/* Department Badge */}
        <div className="relative z-10 flex items-center gap-2 bg-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/20 self-start md:self-auto shrink-0">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] sm:text-xs font-bold text-white uppercase tracking-wider">AIML Department</span>
        </div>
      </div>

      {/* ── Tabs Layout ── */}
      {activeTab === "dashboard" ? (
        loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : error || !metrics ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center font-bold shadow-sm border border-red-100">
            Error loading dashboard data: {error || "Unknown error"}
          </div>
        ) : (
          <HodOverviewTab metrics={metrics} />
        )
      ) : activeTab === "activity" || activeTab === "department-overview" ? (
        <HodActivityTab />
      ) : activeTab === "attendance" ? (
        <HodAttendanceTab />
      ) : activeTab === "leave" ? (
        <HodLeaveTab />
      ) : activeTab === "staff" ? (
        <HodStaffTab />
      ) : activeTab === "students" ? (
        <HodStudentsTab />
      ) : activeTab === "od" ? (
        <HodOdTab />
      ) : activeTab === "achievements" ? (
        <HodAchievementsTab previewDoc={(url) => setPreviewUrl(url)} />
      ) : activeTab === "faculty-portfolios" ? (
        <HodStaffTab />
      ) : activeTab === "batches" || activeTab === "semesters" || activeTab === "sections" || activeTab === "class-allocation" ? (
        <HodBatchesTab />
      ) : activeTab === "audit-logs" ? (
        <HodAuditLogsTab />
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

      {previewUrl && (
        <DocumentPreviewModal
          url={previewUrl}
          title="Achievement Document Proof"
          onClose={() => setPreviewUrl(null)}
        />
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
