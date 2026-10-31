"use client"
import { useState, useEffect, useRef } from "react"
import {
  CalendarDays, CheckCircle, XCircle, Clock,
  AlertCircle, Loader2, Sparkles, FileText,
  ExternalLink, ArrowRight, X, UploadCloud, ShieldAlert,
  PlusCircle, Check, Info, Upload
} from "lucide-react"

interface AttendanceItem {
  date: string
  day: string
  status: "PRESENT" | "ABSENT" | "OD"
  odTitle?: string
  odRefNumber?: string
  absentReason?: string
  absentCategory?: string
  absentProofUrl?: string
  absentStatus?: string
  absentReasonSubmittedAt?: string
  batch: string
  section: string
}

interface LeaveRequestItem {
  id: string
  startDate: string
  endDate: string
  category: string
  reason: string
  attachmentUrl?: string | null
  attachmentName?: string | null
  status: "PENDING" | "PENDING_INCHARGE" | "PENDING_HOD" | "APPROVED" | "REJECTED"
  reviewedBy?: string
  reviewedRole?: string
  reviewedAt?: string
  reviewNotes?: string
  inchargeApprovedBy?: string
  hodApprovedBy?: string
  createdAt?: string
}

export default function StudentAttendanceTab() {
  const [data, setData] = useState<{
    totalDays: number
    presentDays: number
    absentDays: number
    odDays: number
    attendedDays: number
    percentage: number
    isAboveMandatoryCriteria: boolean
    history: AttendanceItem[]
    batch?: string
    section?: string
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"ATTENDANCE" | "LEAVE">("ATTENDANCE")

  // Absent Reason State
  const [selectedAbsentItem, setSelectedAbsentItem] = useState<AttendanceItem | null>(null)
  const [reasonCategory, setReasonCategory] = useState("Medical Illness / Fever")
  const [reasonText, setReasonText] = useState("")
  const [proofUrl, setProofUrl] = useState("")
  const [absentFile, setAbsentFile] = useState<File | null>(null)
  const absentFileInputRef = useRef<HTMLInputElement>(null)
  const [submittingReason, setSubmittingReason] = useState(false)

  // Advance Leave State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const tomorrowStr = (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split("T")[0]
  })()
  const [leaveStartDate, setLeaveStartDate] = useState(tomorrowStr)
  const [leaveEndDate, setLeaveEndDate] = useState(tomorrowStr)
  const [leaveCategory, setLeaveCategory] = useState("Medical Illness")
  const [leaveReason, setLeaveReason] = useState("")
  const [leaveAttachmentUrl, setLeaveAttachmentUrl] = useState("")
  const [leaveFile, setLeaveFile] = useState<File | null>(null)
  const leaveFileInputRef = useRef<HTMLInputElement>(null)
  const [submittingLeave, setSubmittingLeave] = useState(false)

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Upload file to Supabase cloud storage
  const uploadFileToCloud = async (file: File, folderName = "student-proofs"): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File exceeds 5MB limit. Please compress before uploading.")
    }
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", folderName)
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || "File upload failed")
    }
    const data = await res.json()
    return data.url || ""
  }

  const handleLeaveFileChange = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      showToast(`File "${file.name}" exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a compressed file.`, "error")
      setLeaveFile(null)
      if (leaveFileInputRef.current) leaveFileInputRef.current.value = ""
      return
    }
    setLeaveFile(file)
  }

  const handleAbsentFileChange = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      showToast(`File "${file.name}" exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a compressed file.`, "error")
      setAbsentFile(null)
      if (absentFileInputRef.current) absentFileInputRef.current.value = ""
      return
    }
    setAbsentFile(file)
  }

  const fetchStudentAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/attendance/student")
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch (err) {
      console.error("[StudentAttendanceTab] fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLeaveRequests = async () => {
    setLoadingLeaves(true)
    try {
      const res = await fetch("/api/leave")
      if (res.ok) {
        const d = await res.json()
        setLeaveRequests(d.leaves || [])
      }
    } catch (err) {
      console.error("[StudentAttendanceTab] fetch leaves error:", err)
    } finally {
      setLoadingLeaves(false)
    }
  }

  useEffect(() => {
    fetchStudentAttendance()
    fetchLeaveRequests()
  }, [])

  const handleOpenReasonModal = (item: AttendanceItem) => {
    setSelectedAbsentItem(item)
    setReasonCategory(item.absentCategory || "Medical Illness / Fever")
    setReasonText(item.absentReason || "")
    setProofUrl(item.absentProofUrl || "")
    setAbsentFile(null)
  }

  const handleSubmitReason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAbsentItem || !reasonText.trim()) {
      showToast("Please provide a valid explanation for your absence.", "error")
      return
    }

    setSubmittingReason(true)
    try {
      let finalProofUrl = proofUrl.trim() || null
      if (absentFile) {
        try {
          finalProofUrl = await uploadFileToCloud(absentFile, "absent-proofs")
        } catch (uploadErr: any) {
          showToast("Document upload failed: " + uploadErr.message, "error")
          setSubmittingReason(false)
          return
        }
      }

      const res = await fetch("/api/attendance/student", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedAbsentItem.date,
          batch: selectedAbsentItem.batch,
          section: selectedAbsentItem.section,
          category: reasonCategory,
          reason: reasonText.trim(),
          proofUrl: finalProofUrl,
        }),
      })

      const result = await res.json()
      if (res.ok) {
        showToast("Absence reason submitted successfully to Class Incharge!", "success")
        setSelectedAbsentItem(null)
        setAbsentFile(null)
        await fetchStudentAttendance()
      } else {
        throw new Error(result.error || "Failed to submit reason")
      }
    } catch (err: any) {
      showToast(err.message || "Failed to submit reason.", "error")
    } finally {
      setSubmittingReason(false)
    }
  }

  const handleSubmitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
      showToast("Start date, end date, and reason are required.", "error")
      return
    }
    if (leaveEndDate < leaveStartDate) {
      showToast("End date cannot be earlier than start date.", "error")
      return
    }

    setSubmittingLeave(true)
    try {
      let finalAttachmentUrl = leaveAttachmentUrl.trim() || null
      if (leaveFile) {
        try {
          finalAttachmentUrl = await uploadFileToCloud(leaveFile, "leave-proofs")
        } catch (uploadErr: any) {
          showToast("Document upload failed: " + uploadErr.message, "error")
          setSubmittingLeave(false)
          return
        }
      }

      const res = await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          category: leaveCategory,
          reason: leaveReason.trim(),
          attachmentUrl: finalAttachmentUrl,
        }),
      })

      const result = await res.json()
      if (res.ok) {
        showToast("Advance leave request submitted! Your Class Incharge has been notified.", "success")
        setShowLeaveModal(false)
        setLeaveReason("")
        setLeaveAttachmentUrl("")
        setLeaveFile(null)
        await fetchLeaveRequests()
      } else {
        throw new Error(result.error || "Failed to submit leave request")
      }
    } catch (err: any) {
      showToast(err.message || "Submission failed", "error")
    } finally {
      setSubmittingLeave(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
        <p className="text-xs font-bold text-slate-500">Loading your attendance records...</p>
      </div>
    )
  }

  const history = data?.history || []
  const pendingAbsences = history.filter(
    (h) => h.status === "ABSENT" && (!h.absentReason || h.absentStatus === "REASON_PENDING")
  )

  const percentage = data?.percentage ?? 100
  const isEligible = percentage >= 75

  return (
    <div className="space-y-6">
      {/* ── Toast ── */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-in fade-in duration-300 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-black/10 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Top Summary Header Card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-[#003087]/10 text-[#003087]">
                Official RIT Attendance
              </span>
              {data?.batch && data?.section && (
                <span className="text-xs font-bold text-slate-500">
                  Batch {data.batch} · Sec {data.section}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Attendance &amp; Leave Portal
            </h2>
            <p className="text-xs text-slate-500">
              Anna University Regulations: Minimum 75% attendance is mandatory for semester exams.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2.5 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Request Advance Leave
            </button>
          </div>
        </div>

        {/* Attendance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Working Days</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{data?.totalDays || 0}</p>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Days Present</p>
            <p className="text-xl font-black text-emerald-800 mt-0.5">{data?.presentDays || 0}</p>
          </div>

          <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-center">
            <p className="text-[10px] font-bold uppercase text-indigo-700">On-Duty (OD)</p>
            <p className="text-xl font-black text-indigo-800 mt-0.5">{data?.odDays || 0}</p>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-100 text-center">
            <p className="text-[10px] font-bold uppercase text-rose-700">Absent Days</p>
            <p className="text-xl font-black text-rose-800 mt-0.5">{data?.absentDays || 0}</p>
          </div>

          <div className={`p-3.5 rounded-xl border text-center col-span-2 sm:col-span-1 ${
            isEligible ? "bg-blue-50/70 border-blue-200" : "bg-rose-50 border-rose-300"
          }`}>
            <p className={`text-[10px] font-bold uppercase ${isEligible ? "text-[#003087]" : "text-rose-700"}`}>
              Attendance Rate
            </p>
            <p className={`text-xl font-black mt-0.5 ${isEligible ? "text-[#003087]" : "text-rose-800"}`}>
              {percentage}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Sub Navigation Switcher ── */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl px-2 pt-1 shadow-sm">
        <button
          onClick={() => setActiveTab("ATTENDANCE")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "ATTENDANCE"
              ? "border-[#003087] text-[#003087]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> Daily Attendance Log ({history.length})
        </button>
        <button
          onClick={() => setActiveTab("LEAVE")}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "LEAVE"
              ? "border-[#003087] text-[#003087]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" /> Advance Leave Requests ({leaveRequests.length})
        </button>
      </div>

      {/* ── VIEW 1: Daily Attendance Log ── */}
      {activeTab === "ATTENDANCE" && (
        <div className="space-y-6">
          {/* Action Alert: Pending Absence Reasons */}
          {pendingAbsences.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Action Required: Explanation Needed for Recent Absences ({pendingAbsences.length})</span>
              </div>

              <p className="text-xs text-amber-800 leading-relaxed">
                Please submit a proper reason with optional doctor note/letter for the absent dates below so your Class Incharge can review your record.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {pendingAbsences.map((item) => (
                  <div
                    key={item.date}
                    className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-sm"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-800 block">
                        {item.date} ({item.day})
                      </span>
                      <span className="text-[10px] font-semibold text-rose-600">Marked Absent</span>
                    </div>
                    <button
                      onClick={() => handleOpenReasonModal(item)}
                      className="px-3 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
                    >
                      Submit Reason
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date-wise Attendance History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Attendance Log &amp; History
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {history.length} Days Recorded
              </span>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-medium">
                No attendance records logged yet for your class section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      <th className="px-5 py-3.5">Date &amp; Day</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Details &amp; Reason</th>
                      <th className="px-4 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {history.map((h) => {
                      const isPresent = h.status === "PRESENT"
                      const isOd = h.status === "OD"
                      const isAbsent = h.status === "ABSENT"

                      return (
                        <tr key={h.date} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 align-middle">
                            <span className="font-bold text-slate-900 text-sm block">{h.date}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{h.day}</span>
                          </td>

                          <td className="px-4 py-3.5 align-middle">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                isPresent
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : isOd
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {isPresent ? "Present" : isOd ? "On-Duty" : "Absent"}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 align-middle">
                            {isOd ? (
                              <div>
                                <span className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                  {h.odTitle || "Verified On-Duty Event"}
                                </span>
                                {h.odRefNumber && (
                                  <span className="text-[10px] font-mono text-indigo-600 block">
                                    Ref: {h.odRefNumber}
                                  </span>
                                )}
                              </div>
                            ) : isAbsent ? (
                              h.absentReason ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                                      {h.absentCategory || "Absent"}
                                    </span>
                                    {h.absentStatus === "VERIFIED" ? (
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Incharge Verified
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Under Incharge Review
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                                    &ldquo;{h.absentReason}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs font-semibold text-rose-600 italic">
                                  No reason submitted yet
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">Regular attendance marked</span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-middle text-right">
                            {isAbsent && (
                              <button
                                onClick={() => handleOpenReasonModal(h)}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 whitespace-nowrap"
                              >
                                {h.absentReason ? "Edit Reason" : "Submit Reason"}
                              </button>
                            )}
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
      )}

      {/* ── VIEW 2: Advance Leave Requests ── */}
      {activeTab === "LEAVE" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Advance Leave Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Approved leaves automatically protect your record and notify faculty prior to attendance marking.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3.5 py-1.5 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                + Apply New Leave
              </button>
            </div>

            {loadingLeaves ? (
              <div className="py-16 text-center text-slate-400 text-xs font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#003087]" /> Loading leave requests...
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-medium">
                No advance leave requests submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      <th className="px-5 py-3.5">Leave Dates</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Reason &amp; Remarks</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {leaveRequests.map((leave) => {
                      const isApproved = leave.status === "APPROVED"
                      const isRejected = leave.status === "REJECTED"
                      const isPendingHod = leave.status === "PENDING_HOD"
                      const isPendingIncharge = leave.status === "PENDING_INCHARGE" || leave.status === "PENDING"

                      return (
                        <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 align-middle">
                            <span className="font-bold text-slate-900 text-sm block">
                              {leave.startDate} {leave.startDate !== leave.endDate ? `to ${leave.endDate}` : ""}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              Submitted: {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString("en-IN") : "Recent"}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 align-middle">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 inline-block">
                              {leave.category}
                            </span>
                          </td>

                          <td className="px-5 py-3.5 align-middle">
                            <p className="text-xs text-slate-800 font-medium leading-relaxed">
                              {leave.reason}
                            </p>
                            {leave.attachmentUrl && (
                              <a
                                href={leave.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#003087] font-bold hover:underline mt-1"
                              >
                                <ExternalLink className="w-3 h-3" /> View Attached Proof
                              </a>
                            )}
                            {leave.reviewNotes && (
                              <p className="text-[11px] text-slate-500 italic mt-1 border-t border-slate-100 pt-1">
                                Review Note ({leave.reviewedBy}): &ldquo;{leave.reviewNotes}&rdquo;
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3.5 align-middle text-center">
                            {isApproved ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Approved by HOD
                              </span>
                            ) : isPendingHod ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-blue-600" /> Incharge Approved · Pending HOD
                              </span>
                            ) : isRejected ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-600" /> Awaiting Incharge Review
                              </span>
                            )}
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
      )}

      {/* ── Modal: Apply for Advance Leave ── */}
      {showLeaveModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={() => setShowLeaveModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003087] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-300" /> Apply for Advance Leave
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Notifies your Class Incharge so attendance can be planned appropriately.
                </p>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeaveRequest} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Leave Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveCategory}
                  onChange={(e) => setLeaveCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
                >
                  <option value="Medical Illness">Medical Illness / Doctor Visit</option>
                  <option value="Family Function">Family Function / Marriage</option>
                  <option value="Personal Emergency">Personal Emergency</option>
                  <option value="Planned Travel">Planned Travel / Outstation</option>
                  <option value="Other">Other Genuine Grounds</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Detailed Reason &amp; Plan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain why you are requesting leave in advance..."
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003087] resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Attach Medical Certificate / Parent Permission Letter (Optional)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Max 5MB</span>
                </div>
                <input
                  ref={leaveFileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleLeaveFileChange(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => leaveFileInputRef.current?.click()}
                  className={`w-full py-3 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold ${
                    leaveFile
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-slate-50 text-slate-600 hover:border-[#003087]"
                  }`}
                >
                  {leaveFile ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4 text-slate-400" />}
                  <span className="truncate max-w-[280px]">
                    {leaveFile ? leaveFile.name : "Choose File (PDF or Image) to upload"}
                  </span>
                </button>
                {leaveFile && (
                  <button
                    type="button"
                    onClick={() => setLeaveFile(null)}
                    className="text-[10px] text-rose-500 font-bold hover:underline mt-1 inline-block"
                  >
                    Remove selected file
                  </button>
                )}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Or paste external Google Drive link here..."
                    value={leaveAttachmentUrl}
                    onChange={(e) => setLeaveAttachmentUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#003087]"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave || !leaveReason.trim()}
                  className="px-5 py-2.5 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingLeave ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Submit Absence Reason ── */}
      {selectedAbsentItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedAbsentItem(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-auto max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#003087] p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-300" /> Explain Absence on {selectedAbsentItem.date}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Your reason will be delivered directly to your Class Incharge.
                </p>
              </div>
              <button
                onClick={() => setSelectedAbsentItem(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReason} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Absence Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
                >
                  <option value="Medical Illness / Fever">Medical Illness / Fever</option>
                  <option value="Hospitalization / Emergency">Hospitalization / Emergency</option>
                  <option value="Family Function / Emergency">Family Function / Emergency</option>
                  <option value="Transport / Bus Breakdown">Transport / Bus Breakdown</option>
                  <option value="Permitted Leave / Prior Permission">Permitted Leave / Prior Permission</option>
                  <option value="Other Genuine Reason">Other Genuine Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Detailed Reason &amp; Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="State the reason clearly (e.g., Suffered severe fever and visited doctor for consultation)..."
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#003087] resize-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Attach Medical Certificate / Doctor Prescription (Optional)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400">Max 5MB</span>
                </div>
                <input
                  ref={absentFileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => handleAbsentFileChange(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => absentFileInputRef.current?.click()}
                  className={`w-full py-3 px-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-bold ${
                    absentFile
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                      : "border-slate-300 bg-slate-50 text-slate-600 hover:border-[#003087]"
                  }`}
                >
                  {absentFile ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Upload className="w-4 h-4 text-slate-400" />}
                  <span className="truncate max-w-[280px]">
                    {absentFile ? absentFile.name : "Choose File (PDF or Image) to upload"}
                  </span>
                </button>
                {absentFile && (
                  <button
                    type="button"
                    onClick={() => setAbsentFile(null)}
                    className="text-[10px] text-rose-500 font-bold hover:underline mt-1 inline-block"
                  >
                    Remove selected file
                  </button>
                )}
                <div className="mt-2">
                  <input
                    type="url"
                    placeholder="Or paste external Google Drive link here..."
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-[#003087]"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm pt-3 pb-1 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedAbsentItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingReason || !reasonText.trim()}
                  className="px-5 py-2.5 bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {submittingReason ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Submit to Class Incharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
