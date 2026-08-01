import { adminDb } from "@/lib/firebaseAdmin"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, XCircle, AlertTriangle, ArrowLeft } from "lucide-react"

interface ODData {
  referenceNumber: string
  studentName?: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  status: string
  createdAt?: { _seconds: number }
  facultyRespondedAt?: { _seconds: number }
  hodRespondedAt?: { _seconds: number }
  facultyRejectReason?: string
  hodRejectReason?: string
  finalPdfUrl?: string
  pdfUrl?: string
}

function formatTs(ts?: { _seconds: number }) {
  if (!ts) return null
  return new Date(ts._seconds * 1000).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  pending_faculty:  { label: "Pending Faculty Approval", color: "text-[#6B7280]", bg: "bg-[#F5F6FA]",         border: "border-[#E5E7EB]",  icon: Clock },
  rejected_faculty: { label: "Rejected by Faculty",      color: "text-[#EF4444]", bg: "bg-red-50",            border: "border-[#EF4444]",  icon: XCircle },
  pending_hod:      { label: "Pending HOD Approval",     color: "text-[#3B5BFF]", bg: "bg-blue-50",           border: "border-[#3B5BFF]",  icon: Clock },
  rejected_hod:     { label: "Rejected by HOD",          color: "text-[#EF4444]", bg: "bg-red-50",            border: "border-[#EF4444]",  icon: XCircle },
  approved:         { label: "Fully Approved",            color: "text-[#16A34A]", bg: "bg-green-50",          border: "border-[#16A34A]",  icon: CheckCircle },
  completed:        { label: "Completed",                 color: "text-[#16A34A]", bg: "bg-green-50",          border: "border-[#16A34A]",  icon: CheckCircle },
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ referenceNumber: string }>
}) {
  const { referenceNumber } = await params

  // Lookup by referenceNumber
  const snap = await adminDb.collection("odRequests")
    .where("referenceNumber", "==", referenceNumber)
    .limit(1)
    .get()

  if (snap.empty) notFound()

  const raw = snap.docs[0].data() as ODData
  const od: ODData = { ...raw, referenceNumber }

  const sc = STATUS_CONFIG[od.status] || STATUS_CONFIG.pending_faculty
  const StatusIcon = sc.icon

  const isFinalApproved = od.status === "approved" || od.status === "completed"

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col">
      {/* Top bar */}
      <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-0.5">
            AIML Department Portal — Rajalakshmi Institute of Technology
          </p>
          <h1 className="text-white text-lg font-black">OD Verification</h1>
        </div>
        <Link href="/"
          className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-semibold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-2xl space-y-4">

          {/* Ref + status card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="bg-[#0f172a] px-6 py-5">
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Reference Number</p>
              <p className="text-white text-2xl font-black tracking-wide font-mono">{od.referenceNumber}</p>
            </div>
            <div className={`px-6 py-4 flex items-center gap-3 ${sc.bg} border-b ${sc.border}`}>
              <StatusIcon className={`h-5 w-5 ${sc.color}`} />
              <span className={`text-sm font-bold ${sc.color}`}>{sc.label}</span>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Student</p>
                <p className="font-semibold text-[#111827]">{od.studentName || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Event Type</p>
                <p className="font-semibold text-[#111827]">{od.eventType}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Event Name</p>
                <p className="font-semibold text-[#111827]">{od.eventName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Organiser</p>
                <p className="font-semibold text-[#111827]">{od.organiser}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Venue</p>
                <p className="font-semibold text-[#111827]">{od.venue}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">Date(s)</p>
                <p className="font-semibold text-[#111827]">
                  {od.startDate === od.endDate ? od.startDate : `${od.startDate} → ${od.endDate}`}
                </p>
              </div>
            </div>
          </div>

          {/* Approval timeline */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm px-6 py-5">
            <h2 className="text-sm font-bold text-[#111827] mb-5">Approval Timeline</h2>

            {/* Step 1: Submitted */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-[#16A34A] flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="w-0.5 bg-[#E5E7EB] flex-1 my-1" />
              </div>
              <div className="pb-6">
                <p className="text-sm font-bold text-[#111827]">Submitted</p>
                <p className="text-xs text-[#6B7280]">{formatTs(od.createdAt as any) || "—"}</p>
              </div>
            </div>

            {/* Step 2: Faculty */}
            {(() => {
              const facApproved = ["pending_hod", "approved", "completed"].includes(od.status)
              const facRejected = od.status === "rejected_faculty"
              const pending     = !facApproved && !facRejected
              const Icon = facApproved ? CheckCircle : facRejected ? XCircle : Clock
              const dotColor = facApproved ? "bg-[#16A34A]" : facRejected ? "bg-[#EF4444]" : "bg-[#E5E7EB]"
              return (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full ${dotColor} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${pending ? "text-[#94A3B8]" : "text-white"}`} />
                    </div>
                    <div className="w-0.5 bg-[#E5E7EB] flex-1 my-1" />
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-bold text-[#111827]">Faculty Review</p>
                    {facApproved && <p className="text-xs text-[#16A34A] font-semibold">Approved · {formatTs(od.facultyRespondedAt as any)}</p>}
                    {facRejected && (
                      <>
                        <p className="text-xs text-[#EF4444] font-semibold">Rejected · {formatTs(od.facultyRespondedAt as any)}</p>
                        {od.facultyRejectReason && <p className="text-xs text-[#6B7280] mt-1 italic">"{od.facultyRejectReason}"</p>}
                      </>
                    )}
                    {pending && <p className="text-xs text-[#94A3B8]">Awaiting faculty action</p>}
                  </div>
                </div>
              )
            })()}

            {/* Step 3: HOD */}
            {(() => {
              const hodApproved = ["approved", "completed"].includes(od.status)
              const hodRejected = od.status === "rejected_hod"
              const pending     = !hodApproved && !hodRejected
              const Icon = hodApproved ? CheckCircle : hodRejected ? XCircle : Clock
              const dotColor = hodApproved ? "bg-[#16A34A]" : hodRejected ? "bg-[#EF4444]" : "bg-[#E5E7EB]"
              return (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-8 w-8 rounded-full ${dotColor} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${pending ? "text-[#94A3B8]" : "text-white"}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111827]">HOD Final Approval</p>
                    {hodApproved && <p className="text-xs text-[#16A34A] font-semibold">Approved · {formatTs(od.hodRespondedAt as any)}</p>}
                    {hodRejected && (
                      <>
                        <p className="text-xs text-[#EF4444] font-semibold">Rejected · {formatTs(od.hodRespondedAt as any)}</p>
                        {od.hodRejectReason && <p className="text-xs text-[#6B7280] mt-1 italic">"{od.hodRejectReason}"</p>}
                      </>
                    )}
                    {pending && <p className="text-xs text-[#94A3B8]">Awaiting HOD action</p>}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Download final PDF if approved */}
          {isFinalApproved && od.finalPdfUrl && (
            <a href={od.finalPdfUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#16A34A] text-white rounded-2xl font-bold text-sm hover:bg-[#15803d] transition-all">
              <CheckCircle className="h-4 w-4" />
              Download Approved OD Letter (PDF)
            </a>
          )}

          <p className="text-center text-[10px] text-[#94A3B8]">
            This page is publicly accessible — scan the QR code on the printed letter to verify its authenticity.
          </p>
        </div>
      </div>
    </div>
  )
}
