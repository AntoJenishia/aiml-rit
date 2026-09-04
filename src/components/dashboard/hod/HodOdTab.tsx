"use client"
import { ODStatus } from "@/lib/odStatus"
import { useState, useEffect } from "react"
import { FileText, Search, Loader2 } from "lucide-react"
import { ODLedgerTable } from "@/components/shared/ODLedgerTable"
import { ODReviewModal } from "@/components/shared/ODReviewModal"

interface ODRequest {
  id: string
  studentName: string
  studentEmail: string
  rollNumber: string
  department: string
  batch: string
  classId: string
  referenceNumber: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  status: string
  pdfUrl?: string
  signedLetterUrl?: string
  postODProofsUrl?: string
  postODDescription?: string
  hodRemarks?: string
}

export default function HodOdTab({ departmentFilter }: { departmentFilter: "ALL" | "AIML" | "AIDS" }) {
  const [ods, setOds] = useState<ODRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const [selectedOD, setSelectedOD] = useState<ODRequest | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [remarks, setRemarks] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchODs()
  }, [])

  const fetchODs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/od")
      if (!res.ok) throw new Error("Failed to fetch OD requests")
      const data = await res.json()
      setOds(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (odId: string, action: "approve" | "reject", remarksStr?: string) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/od", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odId, action, remarks: remarksStr })
      })
      if (!res.ok) throw new Error(`Failed to ${action} OD`)
      await fetchODs()
      setSelectedOD(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredODs = ods.filter(od => {
    const dept = (od.department || "").toLowerCase()
    const matchesDept = departmentFilter === "ALL"
      || od.department === departmentFilter
      || (departmentFilter === "AIML" && (dept === "aiml" || dept.includes("machine learning")))
      || (departmentFilter === "AIDS" && (dept === "aids" || dept.includes("data science")))
    const q = searchQuery.toLowerCase()
    const roll = String((od as any).registerNumber || od.rollNumber || "")
    const matchesSearch = !q || (
      (od.studentName || "").toLowerCase().includes(q) ||
      roll.toLowerCase().includes(q) ||
      (od.referenceNumber || "").toLowerCase().includes(q) ||
      (od.eventName || "").toLowerCase().includes(q)
    )
    return matchesDept && matchesSearch
  })

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#003087]" /></div>
  if (error) return <div className="p-6 bg-rose-50 text-rose-600 rounded-md border border-rose-200 font-bold">{error}</div>

  return (
    <>
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by student, roll no, event, or ref..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-[#003087] bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="text-sm font-bold text-slate-500">
          Total Records: <span className="text-[#0A192F]">{filteredODs.length}</span>
        </div>
      </div>

      {/* OD Table */}
      <ODLedgerTable 
        ods={filteredODs}
        role="hod"
        onReview={od => setSelectedOD(od)}
      />
    </div>

    {/* OD Review Modal */}
    {selectedOD && (
      <ODReviewModal 
        od={selectedOD}
        role="hod"
        onClose={() => setSelectedOD(null)}
        onApprove={(id, reason) => handleAction(id, "approve", reason)}
        onReject={(id, reason) => handleAction(id, "reject", reason)}
      />
    )}
    </>
  )
}
