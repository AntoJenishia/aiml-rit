"use client"
import { useUser } from "@/lib/hooks/useUser"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState, useEffect, useCallback } from "react"
import {
  Users, UserPlus, FileSignature, Award, PieChart,
  CheckCircle, XCircle, ChevronRight, PlusCircle, CalendarPlus,
  X, Loader2, Eye, EyeOff, AlertCircle, Trophy, BookOpen,
  Megaphone, BarChart3, Shield, TrendingUp, ArrowRight, GraduationCap,
  Download, Search, Filter, RefreshCw, Upload, CheckCircle2, Activity, ExternalLink
} from "lucide-react"


// ── Types & Interfaces ────────────────────────────────────────────────────────
interface FacultyUser {
  uid: string
  name: string
  username: string
  isClassIncharge?: boolean
  classId?: string | null
  department?: string
  designation?: string
  email?: string
  phone?: string
  gender?: string
}

interface StudentUser {
  uid: string
  name: string
  email: string
  registerNumber?: string
  rollNumber?: string
  phone?: string
  batch?: string
  currentYear?: string
  semester?: number
  section?: string
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
  postODProofsUrl?: string
  postODDescription?: string
  postRejectReason?: string
}

interface Highlight {
  id: string
  faculty: string
  title: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const CLASSES = [
  { id: "ii-aiml-a-2025",  label: "II Year – AIML – A (2025–29)" },
  { id: "ii-aiml-b-2025",  label: "II Year – AIML – B (2025–29)" },
  { id: "ii-aiml-c-2025",  label: "II Year – AIML – C (2025–29)" },
  { id: "iii-aiml-a-2024", label: "III Year – AIML – A (2024–28)" },
  { id: "iii-aiml-b-2024", label: "III Year – AIML – B (2024–28)" },
  { id: "iii-aiml-c-2024", label: "III Year – AIML – C (2024–28)" },
  { id: "iv-aiml-a-2023",  label: "IV Year – AIML – A (2023–27)" },
  { id: "iv-aiml-b-2023",  label: "IV Year – AIML – B (2023–27)" },
  { id: "iv-aiml-c-2023",  label: "IV Year – AIML – C (2023–27)" },
]

const BATCH_LABELS: Record<string, string> = {
  "2025": "2025–29",
  "2024": "2024–28",
  "2023": "2023–27",
}

// ── 1. Create Faculty Modal ──────────────────────────────────────────────────
function CreateFacultyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    staff_name: "",
    staff_code: "",
    department: "",
    designation: "",
    email: "",
    phone: "",
    gender: "",
    password: ""
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!form.staff_name || !form.staff_code || !form.password) {
      setError("Name, Staff Code, and Password are required.")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Create Faculty Account</h2>
            <p className="text-xs text-[#6B7280] mt-1">Complete all details to onboard new faculty.</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Staff Name</label>
              <input type="text" placeholder="e.g. Dr. Jane Alice" value={form.staff_name} onChange={(e) => setForm({ ...form, staff_name: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Staff Code</label>
              <input type="text" placeholder="e.g. CS001" value={form.staff_code} onChange={(e) => setForm({ ...form, staff_code: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Department</label>
              <input type="text" placeholder="e.g. AIML" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Designation</label>
              <input type="text" placeholder="e.g. Assistant Professor" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Email</label>
              <input type="email" placeholder="e.g. alice@rit.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#111827] mb-1.5">Phone</label>
              <input type="text" placeholder="e.g. 9876543210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#111827] mb-1.5">Gender</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2 text-sm text-[#111827] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

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

// ── 2. Assign Class Modal ────────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
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

// ── 3. Reset Password Modal ──────────────────────────────────────────────────
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
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

// ── 4. Edit Student Modal ────────────────────────────────────────────────────
function EditStudentModal({ student, onClose, onSuccess }: { student: StudentUser; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: student.name ?? "",
    registerNumber: student.registerNumber ?? "",
    rollNumber: student.rollNumber ?? "",
    phone: student.phone ?? "",
    batch: student.batch ?? "",
    currentYear: student.currentYear ?? "I",
    classId: student.classId ?? "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: student.uid, ...form }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update student.")
        setLoading(false)
        return
      }
      onSuccess()
      onClose()
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Edit Student Profile</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">{student.email}</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 text-sm text-[#EF4444]">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm text-[#111827]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm text-[#111827]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Register No</label>
              <input type="text" value={form.registerNumber} onChange={e => setForm({ ...form, registerNumber: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm text-[#111827]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Roll No</label>
              <input type="text" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm text-[#111827]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Batch</label>
              <input type="text" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-3 py-2 text-sm text-[#111827]" placeholder="e.g. 2024 – 2028" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Year</label>
              <select value={form.currentYear} onChange={e => setForm({ ...form, currentYear: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-2 py-2 text-sm text-[#111827]">
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase tracking-wide mb-1">Class ID</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-2 py-2 text-sm text-[#111827]">
                <option value="">None</option>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB] flex items-center justify-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── 5. Import CSV Modal ──────────────────────────────────────────────────────
function ImportCSVModal({ type, onClose, onSuccess, showToast }: { type: "student" | "faculty"; onClose: () => void; onSuccess: () => void; showToast: (m: string) => void }) {
  const [csvText, setCsvText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const handleImport = async () => {
    setError("")
    if (!csvText.trim()) { setError("CSV content cannot be empty."); return }
    setLoading(false)

    const lines = csvText.split("\n").map(l => l.trim()).filter(Boolean)
    const dataLines = lines.slice(1) // Skip headers
    
    if (dataLines.length === 0) { setError("No data rows found in CSV."); return }
    setLoading(true)
    setProgress({ current: 0, total: dataLines.length })

    let successCount = 0

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i]
      
      // parse CSV columns
      const fields = []
      let cur = ""
      let quotes = false
      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        if (char === '"') quotes = !quotes
        else if (char === ',' && !quotes) { fields.push(cur.trim()); cur = "" }
        else cur += char
      }
      fields.push(cur.trim())

      try {
        if (type === "student") {
          if (fields.length < 6) continue
          const [name, register_no, email, phone, fullClass, semester] = fields
          const section = fields[6] || "A"

          // Determine currentYear from semester
          const semNum = parseInt(semester, 10)
          let currentYear = "III"
          if (semNum <= 2) currentYear = "I"
          else if (semNum <= 4) currentYear = "II"
          else if (semNum <= 6) currentYear = "III"
          else currentYear = "IV"

          const parsedYear = email.match(/\.(\d{2})\d+@/)
          let admissionYear = 2024
          if (parsedYear) {
            const yr = parseInt(parsedYear[1], 10)
            admissionYear = yr >= 50 ? 1900 + yr : 2000 + yr
          }

          const classId = `${currentYear.toLowerCase()}-aiml-${section.toLowerCase()}-${admissionYear}`

          // Save student via API
          const res = await fetch("/api/users", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              uid: email, // use email as the temp UID
              name,
              email,
              registerNumber: register_no,
              rollNumber: register_no.slice(-3),
              phone,
              role: "student",
              photoURL: "",
              department: "Artificial Intelligence & Machine Learning",
              deptCode: "aiml",
              batch: `${admissionYear} – ${admissionYear + 4}`,
              currentYear,
              semester: semNum,
              section,
              classId,
              profileComplete: true,
            })
          })
          if (res.ok) successCount++
        } else {
          // Faculty Import: staff_name, staff_code, department, designation, email, phone, gender
          if (fields.length < 6) continue
          const [name, staff_code, department, designation, email, phone, gender] = fields

          // 1. Create firebase auth credentials account
          const authRes = await fetch("/api/hod/create-faculty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: staff_code,
              password: "ChangeMe123!",
              displayName: name
            })
          })
          if (authRes.ok) {
            const authData = await authRes.json()
            const uid = authData.uid
            
            // 2. Set extra profile metadata fields in Firestore
            await fetch("/api/users", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid,
                staffCode: staff_code,
                department,
                designation,
                email,
                phone,
                gender,
              })
            })
            successCount++
          }
        }
      } catch (err) {
        console.error("CSV Row Import error:", err)
      }
      setProgress(p => ({ ...p, current: i + 1 }))
    }

    setLoading(false)
    showToast(`✓ Successfully imported ${successCount} ${type} accounts!`)
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#111827]">Import {type === "student" ? "Students" : "Faculty"} CSV</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Header format: {type === "student" 
                ? "name,register_no,email,phone,class,semester,section" 
                : "staff_name,staff_code,department,designation,email,phone,gender"}
            </p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="text-sm font-bold text-[#EF4444] bg-red-50 rounded-xl px-4 py-2 border border-red-100">{error}</div>}
          
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-[#3B5BFF]" />
              <p className="text-sm font-bold text-[#111827]">Processing records...</p>
              <div className="w-full bg-[#F5F6FA] rounded-full h-2 max-w-xs mt-2 overflow-hidden border border-[#E5E7EB]">
                <div className="bg-[#3B5BFF] h-2 transition-all duration-150" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
              </div>
              <p className="text-xs text-[#6B7280]">{progress.current} of {progress.total} rows imported</p>
            </div>
          ) : (
            <>
              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="Paste CSV rows here (include header row)..."
                rows={8}
                className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] p-4 text-xs font-mono text-[#111827] placeholder:text-[#94A3B8] focus:border-[#3B5BFF] focus:outline-none focus:ring-2 focus:ring-[#3B5BFF]/20 resize-none"
              />
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">Cancel</button>
                <button onClick={handleImport} className="flex-1 py-2.5 rounded-xl bg-[#3B5BFF] text-white text-sm font-bold hover:bg-[#2563EB]">Start Import</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main HOD Dashboard ────────────────────────────────────────────────────────
import { Suspense } from "react"

function HodDashInner() {
  const { name, image } = useUser()

  const searchParams = useSearchParams()
  const activeTab = (searchParams.get("tab") || "students") as "students" | "faculty" | "od" | "achievements" | "events"

  // Modals visibility toggles
  const [showCreateFaculty, setShowCreateFaculty] = useState(false)
  const [assignTarget, setAssignTarget] = useState<FacultyUser | null>(null)
  const [resetTarget, setResetTarget] = useState<FacultyUser | null>(null)
  const [editingStudent, setEditingStudent] = useState<StudentUser | null>(null)
  const [importType, setImportType] = useState<"student" | "faculty" | null>(null)

  // Dynamic datasets loaded from API
  const [students, setStudents] = useState<StudentUser[]>([])
  const [faculty, setFaculty] = useState<FacultyUser[]>([])
  const [odRequests, setOdRequests] = useState<ODRequest[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([
    { id: "h1", faculty: "Dr. J. Alice", title: "Published Paper in IEEE ICAIET 2026" },
  ])

  // Filters for directories
  const [studentSearch, setStudentSearch] = useState("")
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("2024")
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>("A")
  const [odTabFilter, setOdTabFilter] = useState<"pending" | "approved" | "rejected">("pending")
  const [odProofSubTab, setOdProofSubTab] = useState<"requests" | "proofs">("requests")

  // Status variables
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [toast, setToast] = useState<string | null>(null)

  // Promotion visual indicator
  const [promotingBatch, setPromotingBatch] = useState<string | null>(null)
  const [promoteProgress, setPromoteProgress] = useState(0)

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  // Load all user records from Firestore
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const allUsers = await res.json()
        setStudents(allUsers.filter((u: any) => u.role === "student"))
        setFaculty(allUsers.filter((u: any) => u.role === "staff"))
      }
      
      const odRes = await fetch("/api/od")
      if (odRes.ok) {
        setOdRequests(await odRes.json())
      }
    } catch (e) {
      console.error("Data load failed:", e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Approve a student highlight
  const handleApproveHighlight = (id: string, title: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id))
    showToast(`✓ Approved Highlight: ${title}`)
  }

  // Approve OD Request final stage
  const handleHODApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    if (res.ok) { showToast(`✓ Approved OD for ${od.studentName}`); await loadData() }
    setActionLoading(null)
  }

  // Reject OD Request final stage
  const handleHODReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    if (res.ok) { showToast(`Rejected OD for ${od.studentName}`); await loadData() }
    setActionLoading(null)
  }

  // Promote active classroom students based on semester
  const handlePromoteClass = async () => {
    if (sortedStudents.length === 0) return

    setActionLoading("promoting")
    let successCount = 0

    for (let i = 0; i < sortedStudents.length; i++) {
      const student = sortedStudents[i]
      const nextSemester = (student.semester || 1) + 1
      
      let nextYear = "Graduated"
      if (nextSemester <= 2) nextYear = "I"
      else if (nextSemester <= 4) nextYear = "II"
      else if (nextSemester <= 6) nextYear = "III"
      else if (nextSemester <= 8) nextYear = "IV"

      // Determine new classId
      let nextClassId = ""
      if (nextYear !== "Graduated" && student.section) {
        const nextYearLower = nextYear === "I" ? "i" : nextYear === "II" ? "ii" : nextYear === "III" ? "iii" : "iv"
        nextClassId = `${nextYearLower}-aiml-${student.section.toLowerCase()}-${selectedBatchFilter}`
      }

      try {
        const res = await fetch("/api/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: student.uid,
            semester: nextSemester,
            currentYear: nextYear,
            classId: nextClassId || null
          })
        })
        if (res.ok) successCount++
      } catch (err) {
        console.error("Promote student error:", err)
      }
    }

    setActionLoading(null)
    const currentSem = sortedStudents[0]?.semester || 1
    showToast(`✓ Successfully promoted students to Semester ${currentSem + 1}`)
    await loadData()
  }



  const getSelectedClassId = (batchKey: string, sectionKey: string) => {
    if (batchKey === "2025") return `ii-aiml-${sectionKey.toLowerCase()}-2025`
    if (batchKey === "2024") return `iii-aiml-${sectionKey.toLowerCase()}-2024`
    if (batchKey === "2023") return `iv-aiml-${sectionKey.toLowerCase()}-2023`
    return null
  }
  const selectedClassId = getSelectedClassId(selectedBatchFilter, selectedSectionFilter)
  const activeClassIncharge = faculty.find(f => f.isClassIncharge && f.classId === selectedClassId)
  const activeClassDetails = CLASSES.find(c => c.id === selectedClassId)

  // Filter students based on search query, selected batch, and section
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          (s.registerNumber ?? "").includes(studentSearch)
    const matchesBatch = s.batch?.startsWith(selectedBatchFilter)
    const matchesSection = s.section === selectedSectionFilter
    return matchesSearch && matchesBatch && matchesSection
  })

  // Sort students sequentially (orderwise) by Register Number
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a.registerNumber && b.registerNumber) {
      return a.registerNumber.localeCompare(b.registerNumber)
    }
    return (a.name || "").localeCompare(b.name || "")
  })

  // Group ODs by their status
  const odRequestPending = odRequests.filter(od => od.status === "pending_hod")
  const proofPending     = odRequests.filter(od => od.status === "post_pending_hod")
  const pendingODs = [...odRequestPending, ...proofPending]
  const approvedODs = odRequests.filter(od => od.status === "approved" || od.status === "completed")
  const rejectedODs = odRequests.filter(od => od.status.startsWith("rejected"))

  const odList = odTabFilter === "pending" ? pendingODs : 
                 odTabFilter === "approved" ? approvedODs : rejectedODs



  return (
    <div className="min-h-full space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl border border-white/10 animate-slideUp">
          {toast}
        </div>
      )}

      {/* Reject OD Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setRejectTarget(null)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-[#111827]">Reject {rejectTarget.status === "post_pending_hod" ? "Post-Event Proof" : "OD — Final Stage"}</h2>
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

      {/* Helper Modals */}
      {showCreateFaculty && <CreateFacultyModal onClose={() => setShowCreateFaculty(false)} onSuccess={loadData} />}
      {assignTarget && <AssignClassModal faculty={assignTarget} onClose={() => setAssignTarget(null)} onSuccess={loadData} />}
      {resetTarget && <ResetPasswordModal faculty={resetTarget} onClose={() => setResetTarget(null)} />}
      {editingStudent && <EditStudentModal student={editingStudent} onClose={() => setEditingStudent(null)} onSuccess={loadData} />}
      {importType && <ImportCSVModal type={importType} onClose={() => setImportType(null)} onSuccess={loadData} showToast={showToast} />}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #091e3a 0%, #2f80ed 50%, #2d9cdb 100%)" }}>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#7C3AED]/30 blur-2xl" />
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/75 bg-white/10 px-2 py-0.5 rounded-full">HOD Dashboard</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-blue-600 text-[10px] font-black uppercase">ADMIN</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                {name || "Head of Department"}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">Artificial Intelligence & Machine Learning</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 w-full md:w-auto">
            {[
              { label: "Students",   value: students.length,       color: "text-blue-100" },
              { label: "Faculty",    value: faculty.length,        color: "text-purple-100" },
              { label: "Pending OD", value: pendingODs.length,     color: "text-amber-100" },
              { label: "Classes",    value: CLASSES.length,        color: "text-green-100" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-center">
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <div className="w-full">
        {/* Content Panel */}
        <div className="w-full space-y-4">
          


          {/* TAB 2: Student Directory */}
          {activeTab === "students" && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#111827]">Student Directory</h2>
                  <p className="text-xs text-[#6B7280]">Search, filter and edit student details</p>
                </div>
                <button
                  onClick={() => setImportType("student")}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#3B5BFF] text-white rounded-xl text-xs font-bold hover:bg-[#2563EB] transition-all">
                  <Upload className="h-3.5 w-3.5" /> Import Students CSV
                </button>
              </div>

              {/* Filters & Class Incharge Row */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Batch Pill Selector */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Select Batch</span>
                    <div className="flex gap-1.5 bg-[#F5F6FA] border border-[#E5E7EB] rounded-2xl p-1.5 shrink-0">
                      {[
                        { key: "2025", label: "2025-29 (II Year)" },
                        { key: "2024", label: "2024-28 (III Year)" },
                        { key: "2023", label: "2023-27 (IV Year)" },
                      ].map(batch => (
                        <button
                          key={batch.key}
                          onClick={() => setSelectedBatchFilter(batch.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedBatchFilter === batch.key ? "bg-white text-[#3B5BFF] shadow-sm border border-[#E5E7EB]" : "text-[#6B7280] hover:text-[#111827]"
                          }`}>
                          {batch.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section Pill Selector */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Select Section</span>
                    <div className="flex gap-1.5 bg-[#F5F6FA] border border-[#E5E7EB] rounded-2xl p-1.5 shrink-0">
                      {["A", "B", "C"].map(sec => (
                        <button
                          key={sec}
                          onClick={() => setSelectedSectionFilter(sec)}
                          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selectedSectionFilter === sec ? "bg-white text-[#3B5BFF] shadow-sm border border-[#E5E7EB]" : "text-[#6B7280] hover:text-[#111827]"
                          }`}>
                          Section {sec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="flex flex-col gap-1.5 min-w-[200px] flex-1 sm:flex-initial">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Search</span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94A3B8]" />
                      <input
                        type="text"
                        placeholder="Search name/reg no..."
                        value={studentSearch}
                        onChange={e => setStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#F5F6FA] border border-[#E5E7EB] rounded-2xl text-xs text-[#111827] focus:outline-none focus:border-[#3B5BFF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Class & Incharge Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50/70 border border-blue-100 rounded-2xl px-5 py-4 gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#3B5BFF] text-white p-2 rounded-xl">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Active Classroom</p>
                      <h3 className="text-sm font-black text-[#111827] mt-0.5">
                        {activeClassDetails?.label ?? `${selectedBatchFilter} Batch - Section ${selectedSectionFilter}`}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-blue-100 shadow-sm">
                      <Users className="h-4 w-4 text-[#3B5BFF]" />
                      <span className="text-xs text-[#6B7280]">Class Incharge:</span>
                      <span className="text-xs font-black text-[#111827]">
                        {activeClassIncharge ? activeClassIncharge.name : "Not Assigned"}
                      </span>
                    </div>

                    {/* Promote Button */}
                    {sortedStudents.length > 0 && sortedStudents[0].currentYear !== "Graduated" && (
                      <button
                        onClick={handlePromoteClass}
                        disabled={actionLoading === "promoting"}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803d] transition-all disabled:opacity-50 min-h-[36px]">
                        {actionLoading === "promoting" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5" />
                        )}
                        Promote to Sem {(sortedStudents[0].semester || 1) + 1}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
              ) : sortedStudents.length === 0 ? (
                <div className="text-center py-12 text-xs font-semibold text-[#6B7280]">No student matches found.</div>
              ) : (
                <div className="overflow-x-auto border border-[#E5E7EB] rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#F5F6FA] text-[10px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Register No</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Class</th>
                        <th className="px-4 py-3 text-center">Semester</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {sortedStudents.map((s) => (
                        <tr key={s.uid} className="hover:bg-[#F5F6FA] transition-colors">
                          <td className="px-4 py-3.5 font-bold text-[#111827]">{s.name}</td>
                          <td className="px-4 py-3.5 font-mono text-[#6B7280]">{s.registerNumber || "—"}</td>
                          <td className="px-4 py-3.5 text-[#6B7280]">{s.email}</td>
                          <td className="px-4 py-3.5 font-mono text-[#6B7280]">{s.phone || "—"}</td>
                          <td className="px-4 py-3.5 font-semibold text-[#111827]">{s.currentYear} Year - {s.section || "A"}</td>
                          <td className="px-4 py-3.5 text-center text-[#111827] font-semibold">{s.semester || "—"}</td>
                          <td className="px-4 py-3.5 text-[#6B7280]">{s.batch}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setEditingStudent(s)}
                              className="px-2.5 py-1 text-[10px] font-bold bg-[#F5F6FA] border border-[#E5E7EB] text-[#3B5BFF] hover:bg-[#3B5BFF]/10 rounded-lg">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Faculty Management */}
          {activeTab === "faculty" && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#111827]">Faculty Directory</h2>
                  <p className="text-xs text-[#6B7280]">Manage credentials and assign class responsibility</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setImportType("faculty")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#F5F6FA] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#E5E7EB] rounded-xl text-xs font-bold transition-all">
                    <Upload className="h-3.5 w-3.5" /> Import Faculty CSV
                  </button>
                  <button
                    onClick={() => setShowCreateFaculty(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-bold hover:bg-[#6D28D9] transition-all">
                    <UserPlus className="h-3.5 w-3.5" /> Add Faculty Account
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
              ) : faculty.length === 0 ? (
                <div className="text-center py-12 text-xs font-semibold text-[#6B7280]">No faculty accounts created yet.</div>
              ) : (
                <div className="overflow-x-auto border border-[#E5E7EB] rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-[#F5F6FA] text-[10px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                        <th className="px-5 py-3">Name</th>
                        <th className="px-5 py-3">Staff Code</th>
                        <th className="px-5 py-3">Class Incharge</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {faculty.map((f) => (
                        <tr key={f.uid} className="hover:bg-[#F5F6FA] transition-colors">
                          <td className="px-5 py-3.5 font-bold text-[#111827]">{f.name}</td>
                          <td className="px-5 py-3.5 font-mono text-[#6B7280]">{f.username}</td>
                          <td className="px-5 py-3.5">
                            {f.isClassIncharge && f.classId ? (
                              <span className="font-bold text-[#16A34A] bg-[#16A34A]/10 px-2.5 py-1 rounded-full text-[10px]">
                                {CLASSES.find(c => c.id === f.classId)?.label ?? f.classId}
                              </span>
                            ) : (
                              <span className="text-[#94A3B8]">Not Assigned</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button onClick={() => setAssignTarget(f)} className="text-xs font-bold text-[#3B5BFF] hover:underline">Assign Class</button>
                            <button onClick={() => setResetTarget(f)} className="text-xs font-bold text-[#EF4444] hover:underline">Reset Pwd</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}



          {/* TAB 5: OD Request Center */}
          {activeTab === "od" && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden p-6 space-y-4">
              <div className="border-b border-[#E5E7EB] pb-4">
                <h2 className="text-base font-bold text-[#111827]">OD Approvals</h2>
                <p className="text-xs text-[#6B7280]">Process student On-Duty requests</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
              ) : (
                // Pending: show sub-tab switcher between OD Requests and Proof Approvals
                <>
                  <div className="flex bg-[#F5F6FA] border border-[#E5E7EB] rounded-xl p-1 mb-4">
                    <button onClick={() => setOdProofSubTab("requests")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        odProofSubTab === "requests" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"
                      }`}>
                      OD Requests {odRequestPending.length > 0 && <span className="h-4 w-4 rounded-full bg-amber-400 text-white text-[9px] font-black flex items-center justify-center">{odRequestPending.length}</span>}
                    </button>
                    <button onClick={() => setOdProofSubTab("proofs")}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        odProofSubTab === "proofs" ? "bg-white shadow-sm text-[#111827]" : "text-[#6B7280]"
                      }`}>
                      Proof Approvals {proofPending.length > 0 && <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">{proofPending.length}</span>}
                    </button>
                  </div>
                  {(() => {
                    const list = odProofSubTab === "requests" ? odRequestPending : proofPending
                    if (list.length === 0) return (
                      <div className="text-center py-12 text-xs font-semibold text-[#6B7280]">
                        {odProofSubTab === "requests" ? "No OD requests pending your approval." : "No post-event proofs awaiting your review."}
                      </div>
                    )
                    return (
                      <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden">
                        {list.map(od => {
                          const isActioning = actionLoading === od.id
                          const isProof = od.status === "post_pending_hod"
                          return (
                            <div key={od.id} className="px-5 py-4 hover:bg-[#F5F6FA] transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-sm font-bold text-[#111827]">{od.studentName || "Student"}</p>
                                    {!isProof && (
                                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#16A34A]/10 text-[#16A34A] uppercase">Faculty Approved</span>
                                    )}
                                    {isProof && (
                                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase">Proof Approved by Faculty</span>
                                    )}
                                  </div>
                                  <p className="text-sm font-semibold text-[#111827] mb-0.5">{od.eventName}</p>
                                  <p className="text-xs text-[#6B7280]">{od.organiser} · {od.startDate} – {od.endDate}</p>
                                  <span className="text-[10px] font-mono text-[#94A3B8] block mt-1">Ref: {od.referenceNumber}</span>

                                  {isProof && (
                                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Post-Event Proof Submitted</p>
                                      <p className="text-xs text-blue-900 mb-2 italic">"{od.postODDescription}"</p>
                                      {od.postODProofsUrl && (
                                        <a href={od.postODProofsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 hover:underline bg-white px-2 py-1 rounded border border-blue-200 shadow-sm">
                                          <ExternalLink className="h-3 w-3" /> View Proof Files
                                        </a>
                                      )}
                                    </div>
                                  )}

                                  {isProof ? (
                                    od.finalPdfUrl && (
                                      <a href={od.finalPdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] hover:underline mt-1.5">
                                        <Download className="h-3 w-3" /> View Approved Letter
                                      </a>
                                    )
                                  ) : (
                                    od.pdfUrl && (
                                      <a href={od.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline mt-1.5">
                                        <Download className="h-3 w-3" /> View Draft PDF
                                      </a>
                                    )
                                  )}
                                  <a href={`/verify/${od.referenceNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:underline mt-1.5">
                                    <ExternalLink className="h-3 w-3" /> Verify
                                  </a>
                                </div>
                                <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                                  <button onClick={() => { setRejectTarget(od); setRejectReason("") }} disabled={isActioning}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] rounded-lg text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all">
                                    <XCircle className="h-3.5 w-3.5" /> {isProof ? "Reject Proof" : "Reject"}
                                  </button>
                                  <button onClick={() => handleHODApprove(od)} disabled={isActioning}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-bold hover:bg-[#15803d] transition-all">
                                    <CheckCircle className="h-3.5 w-3.5" /> {isProof ? "Approve Proof" : "Final Approve"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </>
              )}
            </div>
          )}

          {/* TAB 6: Achievements */}
          {activeTab === "achievements" && (
            <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#111827]">Faculty Achievements</h2>
                <p className="text-xs text-[#6B7280]">Approve and feature outstanding academic/research accomplishments</p>
              </div>

              {highlights.length === 0 ? (
                <div className="text-center py-12 text-xs font-semibold text-[#6B7280]">
                  No achievements pending approval.
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-2xl overflow-hidden animate-fadeIn">
                  {highlights.map((h) => (
                    <div key={h.id} className="px-5 py-4 hover:bg-[#F5F6FA] transition-colors flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#111827]">{h.faculty}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{h.title}</p>
                      </div>
                      <button
                        onClick={() => {
                          setHighlights(prev => prev.filter(x => x.id !== h.id))
                          showToast("✓ Achievement Featured Successfully!")
                        }}
                        className="px-3.5 py-1.5 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803d] transition-all flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Feature
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HodDash() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>}>
      <HodDashInner />
    </Suspense>
  )
}

