"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Award, FileText, CheckCircle, Search, Filter, Loader2,
  XCircle, Clock, ExternalLink, X, Calendar, Download,
  FileSpreadsheet, Sparkles, RefreshCw, Paperclip, CheckSquare, Square
} from "lucide-react"
import { downloadAchievementReportPdf, exportAchievementsCsv } from "@/lib/achievementReportPdfDownloader"

export default function HodAchievementsTab({ previewDoc }: { previewDoc: (url: string) => void }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState("All")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Date Range Filter State
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [activePreset, setActivePreset] = useState<string>("ALL")

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  // PDF Export Modal State
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [includeProofs, setIncludeProofs] = useState(true)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/achievements")
      if (res.ok) {
        const data = await res.json()
        setAchievements(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("[HodAchievementsTab] Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [])

  // Quick Date Preset Handler
  const applyPreset = (preset: "ALL" | "THIS_MONTH" | "LAST_3_MONTHS" | "THIS_YEAR") => {
    setActivePreset(preset)
    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]

    if (preset === "ALL") {
      setFromDate("")
      setToDate("")
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0]
      setFromDate(firstDay)
      setToDate(todayStr)
    } else if (preset === "LAST_3_MONTHS") {
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0]
      setFromDate(threeMonthsAgo)
      setToDate(todayStr)
    } else if (preset === "THIS_YEAR") {
      const academicYearStart = today.getMonth() >= 5
        ? `${today.getFullYear()}-06-01`
        : `${today.getFullYear() - 1}-06-01`
      setFromDate(academicYearStart)
      setToDate(todayStr)
    }
  }

  const handleApprove = async (ach: any) => {
    setActionLoading(ach.id)
    try {
      const res = await fetch("/api/admin/achievements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ach.id, action: "approve" }),
      })
      if (res.ok) {
        await fetchAchievements()
      } else {
        alert("Failed to verify achievement")
      }
    } catch (err: any) {
      alert(err.message || "Approval failed")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    try {
      const res = await fetch("/api/admin/achievements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rejectTarget.id,
          action: "reject",
          remarks: rejectReason.trim() || "Rejected by Head of Department",
        }),
      })
      if (res.ok) {
        setRejectTarget(null)
        setRejectReason("")
        await fetchAchievements()
      } else {
        alert("Failed to reject achievement")
      }
    } catch (err: any) {
      alert(err.message || "Rejection failed")
    } finally {
      setActionLoading(null)
    }
  }

  // Filtered achievements by Search, Category, Status, and Date Range
  const filteredAch = useMemo(() => {
    return achievements.filter((a) => {
      const title = (a.title || "").toLowerCase()
      const name = (a.studentName || "").toLowerCase()
      const reg = (a.registerNumber || "").toLowerCase()
      const event = (a.eventName || "").toLowerCase()
      const q = search.toLowerCase().trim()
      const matchesSearch = !q || title.includes(q) || name.includes(q) || reg.includes(q) || event.includes(q)
      const matchesCategory = filterCategory === "All" || a.category === filterCategory

      let matchesStatus = true
      if (filterStatus === "PENDING") {
        matchesStatus = a.status === "PENDING_VERIFICATION" || !a.status
      } else if (filterStatus === "VERIFIED") {
        matchesStatus = a.status === "VERIFIED" || a.status === "APPROVED"
      } else if (filterStatus === "REJECTED") {
        matchesStatus = a.status === "REJECTED"
      }

      // Date Range Match
      const itemDate = a.date || (a.createdAt ? a.createdAt.slice(0, 10) : "")
      let matchesDate = true
      if (fromDate && itemDate && itemDate < fromDate) {
        matchesDate = false
      }
      if (toDate && itemDate && itemDate > toDate) {
        matchesDate = false
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDate
    })
  }, [achievements, search, filterCategory, filterStatus, fromDate, toDate])

  // Key KPI metrics for filtered period
  const totalCount = filteredAch.length
  const verifiedCount = filteredAch.filter((a) => a.status === "VERIFIED" || a.status === "APPROVED").length
  const pendingCount = filteredAch.filter((a) => a.status === "PENDING_VERIFICATION" || !a.status).length
  const proofsCount = filteredAch.filter((a) => a.proofFileUrl).length
  const winnersCount = filteredAch.filter((a) => {
    const pos = (a.position || "").toLowerCase()
    return pos.includes("win") || pos.includes("1st") || pos.includes("first") || pos.includes("2nd") || pos.includes("second") || pos.includes("3rd") || pos.includes("prize")
  }).length

  // Execute PDF generation with chosen proof setting
  const confirmDownloadPdf = async (attachProofs: boolean) => {
    try {
      setExportingPdf(true)
      await downloadAchievementReportPdf({
        fromDate,
        toDate,
        achievements: filteredAch,
        includeProofs: attachProofs,
      })
      setShowPdfModal(false)
    } catch (e: any) {
      alert("Failed to export PDF: " + (e?.message || e))
    } finally {
      setExportingPdf(false)
    }
  }

  // Trigger Excel/CSV Export
  const handleDownloadCsv = () => {
    try {
      setExportingCsv(true)
      exportAchievementsCsv(filteredAch, fromDate, toDate)
    } catch (e: any) {
      alert("Failed to export CSV: " + (e?.message || e))
    } finally {
      setExportingCsv(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-full overflow-hidden">
      {/* ── 1. Top Header Card (Fully Responsive) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl shadow-xs shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                Department Achievements
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1 sm:line-clamp-none">
                Review, verify, and generate date-wise institutional reports for student hackathons, publications &amp; awards
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Stack on small screens */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            disabled={exportingPdf || filteredAch.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Download formal institutional PDF with options to attach certificate proofs"
          >
            {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            <span>Download PDF Report</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={exportingCsv || filteredAch.length === 0}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 disabled:opacity-50 border border-slate-200"
            title="Export filtered records into Excel / CSV spreadsheet"
          >
            {exportingCsv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchAchievements}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all shadow-2xs shrink-0"
            title="Refresh achievements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── 2. Date Range Filter & Quick Presets Bar (Fully Responsive) ── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#003087] shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filter by Event Date Range
            </h3>
            {(fromDate || toDate) && (
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Active
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden xs:inline">Presets:</span>
            {[
              { id: "ALL", label: "All Time" },
              { id: "THIS_MONTH", label: "This Month" },
              { id: "LAST_3_MONTHS", label: "3 Months" },
              { id: "THIS_YEAR", label: "Academic Year" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activePreset === p.id && (!fromDate && !toDate ? p.id === "ALL" : true)
                    ? "bg-[#003087] text-white shadow-2xs"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={() => applyPreset("ALL")}
                className="text-xs font-bold text-rose-600 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Date Inputs & Search / Status Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* From Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setActivePreset("CUSTOM")
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#003087] transition-all cursor-pointer shadow-2xs"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setActivePreset("CUSTOM")
              }}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#003087] transition-all cursor-pointer shadow-2xs"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#003087] transition-all cursor-pointer shadow-2xs"
            >
              <option value="All">All Categories</option>
              <option value="Hackathon">Hackathon</option>
              <option value="Paper Publication">Paper Publication</option>
              <option value="Sports">Sports</option>
              <option value="Project Exhibition">Project Exhibition</option>
              <option value="Coding Contest">Coding Contest</option>
              <option value="Workshop / Seminar">Workshop / Seminar</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Search Student / Event
            </label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Name, Reg No, Title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#003087] transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* ── Status Tabs & KPI Summary Strip (Responsive wrapping) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold overflow-x-auto max-w-full">
            {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  filterStatus === s ? "bg-[#003087] text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                {s === "PENDING" && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Live KPI Metric Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[11px] sm:text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Total: {totalCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              Verified: {verifiedCount}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-200">
              🏆 Winners: {winnersCount}
            </span>
            {pendingCount > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                Pending: {pendingCount}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. Achievements List / Empty State ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 sm:p-16 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#003087] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading student achievements...</p>
        </div>
      ) : filteredAch.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <Award className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No achievements found in this date range</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {fromDate || toDate || search || filterCategory !== "All" || filterStatus !== "ALL"
              ? "Try adjusting your date range or filters above."
              : "No student achievements have been recorded yet."}
          </p>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => applyPreset("ALL")}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Reset Date Filter to All Time
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3.5 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold text-slate-600">
            <span>
              Showing {filteredAch.length} {filteredAch.length === 1 ? "record" : "records"}
              {fromDate || toDate ? ` (${fromDate || "Earliest"} → ${toDate || "Latest"})` : ""}
            </span>
            <span className="text-slate-400 font-normal text-[11px]">
              {proofsCount} certificates attached · Use &quot;Download PDF Report&quot; to export
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredAch.map((ach: any) => {
              const isVerified = ach.status === "VERIFIED" || ach.status === "APPROVED"
              const isPending = ach.status === "PENDING_VERIFICATION" || !ach.status
              const isRejected = ach.status === "REJECTED"

              return (
                <div key={ach.id} className="p-4 sm:p-6 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 sm:gap-5">
                    <div className="flex-1 space-y-2.5 min-w-0">
                      {/* Title & Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {ach.category || "Achievement"}
                        </span>
                        {ach.position && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            🏆 {ach.position}
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug break-words">
                          {ach.title}
                        </h4>
                      </div>

                      {/* Student & Event Metadata Grid (Responsive on Mobile) */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-200/70">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Name</p>
                          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{ach.studentName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Register Number</p>
                          <p className="text-xs font-mono font-bold text-slate-700 mt-0.5">{ach.registerNumber || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event / Organizer</p>
                          <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{ach.eventName || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Date</p>
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">{ach.date || "—"}</p>
                        </div>
                      </div>

                      {/* Description */}
                      {ach.description && (
                        <p className="text-xs text-slate-600 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-2xs break-words">
                          {ach.description}
                        </p>
                      )}

                      {/* Audit verification note */}
                      {ach.verifiedBy && (
                        <p className="text-[11px] text-slate-500 font-medium pt-1">
                          Verified by: <span className="font-bold text-slate-700">{ach.verifiedBy}</span>
                          {ach.remarks && <span className="italic text-slate-500"> — &ldquo;{ach.remarks}&rdquo;</span>}
                        </p>
                      )}
                    </div>

                    {/* Right Action / Status Controls (Full Width on Mobile) */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2.5 shrink-0 pt-2 lg:pt-1 border-t lg:border-t-0 border-slate-100">
                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold">
                        {isVerified ? (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified
                          </span>
                        ) : isRejected ? (
                          <span className="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                          </span>
                        )}
                      </div>

                      {/* Action buttons group */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* View Proof Button */}
                        {ach.proofFileUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof previewDoc === "function") previewDoc(ach.proofFileUrl)
                              else window.open(ach.proofFileUrl, "_blank")
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#003087] transition-colors shadow-2xs"
                          >
                            <FileText className="h-3.5 w-3.5" /> Proof
                          </button>
                        )}

                        {/* HOD Direct Verification Controls */}
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(ach)}
                              disabled={actionLoading === ach.id}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803d] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                              {actionLoading === ach.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectTarget(ach)
                                setRejectReason("")
                              }}
                              disabled={actionLoading === ach.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. Download PDF Confirmation Modal (With Proof Option) ── */}
      {showPdfModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => !exportingPdf && setShowPdfModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-[#003087] rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">Download Achievement Report</h3>
                  <p className="text-xs text-slate-500">Configure export options &amp; certificate attachments</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !exportingPdf && setShowPdfModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Date Range Filter:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {fromDate && toDate ? `${fromDate} to ${toDate}` : fromDate ? `From ${fromDate}` : toDate ? `Until ${toDate}` : "All Time"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Total Entries in Scope:</span>
                <span className="font-bold text-blue-700">{filteredAch.length} records ({verifiedCount} Verified)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Certificate Proofs Available:</span>
                <span className="font-bold text-emerald-700">{proofsCount} attachments</span>
              </div>
            </div>

            {/* Question: Attach Proof Copies? */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Certificate Proof Attachment Setting
              </label>

              {/* Option A: Comprehensive with proofs */}
              <div
                onClick={() => setIncludeProofs(true)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  includeProofs
                    ? "border-[#003087] bg-blue-50/50 shadow-sm ring-1 ring-[#003087]"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="pt-0.5">
                  {includeProofs ? (
                    <CheckSquare className="w-4 h-4 text-[#003087]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                    Attach Certificate Proof Copies (Recommended)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Appends an official Annexure containing embedded certificate preview images, student details, and direct audit verification links for each achievement.
                  </p>
                </div>
              </div>

              {/* Option B: Table only */}
              <div
                onClick={() => setIncludeProofs(false)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  !includeProofs
                    ? "border-[#003087] bg-blue-50/50 shadow-sm ring-1 ring-[#003087]"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="pt-0.5">
                  {!includeProofs ? (
                    <CheckSquare className="w-4 h-4 text-[#003087]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    Consolidated Summary Table Only
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Generates a concise tabular institutional report with summary metrics, student roster, and HOD signature block (Faster download, smaller file size).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPdfModal(false)}
                disabled={exportingPdf}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDownloadPdf(includeProofs)}
                disabled={exportingPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {exportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Assembling PDF Report...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Report {includeProofs ? "(with Proofs)" : ""}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. Reject Reason Modal ── */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setRejectTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Reject Achievement</h3>
              <button onClick={() => setRejectTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Provide feedback or reason for rejecting &ldquo;{rejectTarget.title}&rdquo; of {rejectTarget.studentName}:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete certificate or invalid event date..."
              className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[90px]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading === rejectTarget.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
