"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen, Bell, CalendarDays, Trophy, TrendingUp,
  ExternalLink, CheckCircle2, Clock, Megaphone, X, Sparkles,
} from "lucide-react"
import { getAnnouncements, type Announcement } from "@/lib/db/announcements"
import { getAdminEvents, type AdminEvent } from "@/lib/db/events"

/* ─── stats ───────────────────────────────────────────────── */
const stats = [
  { label: "Current Semester", value: "6",   icon: BookOpen,   gradient: "from-blue-500 to-indigo-600"    },
  { label: "CGPA",             value: "3.8",  icon: TrendingUp, gradient: "from-emerald-500 to-teal-600"  },
  { label: "Enrolled Courses", value: "4",    icon: BookOpen,   gradient: "from-violet-500 to-purple-600" },
  { label: "Achievements",     value: "5",    icon: Trophy,     gradient: "from-amber-500 to-orange-600"  },
]

const TAG_COLORS: Record<string, string> = {
  "Workshop":      "bg-violet-100 text-violet-700 border-violet-200",
  "Hackathon":     "bg-rose-100   text-rose-700   border-rose-200",
  "Guest Lecture": "bg-amber-100  text-amber-700  border-amber-200",
  "Seminar":       "bg-teal-100   text-teal-700   border-teal-200",
  "FDP":           "bg-sky-100    text-sky-700    border-sky-200",
}

const courses = [
  { name: "Machine Learning Fundamentals",  sem: "Sem 6", color: "from-blue-500 to-cyan-500"    },
  { name: "Deep Learning & Neural Networks", sem: "Sem 6", color: "from-violet-500 to-purple-500"},
  { name: "Computer Vision",                 sem: "Sem 6", color: "from-emerald-500 to-teal-500" },
  { name: "NLP & Transformers",              sem: "Sem 6", color: "from-amber-500 to-orange-500" },
]

/* ─── Reveal-on-scroll hook ──────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function RevealCard({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} className={`transition-all duration-700 ${className}
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function StudentDash() {
  const { name, email, image, role } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events,        setEvents]        = useState<AdminEvent[]>([])
  const [registered,    setRegistered]    = useState<Set<string>>(new Set())
  const [loadingData,   setLoadingData]   = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [ann, ev] = await Promise.all([getAnnouncements(), getAdminEvents()])
        setAnnouncements(ann.filter((a) => a.target === "all" || a.target === "students"))
        setEvents(ev)
      } catch { /* Firestore not connected yet */ }
      setLoadingData(false)
    }
    load()
  }, [])

  const toggleRegister = (id: string) =>
    setRegistered((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(160deg,#f8faff 0%,#eef2ff 40%,#f5f8ff 100%)" }}>

      {/* ── Hero header banner ─────────────────────────────── */}
      <div className="relative overflow-hidden mb-8"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e3a8a 50%,#1d4ed8 100%)" }}>
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#60a5fa,transparent 70%)" }} />

        <div className="relative z-10 px-6 py-8 lg:px-10">
          <div className="flex items-center gap-4 mb-6">
            {image ? (
              <Image src={image} alt={name} width={64} height={64}
                className="rounded-2xl ring-4 ring-white/20 shadow-xl" />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 ring-4 ring-white/20 shadow-xl flex items-center justify-center text-white text-2xl font-black">
                {name?.[0] ?? "S"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-amber-400/90 text-xs font-bold uppercase tracking-widest">
                  {role} Dashboard
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight">
                Welcome back, {name?.split(" ")[0]} 👋
              </h1>
              <p className="text-blue-200/70 text-sm mt-0.5">{email}</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={s.label}
                className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 p-4 hover:bg-white/15 transition-all hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-blue-200/70 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="px-6 lg:px-10 pb-10 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── LEFT col ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Courses */}
            <RevealCard delay={0}>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                    <BookOpen className="h-3.5 w-3.5 text-white" />
                  </div>
                  My Courses
                </h2>
                <div className="space-y-2.5">
                  {courses.map((c, i) => (
                    <div key={c.name}
                      className="group flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/60 hover:border-blue-200 hover:bg-blue-50/40 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.sem} · Active</p>
                      </div>
                      <span className="shrink-0 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-100" />
                    </div>
                  ))}
                </div>
              </div>
            </RevealCard>

            {/* Events */}
            <RevealCard delay={100}>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <CalendarDays className="h-3.5 w-3.5 text-white" />
                    </div>
                    Upcoming Events
                  </h2>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {events.length} events
                  </span>
                </div>

                {loadingData ? (
                  <div className="flex justify-center py-8">
                    <div className="h-7 w-7 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
                    <CalendarDays className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">No events posted yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((ev) => {
                      const isReg = registered.has(ev.id!)
                      return (
                        <div key={ev.id}
                          className={`rounded-xl border p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                            ${isReg ? "border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50"
                                    : "border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/40"}`}
                          onClick={() => setSelectedEvent(ev)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-700 truncate">{ev.title}</p>
                              {ev.description && (
                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{ev.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TAG_COLORS[ev.tag] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                                  {ev.tag}
                                </span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                  <Clock className="h-3 w-3" /> {ev.date}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleRegister(ev.id!) }}
                              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all active:scale-95
                                ${isReg ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white"}`}>
                              {isReg ? <><CheckCircle2 className="h-3.5 w-3.5" /> Registered</> : "Register"}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </RevealCard>
          </div>

          {/* ── RIGHT col ─────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Announcements */}
            <RevealCard delay={150}>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-500 flex items-center justify-center">
                    <Megaphone className="h-3.5 w-3.5 text-white" />
                  </div>
                  Announcements
                </h2>

                {loadingData ? (
                  <div className="flex justify-center py-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-200 p-5 text-center">
                    <Bell className="h-6 w-6 text-slate-300 mx-auto mb-1.5" />
                    <p className="text-slate-400 text-xs">No announcements yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {announcements.map((a) => (
                      <div key={a.id}
                        className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50/80 to-orange-50/40 px-4 py-3 hover:shadow-sm transition-all">
                        <p className="text-sm font-semibold text-slate-700">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{a.body}</p>
                        <p className="text-[10px] text-amber-600 font-medium mt-1.5">by {a.postedBy}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </RevealCard>

            {/* Quick links */}
            <RevealCard delay={200}>
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <h2 className="text-base font-bold text-slate-700 mb-3">Quick Links</h2>
                <div className="space-y-2">
                  {[
                    { label: "Department Events", href: "/events",       icon: CalendarDays, color: "bg-indigo-100 text-indigo-600" },
                    { label: "View Faculty",       href: "/faculty",      icon: ExternalLink, color: "bg-blue-100   text-blue-600"   },
                    { label: "Syllabus",           href: "/syllabus",     icon: BookOpen,     color: "bg-violet-100 text-violet-600" },
                    { label: "Achievements",       href: "/achievements", icon: Trophy,       color: "bg-amber-100  text-amber-600"  },
                  ].map((l) => (
                    <Link key={l.label} href={l.href}
                      className="flex items-center gap-3 text-sm font-medium text-slate-600 rounded-xl px-3 py-2.5 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/60 hover:text-blue-700 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150">
                      <span className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${l.color}`}>
                        <l.icon className="h-3.5 w-3.5" />
                      </span>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            </RevealCard>
          </div>
        </div>
      </div>

      {/* ── Event modal ────────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setSelectedEvent(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}>
            {/* modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${TAG_COLORS[selectedEvent.tag] ?? ""}`}>
                  {selectedEvent.tag}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedEvent.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5" /> {selectedEvent.date}
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600 mt-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {selectedEvent.description && (
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{selectedEvent.description}</p>
              )}
              <button
                onClick={() => { toggleRegister(selectedEvent.id!); setSelectedEvent(null) }}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-all active:scale-95
                  ${registered.has(selectedEvent.id!)
                    ? "bg-slate-100 text-slate-500 border border-slate-200"
                    : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700"}`}>
                {registered.has(selectedEvent.id!) ? "✓ Already Registered — Click to Cancel" : "Register for this Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
