"use client"
import { useState, useEffect } from "react"
import { Users, UserPlus, Upload, FileSignature, CheckCircle, Search, Mail, Phone, Loader2, AlertCircle, X } from "lucide-react"

interface FacultyUser {
  uid: string
  name: string
  email: string
  department: string
  designation: string
  phone: string
  isClassIncharge: boolean
  classId: string | null
}

export default function HodStaffTab({ departmentFilter }: { departmentFilter: string }) {
  const [faculty, setFaculty] = useState<FacultyUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState<FacultyUser | null>(null)

  const fetchStaff = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/staff")
      if (res.ok) {
        const data = await res.json()
        setFaculty(data)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // Filter based on Department Switcher AND text search
  const filteredFaculty = faculty.filter(f => {
    const matchesDept = departmentFilter === "ALL" 
      ? true 
      : (f.department || "").toLowerCase().includes(departmentFilter.toLowerCase() === "aids" ? "data science" : departmentFilter.toLowerCase())
    
    const searchLower = search.toLowerCase()
    const matchesSearch = (f.name || "").toLowerCase().includes(searchLower) || (f.email || "").toLowerCase().includes(searchLower)
    
    return matchesDept && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search faculty by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4" /> Add Faculty
          </button>
        </div>
      </div>

      {/* ── Faculty List ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : filteredFaculty.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Users className="w-8 h-8" /></div>
            <h3 className="text-lg font-black text-slate-800">No Faculty Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">No faculty members match your current filters. Try adjusting the search or department filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <th className="px-4 py-3">Faculty Member</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Department & Role</th>
                  <th className="px-4 py-3">Class Incharge</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredFaculty.map(f => (
                  <tr key={f.uid} className="hover:bg-slate-100 even:bg-slate-50 transition-colors group">
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm border border-slate-200">
                          {f.name?.[0] || "F"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{f.name || "Unknown Name"}</div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{f.uid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600"><Mail className="w-3 h-3 text-slate-400" /> {f.email || "No email"}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-600"><Phone className="w-3 h-3 text-slate-400" /> {f.phone || "No phone"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-800 text-xs">{f.department || "N/A"}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">{f.designation || "Faculty"}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      {f.isClassIncharge ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> {f.classId}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => setShowAssignModal(f)} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
                        <FileSignature className="w-3 h-3 text-slate-400" /> Assign Class
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showAssignModal && (
        <AssignClassModal 
          faculty={showAssignModal} 
          onClose={() => setShowAssignModal(null)} 
          onSuccess={fetchStaff} 
        />
      )}
    </div>
  )
}

function AssignClassModal({ faculty, onClose, onSuccess }: { faculty: FacultyUser, onClose: () => void, onSuccess: () => void }) {
  const [selectedClass, setSelectedClass] = useState(faculty.classId ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const CLASSES = [
    { id: "ii-aiml-a-2025",  label: "II Year – AIML – A (2025–29)" },
    { id: "ii-aiml-b-2025",  label: "II Year – AIML – B (2025–29)" },
    { id: "ii-aiml-c-2025",  label: "II Year – AIML – C (2025–29)" },
    { id: "iii-aiml-a-2024", label: "III Year – AIML – A (2024–28)" },
    { id: "iii-aiml-b-2024", label: "III Year – AIML – B (2024–28)" },
    { id: "iii-aiml-c-2024", label: "III Year – AIML – C (2024–28)" },
    { id: "iv-aiml-a-2023",  label: "IV Year – AIML – A (2023–27)" },
  ]

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assignClass", uid: faculty.uid, classId: selectedClass || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update assignment.")
        return
      }
      onSuccess()
      onClose()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Assign Class Incharge</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{faculty.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-100 font-semibold"><AlertCircle className="w-4 h-4 shrink-0" /> {error}</div>}
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
            >
              <option value="">— Remove assignment (None) —</option>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Save Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
