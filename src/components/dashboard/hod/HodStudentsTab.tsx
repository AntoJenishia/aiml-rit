"use client"
import { useState, useEffect, useMemo } from "react"
import {
  Users, Search, Mail, Phone, Loader2, GraduationCap,
  CheckCircle, FileSpreadsheet, UserCheck, Edit3, X,
  Shield, Building2, ChevronRight, AlertCircle, RefreshCw
} from "lucide-react"
import ExcelImportModal from "@/components/admin/ExcelImportModal"

interface StudentUser {
  uid: string
  name: string
  email: string
  department: string
  batch: string
  section: string
  semester?: string | number
  currentYear: string
  rollNumber: string
  registerNumber: string
  phone: string
  classId: string
  classIncharge?: string
  staffCode?: string
  profile?: string
  gender?: string
  hosteler?: string
  profileComplete: boolean
}

interface StaffUser {
  uid: string
  name: string
  email: string
  department: string
  designation: string
  staffCode: string
  phone?: string
  gender?: string
  roomLocation?: string
  profile?: string
  role?: string
}

export default function HodStudentsTab({ departmentFilter }: { departmentFilter?: string } = {}) {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [faculty, setFaculty] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  
  // Batch & Section state
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("")
  
  // Modals state
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null)
  
  // Change Class Incharge modal state
  const [showInchargeModal, setShowInchargeModal] = useState(false)
  const [inchargeSearch, setInchargeSearch] = useState("")
  const [selectedStaffCode, setSelectedStaffCode] = useState<string>("")
  const [assigningIncharge, setAssigningIncharge] = useState(false)
  
  // Feedback toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // 1. Fetch Students
  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/students")
      if (res.ok) {
        const data: StudentUser[] = await res.json()
        setStudents(data)
      }
    } catch (err) {
      console.error("[HodStudentsTab] fetchStudents error:", err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch Faculty
  const fetchFaculty = async () => {
    try {
      const res = await fetch("/api/admin/staff")
      if (res.ok) {
        const data: StaffUser[] = await res.json()
        setFaculty(data)
      }
    } catch (err) {
      console.error("[HodStudentsTab] fetchFaculty error:", err)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchFaculty()
  }, [])

  // Batches calculation
  const uniqueBatches = useMemo(() => {
    const bSet = new Set<string>()
    students.forEach(s => {
      const dept = (s.department || "").toLowerCase()
      if (!dept.includes("aids") && !dept.includes("data science") && s.batch) {
        bSet.add(s.batch)
      }
    })
    return Array.from(bSet).sort().reverse()
  }, [students])

  // Set default batch once loaded
  useEffect(() => {
    if (!selectedBatch && uniqueBatches.length > 0) {
      setSelectedBatch(uniqueBatches[0])
    }
  }, [uniqueBatches, selectedBatch])

  // Sections calculation for selected batch
  const availableSections = useMemo(() => {
    if (!selectedBatch) return []
    const secSet = new Set<string>()
    students
      .filter(s => s.batch === selectedBatch)
      .forEach(s => {
        if (s.section) secSet.add(s.section.toUpperCase())
      })
    return Array.from(secSet).sort()
  }, [students, selectedBatch])

  // Auto-select first section when batch changes
  useEffect(() => {
    if (availableSections.length > 0) {
      if (!selectedSection || !availableSections.includes(selectedSection)) {
        setSelectedSection(availableSections[0])
      }
    } else {
      setSelectedSection("")
    }
  }, [availableSections, selectedSection])

  // Current Section Incharge info
  const currentSectionStudents = useMemo(() => {
    return students.filter(s => {
      if (s.batch !== selectedBatch) return false
      if (selectedSection && selectedSection !== "ALL" && s.section !== selectedSection) return false
      return true
    })
  }, [students, selectedBatch, selectedSection])

  const currentInchargeInfo = useMemo(() => {
    if (currentSectionStudents.length === 0) return null
    const firstWithIncharge = currentSectionStudents.find(s => s.classIncharge && s.classIncharge !== "—")
    const inchargeName = firstWithIncharge?.classIncharge || currentSectionStudents[0]?.classIncharge || "Not Assigned"
    const staffCode = firstWithIncharge?.staffCode || currentSectionStudents[0]?.staffCode || ""
    const classId = firstWithIncharge?.classId || currentSectionStudents[0]?.classId || ""
    
    // Find matching staff record for avatar/email
    const matchedStaff = faculty.find(f => f.staffCode?.toUpperCase() === staffCode?.toUpperCase())

    return {
      name: inchargeName,
      staffCode,
      classId,
      matchedStaff
    }
  }, [currentSectionStudents, faculty])

  // Filter students based on Batch, Section, and Search Query
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const dept = (s.department || "").toLowerCase()
      if (dept.includes("aids") || dept.includes("data science")) return false
      
      // Batch filter
      if (selectedBatch && s.batch !== selectedBatch) return false

      // Section filter
      if (selectedSection && selectedSection !== "ALL" && s.section !== selectedSection) return false

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim()
        const match =
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.registerNumber && s.registerNumber.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          (s.phone && s.phone.includes(q))
        if (!match) return false
      }

      return true
    })
  }, [students, selectedBatch, selectedSection, search])

  // Change Class Incharge Handler
  const handleAssignIncharge = async () => {
    if (!selectedBatch || !selectedSection || selectedSection === "ALL") {
      showToast("Please choose a specific batch and section first.", "error")
      return
    }

    if (!selectedStaffCode) {
      showToast("Please select a faculty member to assign as Class Incharge.", "error")
      return
    }

    setAssigningIncharge(true)
    try {
      const res = await fetch("/api/admin/class-incharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: selectedBatch,
          section: selectedSection,
          staffCode: selectedStaffCode
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update Class Incharge")
      }

      // Optimistically update students state
      const targetStaff = faculty.find(f => f.staffCode === selectedStaffCode)
      const staffName = targetStaff?.name || data.inchargeName

      setStudents(prev =>
        prev.map(s => {
          if (s.batch === selectedBatch && s.section === selectedSection) {
            return {
              ...s,
              staffCode: selectedStaffCode,
              classIncharge: staffName
            }
          }
          return s
        })
      )

      showToast(`Class Incharge updated to ${staffName} (${selectedStaffCode}) for Batch ${selectedBatch} Section ${selectedSection}!`, "success")
      setShowInchargeModal(false)
      setSelectedStaffCode("")
    } catch (err: any) {
      showToast(err.message || "Failed to update Class Incharge.", "error")
    } finally {
      setAssigningIncharge(false)
    }
  }

  // Filtered faculty list for incharge assignment modal
  const filteredFaculty = useMemo(() => {
    if (!inchargeSearch.trim()) return faculty
    const q = inchargeSearch.toLowerCase().trim()
    return faculty.filter(f =>
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.staffCode && f.staffCode.toLowerCase().includes(q)) ||
      (f.designation && f.designation.toLowerCase().includes(q))
    )
  }, [faculty, inchargeSearch])

  return (
    <div className="space-y-6">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-in fade-in duration-300 ${
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
        }`}>
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Top Bar: Title & Import Excel ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-800">Student Directory &amp; Class Management</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003087]">
              {students.length} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Select a Batch and Section below to inspect students and assign Class Incharge.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStudents()
              fetchFaculty()
            }}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
            title="Refresh Directory"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          </button>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" /> Import Students Excel
          </button>
        </div>
      </div>

      {/* ── Step 1: Batch Selection ── */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-[#003087] text-white text-xs font-black flex items-center justify-center">1</span>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Select Batch</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {uniqueBatches.length} Batches Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {uniqueBatches.map(b => {
            const count = students.filter(s => s.batch === b).length
            const isSelected = selectedBatch === b

            return (
              <button
                key={b}
                onClick={() => setSelectedBatch(b)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                  isSelected
                    ? "bg-[#003087] text-white border-[#003087] shadow-md ring-2 ring-[#003087]/20"
                    : "bg-slate-50/70 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div>
                  <p className={`text-base font-black ${isSelected ? "text-white" : "text-slate-800"}`}>
                    Batch {b}
                  </p>
                  <p className={`text-xs mt-0.5 ${isSelected ? "text-white/80" : "text-slate-500 font-medium"}`}>
                    Artificial Intelligence &amp; ML
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                }`}>
                  {count} Students
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Step 2: Section Selection & Class Incharge Control Card ── */}
      {selectedBatch && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-[#003087] text-white text-xs font-black flex items-center justify-center">2</span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Select Section for Batch {selectedBatch}
              </h3>
            </div>

            {/* Section Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              {availableSections.map(sec => {
                const count = students.filter(s => s.batch === selectedBatch && s.section === sec).length
                const isSelected = selectedSection === sec

                return (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-[#003087] text-white border-[#003087] shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>Section {sec}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}

              <button
                onClick={() => setSelectedSection("ALL")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
                  selectedSection === "ALL"
                    ? "bg-[#003087] text-white border-[#003087] shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <span>All Sections</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedSection === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                }`}>
                  {students.filter(s => s.batch === selectedBatch).length}
                </span>
              </button>
            </div>
          </div>

          {/* ── Class Incharge Management Banner ── */}
          {selectedSection && selectedSection !== "ALL" && currentInchargeInfo && (
            <div className="bg-gradient-to-r from-blue-50/70 via-slate-50 to-indigo-50/50 rounded-xl p-4 sm:p-5 border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-white border-2 border-blue-300 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                  {currentInchargeInfo.matchedStaff?.profile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentInchargeInfo.matchedStaff.profile}
                      alt={currentInchargeInfo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <UserCheck className="h-7 w-7 text-[#003087]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#003087] text-white px-2 py-0.5 rounded">
                      Class Incharge
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Batch {selectedBatch} · Section {selectedSection}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                    {currentInchargeInfo.name}
                  </h4>

                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 flex-wrap">
                    {currentInchargeInfo.staffCode && (
                      <span className="font-mono font-bold text-[#003087] bg-white border border-blue-200 px-2 py-0.5 rounded">
                        Staff Code: {currentInchargeInfo.staffCode}
                      </span>
                    )}
                    {currentInchargeInfo.classId && (
                      <span className="font-medium text-slate-500">
                        {currentInchargeInfo.classId}
                      </span>
                    )}
                    {currentInchargeInfo.matchedStaff?.email && (
                      <span className="text-slate-500">
                        {currentInchargeInfo.matchedStaff.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Change Incharge Button */}
              <button
                onClick={() => {
                  setSelectedStaffCode(currentInchargeInfo.staffCode || "")
                  setInchargeSearch("")
                  setShowInchargeModal(true)
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-blue-50 text-[#003087] border-2 border-[#003087] rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Edit3 className="h-4 w-4" /> Change Class Incharge
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Step 3: Student Directory List Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
        {/* Table Toolbar with Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-black text-slate-800">
              {selectedBatch ? `Batch ${selectedBatch}` : "Students"} 
              {selectedSection && selectedSection !== "ALL" ? ` · Section ${selectedSection}` : ""}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredStudents.length} of {currentSectionStudents.length} enrolled students
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, register no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#003087] focus:border-[#003087] shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No Students Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search ? "No students match your search criteria. Try a different query." : "No student records available for this section."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-5 py-3.5">Student Profile</th>
                  <th className="px-4 py-3.5">Register No</th>
                  <th className="px-4 py-3.5">Class / Section</th>
                  <th className="px-4 py-3.5">Mobile</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map(s => (
                  <tr
                    key={s.uid}
                    onClick={() => setSelectedStudent(s)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. Student Profile & Name */}
                    <td className="px-5 py-3 align-middle">
                      <div className="flex items-center gap-3">
                        {s.profile ? (
                          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={s.profile}
                              alt={s.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-[#003087] flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                            {s.name?.[0] || "S"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm leading-snug group-hover:text-[#003087] transition-colors">{s.name}</p>
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            {s.gender === "MALE" ? "Male" : s.gender === "FEMALE" ? "Female" : (s.gender || "Student")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Register No */}
                    <td className="px-4 py-3 align-middle">
                      <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap inline-block">
                        {s.registerNumber || "—"}
                      </span>
                    </td>

                    {/* 3. Class & Section */}
                    <td className="px-4 py-3 align-middle">
                      <div className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {s.classId || `Batch ${s.batch} - Sec ${s.section}`}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Incharge: {s.classIncharge || "—"}
                      </div>
                    </td>

                    {/* 4. Mobile / Contact (Email moved inside profile modal) */}
                    <td className="px-4 py-3 align-middle">
                      {s.phone ? (
                        <span className="text-xs font-mono font-medium text-slate-700 whitespace-nowrap">
                          {s.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    {/* 5. Action Button */}
                    <td className="px-5 py-3 align-middle text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStudent(s)
                        }}
                        className="px-3 py-1.5 bg-[#003087] text-white rounded-lg text-xs font-bold hover:bg-[#002266] transition-colors whitespace-nowrap shadow-sm active:scale-95 inline-block"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Change Class Incharge ── */}
      {showInchargeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowInchargeModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5" /> Assign Class Incharge
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Batch {selectedBatch} · Section {selectedSection}
                </p>
              </div>
              <button onClick={() => setShowInchargeModal(false)} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <p className="text-xs text-slate-600">
                Select a faculty member from the AIML department to assign as the official Class Incharge for all students in this section.
              </p>

              {/* Faculty Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty name, staff code, designation..."
                  value={inchargeSearch}
                  onChange={(e) => setInchargeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:border-[#003087] focus:ring-1 focus:ring-[#003087] outline-none"
                />
              </div>

              {/* Faculty Options List */}
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {filteredFaculty.map(f => {
                  const isSelected = selectedStaffCode === f.staffCode

                  return (
                    <div
                      key={f.uid}
                      onClick={() => setSelectedStaffCode(f.staffCode)}
                      className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50/80 border-l-4 border-[#003087]" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#003087] overflow-hidden shrink-0">
                          {f.profile ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.profile} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            f.name[0]
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">{f.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-mono font-bold text-[#003087] bg-blue-50 px-1.5 py-0.2 rounded">
                              {f.staffCode}
                            </span>
                            <span>{f.designation}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <input
                          type="radio"
                          name="inchargeSelection"
                          checked={isSelected}
                          onChange={() => setSelectedStaffCode(f.staffCode)}
                          className="h-4 w-4 text-[#003087] focus:ring-[#003087]"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowInchargeModal(false)}
                className="px-4 py-2 border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignIncharge}
                disabled={assigningIncharge || !selectedStaffCode}
                className="px-5 py-2 bg-[#003087] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#002266] transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {assigningIncharge ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Student Portfolio Detail View ── */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Student Profile
              </h3>
              <button onClick={() => setSelectedStudent(null)} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Header profile info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-slate-100 pb-5">
                <div className="h-24 w-24 rounded-full bg-slate-100 border-4 border-slate-50 shadow-md flex items-center justify-center text-3xl font-black text-[#003087] shrink-0 overflow-hidden">
                  {selectedStudent.profile ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedStudent.profile} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.name?.[0] || "S"
                  )}
                </div>

                <div className="text-center sm:text-left space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h4 className="text-xl font-black text-slate-900">{selectedStudent.name}</h4>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      String(selectedStudent.hosteler) === "1" || String(selectedStudent.hosteler).toLowerCase() === "hosteler"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}>
                      {String(selectedStudent.hosteler) === "1" || String(selectedStudent.hosteler).toLowerCase() === "hosteler" ? "Hosteller" : "Day Scholar"}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-slate-500">{selectedStudent.email}</p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                      Reg: {selectedStudent.registerNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                      Batch: {selectedStudent.batch}
                    </span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded">
                      Sec: {selectedStudent.section}
                    </span>
                  </div>
                </div>
              </div>

              {/* Complete details grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Official College Email</span>
                    <p className="font-semibold text-slate-800 break-all mt-0.5">{selectedStudent.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Mobile Phone</span>
                    <p className="font-semibold text-slate-800 font-mono mt-0.5">{selectedStudent.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Degree &amp; Program</span>
                    <p className="font-semibold text-slate-800 mt-0.5">B.E. CSE (Artificial Intelligence &amp; ML)</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Residential Status</span>
                    <p className="font-semibold mt-0.5 text-slate-800">
                      {String(selectedStudent.hosteler) === "1" || String(selectedStudent.hosteler).toLowerCase() === "hosteler" ? "Hosteller (Campus Hostel)" : "Day Scholar"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Class &amp; Section</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{selectedStudent.classId || `Batch ${selectedStudent.batch} - Section ${selectedStudent.section}`}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Class Incharge</span>
                    <p className="font-semibold text-[#003087] mt-0.5">
                      {selectedStudent.classIncharge || "—"} {selectedStudent.staffCode ? `(${selectedStudent.staffCode})` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Excel Import Modal ── */}
      <ExcelImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        type="students"
        onSuccess={() => {
          fetchStudents()
        }}
      />
    </div>
  )
}
