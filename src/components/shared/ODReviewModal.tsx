"use client"
import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, Eye, Loader2, FileText, Download } from "lucide-react"
import { ODStatus } from "@/lib/odStatus"
import { formatDate } from "@/lib/dateUtils"

interface ODReviewModalProps {
  od: any
  role: "faculty" | "hod"
  onClose: () => void
  onApprove: (id: string, reason?: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

// Base terminal statuses that are terminal for EVERYONE
const BASE_TERMINAL_STATUSES = [
  ODStatus.APPROVED, ODStatus.REJECTED_HOD, ODStatus.COMPLETED,
  ODStatus.REVOKED, ODStatus.PENDING_PROOF, ODStatus.PROOF_REJECTED_FACULTY, ODStatus.PROOF_REJECTED_HOD
]

export function ODReviewModal({ od, role, onClose, onApprove, onReject }: ODReviewModalProps) {
  const [remarks, setRemarks] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeDoc, setActiveDoc] = useState<"upfront" | "draft" | "postOD">("upfront")

  const hasUpfront = !!od.signedLetterUrl
  const hasDraft   = !!od.pdfUrl || !!od.finalPdfUrl
  const hasPostOD  = !!od.postODProofsUrl

  // On open: pick best default tab
  useEffect(() => {
    if (hasUpfront) setActiveDoc("upfront")
    else if (hasDraft) setActiveDoc("draft")
    else if (hasPostOD) setActiveDoc("postOD")
  }, [od.id])

  const isTerminal = BASE_TERMINAL_STATUSES.includes(od.status as ODStatus) || 
    (role === "faculty" && [ODStatus.PENDING_HOD, ODStatus.PROOF_PENDING_HOD].includes(od.status as ODStatus)) ||
    (role === "hod" && [ODStatus.PENDING_FACULTY, ODStatus.PROOF_PENDING_FACULTY].includes(od.status as ODStatus))
    
  const isPostOD   = od.status === ODStatus.PROOF_PENDING_FACULTY || od.status === ODStatus.PROOF_PENDING_HOD
  const dateStr    = od.startDate !== od.endDate
    ? `${formatDate(od.startDate)} to ${formatDate(od.endDate)}`
    : formatDate(od.startDate)

  // Resolve roll number — API may return rollNumber or studentRollNo
  const rollNo = od.rollNumber || od.studentRollNo || "—"
  const classId = od.classId || (od.year ? `${od.year}-${od.section || ''}` : "—")

  // Resolve iframe src
  const draftSrc = od.finalPdfUrl || od.pdfUrl
  let iframeSrc = ""
  if (activeDoc === "upfront" && hasUpfront) iframeSrc = od.signedLetterUrl
  else if (activeDoc === "draft" && draftSrc)  iframeSrc = draftSrc
  else if (activeDoc === "postOD" && hasPostOD) iframeSrc = od.postODProofsUrl

  // Normalise Google Drive links to embed format
  if (iframeSrc?.includes("drive.google.com/file/d/")) {
    iframeSrc = iframeSrc.replace(/\/view.*$/, "/preview")
  }

  const handleAction = async (actionType: "approve" | "reject") => {
    setError("")
    if (actionType === "reject" && !remarks.trim()) {
      setError("Please provide a reason for rejection.")
      return
    }
    setActionLoading(true)
    try {
      if (actionType === "approve") await onApprove(od.id, remarks)
      else await onReject(od.id, remarks)
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to process request.")
      setActionLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl flex flex-col my-auto" style={{ maxHeight: "90vh" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#003087]" /> OD Request Review
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Ref: {od.referenceNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden" style={{ minHeight: 520 }}>

          {/* Left: Details + Actions */}
          <div className="w-full lg:w-[42%] flex flex-col border-r border-slate-200 overflow-y-auto">
            <div className="p-6 space-y-5 flex-1">

              {/* Student + Event */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Student</h3>
                  <p className="text-sm font-bold text-slate-800">{od.studentName}</p>
                  <p className="text-xs font-mono text-slate-500 mt-1">Roll: {rollNo}</p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">Class: {classId}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{od.department || ""}</p>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Event</h3>
                  <p className="text-sm font-bold text-slate-800">{od.eventName}</p>
                  <p className="text-xs text-slate-600 mt-1">{od.eventType}</p>
                  <p className="text-xs text-slate-600 mt-0.5">Org: {od.organiser}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{dateStr}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reason Provided</h3>
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm text-slate-700 italic">{od.reason}</div>
              </div>

              {/* Post-OD description */}
              {isPostOD && od.postODDescription && (
                <div>
                  <h3 className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1.5">Post-OD Description</h3>
                  <div className="bg-purple-50 p-3 rounded border border-purple-100 text-sm text-purple-900 italic">{od.postODDescription}</div>
                </div>
              )}

              {/* Already-terminal notice */}
              {isTerminal && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs font-bold text-amber-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 shrink-0" />
                  This OD is already in a terminal state ({od.status.replace(/_/g, " ")}). View-only mode.
                </div>
              )}

              {/* Remarks + Actions — only for actionable states */}
              {!isTerminal && (
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Review Remarks (Optional)</h3>
                  <textarea
                    className="w-full bg-white border border-slate-300 rounded p-3 text-sm focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087] transition-all"
                    rows={3}
                    placeholder={`Add remarks before approving/rejecting as ${role.toUpperCase()}...`}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  {error && <p className="text-xs text-red-500 font-bold mt-2">{error}</p>}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isTerminal && (
              <div className="p-5 bg-slate-50 border-t border-slate-200 shrink-0 flex gap-3">
                <button
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-white text-rose-600 font-bold text-sm rounded border border-rose-200 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Reject
                </button>
                <button
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Approve OD
                </button>
              </div>
            )}
          </div>

          {/* Right: Document Viewer */}
          <div className="w-full lg:w-[58%] bg-slate-100 flex flex-col">
            {/* Tab bar */}
            <div className="px-4 py-2.5 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto shrink-0 flex-wrap">
              {hasUpfront && (
                <button
                  onClick={() => setActiveDoc("upfront")}
                  className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${activeDoc === "upfront" ? "bg-[#003087] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  Attached Proof
                </button>
              )}
              {hasDraft && (
                <button
                  onClick={() => setActiveDoc("draft")}
                  className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors ${activeDoc === "draft" ? "bg-[#003087] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {od.finalPdfUrl ? "Approved OD PDF" : "Draft OD PDF"}
                </button>
              )}
              {hasPostOD && (
                <button
                  onClick={() => setActiveDoc("postOD")}
                  className={`px-3 py-1.5 rounded text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${activeDoc === "postOD" ? "bg-purple-600 text-white" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
                >
                  <Eye className="w-3 h-3" /> Post-Event Proof
                </button>
              )}
              {iframeSrc && (
                <a href={iframeSrc} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#003087]">
                  <Download className="w-3 h-3" /> Download
                </a>
              )}
            </div>

            {/* Iframe viewer */}
            <div className="flex-1 bg-slate-200 p-4 flex items-stretch min-h-[400px]">
              {iframeSrc ? (
                <iframe
                  key={iframeSrc}
                  src={iframeSrc}
                  className="w-full h-full rounded shadow-sm bg-white border-0 min-h-[400px]"
                  allow="autoplay"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 mb-2 opacity-40" />
                  <p className="text-sm font-bold">No document available.</p>
                  <p className="text-xs mt-1 opacity-70">The student has not uploaded any document yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
