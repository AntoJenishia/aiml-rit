"use client"
import { useState, useEffect } from "react"
import {
  CalendarDays, TrendingUp, Users, Award, Clock,
  FileText, Download, CheckCircle, AlertTriangle,
  RefreshCw, Loader2, Phone, Search, ExternalLink,
  ChevronRight, BarChart3, ShieldAlert
} from "lucide-react"
import { downloadActivityReportPdf } from "@/lib/activityReportPdfDownloader"

export default function HodActivityTab() {
  const today = new Date().toISOString().split("T")[0]
  const defaultFrom = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const [fromDate, setFromDate] = useState<string>(defaultFrom)
  const [toDate, setToDate] = useState<string>(today)
  const [preset, setPreset] = useState<"7D" | "30D" | "TODAY" | "CUSTOM">("7D")

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false)

  const fetchActivityData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/activity?fromDate=${fromDate}&toDate=${toDate}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("[HodActivityTab] fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityData()
  }, [fromDate, toDate])

  const handleApplyPreset = (p: "7D" | "30D" | "TODAY") => {
    setPreset(p)
    const now = new Date()
    const to = now.toISOString().split("T")[0]
    let from = to

    if (p === "7D") {
      const d = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
      from = d.toISOString().split("T")[0]
    } else if (p === "30D") {
      const d = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
      from = d.toISOString().split("T")[0]
    } else if (p === "TODAY") {
      from = to
    }

    setFromDate(from)
    setToDate(to)
  }

  const handleDownloadPdf = () => {
    if (!data) return
    setDownloadingPdf(true)
    try {
      downloadActivityReportPdf(data)
    } finally {
      setTimeout(() => setDownloadingPdf(false), 800)
    }
  }

  const handleDownloadExcel = () => {
    if (!data) return
    const rows = [
      ["RAJALAKSHMI INSTITUTE OF TECHNOLOGY - AIML DEPARTMENT"],
      ["ACTIVITY & ATTENDANCE AUDIT REPORT"],
      [`Date Range: ${fromDate} to ${toDate}`, `Working Days Logged: ${data.range?.workingDays || 0}`],
      [""],
      ["1. SECTION PERFORMANCE SUMMARY"],
      ["Batch", "Section", "Class Incharge", "Marked Sessions", "Enrolled Students", "Present", "Absent", "OD", "Attendance Rate %"],
      ...data.sectionsSummary.map((s: any) => [
        s.batch,
        s.section,
        s.inchargeName,
        s.totalSessions,
        s.studentCount,
        s.presentCount,
        s.absentCount,
        s.odCount,
        `${s.attendanceRate}%`,
      ]),
      [""],
      ["2. FREQUENT ABSENTEES (AT-RISK >= 3 DAYS)"],
      ["Register Number", "Student Name", "Batch", "Section", "Absent Days", "Incharge", "Latest Reason"],
      ...data.frequentAbsentees.map((s: any) => [
        s.registerNumber,
        s.name,
        s.batch,
        s.section,
        s.absentCount,
        s.inchargeName,
        s.absentReasons?.[0] || "None",
      ]),
    ]

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `RIT_AIML_Activity_Report_${fromDate}_to_${toDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const kpi = data?.kpi
  const sectionsSummary = data?.sectionsSummary || []
  const frequentAbsentees = data?.frequentAbsentees || []
  const achievements = data?.achievementsList || []

  const filteredSections = sectionsSummary.filter((s: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.batch.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q) ||
      s.inchargeName.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* ── Top Command Banner & Date Range Selector ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#003087]/10 text-[#003087]">
                Executive Dashboard
              </span>
              <span className="text-xs font-bold text-slate-500">
                Dr. Selvakumaran S. · HOD AIML
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#003087]" /> Department Activity &amp; Attendance Command Center
            </h2>
            <p className="text-xs text-slate-500">
              Multi-day aggregation across class sections, OD requests, leaves, and verified achievements.
            </p>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              <button
                onClick={() => handleApplyPreset("TODAY")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  preset === "TODAY" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleApplyPreset("7D")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  preset === "7D" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                This Week (7D)
              </button>
              <button
                onClick={() => handleApplyPreset("30D")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  preset === "30D" ? "bg-[#003087] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                This Month (30D)
              </button>
            </div>

            {/* Export Buttons */}
            <button
              onClick={handleDownloadPdf}
              disabled={loading || downloadingPdf}
              className="px-3.5 py-2 bg-[#003087] hover:bg-[#002266] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {downloadingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Download PDF
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={loading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Excel (CSV)
            </button>
          </div>
        </div>

        {/* Custom Date Range Selectors */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setPreset("CUSTOM")
                setFromDate(e.target.value)
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setPreset("CUSTOM")
                setToDate(e.target.value)
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
            />
          </div>

          <button
            onClick={fetchActivityData}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-[#003087] rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          </button>

          {data?.range && (
            <span className="text-xs font-bold text-slate-400 ml-auto">
              {data.range.workingDays} working days logged in this range
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
          <p className="text-xs font-bold text-slate-500">Aggregating department analytics...</p>
        </div>
      ) : (
        <>
          {/* ── KPI Metric Cards Strip ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-[#003087]">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Att. Rate</span>
              <p className="text-2xl font-black text-[#003087] mt-1">{kpi?.overallAttendanceRate || 0}%</p>
              <span className="text-[10px] text-slate-400 font-semibold">Across all batches</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-600">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Verified ODs</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">
                {(kpi?.verifiedOdCount || 0) + (kpi?.completedOdCount || 0)}
              </p>
              <span className="text-[10px] text-indigo-500 font-semibold">{kpi?.totalOdRequests || 0} total requests</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Approved Leaves</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{kpi?.approvedLeaveCount || 0}</p>
              <span className="text-[10px] text-amber-600 font-semibold">{kpi?.totalLeaveRequests || 0} requested</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Achievements</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{kpi?.totalAchievementsCount || 0}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Logged &amp; verified</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-rose-500">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">At-Risk Absentees</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{kpi?.frequentAbsenteesCount || 0}</p>
              <span className="text-[10px] text-rose-600 font-semibold">&ge; 3 days absent</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Working Sessions</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{data?.range?.workingDays || 0}</p>
              <span className="text-[10px] text-slate-400 font-semibold">{kpi?.totalStudents || 0} students</span>
            </div>
          </div>

          {/* ── Section Performance Matrix Table ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Section Attendance &amp; Activity Performance Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Consolidated performance metrics for all AIML sections during {fromDate} to {toDate}.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter section or incharge..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium outline-none focus:border-[#003087]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                    <th className="px-5 py-3.5">Batch &amp; Section</th>
                    <th className="px-4 py-3.5">Class Incharge</th>
                    <th className="px-4 py-3.5 text-center">Sessions</th>
                    <th className="px-4 py-3.5 text-center">Headcount</th>
                    <th className="px-4 py-3.5 text-center">Present (Agg)</th>
                    <th className="px-4 py-3.5 text-center">Absent (Agg)</th>
                    <th className="px-4 py-3.5 text-center">OD (Agg)</th>
                    <th className="px-5 py-3.5 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredSections.map((sec: any) => {
                    const isHealthy = sec.attendanceRate >= 85
                    const isModerate = sec.attendanceRate >= 75 && sec.attendanceRate < 85

                    return (
                      <tr key={`${sec.batch}__${sec.section}`} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-5 py-3.5 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-[#003087]/10 text-[#003087] flex items-center justify-center font-black text-xs">
                              {sec.section}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                Section {sec.section}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                Batch {sec.batch}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 align-middle">
                          <span className="font-bold text-xs text-slate-800 block">
                            {sec.inchargeName}
                          </span>
                          {sec.staffCode && (
                            <span className="text-[10px] font-mono text-slate-400">
                              Code: {sec.staffCode}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center font-bold text-xs text-slate-700">
                          {sec.totalSessions}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center font-bold text-xs text-slate-700">
                          {sec.studentCount}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center font-bold text-xs text-emerald-700">
                          {sec.presentCount}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center font-bold text-xs text-rose-700">
                          {sec.absentCount}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center font-bold text-xs text-indigo-700">
                          {sec.odCount}
                        </td>

                        <td className="px-5 py-3.5 align-middle text-right">
                          <div className="inline-flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-full ${
                                  isHealthy ? "bg-emerald-500" : isModerate ? "bg-amber-500" : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(100, sec.attendanceRate)}%` }}
                              />
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                isHealthy
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : isModerate
                                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {sec.attendanceRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Frequent Absentees & At-Risk Alert Table ── */}
          {frequentAbsentees.length > 0 && (
            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-rose-200 bg-rose-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-600 text-white rounded-xl">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-900">
                      Frequent Absentees Monitoring ({frequentAbsentees.length} Students At-Risk)
                    </h3>
                    <p className="text-xs text-rose-700">
                      Students who have been absent 3 or more days during the selected period.
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-rose-50/50 border-b border-rose-100 text-[11px] uppercase tracking-wider font-bold text-rose-900">
                      <th className="px-5 py-3">Register No</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Batch &amp; Sec</th>
                      <th className="px-4 py-3 text-center">Days Absent</th>
                      <th className="px-5 py-3">Incharge Name</th>
                      <th className="px-5 py-3">Absence Reasons Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {frequentAbsentees.map((stu: any) => (
                      <tr key={stu.uid} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-5 py-3.5 align-middle">
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {stu.registerNumber}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 align-middle font-bold text-xs text-slate-900">
                          {stu.name}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-xs font-bold text-slate-600">
                          Batch {stu.batch} · {stu.section}
                        </td>

                        <td className="px-4 py-3.5 align-middle text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                            {stu.absentCount} Days
                          </span>
                        </td>

                        <td className="px-5 py-3.5 align-middle text-xs font-bold text-slate-700">
                          {stu.inchargeName}
                        </td>

                        <td className="px-5 py-3.5 align-middle">
                          {stu.absentReasons && stu.absentReasons.length > 0 ? (
                            <span className="text-xs text-slate-700 font-medium line-clamp-1 italic">
                              &ldquo;{stu.absentReasons[0]}&rdquo;
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-500 font-semibold italic">
                              No reason submitted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Recent Verified Achievements Strip ── */}
          {achievements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Recent Verified Department Achievements in Range
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {achievements.length} Achievements
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((ach: any) => (
                  <div
                    key={ach.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-2 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          {ach.position || "Winner"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{ach.date}</span>
                      </div>
                      <p className="text-xs font-black text-slate-900 leading-snug line-clamp-2">
                        {ach.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {ach.studentName} · {ach.registerNumber}
                      </p>
                    </div>

                    {ach.proofFileUrl && (
                      <a
                        href={ach.proofFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#003087] font-bold hover:underline inline-flex items-center gap-1 self-start pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> View Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

