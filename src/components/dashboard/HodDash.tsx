"use client"
import { useUser } from "@/lib/hooks/useUser"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import {
  Users, UserPlus, FileSignature, Award, PieChart,
  CheckCircle, XCircle, ChevronRight, PlusCircle, CalendarPlus,
  X, Loader2, Eye, EyeOff, AlertCircle, Trophy, BookOpen,
  Megaphone, BarChart3, Shield, TrendingUp, ArrowRight, GraduationCap,
  Download,
} from "lucide-react"

interface FacultyUser {
  uid: string
  name: string
  username: string
  isClassIncharge?: boolean
  classId?: string | null
}

interface ODRequest {
  id: string
  referenceNumber: string
  studentName?: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  status: string
  pdfUrl?: string
  finalPdfUrl?: string
}

interface Highlight {
  id: string
  faculty: string
  title: string
}

const CLASSES = [
  { id: "ii-aiml-a-2024",  label: "II Year – AIML – A (2024–2028)" },
  { id: "ii-aiml-b-2024",  label: "II Year – AIML – B (2024–2028)" },
  { id: "iii-aiml-a-2023", label: "III Year – AIML – A (2023–2027)" },
  { id: "iv-aiml-a-2022",  label: "IV Year – AIML – A (2022–2026)" },
]

// ── Create Faculty Modal ───────────────────────────────────────────────────────
function CreateFacultyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ username: "", password: "", displayName: "" })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.username || !form.password || !form.displayName) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/hod/create-faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to create faculty."); return }
      onSuccess()
      onClose()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Create Faculty Account</h2>
            <p className="text-xs text-[#6B7280] mt-1">Username + password only — no email required</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          {[
            { label: "Full Name", key: "displayName", placeholder: "e.g. Dr. Jane Alice", type: "text" },
            { label: "Username", key: "username", placeholder: "e.g. alice_f (letters, numbers, underscores)", type: "text" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#6B7280]">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-bold hover:bg-[#6D28D9] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Assign Class Modal ────────────────────────────────────────────────────────
function AssignClassModal({ faculty, onClose, onSuccess }: { faculty: FacultyUser; onClose: () => void; onSuccess: () => void }) {
  const [selectedClass, setSelectedClass] = useState(faculty.classId ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/hod/create-faculty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assignClass", facultyUid: faculty.uid, classId: selectedClass || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to update assignment."); return }
      onSuccess()
      onClose()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Assign Class Incharge</h2>
            <p className="text-xs text-[#6B7280] mt-1">{faculty.name}</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-[#111827] mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20">
              <option value="">— Remove assignment —</option>
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPasswordModal({ faculty, onClose }: { faculty: FacultyUser; onClose: () => void }) {
  const [newPassword, setNewPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!newPassword || newPassword.length < 8) { setError("Password must be at least 8 characters."); return }
    setLoading(true)
    try {
      const res = await fetch("/api/hod/create-faculty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", facultyUid: faculty.uid, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Failed to reset password."); return }
      setSuccess(true)
    } catch {
      setError("Network error.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-lg font-black text-[#111827]">Reset Password — {faculty.name}</h2>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="h-14 w-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-[#16A34A]" />
              </div>
              <p className="text-sm font-bold text-[#111827]">Password reset successfully.</p>
              <button onClick={onClose} className="px-5 py-2 rounded-xl bg-[#F5F6FA] text-sm font-bold text-[#6B7280] hover:bg-[#E5E7EB]">Close</button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </div>
              )}
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 pr-10"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#6B7280]">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Reset Password
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── HOD Achievement (dept-wide) ───────────────────────────────────────────────
const mockAchievements = [
  { id: "a1", student: "Aakash K",    class: "II-A", title: "1st Place – NIT Hackathon",      type: "Hackathon",   year: "2026" },
  { id: "a2", student: "Priya M",     class: "II-A", title: "Best Paper – IEEE ICAIET",        type: "Research",    year: "2026" },
  { id: "a3", student: "Divya S",     class: "III-A", title: "Intern @ Google Summer Coding",  type: "Internship",  year: "2026" },
]

// ── Main HOD Dashboard ────────────────────────────────────────────────────────
export default function HodDash() {
  const { name, image } = useUser()

  const [showCreateFaculty, setShowCreateFaculty] = useState(false)
  const [assignTarget, setAssignTarget] = useState<FacultyUser | null>(null)
  const [resetTarget, setResetTarget] = useState<FacultyUser | null>(null)
  const [activeTab, setActiveTab] = useState<"faculty" | "od" | "achievements">("faculty")

  const [faculty, setFaculty] = useState<FacultyUser[]>([])
  const [loadingFaculty, setLoadingFaculty] = useState(true)

  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  const [loadingOD, setLoadingOD] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadODs = useCallback(async () => {
    setLoadingOD(true)
    try {
      const res = await fetch("/api/od")
      if (res.ok) setOdRequests(await res.json())
    } catch { /* silently fail */ }
    setLoadingOD(false)
  }, [])

  useEffect(() => { loadODs() }, [loadODs])

  const handleHODApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    const data = await res.json()
    if (res.ok) { showToast(`✓ Final OD approved for ${od.studentName}`); await loadODs() }
    else showToast(`Error: ${data.error}`)
    setActionLoading(null)
  }

  const handleHODReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    const data = await res.json()
    if (res.ok) { showToast(`Rejected OD for ${od.studentName}`); await loadODs() }
    else showToast(`Error: ${data.error}`)
    setActionLoading(null)
  }
  const mockHighlights: Highlight[] = [
    { id: "h1", faculty: "Dr. J. Alice", title: "Published Paper in IEEE ICAIET 2026" },
  ]

  const loadFaculty = useCallback(async () => {
    setLoadingFaculty(true)
    try {
      const res = await fetch("/api/users")
      const all = await res.json()
      setFaculty(all.filter((u: FacultyUser & { role: string }) => u.role === "staff"))
    } catch { /* silently fail */ }
    setLoadingFaculty(false)
  }, [])

  useEffect(() => { loadFaculty() }, [loadFaculty])

  const classLabel = (classId?: string | null) => {
    if (!classId) return null
    return CLASSES.find((c) => c.id === classId)?.label ?? classId
  }

  const tabs = [
    { key: "faculty",       label: "Faculty Mgmt",   icon: Users },
    { key: "od",            label: "OD Approvals",   icon: FileSignature },
    { key: "achievements",  label: "Achievements",   icon: Trophy },
  ] as const

  return (
    <div className="min-h-full space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
      {/* Reject OD Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setRejectTarget(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#111827]">Reject OD — Final Stage</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{rejectTarget.studentName} · {rejectTarget.eventName}</p>
              </div>
              <button onClick={() => setRejectTarget(null)} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for final rejection (required)…" rows={3}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#EF4444] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 resize-none" />
              <div className="flex gap-3">
                <button onClick={() => setRejectTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button
                  onClick={async () => { await handleHODReject(rejectTarget, rejectReason); setRejectTarget(null); setRejectReason("") }}
                  disabled={!rejectReason.trim() || actionLoading === rejectTarget.id}
                  className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-50">
                  {actionLoading === rejectTarget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Faculty/Class Modals */}
      {showCreateFaculty && <CreateFacultyModal onClose={() => setShowCreateFaculty(false)} onSuccess={loadFaculty} />}
      {assignTarget && <AssignClassModal faculty={assignTarget} onClose={() => setAssignTarget(null)} onSuccess={loadFaculty} />}
      {resetTarget && <ResetPasswordModal faculty={resetTarget} onClose={() => setResetTarget(null)} />}

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #111827 100%)" }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#3B5BFF]/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7C3AED]/20 blur-2xl" />
        </div>
        <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {image ? (
              <Image src={image} alt={name || ""} width={72} height={72}
                className="rounded-2xl ring-4 ring-white/20 w-14 h-14 md:w-16 md:h-16 object-cover shrink-0" />
            ) : (
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-white/10 text-white flex items-center justify-center text-2xl font-black ring-4 ring-white/20 shrink-0">
                {name?.[0] ?? "H"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">HOD Portal</span>
                <span className="px-2 py-0.5 rounded-full bg-[#3B5BFF] text-white text-[10px] font-bold">Admin</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                {name || "Head of Department"}
              </h1>
              <p className="text-white/60 text-sm mt-0.5">AI & Machine Learning Department</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            {[
              { label: "Faculty",  value: faculty.length,                                    color: "text-blue-300" },
              { label: "Classes",  value: CLASSES.length,                                    color: "text-purple-300" },
              { label: "Incharges",value: faculty.filter(f => f.isClassIncharge).length,     color: "text-green-300" },
              { label: "Pending OD",value: odRequests.length,                                color: "text-amber-300" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-center">
                <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending OD Approvals", value: odRequests.length, icon: FileSignature, border: "border-l-[#3B5BFF]", iconBg: "bg-[#3B5BFF]/10", iconColor: "text-[#3B5BFF]", sub: "Awaiting final review" },
          { label: "Faculty Accounts",     value: faculty.length,         icon: Users,          border: "border-l-[#7C3AED]", iconBg: "bg-[#7C3AED]/10", iconColor: "text-[#7C3AED]", sub: "Total registered" },
          { label: "Pending Highlights",   value: mockHighlights.length,  icon: PlusCircle,     border: "border-l-[#D97706]", iconBg: "bg-[#D97706]/10", iconColor: "text-[#D97706]", sub: "Awaiting approval" },
          { label: "Total Students",       value: "450",                   icon: BookOpen,       border: "border-l-[#16A34A]", iconBg: "bg-[#16A34A]/10", iconColor: "text-[#16A34A]", sub: "Across all classes" },
        ].map((s) => (
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

        {/* LEFT — tabbed main panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab nav */}
          <div className="flex gap-1 bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1">
            {tabs.map((tab) => (
              <button key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-white shadow-sm text-[#111827]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}>
                <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? "text-[#3B5BFF]" : "text-[#94A3B8]"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Faculty Tab */}
          {activeTab === "faculty" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#7C3AED]" />
                  Faculty Accounts
                </h2>
                <button
                  onClick={() => setShowCreateFaculty(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-xs font-bold hover:bg-[#6D28D9] transition-all">
                  <UserPlus className="h-3.5 w-3.5" /> Add Faculty
                </button>
              </div>
              {loadingFaculty ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" />
                </div>
              ) : faculty.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center px-6">
                  <div className="h-14 w-14 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-7 w-7 text-[#7C3AED]" />
                  </div>
                  <p className="text-sm font-bold text-[#111827]">No faculty accounts yet</p>
                  <p className="text-xs text-[#6B7280] mt-1 mb-4">Create the first faculty account to get started</p>
                  <button onClick={() => setShowCreateFaculty(true)}
                    className="px-5 py-2.5 bg-[#7C3AED] text-white rounded-xl text-xs font-bold hover:bg-[#6D28D9]">
                    Create First Faculty Account
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] bg-[#F5F6FA]">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Username</th>
                        <th className="px-6 py-3">Class Incharge</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {faculty.map((f) => (
                        <tr key={f.uid} className="hover:bg-[#F5F6FA] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-sm font-black shrink-0">
                                {f.name?.[0] ?? "F"}
                              </div>
                              <span className="font-semibold text-[#111827]">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-[#6B7280]">{f.username || "—"}</td>
                          <td className="px-6 py-4">
                            {f.isClassIncharge && f.classId ? (
                              <span className="text-xs font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full">
                                {classLabel(f.classId)}
                              </span>
                            ) : (
                              <span className="text-xs text-[#94A3B8]">Not assigned</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button onClick={() => setAssignTarget(f)}
                              className="text-xs font-bold text-[#3B5BFF] hover:underline">Assign Class</button>
                            <button onClick={() => setResetTarget(f)}
                              className="text-xs font-bold text-[#EF4444] hover:underline">Reset Pwd</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* OD Tab */}
          {activeTab === "od" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-[#3B5BFF]" />
                  Final OD Approvals
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3B5BFF]/10 text-[#3B5BFF]">
                  {loadingOD ? "…" : `${odRequests.length} Pending`}
                </span>
              </div>
              {loadingOD ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
              ) : odRequests.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center px-6">
                  <div className="h-14 w-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-7 w-7 text-[#16A34A]" />
                  </div>
                  <p className="text-sm font-bold text-[#111827]">No ODs awaiting final approval</p>
                  <p className="text-xs text-[#6B7280] mt-1">All faculty-approved requests will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {odRequests.map(od => {
                    const isActioning = actionLoading === od.id
                    return (
                      <div key={od.id} className="px-6 py-5 hover:bg-[#F5F6FA] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <p className="text-sm font-bold text-[#111827]">{od.studentName || "Student"}</p>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A]">Faculty Approved</span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] mb-0.5">{od.eventName}</p>
                            <p className="text-xs text-[#6B7280]">{od.organiser} · {od.startDate}{od.startDate !== od.endDate ? ` – ${od.endDate}` : ""}</p>
                            <p className="text-[10px] font-mono text-[#94A3B8] mt-1">Ref: {od.referenceNumber}</p>
                            {od.pdfUrl && (
                              <a href={od.pdfUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline mt-1">
                                <Download className="h-3 w-3" /> View Draft PDF
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setRejectTarget(od); setRejectReason("") }} disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] rounded-lg text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all disabled:opacity-50">
                              {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />} Reject
                            </button>
                            <button onClick={() => handleHODApprove(od)} disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803d] transition-all disabled:opacity-50">
                              {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />} Final Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[#D97706]" />
                  Department Achievements
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">All Classes</span>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {mockAchievements.map((a) => (
                  <div key={a.id} className="px-6 py-4 flex items-start gap-4 hover:bg-[#F5F6FA] transition-colors">
                    <div className="h-9 w-9 rounded-xl bg-[#D97706]/10 flex items-center justify-center shrink-0">
                      <Trophy className="h-4 w-4 text-[#D97706]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#111827]">{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#6B7280]">{a.student}</span>
                        <span className="text-[10px] text-[#94A3B8]">·</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F6FA] text-[#6B7280]">{a.class}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D97706]/10 text-[#D97706]">{a.type}</span>
                      </div>
                    </div>
                    <span className="text-xs text-[#94A3B8] shrink-0">{a.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT col */}
        <div className="space-y-6">

          {/* Class Assignment Status */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827]">Class Assignment Status</h2>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              {CLASSES.map((cls) => {
                const incharge = faculty.find(f => f.classId === cls.id)
                return (
                  <div key={cls.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F5F6FA] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#111827] truncate">{cls.label}</p>
                      {incharge ? (
                        <p className="text-[10px] font-bold text-[#16A34A] mt-0.5">{incharge.name}</p>
                      ) : (
                        <p className="text-[10px] font-bold text-[#EF4444] mt-0.5">⚠ No incharge</p>
                      )}
                    </div>
                    {!incharge && (
                      <button onClick={() => setShowCreateFaculty(false)}
                        className="shrink-0 text-[10px] font-bold text-[#3B5BFF] bg-[#3B5BFF]/10 px-2.5 py-1 rounded-lg hover:bg-[#3B5BFF]/20 transition-colors">
                        Assign
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* HOD Quick Actions */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-base font-bold text-[#111827]">HOD Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {[
                { label: "Create Department Event",  icon: CalendarPlus, accent: "#3B5BFF" },
                { label: "Post Announcement",        icon: Megaphone,    accent: "#7C3AED" },
                { label: "View OD Analytics",        icon: BarChart3,    accent: "#16A34A" },
              ].map((action) => (
                <button key={action.label}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-3 hover:bg-[#F5F6FA] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.accent}15` }}>
                      <action.icon className="h-4 w-4" style={{ color: action.accent }} />
                    </div>
                    <span className="text-sm font-semibold text-[#111827]">{action.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#94A3B8]" />
                </button>
              ))}
            </div>
          </div>

          {/* Faculty Highlights */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
              <Award className="h-4 w-4 text-[#D97706]" />
              <h2 className="text-base font-bold text-[#111827]">Pending Highlights</h2>
            </div>
            {mockHighlights.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-xs font-semibold text-[#6B7280]">No pending highlights</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {mockHighlights.map((h) => (
                  <div key={h.id} className="px-5 py-4">
                    <p className="text-sm font-bold text-[#111827]">{h.title}</p>
                    <p className="text-xs text-[#6B7280] mt-1">By {h.faculty}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1.5 bg-[#F5F6FA] text-[#6B7280] rounded-lg text-xs font-bold hover:bg-[#E5E7EB] transition-colors">Review</button>
                      <button className="flex-1 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803d] transition-colors">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
