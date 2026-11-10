"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Shield, Search, Download, RefreshCw, Loader2,
  MapPin, Globe, Laptop, Smartphone, CheckCircle,
  AlertTriangle, KeyRound, CalendarCheck, Clock,
  FileText, Users, ArrowUpRight, Copy, Check
} from "lucide-react"

interface AuditLog {
  id?: string
  userId: string
  userName: string
  userEmail?: string
  userRole: "student" | "staff" | "hod" | "admin" | "system"
  registerNumber?: string | null
  staffCode?: string | null
  action: string
  entityType: string
  entityId?: string | null
  details: string
  ip: string
  location: string
  userAgent: string
  createdAt: string
}

interface Metrics {
  totalLogs: number
  uniqueUsers: number
  loginEvents: number
  attendanceEvents: number
  leaveEvents: number
  odEvents: number
}

function parseDevice(ua: string): { browser: string; os: string; isMobile: boolean } {
  const isMobile = /mobile|android|iphone|ipad/i.test(ua)
  let os = "Desktop"
  if (/windows/i.test(ua)) os = "Windows"
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS"
  else if (/android/i.test(ua)) os = "Android"
  else if (/iphone|ipad/i.test(ua)) os = "iOS"
  else if (/linux/i.test(ua)) os = "Linux"

  let browser = "Browser"
  if (/edg/i.test(ua)) browser = "Edge"
  else if (/chrome/i.test(ua)) browser = "Chrome"
  else if (/safari/i.test(ua)) browser = "Safari"
  else if (/firefox/i.test(ua)) browser = "Firefox"

  return { browser, os, isMobile }
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 60) return "Just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export default function HodAuditLogsTab() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [actionFilter, setActionFilter] = useState<string>("ALL")
  const [copiedIp, setCopiedIp] = useState<string | null>(null)

  const fetchLogs = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch("/api/admin/audit-logs?limit=200")
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setMetrics(data.metrics || null)
      }
    } catch (err) {
      console.error("[HodAuditLogsTab] Error fetching logs:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIp(text)
    setTimeout(() => setCopiedIp(null), 2000)
  }

  // Filtered in-memory list
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (roleFilter !== "ALL" && log.userRole.toLowerCase() !== roleFilter.toLowerCase()) {
        return false
      }
      if (actionFilter !== "ALL" && !log.action.includes(actionFilter)) {
        return false
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        return (
          log.userName.toLowerCase().includes(q) ||
          (log.userEmail || "").toLowerCase().includes(q) ||
          (log.registerNumber || "").toLowerCase().includes(q) ||
          (log.staffCode || "").toLowerCase().includes(q) ||
          log.details.toLowerCase().includes(q) ||
          log.ip.toLowerCase().includes(q) ||
          log.location.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logs, roleFilter, actionFilter, search])

  // Export to CSV
  const exportCsv = () => {
    const headers = [
      "Timestamp",
      "User Name",
      "Role",
      "Register No / Staff Code",
      "Action",
      "Details",
      "IP Address",
      "Location",
      "Device / User Agent",
    ]
    const rows = filteredLogs.map((l) => [
      l.createdAt,
      `"${l.userName.replace(/"/g, '""')}"`,
      l.userRole.toUpperCase(),
      l.registerNumber || l.staffCode || "—",
      l.action,
      `"${l.details.replace(/"/g, '""')}"`,
      l.ip,
      `"${l.location.replace(/"/g, '""')}"`,
      `"${l.userAgent.replace(/"/g, '""')}"`,
    ])

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `AIML_Audit_Logs_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#003087] text-white shadow-sm">
              <Shield className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Activity Audit &amp; Security Logs
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive tracking of all user operations with client IP addresses and geolocation.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#003087] hover:bg-[#002266] transition-all shadow-sm hover:shadow disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Metric Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Recorded Logs</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.totalLogs ?? logs.length}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Audit history</span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Unique Users</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.uniqueUsers ?? "—"}</p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Staff &amp; Students</span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auth &amp; Logins</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <KeyRound className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{metrics?.loginEvents ?? 0}</p>
          <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">IP Verified Logins</span>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Operations</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {(metrics?.attendanceEvents || 0) + (metrics?.leaveEvents || 0) + (metrics?.odEvents || 0)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">Attendance / Leave / OD</span>
        </div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, reg no, IP address, location, action..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs focus:border-[#003087] focus:ring-1 focus:ring-[#003087] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-semibold outline-none focus:border-[#003087]"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="STAFF">Faculty / Staff</option>
            <option value="HOD">HOD / Admin</option>
          </select>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-semibold outline-none focus:border-[#003087]"
          >
            <option value="ALL">All Actions</option>
            <option value="AUTH_LOGIN">Login Sessions</option>
            <option value="ATTENDANCE">Attendance Operations</option>
            <option value="LEAVE">Advance Leaves</option>
            <option value="OD">On-Duty Applications</option>
          </select>
        </div>
      </div>

      {/* ── Audit Logs Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
            <p className="text-xs font-bold text-slate-500">Retrieving security audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No audit logs found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || roleFilter !== "ALL" || actionFilter !== "ALL"
                ? "Try clearing your search or filter options."
                : "Activity logs will automatically populate as students and faculty interact with the portal."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-5 py-3.5 min-w-[220px]">User &amp; Identity</th>
                  <th className="px-4 py-3.5 min-w-[150px]">Activity / Event</th>
                  <th className="px-5 py-3.5 min-w-[240px]">Details &amp; Payload</th>
                  <th className="px-4 py-3.5 min-w-[180px]">IP &amp; Geolocation</th>
                  <th className="px-4 py-3.5 min-w-[140px]">Device / Browser</th>
                  <th className="px-4 py-3.5 text-right min-w-[130px]">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLogs.map((log) => {
                  const device = parseDevice(log.userAgent)
                  const isLogin = log.action.includes("LOGIN")
                  const isAttendance = log.action.includes("ATTENDANCE")
                  const isLeave = log.action.includes("LEAVE")
                  const isOd = log.action.includes("OD")
                  const isReject = log.action.includes("REJECT")

                  // Action badge color
                  let actionBadge = "bg-slate-100 text-slate-700 border-slate-200"
                  if (isReject) {
                    actionBadge = "bg-rose-50 text-rose-700 border-rose-200"
                  } else if (isLogin) {
                    actionBadge = "bg-emerald-50 text-emerald-700 border-emerald-200"
                  } else if (isAttendance) {
                    actionBadge = "bg-blue-50 text-blue-700 border-blue-200"
                  } else if (isLeave) {
                    actionBadge = "bg-amber-50 text-amber-800 border-amber-200"
                  } else if (isOd) {
                    actionBadge = "bg-indigo-50 text-indigo-700 border-indigo-200"
                  }

                  // Role badge color
                  let roleBadge = "bg-slate-100 text-slate-700"
                  if (log.userRole === "student") roleBadge = "bg-purple-100 text-purple-800 border border-purple-200"
                  else if (log.userRole === "staff") roleBadge = "bg-blue-100 text-blue-800 border border-blue-200"
                  else if (log.userRole === "hod" || log.userRole === "admin") roleBadge = "bg-indigo-100 text-indigo-900 border border-indigo-300"

                  return (
                    <tr key={log.id || `${log.userId}-${log.createdAt}`} className="hover:bg-slate-50/70 transition-colors">
                      {/* 1. User Identity */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-[#003087] flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                            {log.userName?.[0] || "U"}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 text-sm block truncate">
                              {log.userName}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${roleBadge}`}>
                                {log.userRole}
                              </span>
                              {(log.registerNumber || log.staffCode) && (
                                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                  {log.registerNumber || log.staffCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Action Badge */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border inline-flex items-center gap-1 ${actionBadge}`}>
                          {isLogin && <KeyRound className="w-3 h-3" />}
                          {isAttendance && <CalendarCheck className="w-3 h-3" />}
                          {isLeave && <FileText className="w-3 h-3" />}
                          {isOd && <CheckCircle className="w-3 h-3" />}
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* 3. Details Description */}
                      <td className="px-5 py-3.5 align-middle max-w-sm">
                        <p className="text-xs text-slate-700 font-medium leading-relaxed break-words">
                          {log.details}
                        </p>
                      </td>

                      {/* 4. IP & Geolocation */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {log.ip}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(log.ip)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors"
                              title="Copy IP address"
                            >
                              {copiedIp === log.ip ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[170px]" title={log.location}>
                              {log.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 5. Device & Browser */}
                      <td className="px-4 py-3.5 align-middle text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {device.isMobile ? (
                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800">
                            {device.browser}
                          </span>
                          <span className="text-slate-400 font-normal">
                            on {device.os}
                          </span>
                        </div>
                      </td>

                      {/* 6. Timestamp */}
                      <td className="px-4 py-3.5 align-middle text-right">
                        <span className="text-xs font-bold text-slate-700 block whitespace-nowrap">
                          {formatRelativeTime(log.createdAt)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block whitespace-nowrap mt-0.5">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

