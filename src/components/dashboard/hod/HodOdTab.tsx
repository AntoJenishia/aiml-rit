"use client"
import { useState, useEffect } from "react"
import { FileText, CheckCircle, XCircle, Search, Loader2, Calendar, MapPin, Building2, User, Eye, Edit } from "lucide-react"

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
  signedLetterUrl?: string
  driveFolderUrl?: string
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

  const handleAction = async (odId: string, action: "approve" | "reject") => {
    if (!confirm(`Are you sure you want to ${action} this OD?`)) return
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/od", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ odId, action, remarks })
      })
      if (!res.ok) throw new Error(`Failed to ${action} OD`)
      await fetchODs()
      setSelectedOD(null)
      setRemarks("")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FACULTY_VERIFICATION": return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending Faculty</span>
      case "HOD_APPROVAL": return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Pending HOD</span>
      case "HOD_APPROVED": return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Approved</span>
      case "HOD_REJECTED": return <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Rejected</span>
      default: return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{status.replace("_", " ")}</span>
    }
  }

  const getEmbedUrl = (url: string) => {
    if (!url) return ""
    if (url.includes("drive.google.com/file/d/")) {
      return url.replace(/\/view.*$/, "/preview")
    }
    return url
  }

  const filteredODs = ods.filter(od => {
    const matchesDept = departmentFilter === "ALL" || od.department === departmentFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || (
      od.studentName.toLowerCase().includes(q) ||
      od.rollNumber.toLowerCase().includes(q) ||
      od.referenceNumber.toLowerCase().includes(q) ||
      od.eventName.toLowerCase().includes(q)
    )
    return matchesDept && matchesSearch
  })

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#003087]" /></div>
  if (error) return <div className="p-6 bg-rose-50 text-rose-600 rounded-md border border-rose-200 font-bold">{error}</div>

  return (
    <div className="space-y-6">
      {/* OD Action Modal */}
      {selectedOD && (
        <div className="fixed inset-0 bg-[#0A192F]/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between border-b border-[#002266]">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                OD Request Review
              </h2>
              <button onClick={() => setSelectedOD(null)} className="text-blue-200 hover:text-white transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Student Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800">{selectedOD.studentName}</p>
                    <p className="text-xs text-slate-600 font-mono">Roll: {selectedOD.rollNumber}</p>
                    <p className="text-xs text-slate-600">Class: {selectedOD.classId}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Event Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800">{selectedOD.eventName}</p>
                    <p className="text-xs text-slate-600">Type: {selectedOD.eventType}</p>
                    <p className="text-xs text-slate-600">Org: {selectedOD.organiser}</p>
                    <p className="text-xs text-slate-600 font-mono">{new Date(selectedOD.startDate).toLocaleDateString()} to {new Date(selectedOD.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Reason provided</h3>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">{selectedOD.reason}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Attached Proof</h3>
                  {selectedOD.signedLetterUrl && (
                    <a href={selectedOD.signedLetterUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                      <Eye className="w-3 h-3" /> Open in New Tab
                    </a>
                  )}
                </div>
                {selectedOD.signedLetterUrl ? (
                  <div className="mt-2 border border-slate-200 rounded overflow-hidden bg-slate-50 flex flex-col relative group">
                    <iframe src={getEmbedUrl(selectedOD.signedLetterUrl)} className="w-full h-80 sm:h-[500px]" title="Document Proof" allow="autoplay" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded border border-slate-200 text-center">No document attached.</p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">HOD Remarks (Optional)</h3>
                <textarea 
                  className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:outline-none focus:border-[#003087]" 
                  rows={3} 
                  placeholder="Add remarks before approving/rejecting..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => handleAction(selectedOD.id, "reject")}
                disabled={actionLoading}
                className="px-6 py-2 bg-rose-50 text-rose-700 font-bold text-sm rounded hover:bg-rose-100 transition-colors border border-rose-200"
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>
              <button 
                onClick={() => handleAction(selectedOD.id, "approve")}
                disabled={actionLoading}
                className="px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded hover:bg-emerald-700 transition-colors shadow-sm"
              >
                {actionLoading ? "Processing..." : "Approve OD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Search & Actions Bar ── */}
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

      {/* ── OD Table ── */}
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
                <th className="px-4 py-3">Reference / Student</th>
                <th className="px-4 py-3">Event Details</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredODs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-sm font-bold">No OD requests found matching your filters.</td>
                </tr>
              ) : (
                filteredODs.map(od => (
                  <tr key={od.id} className="hover:bg-slate-100 even:bg-slate-50 transition-colors group">
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="font-mono text-xs font-bold text-[#003087] mb-0.5">{od.referenceNumber}</div>
                      <div className="font-bold text-slate-800 text-sm">{od.studentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{od.rollNumber} • {od.classId}</div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="font-bold text-slate-800 text-xs mb-0.5">{od.eventName}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{od.eventType}</div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono mb-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> {new Date(od.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" /> {new Date(od.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      {getStatusBadge(od.status)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button 
                        onClick={() => setSelectedOD(od)}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3 h-3 text-[#003087]" /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
