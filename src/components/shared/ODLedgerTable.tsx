"use client"
import { Calendar, FileText, ExternalLink, Download, Eye, Upload } from "lucide-react"
import { ODStatus } from "@/lib/odStatus"
import { OD_STATUS_LABELS, OD_STATUS_STYLES } from "@/lib/odStatus"
import { formatStudentClass, formatStudentRoll } from "@/lib/studentIdentity"

export interface ODLedgerTableProps {
  ods: any[]
  role: "student" | "faculty" | "hod"
  onPreviewDocument?: (url: string) => void
  onUploadProof?: (od: any) => void
  onReapply?: (od: any) => void
  onReview?: (od: any) => void
}

// Short label override for pill badges — keeps them compact
const STATUS_SHORT: Partial<Record<ODStatus, string>> = {
  [ODStatus.PENDING_FACULTY]:        "Pending Faculty",
  [ODStatus.REJECTED_FACULTY]:       "Rejected by Faculty",
  [ODStatus.PENDING_HOD]:            "Pending HOD",
  [ODStatus.REJECTED_HOD]:           "Rejected by HOD",
  [ODStatus.APPROVED]:               "Approved",
  [ODStatus.PENDING_PROOF]:          "Proof Required",
  [ODStatus.PROOF_PENDING_FACULTY]:  "Proof — Faculty Review",
  [ODStatus.PROOF_REJECTED_FACULTY]: "Proof Rejected (Faculty)",
  [ODStatus.PROOF_PENDING_HOD]:      "Proof — HOD Review",
  [ODStatus.PROOF_REJECTED_HOD]:     "Proof Rejected (HOD)",
  [ODStatus.COMPLETED]:              "Completed",
  [ODStatus.REVOKED]:                "Revoked",
}

export function ODLedgerTable({ ods, role, onPreviewDocument, onUploadProof, onReapply, onReview }: ODLedgerTableProps) {

  if (ods.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <div className="bg-[#003087] px-4 py-2.5 border-b border-[#002266]">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            On-Duty Requests Master Ledger
          </h3>
        </div>
        <div className="p-10 text-center text-slate-400 text-sm font-bold">
          No OD requests found.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
      <div className="bg-[#003087] px-4 py-2.5 border-b border-[#002266]">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-500" />
          On-Duty Requests Master Ledger
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase tracking-widest font-bold text-slate-500">
              <th className="px-4 py-3">OD Reference ID</th>
              <th className="px-4 py-3">Event Details</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Status</th>
              {role === "student" && <th className="px-4 py-3">Proof Stage</th>}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {ods.map(od => {
              const sc = OD_STATUS_STYLES[od.status as ODStatus] || { color: "text-[#6B7280]", bg: "bg-slate-100", border: "border-slate-200" }
              const shortLabel = STATUS_SHORT[od.status as ODStatus] || od.status.replace(/_/g, " ")
              const roll = formatStudentRoll(od)
              const klass = formatStudentClass(od)

              return (
                <tr key={od.id} className="hover:bg-slate-50 transition-colors">
                  {/* Col 1: OD Reference + Student */}
                  <td className="px-4 py-3 border-r border-slate-100 align-top min-w-[160px]">
                    <div className="font-mono text-xs font-bold text-[#003087]">{od.referenceNumber}</div>
                    {(role === "faculty" || role === "hod") && (
                      <>
                        <div className="font-semibold text-slate-800 text-sm mt-0.5">{od.studentName}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {klass !== "Not set" ? `${roll} · ${klass}` : roll}
                        </div>
                      </>
                    )}
                  </td>

                  {/* Col 2: Event Details */}
                  <td className="px-4 py-3 border-r border-slate-100 align-top">
                    <div className="font-bold text-slate-800 text-xs">{od.eventName}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{od.eventType}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]" title={od.organiser}>{od.organiser}</div>
                  </td>

                  {/* Col 3: Duration */}
                  <td className="px-4 py-3 border-r border-slate-100 align-top whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      {new Date(od.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    {od.startDate !== od.endDate && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono mt-1">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        {new Date(od.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    )}
                  </td>

                  {/* Col 4: Status */}
                  <td className="px-4 py-3 border-r border-slate-100 align-top min-w-[140px]">
                    {/* Primary status pill — rounded-full as per reference UI */}
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${sc.bg} ${sc.color}`}>
                      {shortLabel}
                    </span>
                  </td>

                  {/* Col 4.5: Proof Stage (Student Only) */}
                  {role === "student" && (
                    <td className="px-4 py-3 border-r border-slate-100 align-top min-w-[180px]">
                      <div className="flex flex-col gap-1.5 items-start">
                        {od.signedLetterUrl && !od.postODProofsUrl && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#16A34A] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Upfront Proof: Uploaded ✓
                          </span>
                        )}
                        {od.postODProofsUrl && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Post-Event Proof: Uploaded ✓
                          </span>
                        )}
                        {od.status === ODStatus.APPROVED
                          && od.eventType !== "Meeting"
                          && od.eventType !== "Official Department Work"
                          && !od.postODProofsUrl && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            Post-Event Proof: Required
                          </span>
                        )}
                        {!od.signedLetterUrl && !od.postODProofsUrl && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                            No Proof Uploaded
                          </span>
                        )}
                      </div>
                    </td>
                  )}

                  {/* Col 5: Actions */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-end gap-1.5">
                      {/* Verify — always */}
                      <a
                        href={`/verify/${od.referenceNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-slate-200 hover:text-[#003087] transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" /> Verify
                      </a>

                      {/* Faculty / HOD: Review button (always visible) */}
                      {(role === "faculty" || role === "hod") && onReview && (
                        <button
                          onClick={() => onReview(od)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#003087]/30 text-[#003087] rounded text-[10px] font-bold hover:bg-blue-50 transition-colors shadow-sm"
                        >
                          <Eye className="w-3 h-3" /> Review
                        </button>
                      )}

                      {/* Student-specific document previews */}
                      {role === "student" && onPreviewDocument && (
                        <div className="flex flex-wrap gap-1 justify-end mt-0.5">
                          {od.pdfUrl && !od.finalPdfUrl && (
                            <button onClick={() => onPreviewDocument(od.pdfUrl!)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-blue-700 hover:bg-blue-100 transition-colors">
                              <FileText className="h-3 w-3" /> Draft
                            </button>
                          )}
                          {od.finalPdfUrl && (
                            <button onClick={() => onPreviewDocument(od.finalPdfUrl!)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-[9px] font-bold text-green-700 hover:bg-green-100 transition-colors">
                              <Download className="h-3 w-3" /> Final OD
                            </button>
                          )}
                          {od.signedLetterUrl && !od.postODProofsUrl && (
                            <button onClick={() => onPreviewDocument(od.signedLetterUrl!)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                              <FileText className="h-3 w-3" /> Upfront Proof
                            </button>
                          )}
                          {od.postODProofsUrl && (
                            <button onClick={() => onPreviewDocument(od.postODProofsUrl!)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-[9px] font-bold text-purple-700 hover:bg-purple-100 transition-colors">
                              <FileText className="h-3 w-3" /> Post-Proof
                            </button>
                          )}
                        </div>
                      )}

                      {/* Student-specific action buttons */}
                      {role === "student" && (
                        <>
                          {(od.status === ODStatus.REJECTED_FACULTY || od.status === ODStatus.REJECTED_HOD) && onReapply && !od.postODProofsUrl && (
                            <button onClick={() => onReapply(od)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-50 text-[10px] font-bold text-red-700 hover:bg-red-100 transition-colors">
                              Edit &amp; Re-Apply
                            </button>
                          )}
                          {(od.status === ODStatus.PROOF_REJECTED_FACULTY || od.status === ODStatus.PROOF_REJECTED_HOD) && onUploadProof && (
                            <button onClick={() => onUploadProof(od)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-[10px] font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                              Upload Proof Again
                            </button>
                          )}
                          {od.status === ODStatus.APPROVED
                            && od.eventType !== "Meeting"
                            && od.eventType !== "Official Department Work"
                            && !od.postODProofsUrl
                            && onUploadProof && (
                            <button onClick={() => onUploadProof(od)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-50 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors">
                              <Upload className="w-3 h-3" /> Upload Proof Now
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
