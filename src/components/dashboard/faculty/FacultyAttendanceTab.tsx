"use client"
import { useState, useEffect, useMemo } from "react"
import {
  CalendarDays, CheckCircle, XCircle, Clock, Users,
  Check, X, AlertCircle, Loader2, Sparkles, RefreshCw,
  Search, Shield, FileText, ExternalLink, ArrowRight,
  Lock, Unlock, ShieldCheck
} from "lucide-react"

interface InchargeSection {
  batch: string
  section: string
  classTitle?: string
}

interface StudentRosterItem {
  uid: string
  name: string
  registerNumber: string
  classTitle?: string
  gender?: string
  approvedOd?: {
    refNumber: string
    eventName: string
    eventType: string
  } | null
  approvedLeave?: {
    id: string
    category: string
    reason: string
  } | null
  pendingHodLeave?: {
    id: string
    category: string
    reason: string
  } | null
}

export default function FacultyAttendanceTab({
  inchargeSections = [],
  staffName = "Class Incharge"
}: {
  inchargeSections?: InchargeSection[]
  staffName?: string
}) {
  // 1. Date & Section Selection
  const todayStr = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("")

  // 2. Data State
  const [students, setStudents] = useState<StudentRosterItem[]>([])
  const [statusMap, setStatusMap] = useState<Record<string, "PRESENT" | "ABSENT" | "OD">>({})
  const [savedRecords, setSavedRecords] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [isMarked, setIsMarked] = useState<boolean>(false)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockedAt, setLockedAt] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [search, setSearch] = useState<string>("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Pick default section if available
  useEffect(() => {
    if (inchargeSections.length > 0 && !selectedSectionKey) {
      const first = inchargeSections[0]
      setSelectedSectionKey(`${first.batch}__${first.section}`)
    }
  }, [inchargeSections, selectedSectionKey])

  const currentSection = useMemo(() => {
    if (!selectedSectionKey) return null
    const [batch, section] = selectedSectionKey.split("__")
    return { batch, section }
  }, [selectedSectionKey])

  // Fetch Attendance & Students
  const fetchAttendanceRoster = async () => {
    if (!currentSection) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/attendance?batch=${encodeURIComponent(currentSection.batch)}&section=${encodeURIComponent(currentSection.section)}&date=${selectedDate}`
      )
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students || [])
        setIsMarked(data.isMarked || false)
        setIsLocked(Boolean(data.isLocked))
        setLockedAt(data.lockedAt || null)
        setSavedAt(data.savedAt || null)
        setSavedRecords(data.records || {})

        // Initialize status map:
        // Priority 1: Already saved status in database
        // Priority 2: If student has an approved OD for this date -> default to OD
        // Priority 3: Default to PRESENT
        const initialStatus: Record<string, "PRESENT" | "ABSENT" | "OD"> = {}
        ;(data.students || []).forEach((s: StudentRosterItem) => {
          if (data.records && data.records[s.uid]) {
            initialStatus[s.uid] = data.records[s.uid].status || "PRESENT"
          } else if (s.approvedOd) {
            initialStatus[s.uid] = "OD"
          } else if (s.approvedLeave) {
            initialStatus[s.uid] = "ABSENT"
          } else {
            initialStatus[s.uid] = "PRESENT"
          }
        })
        setStatusMap(initialStatus)
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "Failed to load class roster", "error")
      }
    } catch (err: any) {
      console.error("[FacultyAttendanceTab] fetch error:", err)
      showToast("Error loading attendance data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentSection && selectedDate) {
      fetchAttendanceRoster()
    }
  }, [selectedSectionKey, selectedDate])

  // Quick Action: Mark All Present (respecting ODs)
  const handleMarkAllPresent = () => {
    if (isLocked) {
      showToast("Attendance is locked. Request HOD unlock to modify.", "error")
      return
    }
    const updated = { ...statusMap }
    students.forEach((s) => {
      // If student has an approved OD, keep as OD; if approved Leave, keep as ABSENT; otherwise PRESENT
      updated[s.uid] = s.approvedOd ? "OD" : s.approvedLeave ? "ABSENT" : "PRESENT"
    })
    setStatusMap(updated)
    showToast("All students marked as Present (Approved ODs & Leaves preserved)", "success")
  }

  // Quick Action: Tomorrow / Next Day
  const handleSetTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setSelectedDate(tomorrow.toISOString().split("T")[0])
  }

  // Individual toggle
  const handleSetStatus = (uid: string, status: "PRESENT" | "ABSENT" | "OD") => {
    if (isLocked) {
      showToast("Attendance is locked by HOD. Request unlock to edit.", "error")
      return
    }
    setStatusMap((prev) => ({
      ...prev,
      [uid]: status,
    }))
  }

  // Save Attendance to Database
  const handleSaveAttendance = async () => {
    if (!currentSection) return
    setSaving(true)
    try {
      const records = students.map((s) => ({
        studentUid: s.uid,
        registerNumber: s.registerNumber,
        name: s.name,
        status: statusMap[s.uid] || "PRESENT",
        odRefNumber: s.approvedOd?.refNumber || null,
        odTitle: s.approvedOd?.eventName || null,
        absentCategory: s.approvedLeave ? s.approvedLeave.category : (savedRecords[s.uid]?.absentCategory || null),
        absentReason: s.approvedLeave ? `Approved Leave: ${s.approvedLeave.reason}` : (savedRecords[s.uid]?.absentReason || null),
        absentStatus: s.approvedLeave ? "VERIFIED" : (savedRecords[s.uid]?.absentStatus || null),
      }))

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch: currentSection.batch,
          section: currentSection.section,
          date: selectedDate,
          records,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setIsMarked(true)
        setIsLocked(true)
        setSavedAt(new Date().toISOString())
        showToast(`Attendance saved & locked successfully for ${selectedDate}!`, "success")
        fetchAttendanceRoster()
      } else {
        throw new Error(data.error || "Failed to save attendance")
      }
    } catch (err: any) {
      showToast(err.message || "Failed to save attendance.", "error")
    } finally {
      setSaving(false)
    }
  }

  // Metrics calculation
  const counts = useMemo(() => {
    let p = 0
    let a = 0
    let od = 0
    students.forEach((s) => {
      const st = statusMap[s.uid] || "PRESENT"
      if (st === "PRESENT") p++
      else if (st === "ABSENT") a++
      else if (st === "OD") od++
    })
    const total = students.length
    const rate = total > 0 ? Math.round(((p + od) / total) * 100) : 100
    return { total, p, a, od, rate }
  }, [students, statusMap])

  // Filter and sort students strictly by Register Number
  const filteredStudents = useMemo(() => {
    const list = [...students].sort((a, b) =>
      (a.registerNumber || "").localeCompare(b.registerNumber || "", undefined, { numeric: true })
    )
    if (!search.trim()) return list
    const q = search.toLowerCase().trim()
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.registerNumber.toLowerCase().includes(q)
    )
  }, [students, search])

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

      {/* ── 1. Header & Controls Card ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                Daily Attendance Portal
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003087]">
                Class Incharge
              </span>
              {isLocked ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5 border border-emerald-300 shadow-sm">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" /> Locked &amp; Finalized
                </span>
              ) : isMarked ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1.5 border border-amber-300">
                  <Unlock className="w-3.5 h-3.5 text-amber-700" /> Unlocked (Editable)
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Not Saved Yet
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Mark attendance for your assigned class. Approved On-Duty (OD) requests are automatically integrated.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSetTomorrow}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
            >
              Next Day (Tomorrow)
            </button>
            <button
              onClick={handleMarkAllPresent}
              disabled={isLocked || students.length === 0}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors border border-emerald-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4 text-emerald-600" /> Mark All Present
            </button>
          </div>
        </div>

        {/* Locked Status Banner (Tick Confirmation Screen) */}
        {isLocked && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-emerald-950">Attendance Submitted &amp; Locked</h4>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Official Record
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Attendance for {selectedDate} is securely locked. To modify or correct any record, please contact the HOD to unlock editing permissions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => showToast("Please contact Dr. Selvakumaran S. (HOD) or use the HOD Attendance Tracker to unlock this section.", "success")}
                className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-700" /> Request HOD Unlock
              </button>
            </div>
          </div>
        )}

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Section Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Assigned Class / Section
            </label>
            {inchargeSections.length > 0 ? (
              <select
                value={selectedSectionKey}
                onChange={(e) => setSelectedSectionKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
              >
                {inchargeSections.map((sec) => (
                  <option key={`${sec.batch}__${sec.section}`} value={`${sec.batch}__${sec.section}`}>
                    Batch {sec.batch} · Section {sec.section}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                All AIML Sections (Department View)
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
              />
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Search Student
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Register no or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-[#003087]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Metric Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Students</p>
          <p className="text-2xl font-black text-slate-800 mt-0.5">{counts.total}</p>
        </div>

        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present (P)</p>
          <p className="text-2xl font-black text-emerald-800 mt-0.5">{counts.p}</p>
        </div>

        <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-sm text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent (A)</p>
          <p className="text-2xl font-black text-rose-800 mt-0.5">{counts.a}</p>
        </div>

        <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 shadow-sm text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">On-Duty (OD)</p>
          <p className="text-2xl font-black text-indigo-800 mt-0.5">{counts.od}</p>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#003087] p-4 rounded-xl shadow-sm text-center text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Attendance Rate</p>
          <p className="text-2xl font-black mt-0.5">{counts.rate}%</p>
        </div>
      </div>

      {/* ── 3. Student Attendance Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Student Attendance Roster · {selectedDate}
            </h3>
            {savedAt && (
              <span className="text-[11px] text-slate-400 font-medium">
                (Last saved: {new Date(savedAt).toLocaleTimeString()})
              </span>
            )}
          </div>

          {isLocked ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Attendance Locked
              </span>
            </div>
          ) : (
            <button
              onClick={handleSaveAttendance}
              disabled={saving || students.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#003087] hover:bg-[#002266] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Save &amp; Lock Attendance
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading student roster &amp; checking OD approvals...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-4 py-3.5">Register No</th>
                  <th className="px-4 py-3.5">OD / Leave Approval</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Student Absence Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((s, idx) => {
                  const currentStatus = statusMap[s.uid] || "PRESENT"
                  const savedRecord = savedRecords[s.uid]
                  const hasApprovedOd = Boolean(s.approvedOd)

                  return (
                    <tr key={s.uid} className="hover:bg-slate-50/60 transition-colors">
                      {/* 1. Student Name & Number */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#003087]/10 text-[#003087] flex items-center justify-center font-bold text-xs shrink-0 border border-[#003087]/20">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-snug">{s.name}</p>
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                              {s.gender || "Student"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Register Number */}
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap">
                          {s.registerNumber || "—"}
                        </span>
                      </td>

                      {/* 3. Approved OD or Leave Badge */}
                      <td className="px-4 py-3.5 align-middle">
                        {hasApprovedOd ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                            <span>OD Approved: {s.approvedOd?.eventName}</span>
                          </div>
                        ) : s.approvedLeave ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                            <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Leave: {s.approvedLeave?.category} (HOD Approved)</span>
                          </div>
                        ) : s.pendingHodLeave ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Leave: {s.pendingHodLeave?.category} (Pending HOD)</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>

                      {/* 4. Interactive or Locked Attendance Status */}
                      <td className="px-5 py-3.5 align-middle text-center">
                        {isLocked ? (
                          <div className="inline-flex items-center justify-center">
                            {currentStatus === "PRESENT" ? (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1 shadow-sm">
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Present
                              </span>
                            ) : currentStatus === "ABSENT" ? (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1 shadow-sm">
                                <X className="w-3.5 h-3.5 text-rose-600" /> Absent
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 inline-flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> On-Duty
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
                            {/* Present */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(s.uid, "PRESENT")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === "PRESENT"
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                            >
                              P
                            </button>

                            {/* Absent */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(s.uid, "ABSENT")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                currentStatus === "ABSENT"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                              }`}
                            >
                              A
                            </button>

                            {/* OD */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(s.uid, "OD")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                currentStatus === "OD"
                                  ? "bg-indigo-600 text-white shadow-sm"
                                  : "text-slate-600 hover:text-indigo-700 hover:bg-indigo-50"
                              }`}
                            >
                              OD
                              {hasApprovedOd && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 5. Student Submitted Absence Reason */}
                      <td className="px-5 py-3.5 align-middle">
                        {currentStatus === "ABSENT" ? (
                          savedRecord?.absentReason ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  {savedRecord.absentCategory || "Reason Provided"}
                                </span>
                                {savedRecord.absentReasonSubmittedAt && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(savedRecord.absentReasonSubmittedAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-700 font-medium italic break-words max-w-xs">
                                &ldquo;{savedRecord.absentReason}&rdquo;
                              </p>
                              {savedRecord.absentProofUrl && (
                                <a
                                  href={savedRecord.absentProofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-[#003087] hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" /> View Medical / Proof
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-block">
                              Reason Pending from Student
                            </span>
                          )
                        ) : currentStatus === "OD" ? (
                          <span className="text-xs text-indigo-700 font-medium">
                            {s.approvedOd?.refNumber ? `Ref: ${s.approvedOd.refNumber}` : "Official Duty Verified"}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
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
  )
}

