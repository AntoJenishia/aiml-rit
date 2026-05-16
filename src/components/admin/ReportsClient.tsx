"use client"
import { BarChart3, TrendingUp, Users, CalendarDays } from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"

const monthlyData = [
  { month: "Jan", students: 160, staff: 30 },
  { month: "Feb", students: 165, staff: 31 },
  { month: "Mar", students: 170, staff: 31 },
  { month: "Apr", students: 175, staff: 32 },
  { month: "May", students: 178, staff: 32 },
  { month: "Jun", students: 180, staff: 32 },
]

const eventData = [
  { month: "Jan", events: 2 },
  { month: "Feb", events: 3 },
  { month: "Mar", events: 5 },
  { month: "Apr", events: 4 },
  { month: "May", events: 6 },
  { month: "Jun", events: 4 },
]

const summaryCards = [
  { label: "Total Enrolled",    value: "180", icon: Users,        color: "blue",    change: "+12%" },
  { label: "Events This Year",  value: "24",  icon: CalendarDays, color: "violet",  change: "+8%"  },
  { label: "Avg. Attendance",   value: "87%", icon: TrendingUp,   color: "emerald", change: "+3%"  },
  { label: "Reports Generated", value: "6",   icon: BarChart3,    color: "amber",   change: "—"    },
]

const colorMap: Record<string, string> = {
  blue:    "bg-blue-500    text-white",
  violet:  "bg-violet-500  text-white",
  emerald: "bg-emerald-500 text-white",
  amber:   "bg-amber-500   text-white",
}

export default function ReportsClient() {
  return (
    <div className="p-4 md:p-8 max-w-5xl overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-blue-500" /> Reports &amp; Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Department performance overview</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {summaryCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 ${colorMap[c.color]}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.label}</div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">{c.change} vs last year</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Enrollment Trend (2025)</h2>
          <div className="overflow-x-auto -mx-2 px-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Students" />
              <Line type="monotone" dataKey="staff"    stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Staff" />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Events per Month (2025)</h2>
          <div className="overflow-x-auto -mx-2 px-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
              <Bar dataKey="events" fill="#2563eb" radius={[6, 6, 0, 0]} name="Events" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
