"use client"
import { useUser } from "@/lib/hooks/useUser"
import Image from "next/image"
import Link from "next/link"
import { Users, BookOpen, Clock, ClipboardList, Bell, Calendar } from "lucide-react"

const stats = [
  { label: "Courses Taught", value: "3", icon: BookOpen, color: "blue" },
  { label: "Total Students", value: "120", icon: Users, color: "emerald" },
  { label: "Pending Reviews", value: "8", icon: ClipboardList, color: "amber" },
  { label: "Office Hours/wk", value: "6h", icon: Clock, color: "violet" },
]

const colorMap: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 border-blue-200",
  emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  violet: "bg-violet-500/10 text-violet-600 border-violet-200",
  amber: "bg-amber-500/10 text-amber-600 border-amber-200",
}

export default function StaffDash() {
  const { name, image } = useUser()

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        {image ? (
          <Image src={image} alt={name} width={56} height={56} className="rounded-full ring-4 ring-blue-100" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
            {name?.[0] ?? "F"}
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Welcome, Dr. {name?.split(" ").pop()} 👋</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI & Machine Learning — Staff Dashboard</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        {stats.map((s) => (
          <div key={s.label}
            className={`rounded-2xl border p-4 md:p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${colorMap[s.color]} bg-white/80`}>
            <s.icon className="h-5 w-5 mb-3 opacity-70" />
            <div className="text-2xl md:text-3xl font-bold font-display">{s.value}</div>
            <div className="text-xs font-medium mt-1 opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Courses taught */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 md:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" /> Courses Taught
          </h2>
          <div className="space-y-3">
            {[
              { name: "Machine Learning", students: 42, sem: "Sem 6" },
              { name: "Data Structures & Algorithms", students: 38, sem: "Sem 3" },
              { name: "Deep Learning", students: 40, sem: "Sem 7" },
            ].map((c) => (
              <div key={c.name} className="flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.sem} · {c.students} students</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full shrink-0">Active</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Announcements */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" /> Notice
            </h2>
            <div className="space-y-2">
              {["Exam schedule published", "Lab session rescheduled — Fri", "Research submission deadline"].map((n) => (
                <div key={n} className="flex items-start gap-2 text-xs text-slate-600">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  {n}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 md:p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-700 mb-3">Quick Access</h2>
            <div className="space-y-2">
              {[
                { label: "View Events", href: "/events", icon: Calendar },
                { label: "Faculty Page", href: "/faculty", icon: Users },
              ].map((l) => (
                <Link key={l.label} href={l.href}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 rounded-lg px-3 py-2 min-h-[44px] hover:bg-blue-50 hover:text-blue-700 transition-colors">
                  <l.icon className="h-4 w-4 text-blue-500" /> {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
