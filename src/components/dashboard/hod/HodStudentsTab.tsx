"use client"
import { useState, useEffect } from "react"
import { Users, UserPlus, Upload, Search, Mail, Phone, Loader2, GraduationCap, Edit, CheckCircle } from "lucide-react"

interface StudentUser {
  uid: string
  name: string
  email: string
  department: string
  batch: string
  currentYear: string
  rollNumber: string
  registerNumber: string
  phone: string
  classId: string
  profileComplete: boolean
}

export default function HodStudentsTab({ departmentFilter }: { departmentFilter: string }) {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [batchFilter, setBatchFilter] = useState("ALL")

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data = await res.json()
        setStudents(data)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  // Filter based on Department, Batch, and Text Search
  const filteredStudents = students.filter(s => {
    const matchesDept = departmentFilter === "ALL" 
      ? true 
      : (s.department || "").toLowerCase().includes(departmentFilter.toLowerCase() === "aids" ? "data science" : departmentFilter.toLowerCase())
    
    const matchesBatch = batchFilter === "ALL" ? true : s.batch === batchFilter

    const searchLower = search.toLowerCase()
    const matchesSearch = 
      (s.name || "").toLowerCase().includes(searchLower) || 
      (s.email || "").toLowerCase().includes(searchLower) ||
      (s.rollNumber || "").toLowerCase().includes(searchLower) ||
      (s.registerNumber || "").toLowerCase().includes(searchLower)
    
    return matchesDept && matchesBatch && matchesSearch
  })

  // Extract unique batches for the filter dropdown
  const uniqueBatches = Array.from(new Set(students.map(s => s.batch).filter(Boolean))).sort().reverse()

  return (
    <div className="space-y-6">
      {/* ── Toolbar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, roll no, or register no..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
            />
          </div>
          
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-slate-700 focus:outline-none shadow-sm"
          >
            <option value="ALL">All Batches</option>
            {uniqueBatches.map(b => <option key={b} value={b}>{b} Batch</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4" /> Import CSV
          </button>
        </div>
      </div>

      {/* ── Students List ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><GraduationCap className="w-8 h-8" /></div>
            <h3 className="text-lg font-black text-slate-800">No Students Found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">No students match your current filters. Try adjusting the search, batch, or department filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  <th className="px-4 py-3">Student Profile</th>
                  <th className="px-4 py-3">Identifiers</th>
                  <th className="px-4 py-3">Academic Details</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredStudents.map(s => (
                  <tr key={s.uid} className="hover:bg-slate-100 even:bg-slate-50 transition-colors group">
                    <td className="px-4 py-2.5 border-r border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm border border-slate-200">
                          {s.name?.[0] || "S"}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{s.name || "Unknown Name"}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono text-slate-700"><span className="text-slate-400 font-sans text-[10px] uppercase tracking-widest">Roll:</span> {s.rollNumber || "—"}</div>
                        <div className="text-xs font-mono text-slate-700"><span className="text-slate-400 font-sans text-[10px] uppercase tracking-widest">Reg:</span> {s.registerNumber || "—"}</div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-800 text-xs">{s.classId ? s.classId.toUpperCase() : (s.department || "N/A")}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">Batch {s.batch || "Unknown"}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      {s.profileComplete ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Active
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Incomplete Profile</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5">
                        <Edit className="w-3 h-3 text-slate-400" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
