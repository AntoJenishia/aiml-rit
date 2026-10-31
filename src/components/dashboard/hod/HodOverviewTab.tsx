"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Users, GraduationCap, FileText, Award, CalendarDays,
  TrendingUp, Building2, ChevronRight, AlertTriangle,
  CheckCircle, Phone, ArrowRight, Loader2, Sparkles
} from "lucide-react"

interface HodOverviewProps {
  metrics: {
    totalStudents: number
    totalFaculty: number
    totalBatches: number
    activeSections: number
    pendingOD: number
    pendingAchievements: number
    pendingPortfolios: number
    upcomingEvents: number
    aiml: { students: number, faculty: number, pendingOD: number, achievements: number }
  }
}

export default function HodOverviewTab({ metrics }: HodOverviewProps) {
  const todayStr = new Date().toISOString().split("T")[0]
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [loadingAttendance, setLoadingAttendance] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/attendance?date=${todayStr}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setAttendanceData(data)
      })
      .catch((err) => console.error("Error fetching today attendance:", err))
      .finally(() => setLoadingAttendance(false))
  }, [todayStr])

  const pendingIncharges = attendanceData?.pendingIncharges || []
  const hasPending = pendingIncharges.length > 0
  const summary = attendanceData?.summary

  return (
    <div className="space-y-6">
      {/* ── High Level Metrics ── */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-sm">
        <div className="bg-[#003087] px-4 py-2.5 flex items-center justify-between border-b border-[#002266]">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            AIML Department Core Statistics
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</span>
              <GraduationCap className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.totalStudents}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">AIML Enrollments</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AIML Faculty</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.totalFaculty}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Active Teaching Staff</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending OD</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.pendingOD}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Requires Approval</p>
            </div>
          </div>

          <div className="p-4 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Achievements</span>
              <Award className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#0A192F]">{metrics.pendingAchievements}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Attendance Tracking Widget (HOD Feature Requested) ── */}
      {!loadingAttendance && attendanceData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl text-white ${hasPending ? "bg-rose-600" : "bg-emerald-600"}`}>
                {hasPending ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Today&apos;s Attendance Tracking · {todayStr}
                </h3>
                <p className="text-xs text-slate-500">
                  {hasPending
                    ? `${pendingIncharges.length} Class Incharges have not yet submitted attendance for today.`
                    : "All department sections have completed attendance marking for today."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto shrink-0">
              <Link
                href="/admin?tab=activity"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Date Range Analytics
              </Link>
              <Link
                href="/admin?tab=attendance"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
              >
                Open Attendance Tracker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Sections</span>
                <p className="text-xl font-black text-slate-800 mt-0.5">{summary?.totalSections || 0}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Sections Marked</span>
                <p className="text-xl font-black text-emerald-800 mt-0.5">{summary?.markedSections || 0}</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-center">
                <span className="text-[10px] font-bold uppercase text-rose-700">Sections Pending</span>
                <p className="text-xl font-black text-rose-800 mt-0.5">{summary?.pendingSections || 0}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                <span className="text-[10px] font-bold uppercase text-blue-700">Dept. Attendance Rate</span>
                <p className="text-xl font-black text-blue-800 mt-0.5">{summary?.departmentAttendanceRate || 0}%</p>
              </div>
            </div>

            {/* List of Pending Incharges (Who hasn't marked yet) */}
            {hasPending ? (
              <div className="border border-rose-200 bg-rose-50/60 rounded-xl p-4 space-y-3">
                <span className="text-xs font-black text-rose-900 uppercase tracking-wider block">
                  ⚠️ Class Incharges Pending Attendance Submission Today:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pendingIncharges.map((pi: any) => (
                    <div
                      key={`${pi.batch}__${pi.section}`}
                      className="bg-white border border-rose-200 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                            Sec {pi.section}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">
                            Batch {pi.batch}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 text-xs mt-1 truncate">
                          {pi.inchargeName}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">
                          Code: {pi.staffCode || "—"}
                        </span>
                      </div>

                      {pi.inchargePhone && (
                        <a
                          href={`tel:${pi.inchargePhone}`}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition-colors border border-rose-200 shrink-0"
                          title={`Call ${pi.inchargeName}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-emerald-800 text-xs font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>All Class Incharges have marked attendance for today!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Academic Overview & Action Required ── */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#003087]" /> AIML Academic Structure
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Active Batches</span>
              <span className="text-sm font-black text-slate-800">{metrics.totalBatches}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Active Sections</span>
              <span className="text-sm font-black text-slate-800">{metrics.activeSections}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-semibold text-slate-600">Upcoming Events</span>
              <span className="text-sm font-black text-slate-800">{metrics.upcomingEvents}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Pending Actions
          </h3>
          <div className="space-y-3">
            <Link href="/admin?tab=od" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">OD Verifications</p>
                  <p className="text-xs text-slate-500">Requires final HOD override</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black">{metrics.pendingOD}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link href="/admin?tab=achievements" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><Award className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Achievement Approvals</p>
                  <p className="text-xs text-slate-500">Pending public publication</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-black">{metrics.pendingAchievements}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>

            <Link href="/admin?tab=staff" className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800">Faculty Profiles &amp; Portfolios</p>
                  <p className="text-xs text-slate-500">Inspect faculty directory and records</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black">{metrics.pendingPortfolios}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
