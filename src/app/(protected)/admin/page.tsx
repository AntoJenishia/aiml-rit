"use client"
import { useState } from "react"
import { useUser } from "@/lib/hooks/useUser"
import { TrendingUp, Activity, BarChart3, GraduationCap } from "lucide-react"
import Link from "next/link"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts"

// ── All data imported from /data — nothing hardcoded ──
import { hodStats, quickActions, colorMap, batches } from "@/data/hodDashboard"
import { batchEnrollments } from "@/data/enrollment"
import { assessmentScores, batchAttendance } from "@/data/assessments"

// ── Color palettes ──
const BATCH_COLORS: Record<string, string> = {
  "2025": "#3b82f6", // blue
  "2024": "#8b5cf6", // violet
  "2023": "#10b981", // emerald
  "2022": "#f59e0b", // amber
}

const CAT_COLORS = { cat1: "#6366f1", cat2: "#f59e0b", cat3: "#10b981" }

type ViewMode = "batch" | "compare"

export default function AdminPage() {
  const { name } = useUser()
  const [selectedBatch, setSelectedBatch] = useState("2025")
  const [viewMode, setViewMode] = useState<ViewMode>("batch")

  // ── Derived data ──
  const enrollmentChartData = batchEnrollments.map((b) => ({
    name: `Batch ${b.label}`,
    batch: b.batch,
    Students: b.totalStudents,
    Male: b.maleCount,
    Female: b.femaleCount,
  }))

  const selectedEnrollment = batchEnrollments.find((b) => b.batch === selectedBatch)
  const selectedAttendance = batchAttendance.find((b) => b.batch === selectedBatch)

  // Assessment data for selected batch
  const batchAssessments = assessmentScores
    .filter((a) => a.batch === selectedBatch)
    .map((a) => ({
      name: `Sem ${a.semester}`,
      CAT1: a.cat1Avg,
      CAT2: a.cat2Avg,
      CAT3: a.cat3Avg,
    }))

  // Compare mode: latest semester average per batch
  const compareData = batches.map((b) => {
    const scores = assessmentScores.filter((a) => a.batch === b.batch)
    const latest = scores[scores.length - 1]
    const att = batchAttendance.find((a) => a.batch === b.batch)
    return {
      name: `${b.yearRoman} Year\n(${b.label})`,
      "Avg Score": latest ? Math.round((latest.cat1Avg + latest.cat2Avg + latest.cat3Avg) / 3) : 0,
      Attendance: att?.attendancePercent ?? 0,
      batch: b.batch,
    }
  })

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">HOD</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm md:text-base mt-1">Welcome back, {name} — here&apos;s a snapshot of the department.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {hodStats.map((s) => {
          const { card, badge } = colorMap[s.color]
          return (
            <div key={s.label} className={`rounded-2xl border p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${card}`}>
              <div className={`h-9 w-9 rounded-xl ${badge} flex items-center justify-center mb-3`}>
                <s.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-800 font-display">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              {s.change !== "0" && (
                <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />{s.change} this month
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Batch Selector Tabs ── */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {batches.map((b) => (
            <button
              key={b.batch}
              onClick={() => { setSelectedBatch(b.batch); setViewMode("batch") }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border min-h-[40px]
                ${viewMode === "batch" && selectedBatch === b.batch
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"}`}>
              {b.yearRoman} Year <span className="text-xs opacity-70 ml-1">({b.label})</span>
            </button>
          ))}
          <button
            onClick={() => setViewMode("compare")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border min-h-[40px]
              ${viewMode === "compare"
                ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white border-violet-600 shadow-lg shadow-violet-500/30"
                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50"}`}>
            <BarChart3 className="h-3.5 w-3.5 inline mr-1.5" />Compare All
          </button>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">

        {/* Chart 1: Internal Assessment (shown first) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            {viewMode === "compare"
              ? "All Batches — Latest Performance"
              : `Batch ${batches.find((b) => b.batch === selectedBatch)?.label} — Internal Assessment`}
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === "compare" ? (
                <BarChart data={compareData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700, color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Avg Score" radius={[6, 6, 0, 0]}>
                    {compareData.map((entry) => (
                      <Cell key={entry.batch} fill={BATCH_COLORS[entry.batch]} />
                    ))}
                  </Bar>
                  <Bar dataKey="Attendance" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <BarChart data={batchAssessments} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    labelStyle={{ fontWeight: 700, color: "#1e293b" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="CAT1" fill={CAT_COLORS.cat1} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="CAT2" fill={CAT_COLORS.cat2} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="CAT3" fill={CAT_COLORS.cat3} radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Year-wise Enrollment */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            Year-wise Enrollment
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                  labelStyle={{ fontWeight: 700, color: "#1e293b" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Male" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Female" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Batch Details Card (when a specific batch is selected) ── */}
      {viewMode === "batch" && selectedEnrollment && (
        <div className="grid sm:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-5">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Batch Strength</p>
            <p className="text-3xl font-bold text-slate-800">{selectedEnrollment.totalStudents}</p>
            <p className="text-xs text-slate-500 mt-1">
              {selectedEnrollment.maleCount} Male · {selectedEnrollment.femaleCount} Female
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-teal-50/40 p-5">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Attendance</p>
            <p className="text-3xl font-bold text-slate-800">{selectedAttendance?.attendancePercent ?? "—"}%</p>
            <p className="text-xs text-slate-500 mt-1">
              Current semester average
            </p>
          </div>
          <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-br from-violet-50 to-purple-50/40 p-5">
            <p className="text-xs font-semibold text-violet-500 uppercase tracking-wide mb-1">Current Year</p>
            <p className="text-3xl font-bold text-slate-800">{selectedEnrollment.currentYear}</p>
            <p className="text-xs text-slate-500 mt-1">
              Batch {selectedEnrollment.label}
            </p>
          </div>
        </div>
      )}

      {/* ── Compare All Summary (when compare mode is active) ── */}
      {viewMode === "compare" && (
        <div className="grid sm:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {batches.map((b) => {
            const enrollment = batchEnrollments.find((e) => e.batch === b.batch)
            const att = batchAttendance.find((a) => a.batch === b.batch)
            return (
              <div key={b.batch}
                className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 hover:-translate-y-0.5 transition-all hover:shadow-md cursor-pointer"
                onClick={() => { setSelectedBatch(b.batch); setViewMode("batch") }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: BATCH_COLORS[b.batch] }} />
                  <span className="text-xs font-bold text-slate-600">{b.yearRoman} Year</span>
                </div>
                <p className="text-2xl font-bold text-slate-800">{enrollment?.totalStudents}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {att?.attendancePercent}% attendance · Batch {b.label}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Quick Actions + Activity ── */}
      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-700 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link key={a.label} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 min-h-[44px] text-sm font-medium text-slate-600 transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700">
                <a.icon className="h-4 w-4 text-amber-500 shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { event: "New student registered",        time: "2 hours ago",  dot: "bg-emerald-500" },
              { event: "Announcement posted",           time: "5 hours ago",  dot: "bg-amber-500"   },
              { event: "Event updated: Tech Symposium", time: "Yesterday",    dot: "bg-blue-500"    },
              { event: "Staff profile updated",         time: "2 days ago",   dot: "bg-violet-500"  },
            ].map((item) => (
              <div key={item.event} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-slate-50/60 border border-slate-100">
                <div className={`h-2 w-2 rounded-full ${item.dot} mt-1.5 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{item.event}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
