"use client"
import { useUser } from "@/lib/hooks/useUser"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import {
  Users, CheckCircle, XCircle, FileText, ChevronRight,
  BookOpen, TrendingUp, Clock, AlertCircle, Loader2,
  ExternalLink, Download, X, Send,
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────
interface ODRequest {
  id: string
  referenceNumber: string
  studentName?: string
  studentUid: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  status: string
  pdfUrl?: string
  createdAt?: any
}

// ── Reject Reason Modal ───────────────────────────────────────────────────────
function RejectModal({
  od,
  onClose,
  onConfirm,
}: {
  od: ODRequest
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!reason.trim()) { setError("A rejection reason is required."); return }
    setLoading(true)
    await onConfirm(reason)
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#111827]">Reject OD Request</h2>
            <p className="text-xs text-[#6B7280] mt-0.5">{od.studentName} — {od.eventName}</p>
          </div>
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#111827] p-1 rounded-lg hover:bg-[#F5F6FA]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-[#EF4444]/30 rounded-xl px-4 py-3 text-sm text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-[#111827] mb-1.5">
              Reason for Rejection <span className="text-[#EF4444]">*</span>
            </label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Provide a clear reason so the student can resubmit…"
              rows={3}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F5F6FA] px-4 py-2.5 text-sm text-[#111827] placeholder:text-[#94A3B8] focus:border-[#EF4444] focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-[#6B7280] hover:bg-[#F5F6FA]">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-sm font-bold hover:bg-[#DC2626] flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject Request
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main StaffDash ────────────────────────────────────────────────────────────
export default function StaffDash() {
  const { name, image, isClassIncharge, classId } = useUser()

  const [odRequests,   setOdRequests]   = useState<ODRequest[]>([])
  const [loadingOD,    setLoadingOD]    = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ODRequest | null>(null)
  const [toast,        setToast]        = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadODs = useCallback(async () => {
    setLoadingOD(true)
    try {
      const res = await fetch("/api/od")
      if (res.ok) setOdRequests(await res.json())
    } catch { /* silently fail */ }
    setLoadingOD(false)
  }, [])

  useEffect(() => { if (isClassIncharge) loadODs() }, [isClassIncharge, loadODs])

  const handleApprove = async (od: ODRequest) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(`✓ Approved OD for ${od.studentName}`)
      await loadODs()
    } else {
      showToast(`Error: ${data.error}`)
    }
    setActionLoading(null)
  }

  const handleReject = async (od: ODRequest, reason: string) => {
    setActionLoading(od.id)
    const res = await fetch(`/api/od/${od.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    })
    const data = await res.json()
    if (res.ok) {
      showToast(`Rejected OD for ${od.studentName}`)
      await loadODs()
    } else {
      showToast(`Error: ${data.error}`)
    }
    setActionLoading(null)
  }

  const TAG_COLORS: Record<string, string> = {
    "Workshop":      "bg-purple-100 text-purple-700",
    "Hackathon":     "bg-red-100 text-red-700",
    "Guest Lecture": "bg-amber-100 text-amber-700",
    "Symposium":     "bg-indigo-100 text-indigo-700",
    "Conference":    "bg-rose-100 text-rose-700",
    "Internship":    "bg-teal-100 text-teal-700",
  }

  const mockStudents = [
    { id: "1", name: "Aakash K",  registerNumber: "312221202001", cgpa: "9.1" },
    { id: "2", name: "Priya M",   registerNumber: "312221202002", cgpa: "8.5" },
    { id: "3", name: "Rahul M",   registerNumber: "312221202003", cgpa: "7.8" },
    { id: "4", name: "Sneha P",   registerNumber: "312221202004", cgpa: "8.9" },
  ]

  return (
    <div className="min-h-full space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111827] text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <RejectModal
          od={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => handleReject(rejectTarget, reason)}
        />
      )}

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #7C3AED 60%, #3B5BFF 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-white/10" />
        </div>
        <div className="relative px-6 py-8 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {image ? (
              <Image src={image} alt={name || ""} width={64} height={64}
                className="rounded-full ring-4 ring-white/30 w-14 h-14 object-cover shrink-0" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-white/20 text-white flex items-center justify-center text-2xl font-black ring-4 ring-white/30 shrink-0">
                {name?.[0] ?? "F"}
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Faculty Portal</p>
              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                Welcome, {name || "Faculty"} 👋
              </h1>
              <p className="text-white/70 text-sm mt-1">AIML Department · Faculty Member</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            {isClassIncharge ? (
              <>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Class Incharge</p>
                  <p className="text-white font-bold text-sm mt-1 max-w-[160px] truncate">{classId || "—"}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[80px]">
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">OD Queue</p>
                  <p className="text-white font-black text-2xl mt-0.5">{loadingOD ? "…" : odRequests.length}</p>
                </div>
              </>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Status</p>
                <p className="text-white font-bold text-sm mt-1">Subject Faculty</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Students",      value: mockStudents.length, icon: Users,       border: "border-l-[#3B5BFF]", iconBg: "bg-[#3B5BFF]/10", iconColor: "text-[#3B5BFF]", sub: "In your class" },
          { label: "Pending ODs",   value: loadingOD ? "…" : odRequests.length, icon: Clock, border: "border-l-[#EF4444]", iconBg: "bg-[#EF4444]/10", iconColor: "text-[#EF4444]", sub: "Awaiting review" },
          { label: "Avg CGPA",      value: "8.6",               icon: TrendingUp,  border: "border-l-[#16A34A]", iconBg: "bg-[#16A34A]/10", iconColor: "text-[#16A34A]", sub: "Class average" },
          { label: "OD Approved",   value: "5",                  icon: CheckCircle, border: "border-l-[#7C3AED]", iconBg: "bg-[#7C3AED]/10", iconColor: "text-[#7C3AED]", sub: "This semester" },
        ].map(s => (
          <div key={s.label}
            className={`bg-white rounded-xl p-5 shadow-sm border border-[#E5E7EB] border-l-4 ${s.border} hover:shadow-md transition-shadow`}>
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

      {/* ── Main Content ── */}
      {isClassIncharge ? (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* OD Queue — LEFT 2/3 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3B5BFF]" />
                  Pending OD Approvals
                </h2>
                {!loadingOD && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444]">
                    {odRequests.length} Pending
                  </span>
                )}
              </div>

              {loadingOD ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-[#3B5BFF]" /></div>
              ) : odRequests.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center px-6">
                  <div className="h-14 w-14 rounded-full bg-[#16A34A]/10 flex items-center justify-center mb-3">
                    <CheckCircle className="h-7 w-7 text-[#16A34A]" />
                  </div>
                  <p className="text-sm font-bold text-[#111827]">All clear!</p>
                  <p className="text-xs text-[#6B7280] mt-1">No pending OD requests from your students.</p>
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
                              <div className="h-7 w-7 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-xs font-black shrink-0">
                                {od.studentName?.[0] ?? "S"}
                              </div>
                              <p className="text-sm font-bold text-[#111827]">{od.studentName || "Student"}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[od.eventType] || "bg-[#F5F6FA] text-[#6B7280]"}`}>
                                {od.eventType}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-[#111827] mb-0.5">{od.eventName}</p>
                            <p className="text-xs text-[#6B7280]">{od.organiser} · {od.venue}</p>
                            <p className="text-xs text-[#6B7280]">
                              {od.startDate}{od.startDate !== od.endDate ? ` – ${od.endDate}` : ""}
                            </p>
                            <p className="text-[10px] font-mono text-[#94A3B8] mt-1">Ref: {od.referenceNumber}</p>
                            <div className="flex gap-3 mt-2">
                              {od.pdfUrl && (
                                <a href={od.pdfUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] font-bold text-[#3B5BFF] hover:underline">
                                  <Download className="h-3 w-3" /> View Draft PDF
                                </a>
                              )}
                              <a href={`/verify/${od.referenceNumber}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] hover:underline">
                                <ExternalLink className="h-3 w-3" /> Verify
                              </a>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => setRejectTarget(od)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#EF4444]/10 text-[#EF4444] rounded-xl text-xs font-bold hover:bg-[#EF4444] hover:text-white transition-all disabled:opacity-50">
                              {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(od)}
                              disabled={isActioning}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#16A34A] text-white rounded-xl text-xs font-bold hover:bg-[#15803d] transition-all disabled:opacity-50">
                              {isActioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                              Approve
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Students — RIGHT 1/3 */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#7C3AED]" />
                <h2 className="text-base font-bold text-[#111827]">Your Students</h2>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {mockStudents.map(s => {
                  const cgpa = parseFloat(s.cgpa)
                  const cgpaColor = cgpa >= 8.5 ? "text-[#16A34A] bg-green-50" : cgpa >= 7 ? "text-[#3B5BFF] bg-blue-50" : "text-[#D97706] bg-amber-50"
                  return (
                    <div key={s.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-[#F5F6FA] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-7 w-7 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center text-xs font-black shrink-0">
                          {s.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#111827] truncate">{s.name}</p>
                          <p className="text-[10px] font-mono text-[#6B7280]">{s.registerNumber}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${cgpaColor}`}>
                        {s.cgpa}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Non-incharge state
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-10 text-center">
          <div className="h-16 w-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-[#7C3AED]" />
          </div>
          <h2 className="text-lg font-bold text-[#111827] mb-2">You are not a Class Incharge</h2>
          <p className="text-sm text-[#6B7280] max-w-sm mx-auto">
            OD management is available to Class Incharges only. Contact the HOD to be assigned to a class.
          </p>
        </div>
      )}
    </div>
  )
}
