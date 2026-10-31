"use client"
import { useState, useEffect, useMemo } from "react"
import {
  FolderOpen, CalendarDays, Users, CheckCircle,
  AlertCircle, Loader2, Sparkles, UserCheck, Shield, ChevronRight,
  RefreshCw, X, ArrowRight, Layers, Edit3, Search
} from "lucide-react"

interface StudentUser {
  uid: string
  name: string
  email: string
  department: string
  batch: string
  section: string
  semester?: string | number
  classId: string
  classIncharge?: string
  staffCode?: string
  profile?: string
  gender?: string
  hosteler?: string
}

interface StaffUser {
  uid: string
  name: string
  email: string
  department: string
  designation: string
  staffCode: string
  profile?: string
}

interface BatchInfo {
  batch: string
  totalStudents: number
  currentSemester: number
  currentYear: string
  sections: {
    section: string
    count: number
    classId: string
    incharge: string
    staffCode?: string
  }[]
}

export default function HodBatchesTab() {
  const [students, setStudents] = useState<StudentUser[]>([])
  const [faculty, setFaculty] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  // Upgrade Modal State
  const [selectedBatchForUpgrade, setSelectedBatchForUpgrade] = useState<BatchInfo | null>(null)
  const [targetSemester, setTargetSemester] = useState<number>(1)
  const [targetSection, setTargetSection] = useState<string>("ALL")
  const [enableInchargeUpdateInModal, setEnableInchargeUpdateInModal] = useState(false)
  const [modalSectionIncharges, setModalSectionIncharges] = useState<Record<string, { staffCode: string; name: string }>>({})

  // Direct Change Incharge Modal State
  const [inchargeModalData, setInchargeModalData] = useState<{
    batch: string
    section: string
    currentIncharge: string
    currentStaffCode?: string
  } | null>(null)
  const [inchargeSearch, setInchargeSearch] = useState("")
  const [selectedStaffCode, setSelectedStaffCode] = useState("")
  const [savingIncharge, setSavingIncharge] = useState(false)

  // Toast State
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
      console.error("[HodBatchesTab] Error fetching students:", err)
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
      console.error("[HodBatchesTab] Error fetching faculty:", err)
    }
  }

  useEffect(() => {
    fetchStudents()
    fetchFaculty()
  }, [])

  // Aggregate student data into structured batches
  const batchesData = useMemo<BatchInfo[]>(() => {
    const map = new Map<string, StudentUser[]>()

    students.forEach((s) => {
      const dept = (s.department || "").toLowerCase()
      if (dept.includes("aids") || dept.includes("data science")) return
      if (!s.batch) return

      if (!map.has(s.batch)) {
        map.set(s.batch, [])
      }
      map.get(s.batch)!.push(s)
    })

    const result: BatchInfo[] = []

    map.forEach((bStudents, batchName) => {
      // Find representative semester
      let semNum = 1
      for (const s of bStudents) {
        if (s.semester) {
          const parsed = parseInt(String(s.semester), 10)
          if (!isNaN(parsed) && parsed > 0) {
            semNum = parsed
            break
          }
        }
      }

      // Calculate Year based on semester
      let yearName = "1st Year"
      if (semNum >= 7) yearName = "4th Year (Final Year)"
      else if (semNum >= 5) yearName = "3rd Year (Pre-final)"
      else if (semNum >= 3) yearName = "2nd Year"

      // Aggregate Sections
      const secMap = new Map<string, StudentUser[]>()
      bStudents.forEach((s) => {
        const sec = s.section ? s.section.toUpperCase() : "A"
        if (!secMap.has(sec)) secMap.set(sec, [])
        secMap.get(sec)!.push(s)
      })

      const sections = Array.from(secMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([sec, secStudents]) => {
          const firstIncharge = secStudents.find((s) => s.classIncharge && s.classIncharge !== "—")
          return {
            section: sec,
            count: secStudents.length,
            classId: secStudents[0]?.classId || `B.E. CSE (AI & ML) / ${semNum} / ${sec}`,
            incharge: firstIncharge?.classIncharge || secStudents[0]?.classIncharge || "Not Assigned",
            staffCode: firstIncharge?.staffCode || secStudents[0]?.staffCode,
          }
        })

      result.push({
        batch: batchName,
        totalStudents: bStudents.length,
        currentSemester: semNum,
        currentYear: yearName,
        sections,
      })
    })

    return result.sort((a, b) => b.batch.localeCompare(a.batch))
  }, [students])

  // Open upgrade modal
  const handleOpenUpgrade = (b: BatchInfo, customTarget?: number) => {
    setSelectedBatchForUpgrade(b)
    setTargetSection("ALL")
    const targetSem = customTarget !== undefined ? customTarget : Math.min(b.currentSemester + 1, 8)
    setTargetSemester(targetSem)

    // Pre-populate incharges map from current allocations
    const inchargeMap: Record<string, { staffCode: string; name: string }> = {}
    b.sections.forEach((sec) => {
      inchargeMap[sec.section] = {
        staffCode: sec.staffCode || "",
        name: sec.incharge || "",
      }
    })
    setModalSectionIncharges(inchargeMap)
    setEnableInchargeUpdateInModal(false)
  }

  // Execute semester upgrade
  const handleConfirmUpgrade = async () => {
    if (!selectedBatchForUpgrade) return

    setUpgrading(true)
    try {
      const payload: any = {
        batch: selectedBatchForUpgrade.batch,
        targetSemester,
        section: targetSection,
      }

      // If HOD enabled updating/reassigning incharges during promotion
      if (enableInchargeUpdateInModal) {
        payload.sectionIncharges = modalSectionIncharges
      }

      const res = await fetch("/api/admin/upgrade-semester", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to upgrade semester")
      }

      showToast(
        data.message ||
          `Successfully upgraded Batch ${selectedBatchForUpgrade.batch} to Semester ${targetSemester}!`,
        "success"
      )

      setSelectedBatchForUpgrade(null)
      await fetchStudents()
    } catch (err: any) {
      showToast(err.message || "Failed to upgrade semester.", "error")
    } finally {
      setUpgrading(false)
    }
  }

  // Open direct change incharge modal
  const handleOpenInchargeModal = (batch: string, section: string, currentIncharge: string, currentStaffCode?: string) => {
    setInchargeModalData({ batch, section, currentIncharge, currentStaffCode })
    setSelectedStaffCode(currentStaffCode || "")
    setInchargeSearch("")
  }

  // Save single section incharge
  const handleSaveIncharge = async () => {
    if (!inchargeModalData || !selectedStaffCode) {
      showToast("Please select a faculty member.", "error")
      return
    }

    setSavingIncharge(true)
    try {
      const res = await fetch("/api/admin/class-incharge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: inchargeModalData.batch,
          section: inchargeModalData.section,
          staffCode: selectedStaffCode,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update Class Incharge")
      }

      showToast(data.message || "Class Incharge updated successfully!", "success")
      setInchargeModalData(null)
      await fetchStudents()
    } catch (err: any) {
      showToast(err.message || "Failed to update Class Incharge.", "error")
    } finally {
      setSavingIncharge(false)
    }
  }

  // Filtered faculty for incharge search
  const filteredFaculty = useMemo(() => {
    if (!inchargeSearch.trim()) return faculty
    const q = inchargeSearch.toLowerCase().trim()
    return faculty.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.staffCode && f.staffCode.toLowerCase().includes(q)) ||
        (f.designation && f.designation.toLowerCase().includes(q))
    )
  }, [faculty, inchargeSearch])

  return (
    <div className="space-y-6">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-bold shadow-lg transition-all animate-in fade-in duration-300 ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-white/80 hover:text-white p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Top Header Banner ── */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-[#003087]">
              <FolderOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Batches &amp; Semester Promotion Portal
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Manage academic cohorts, inspect section allocations, reassign Class Incharges, and promote batches to their next semester in one click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Department</p>
            <p className="text-xs font-black text-[#003087]">AIML Department</p>
          </div>
          <button
            onClick={() => {
              fetchStudents()
              fetchFaculty()
            }}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
            title="Refresh Batch Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#003087]" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{students.length} Students</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003087] flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Batches</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{batchesData.length} Cohorts</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Sections</p>
            <p className="text-2xl font-black text-slate-800 mt-1">
              {batchesData.reduce((acc, b) => acc + b.sections.length, 0)} Sections
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Batches Cards Grid ── */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
          <p className="text-sm font-bold text-slate-500">Loading batch details from Supabase...</p>
        </div>
      ) : batchesData.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-16 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Batches Found</h3>
          <p className="text-xs text-slate-500 mt-1">Please import student records with batch fields.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {batchesData.map((b) => {
            const nextSem = Math.min(b.currentSemester + 1, 8)
            const isCompleted = b.currentSemester >= 8

            // Determine balanced grid columns based on sections count
            const gridColsClass =
              b.sections.length === 1
                ? "grid-cols-1"
                : b.sections.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

            return (
              <div
                key={b.batch}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Batch Header Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-[#003087] to-slate-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-lg sm:text-xl font-black tracking-wide">
                        Batch {b.batch}
                      </span>
                      <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Semester {b.currentSemester}
                      </span>
                      <span className="bg-white/20 text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                        {b.currentYear}
                      </span>
                    </div>
                    <p className="text-xs text-blue-200 mt-1 font-medium">
                      B.E. Computer Science &amp; Engineering (AIML) · {b.totalStudents} Students Enrolled
                    </p>
                  </div>

                  {/* Actions for this batch */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {!isCompleted ? (
                      <button
                        onClick={() => handleOpenUpgrade(b)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-black rounded-lg transition-all shadow-md active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" /> Promote to Semester {nextSem}
                      </button>
                    ) : (
                      <span className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                        Graduated / Final Term
                      </span>
                    )}

                    <button
                      onClick={() => handleOpenUpgrade(b, b.currentSemester)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors border border-white/20"
                    >
                      Set Custom Sem
                    </button>
                  </div>
                </div>

                {/* Section Cards Inside this Batch */}
                <div className="p-5 bg-slate-50/50">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Enrolled Sections &amp; Class Incharge Allocations</span>
                    <span>{b.sections.length} Sections Active</span>
                  </div>

                  {/* Balanced Grid without awkward line wrapping or empty columns */}
                  <div className={`grid gap-4 ${gridColsClass}`}>
                    {b.sections.map((sec) => (
                      <div
                        key={sec.section}
                        className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3.5 hover:border-blue-300 transition-colors"
                      >
                        {/* Section Header */}
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black bg-[#003087] text-white px-2.5 py-1 rounded shadow-sm">
                                Section {sec.section}
                              </span>
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                                Sem {b.currentSemester}
                              </span>
                            </div>

                            <span className="text-xs font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                              {sec.count} Students
                            </span>
                          </div>

                          {/* Full-width clean class name container */}
                          <div className="mt-3">
                            <p
                              className="text-xs font-mono font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg truncate"
                              title={sec.classId}
                            >
                              {sec.classId}
                            </p>
                          </div>
                        </div>

                        {/* Class Incharge Detail & Change Button */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Class Incharge
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#003087] shrink-0" />
                              <span className="font-bold text-xs text-slate-800 truncate">
                                {sec.incharge}
                              </span>
                              {sec.staffCode && (
                                <span className="font-mono text-[10px] font-bold text-[#003087] bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded shrink-0">
                                  {sec.staffCode}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Direct Change Button */}
                          <button
                            onClick={() =>
                              handleOpenInchargeModal(b.batch, sec.section, sec.incharge, sec.staffCode)
                            }
                            className="px-2.5 py-1.5 text-xs font-bold text-[#003087] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all active:scale-95 shrink-0 flex items-center gap-1 shadow-sm"
                            title="Change Class Incharge for this section"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal 1: Upgrade Semester & Optional Incharge Reassignment ── */}
      {selectedBatchForUpgrade && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedBatchForUpgrade(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" /> Promote Batch to Next Semester
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Batch {selectedBatchForUpgrade.batch}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForUpgrade(null)}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Visual Transition Indicator */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-around text-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current</p>
                  <p className="text-xl font-black text-slate-800 mt-0.5">
                    Semester {selectedBatchForUpgrade.currentSemester}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">{selectedBatchForUpgrade.currentYear}</p>
                </div>

                <div className="h-8 w-8 rounded-full bg-blue-100 text-[#003087] flex items-center justify-center font-bold">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">New Target</p>
                  <p className="text-xl font-black text-emerald-700 mt-0.5">
                    Semester {targetSemester}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">
                    {targetSemester >= 7
                      ? "4th Year"
                      : targetSemester >= 5
                      ? "3rd Year"
                      : targetSemester >= 3
                      ? "2nd Year"
                      : "1st Year"}
                  </p>
                </div>
              </div>

              {/* Target Semester Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Target Semester
                </label>
                <select
                  value={targetSemester}
                  onChange={(e) => setTargetSemester(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem} {sem === selectedBatchForUpgrade.currentSemester ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Apply Scope Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Apply Scope
                </label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087] focus:ring-1 focus:ring-[#003087]"
                >
                  <option value="ALL">All Sections (Entire Batch · {selectedBatchForUpgrade.totalStudents} Students)</option>
                  {selectedBatchForUpgrade.sections.map((sec) => (
                    <option key={sec.section} value={sec.section}>
                      Section {sec.section} Only ({sec.count} Students)
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Incharge Reassignment Toggle for New Semester */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Reassign Class Incharges for Semester {targetSemester}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Optionally allocate new faculty incharge for each section.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="toggleIncharge"
                    checked={enableInchargeUpdateInModal}
                    onChange={(e) => setEnableInchargeUpdateInModal(e.target.checked)}
                    className="h-4 w-4 text-[#003087] rounded border-slate-300 focus:ring-[#003087]"
                  />
                </div>

                {enableInchargeUpdateInModal && (
                  <div className="mt-3 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    {selectedBatchForUpgrade.sections.map((sec) => {
                      const currentAssigned = modalSectionIncharges[sec.section]?.staffCode || ""

                      return (
                        <div key={sec.section} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-700 w-24 shrink-0">
                            Section {sec.section}:
                          </span>
                          <select
                            value={currentAssigned}
                            onChange={(e) => {
                              const chosenStaff = faculty.find((f) => f.staffCode === e.target.value)
                              setModalSectionIncharges((prev) => ({
                                ...prev,
                                [sec.section]: {
                                  staffCode: e.target.value,
                                  name: chosenStaff?.name || "",
                                },
                              }))
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:border-[#003087] outline-none"
                          >
                            <option value="">-- Keep Current Incharge ({sec.incharge}) --</option>
                            {faculty.map((f) => (
                              <option key={f.uid} value={f.staffCode}>
                                {f.name} ({f.staffCode})
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Impact Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Notice:</span> Student class notations will update from{" "}
                <span className="font-mono font-bold bg-amber-100 px-1 py-0.2 rounded">
                  / {selectedBatchForUpgrade.currentSemester} /
                </span>{" "}
                to{" "}
                <span className="font-mono font-bold bg-emerald-100 text-emerald-900 px-1 py-0.2 rounded">
                  / {targetSemester} /
                </span>{" "}
                in Supabase.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setSelectedBatchForUpgrade(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                disabled={upgrading || targetSemester === selectedBatchForUpgrade.currentSemester}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-md disabled:opacity-60 flex items-center gap-2"
              >
                {upgrading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Upgrading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Confirm &amp; Upgrade
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 2: Direct Change Incharge for Single Section ── */}
      {inchargeModalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          onClick={() => setInchargeModalData(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#003087] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5" /> Change Class Incharge
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  Batch {inchargeModalData.batch} · Section {inchargeModalData.section}
                </p>
              </div>
              <button onClick={() => setInchargeModalData(null)} className="text-white/70 hover:text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                Current Incharge: <span className="font-bold">{inchargeModalData.currentIncharge}</span>{" "}
                {inchargeModalData.currentStaffCode && `(${inchargeModalData.currentStaffCode})`}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculty name, staff code..."
                  value={inchargeSearch}
                  onChange={(e) => setInchargeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium focus:border-[#003087] focus:ring-1 focus:ring-[#003087] outline-none"
                />
              </div>

              {/* Faculty List */}
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {filteredFaculty.map((f) => {
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
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-[#003087] overflow-hidden shrink-0">
                          {f.profile ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.profile} alt={f.name} className="w-full h-full object-cover" />
                          ) : (
                            f.name[0]
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800">{f.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {f.staffCode} · {f.designation}
                          </p>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="singleInchargeSelect"
                        checked={isSelected}
                        onChange={() => setSelectedStaffCode(f.staffCode)}
                        className="h-4 w-4 text-[#003087] focus:ring-[#003087]"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setInchargeModalData(null)}
                className="px-4 py-2 border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIncharge}
                disabled={savingIncharge || !selectedStaffCode}
                className="px-5 py-2 bg-[#003087] hover:bg-[#002266] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {savingIncharge ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" /> Save Incharge
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
