"use client"
import { useUser } from "@/lib/hooks/useUser"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen, Bell, CalendarDays, Trophy, TrendingUp,
  ExternalLink, CheckCircle, CheckCircle2, Clock, Megaphone, X, Loader2,
  GraduationCap, Users, ArrowRight, Star, FileText, PlusCircle,
  Upload, AlertCircle, XCircle, ChevronRight, Download,
} from "lucide-react"
import { getAnnouncements, type Announcement } from "@/lib/db/announcements"
import { getAdminEvents, type AdminEvent } from "@/lib/db/events"
import { getRegistrationsByUser, registerForEvent, unregisterFromEvent } from "@/lib/db/registrations"

// ── Types ────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string
  referenceNumber: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  status: "pending_faculty" | "rejected_faculty" | "pending_hod" | "rejected_hod" | "approved" | "completed"
  pdfUrl?: string
  finalPdfUrl?: string
  facultyRejectReason?: string
  hodRejectReason?: string
  createdAt?: any
}

// ── Constants ────────────────────────────────────────────────────────────────
const OD_EVENT_TYPES = [
  "Workshop", "Symposium", "Internship", "Hackathon",
  "Conference", "Guest Lecture", "Other",
]

const TAG_COLORS: Record<string, string> = {
  "Workshop":      "bg-purple-100 text-purple-700",
  "Hackathon":     "bg-red-100 text-red-700",
  "Guest Lecture": "bg-amber-100 text-amber-700",
  "Seminar":       "bg-green-100 text-green-700",
  "FDP":           "bg-blue-100 text-blue-700",
  "Symposium":     "bg-indigo-100 text-indigo-700",
  "Conference":    "bg-rose-100 text-rose-700",
  "Internship":    "bg-teal-100 text-teal-700",
}

const OD_STATUS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_faculty:  { label: "Pending Faculty",  color: "text-[#6B7280]", bg: "bg-[#F5F6FA]",    icon: Clock },
  rejected_faculty: { label: "Rejected",          color: "text-[#EF4444]", bg: "bg-red-50",       icon: XCircle },
  pending_hod:      { label: "Pending HOD",       color: "text-[#3B5BFF]", bg: "bg-blue-50",      icon: Clock },
  rejected_hod:     { label: "Rejected by HOD",   color: "text-[#EF4444]", bg: "bg-red-50",       icon: XCircle },
  approved:         { label: "Approved ✓",         color: "text-[#16A34A]", bg: "bg-green-50",     icon: CheckCircle },
  completed:        { label: "Completed",          color: "text-[#16A34A]", bg: "bg-green-50",     icon: CheckCircle },
}

const quickLinks = [
  { label: "Department Events", href: "/events",       icon: CalendarDays, accent: "#3B5BFF" },
  { label: "View Faculty",      href: "/faculty",      icon: Users,        accent: "#7C3AED" },
  { label: "Syllabus",          href: "/syllabus",     icon: BookOpen,     accent: "#16A34A" },
  { label: "Achievements",      href: "/achievements", icon: Trophy,       accent: "#D97706" },
]

// ── OD Application Modal ─────────────────────────────────────────────────────
function ODModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    eventName: "", eventType: OD_EVENT_TYPES[0], organiser: "", venue: "",
    startDate: "", endDate: "", reason: "",
    isSpecialNeed: false, specialNeedJustification: "",
  })
  const [proofFile,    setProofFile]    = useState<File | null>(null)
  const [uploading,    setUploading]    = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    setError("")
    if (!form.eventName || !form.organiser || !form.venue || !form.startDate || !form.endDate || !form.reason) {
      setError("Please fill all required fields.")
      return
    }
    if (!proofFile) { setError("Please upload the upfront proof document."); return }

    setUploading(true)

    // 1. Upload proof file via the existing upload API
    const fd = new FormData()
    fd.append("file", proofFile)
    fd.append("folder", "odProof")
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd })
    const uploadData = await uploadRes.json()
    if (!uploadRes.ok) { setError(uploadData.error || "Upload failed."); setUploading(false); return }
    const upfrontProofUrl = uploadData.url

    setUploading(false)
    setSubmitting(true)

    // 2. Submit OD request
    const res = await fetch("/api/od", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, upfrontProofUrl }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || "Submission failed."); setSubmitting(false); return }

    setSubmitting(false)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Apply for On-Duty (OD)</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">Fill all details — a PDF will be generated immediately</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}

          {/* Event details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Event Name *</label>
              <input value={form.eventName} onChange={e => set("eventName", e.target.value)}
                placeholder="e.g. NIT Hackathon 2026"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Event Type *</label>
              <select value={form.eventType} onChange={e => set("eventType", e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20">
                {OD_EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Organiser *</label>
              <input value={form.organiser} onChange={e => set("organiser", e.target.value)}
                placeholder="e.g. IIT Madras"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Venue *</label>
              <input value={form.venue} onChange={e => set("venue", e.target.value)}
                placeholder="e.g. IIT Madras Campus, Chennai"
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
          </div>

          {/* Special need (internship) */}
          {form.eventType === "Internship" && (
            <div className="rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isSpecialNeed} onChange={e => set("isSpecialNeed", e.target.checked)}
                  className="h-4 w-4 rounded text-[#3B5BFF]" />
                <span className="text-sm font-semibold text-[#111827]">Special need (internship extending beyond 5 days)</span>
              </label>
              {form.isSpecialNeed && (
                <textarea value={form.specialNeedJustification} onChange={e => set("specialNeedJustification", e.target.value)}
                  placeholder="Provide justification for the extended duration..."
                  rows={2}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 resize-none" />
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Reason / Purpose *</label>
            <textarea value={form.reason} onChange={e => set("reason", e.target.value)}
              placeholder="Briefly explain why you need this OD..."
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 resize-none" />
          </div>

          {/* Proof upload */}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">Upfront Proof (PDF or Image) *</label>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden"
              onChange={e => setProofFile(e.target.files?.[0] || null)} />
            <button onClick={() => fileRef.current?.click()}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed py-4 text-sm font-semibold transition-all ${proofFile ? "border-[#16A34A] bg-green-50 text-[#16A34A]" : "border-[#E5E7EB] bg-[#F5F6FA] text-[#6B7280] hover:border-[#3B5BFF] hover:text-[#3B5BFF]"}`}>
              {proofFile ? <CheckCircle className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              {proofFile ? proofFile.name : "Click to upload registration confirmation / invitation"}
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-[#E5E7EB] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={uploading || submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB] flex items-center justify-center gap-2 disabled:opacity-60">
            {(uploading || submitting) ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            {uploading ? "Uploading…" : submitting ? "Generating PDF…" : "Submit & Generate OD"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main StudentDash ─────────────────────────────────────────────────────────
export default function StudentDash() {
  const { uid, name, email, image } = useUser()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [events,        setEvents]        = useState<AdminEvent[]>([])
  const [registered,    setRegistered]    = useState<Set<string>>(new Set())
  const [regLoading,    setRegLoading]    = useState<Set<string>>(new Set())
  const [loadingData,   setLoadingData]   = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)
  const [odRequests,    setOdRequests]    = useState<ODRequest[]>([])
  const [loadingOD,     setLoadingOD]     = useState(true)
  const [showODForm,    setShowODForm]    = useState(false)
  const [activeTab,     setActiveTab]     = useState<"courses" | "od">("courses")

  const mockClassIncharge = "Dr. J. Alice"
  const mockSemester      = "6"
  const mockCGPA          = "8.7"
  const mockCourses       = 4
  const mockAwards        = 2

  useEffect(() => {
    async function load() {
      try {
        const [ann, ev] = await Promise.all([getAnnouncements(), getAdminEvents()])
        setAnnouncements(ann.filter(a => a.target === "all" || a.target === "students"))
        setEvents(ev)
        if (uid) {
          const regs = await getRegistrationsByUser(uid)
          setRegistered(new Set(regs.map(r => r.eventId)))
        }
      } catch { /* silently fail */ }
      setLoadingData(false)
    }
    load()
  }, [uid])

  const loadODs = async () => {
    if (!uid) return
    setLoadingOD(true)
    try {
      const res = await fetch("/api/od")
      if (res.ok) setOdRequests(await res.json())
    } catch { /* silently fail */ }
    setLoadingOD(false)
  }

  useEffect(() => { loadODs() }, [uid])

  const toggleRegister = async (eventId: string) => {
    if (!uid || regLoading.has(eventId)) return
    setRegLoading(prev => new Set(prev).add(eventId))
    try {
      if (registered.has(eventId)) {
        await unregisterFromEvent(eventId, uid)
        setRegistered(prev => { const n = new Set(prev); n.delete(eventId); return n })
      } else {
        await registerForEvent(eventId, uid, name, email)
        setRegistered(prev => new Set(prev).add(eventId))
      }
    } catch { /* silently fail */ }
    setRegLoading(prev => { const n = new Set(prev); n.delete(eventId); return n })
  }

  const pendingODs   = odRequests.filter(o => o.status === "pending_faculty" || o.status === "pending_hod").length
  const approvedODs  = odRequests.filter(o => o.status === "approved" || o.status === "completed").length

  return (
    <div className="min-h-full space-y-6">

      {/* OD Modal */}
      {showODForm && <ODModal onClose={() => setShowODForm(false)} onSuccess={loadODs} />}

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #3B5BFF 60%, #7C3AED 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {image ? (
              <Image src={image} alt={name || ""} width={72} height={72}
                className="rounded-full ring-4 ring-white/30 w-14 h-14 md:w-16 md:h-16 object-cover shrink-0" />
            ) : (
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-black ring-4 ring-white/30 shrink-0">
                {name?.[0] ?? "S"}
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Student Portal</p>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                Welcome back, {name?.split(" ")[0] || "Student"} 👋
              </h1>
              <p className="text-white/70 text-sm mt-1">{email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Class Incharge</p>
              <p className="text-white font-bold text-sm mt-1">{mockClassIncharge}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[90px]">
              <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Semester</p>
              <p className="text-white font-black text-xl mt-0.5">{mockSemester}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CGPA",       value: mockCGPA,       icon: TrendingUp,   border: "border-l-[#3B5BFF]", iconBg: "bg-[#3B5BFF]/10", iconColor: "text-[#3B5BFF]", sub: "Current GPA" },
          { label: "Courses",    value: mockCourses,    icon: BookOpen,     border: "border-l-[#7C3AED]", iconBg: "bg-[#7C3AED]/10", iconColor: "text-[#7C3AED]", sub: "This semester" },
          { label: "Awards",     value: mockAwards,     icon: Trophy,       border: "border-l-[#D97706]", iconBg: "bg-[#D97706]/10", iconColor: "text-[#D97706]", sub: "Achievements" },
          { label: "OD Pending", value: pendingODs,     icon: FileText,     border: "border-l-[#EF4444]", iconBg: "bg-[#EF4444]/10", iconColor: "text-[#EF4444]", sub: `${approvedODs} approved` },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB] border-l-4 ${s.border} hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-black text-[#111827]">{s.value}</p>
            <p className="text-xs font-bold text-[#6B7280] mt-1">{s.label}</p>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tab nav — Courses | OD */}
          <div className="flex gap-1 bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1">
            {(["courses", "od"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280] hover:text-[#111827]"
                }`}>
                {tab === "courses" ? <BookOpen className={`h-4 w-4 ${activeTab === tab ? "text-[#3B5BFF]" : "text-[#94A3B8]"}`} /> : <FileText className={`h-4 w-4 ${activeTab === tab ? "text-[#3B5BFF]" : "text-[#94A3B8]"}`} />}
                {tab === "courses" ? "My Courses" : "My OD Requests"}
                {tab === "od" && pendingODs > 0 && (
                  <span className="h-4 w-4 rounded-full bg-[#EF4444] text-white text-[9px] font-black flex items-center justify-center">
                    {pendingODs}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3B5BFF]" /> My Courses
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3B5BFF]/10 text-[#3B5BFF]">
                  Semester {mockSemester}
                </span>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {[
                  { name: "Machine Learning Fundamentals",   code: "AI6001", credits: 4, accent: "#3B5BFF" },
                  { name: "Deep Learning & Neural Networks", code: "AI6002", credits: 4, accent: "#7C3AED" },
                  { name: "Computer Vision",                 code: "AI6003", credits: 3, accent: "#16A34A" },
                  { name: "NLP & Transformers",              code: "AI6004", credits: 4, accent: "#D97706" },
                ].map((c, i) => (
                  <div key={c.code} className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F6FA] transition-colors">
                    <div className="h-9 w-9 rounded-xl text-white flex items-center justify-center text-sm font-black shrink-0"
                      style={{ backgroundColor: c.accent }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">{c.name}</p>
                      <p className="text-xs text-[#6B7280]">{c.code} · {c.credits} Credits</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#16A34A] bg-green-50 px-2.5 py-1 rounded-full">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OD Tab */}
          {activeTab === "od" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3B5BFF]" /> My OD Requests
                </h2>
                <button onClick={() => setShowODForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg text-xs font-bold hover:bg-[#2563EB] transition-all">
                  <PlusCircle className="h-3.5 w-3.5" /> Apply for OD
                </button>
              </div>

              {loadingOD ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" />
                </div>
              ) : odRequests.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center px-6">
                  <div className="h-14 w-14 rounded-full bg-[#3B5BFF]/10 flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-7 w-7 text-[#3B5BFF]" />
                  </div>
                  <p className="text-sm font-bold text-[#111827]">No OD requests yet</p>
                  <p className="text-xs text-[#6B7280] mt-1 mb-4">Apply for OD when you need to attend an external event</p>
                  <button onClick={() => setShowODForm(true)}
                    className="px-5 py-2.5 bg-[#3B5BFF] text-white rounded-xl text-xs font-bold hover:bg-[#2563EB]">
                    Apply for OD
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {odRequests.map(od => {
                    const sc = OD_STATUS[od.status] || OD_STATUS.pending_faculty
                    const StatusIcon = sc.icon
                    const isRejected = od.status === "rejected_faculty" || od.status === "rejected_hod"
                    const isApproved = od.status === "approved" || od.status === "completed"
                    return (
                      <div key={od.id} className={`px-6 py-4 hover:bg-[#F5F6FA] transition-colors ${isRejected ? "border-l-4 border-l-[#EF4444]" : isApproved ? "border-l-4 border-l-[#16A34A]" : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-sm font-bold text-[#111827]">{od.eventName}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[od.eventType] || "bg-[#F5F6FA] text-[#6B7280]"}`}>
                                {od.eventType}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280]">{od.organiser} · {od.startDate}{od.startDate !== od.endDate ? ` – ${od.endDate}` : ""}</p>
                            <p className="text-[10px] font-mono text-[#94A3B8] mt-1">Ref: {od.referenceNumber}</p>
                            {isRejected && (
                              <p className="text-xs text-[#EF4444] mt-1">
                                Reason: {od.facultyRejectReason || od.hodRejectReason || "—"}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.color}`}>
                              <StatusIcon className="h-3 w-3" /> {sc.label}
                            </div>
                            <div className="flex gap-2">
                              {(od.pdfUrl || od.finalPdfUrl) && (
                                <a href={od.finalPdfUrl || od.pdfUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline">
                                  <Download className="h-3 w-3" /> PDF
                                </a>
                              )}
                              <a href={`/verify/${od.referenceNumber}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:underline">
                                <ExternalLink className="h-3 w-3" /> Verify
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Events */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#16A34A]" /> Upcoming Events
              </h2>
              <Link href="/events" className="text-xs font-bold text-[#3B5BFF] flex items-center gap-1 hover:underline">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {loadingData ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#3B5BFF]" /></div>
            ) : events.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-[#94A3B8]">No upcoming events</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {events.slice(0, 3).map(ev => {
                  const isReg = registered.has(ev.id!)
                  const isLoading = regLoading.has(ev.id!)
                  return (
                    <div key={ev.id} className="px-6 py-4 flex items-center gap-4 hover:bg-[#F5F6FA] transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-bold text-[#111827] truncate">{ev.title}</p>
                        </div>
                        <p className="text-xs text-[#6B7280]">{ev.date}</p>
                      </div>
                      <button onClick={() => toggleRegister(ev.id!)} disabled={isLoading}
                        className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReg ? "bg-[#16A34A]/10 text-[#16A34A] hover:bg-red-50 hover:text-[#EF4444]" : "bg-[#3B5BFF] text-white hover:bg-[#2563EB]"}`}>
                        {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isReg ? "Registered ✓" : "Register"}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT col */}
        <div className="space-y-6">

          {/* Announcements */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-[#111827]">Announcements</h2>
            </div>
            {announcements.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-[#94A3B8]">No announcements</div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {announcements.slice(0, 4).map(a => (
                  <div key={a.id} className="px-5 py-3.5 hover:bg-[#F5F6FA] transition-colors">
                    <p className="text-sm font-bold text-[#111827]">{a.title}</p>
                    {a.body && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{a.body}</p>}
                    {a.postedBy && <p className="text-[10px] font-bold text-[#94A3B8] mt-1">— {a.postedBy}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827]">Quick Links</h2>
            </div>
            <div className="p-3 space-y-1">
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-[#F5F6FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${link.accent}18` }}>
                      <link.icon className="h-4 w-4" style={{ color: link.accent }} />
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">{link.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
