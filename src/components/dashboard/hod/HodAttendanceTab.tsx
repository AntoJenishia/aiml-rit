"use client"
import { useState, useEffect, useMemo } from "react"
import {
  CalendarDays, CheckCircle, XCircle, Clock, Users,
  AlertTriangle, Check, X, Loader2, Sparkles, Phone,
  Mail, ExternalLink, ChevronRight, Eye, RefreshCw,
  Search, Shield, Building2, UserCheck, Download,
  FileSpreadsheet, Printer, Lock, Unlock, ShieldCheck, FileDown
} from "lucide-react"
import { RIT_LOGO_BASE64 } from "@/lib/ritLogoBase64"
import { downloadOfficialAttendancePdf } from "@/lib/attendancePdfDownloader"

interface PendingIncharge {
  batch: string
  section: string
  classTitle: string
  studentCount: number
  inchargeName: string
  staffCode: string | null
  inchargePhone: string | null
  inchargeEmail: string | null
}

interface StudentAttendanceRecord {
  studentUid?: string
  name: string
  registerNumber: string
  status: "PRESENT" | "ABSENT" | "OD"
  odTitle?: string
  odRefNumber?: string
  odVerified?: boolean
  odStatus?: string
  isSpotOd?: boolean
  absentReason?: string
  absentCategory?: string
  absentProofUrl?: string
  absentStatus?: string
  absentReasonSubmittedAt?: string
}

interface SectionAttendanceSummary {
  batch: string
  section: string
  classTitle: string
  studentCount: number
  staffCode: string | null
  inchargeName: string
  inchargePhone: string | null
  inchargeEmail: string | null
  isMarked: boolean
  isLocked: boolean
  lockedAt: string | null
  lockedBy: string | null
  markedAt: string | null
  markedBy: string | null
  markedByName: string | null
  presentCount: number
  absentCount: number
  odCount: number
  attendanceRate: number
  records: StudentAttendanceRecord[] | Record<string, StudentAttendanceRecord> | null
}

export default function HodAttendanceTab() {
  const todayStr = new Date().toISOString().split("T")[0]
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>("ALL")
  const [data, setData] = useState<{
    date: string
    summary: {
      totalSections: number
      markedSections: number
      pendingSections: number
      totalStudents: number
      totalPresent: number
      totalAbsent: number
      totalOd: number
      departmentAttendanceRate: number
      allMarked: boolean
    }
    pendingIncharges: PendingIncharge[]
    sections: SectionAttendanceSummary[]
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [selectedSectionForModal, setSelectedSectionForModal] = useState<SectionAttendanceSummary | null>(null)
  const [modalSearch, setModalSearch] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDepartmentAttendance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/attendance?date=${selectedDate}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error("[HodAttendanceTab] fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartmentAttendance()
  }, [selectedDate])

  // Distinct batches for filter
  const batches = useMemo(() => {
    if (!data?.sections) return []
    const set = new Set<string>()
    data.sections.forEach((s) => set.add(s.batch))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [data])

  // Filter sections by batch
  const filteredSections = useMemo(() => {
    if (!data?.sections) return []
    if (selectedBatchFilter === "ALL") return data.sections
    return data.sections.filter((s) => s.batch === selectedBatchFilter)
  }, [data, selectedBatchFilter])

  // Quick Action date buttons
  const setDateToday = () => setSelectedDate(todayStr)
  const setDateYesterday = () => {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    setSelectedDate(d.toISOString().split("T")[0])
  }

  // Filter records in modal - strictly sorted by registerNumber
  const modalRecords = useMemo(() => {
    if (!selectedSectionForModal?.records) return []
    const raw = selectedSectionForModal.records
    const list: StudentAttendanceRecord[] = Array.isArray(raw)
      ? [...raw]
      : Object.entries(raw).map(([key, val]) => ({
          ...val,
          studentUid: val.studentUid || key
        }))

    // Sort strictly by registerNumber natural/numeric order (e.g. 21172401001, 21172401002...)
    list.sort((a, b) =>
      (a.registerNumber || "").localeCompare(b.registerNumber || "", undefined, { numeric: true })
    )

    if (!modalSearch.trim()) return list
    const q = modalSearch.toLowerCase().trim()
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.registerNumber.toLowerCase().includes(q)
    )
  }, [selectedSectionForModal, modalSearch])

  // ── 1. Excel / CSV Export Generator (With Complete Student Details in Register No Order) ──
  const handleDownloadExcel = (sectionsToExport: SectionAttendanceSummary[], filenamePrefix: string) => {
    if (!sectionsToExport || sectionsToExport.length === 0) {
      alert("No attendance records available to export.")
      return
    }

    const rows: string[][] = [
      [
        "S.No",
        "Date",
        "Batch",
        "Section",
        "Register Number",
        "Student Name",
        "Attendance Status",
        "Absence Reason",
        "Reason Category",
        "Reason Submitted At",
        "Medical Proof URL",
        "OD Title / Event",
        "OD Reference Number",
        "OD Verification Status",
        "Class Incharge Name",
        "Section Lock Status",
        "Last Saved Timestamp"
      ]
    ]

    let sNo = 1
    const allStudentsToExport: {
      date: string
      batch: string
      section: string
      registerNumber: string
      name: string
      status: string
      absentReason: string
      absentCategory: string
      absentReasonSubmittedAt: string
      absentProofUrl: string
      odTitle: string
      odRefNumber: string
      odStatus: string
      inchargeName: string
      isLocked: boolean
      markedAt: string | null
    }[] = []

    sectionsToExport.forEach((sec) => {
      const raw = sec.records
      const recs: StudentAttendanceRecord[] = Array.isArray(raw)
        ? raw
        : raw ? Object.values(raw) : []

      recs.forEach((r) => {
        allStudentsToExport.push({
          date: selectedDate,
          batch: sec.batch,
          section: sec.section,
          registerNumber: r.registerNumber || "",
          name: r.name || "",
          status: r.status || (sec.isMarked ? "PRESENT" : "NOT_MARKED"),
          absentReason: r.absentReason || "",
          absentCategory: r.absentCategory || "",
          absentReasonSubmittedAt: r.absentReasonSubmittedAt ? new Date(r.absentReasonSubmittedAt).toLocaleString() : "—",
          absentProofUrl: r.absentProofUrl || "",
          odTitle: r.odTitle || "",
          odRefNumber: r.odRefNumber || "",
          odStatus: r.status === "OD" ? (r.odVerified || r.odStatus === "VERIFIED" ? "VERIFIED" : "PENDING_HOD_APPROVAL") : "—",
          inchargeName: sec.inchargeName || "Not Assigned",
          isLocked: sec.isLocked,
          markedAt: sec.markedAt
        })
      })
    })

    // Sort strictly by Register Number natural/numeric order
    allStudentsToExport.sort((a, b) =>
      a.registerNumber.localeCompare(b.registerNumber, undefined, { numeric: true })
    )

    allStudentsToExport.forEach((st) => {
      rows.push([
        String(sNo++),
        st.date,
        st.batch,
        st.section,
        `"${st.registerNumber.replace(/"/g, '""')}"`,
        `"${st.name.replace(/"/g, '""')}"`,
        st.status,
        `"${st.absentReason.replace(/"/g, '""')}"`,
        `"${st.absentCategory.replace(/"/g, '""')}"`,
        st.absentReasonSubmittedAt,
        `"${st.absentProofUrl.replace(/"/g, '""')}"`,
        `"${st.odTitle.replace(/"/g, '""')}"`,
        `"${st.odRefNumber.replace(/"/g, '""')}"`,
        st.odStatus,
        `"${st.inchargeName.replace(/"/g, '""')}"`,
        st.isLocked ? "LOCKED" : "UNLOCKED",
        st.markedAt ? new Date(st.markedAt).toLocaleString() : "—"
      ])
    })

    if (rows.length <= 1) {
      alert("No student records found to export.")
      return
    }

    const csvContent = "\uFEFF" + rows.map((e) => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filenamePrefix}_${selectedDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ── 2. Official PDF Direct Download Generator (Instant File Download) ──
  const handleDownloadPdf = (sectionsToExport: SectionAttendanceSummary[], reportTitle: string) => {
    downloadOfficialAttendancePdf(sectionsToExport, selectedDate, reportTitle)
  }

  // ── 3. Toggle Lock / Unlock Section ──
  const handleToggleLock = async (sec: SectionAttendanceSummary, lockState: boolean) => {
    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_lock",
          batch: sec.batch,
          section: sec.section,
          date: selectedDate,
          isLocked: lockState,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        alert(result.message || (lockState ? "Section locked." : "Section unlocked for Class Incharge editing."))
        fetchDepartmentAttendance()
        if (selectedSectionForModal && selectedSectionForModal.batch === sec.batch && selectedSectionForModal.section === sec.section) {
          setSelectedSectionForModal({ ...selectedSectionForModal, isLocked: lockState })
        }
      } else {
        alert(result.error || "Failed to update lock state.")
      }
    } catch (err: any) {
      alert(err.message || "Network error updating lock.")
    } finally {
      setActionLoading(false)
    }
  }

  // ── 4. 1-Click Approve Spot OD ──
  const handleApproveSpotOd = async (sec: SectionAttendanceSummary, studentUid: string, studentName: string) => {
    const eventName = window.prompt(`Approve Spot OD for ${studentName}. Enter official event or reason:`, "College Academic Representation / Official Duty")
    if (!eventName) return

    setActionLoading(true)
    try {
      const res = await fetch("/api/admin/attendance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_spot_od",
          batch: sec.batch,
          section: sec.section,
          date: selectedDate,
          studentUid,
          eventName,
        }),
      })
      const result = await res.json()
      if (res.ok) {
        alert(`Spot OD verified successfully! Reference Number: ${result.refNumber}`)
        fetchDepartmentAttendance()
        // Update modal state in place
        if (selectedSectionForModal && selectedSectionForModal.records) {
          if (Array.isArray(selectedSectionForModal.records)) {
            const updated = selectedSectionForModal.records.map((r) => {
              if (r.studentUid === studentUid) {
                return {
                  ...r,
                  status: "OD" as const,
                  odTitle: eventName,
                  odRefNumber: result.refNumber,
                  odVerified: true,
                  odStatus: "VERIFIED",
                }
              }
              return r
            })
            setSelectedSectionForModal({
              ...selectedSectionForModal,
              records: updated,
            })
          } else {
            const updated: Record<string, StudentAttendanceRecord> = { ...selectedSectionForModal.records }
            if (updated[studentUid]) {
              updated[studentUid] = {
                ...updated[studentUid],
                status: "OD" as const,
                odTitle: eventName,
                odRefNumber: result.refNumber,
                odVerified: true,
                odStatus: "VERIFIED",
              }
              setSelectedSectionForModal({
                ...selectedSectionForModal,
                records: updated,
              })
            }
          }
        }
      } else {
        alert(result.error || "Failed to approve spot OD.")
      }
    } catch (err: any) {
      alert(err.message || "Network error approving OD.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 1. Top Controls Bar with Date & Export Actions ── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">
              Department Attendance Tracking
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003087]">
              HOD Master View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor real-time daily attendance across all AIML batches, lock/unlock edit permissions, and export official reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Date Buttons */}
          <button
            onClick={setDateToday}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
              selectedDate === todayStr
                ? "bg-[#003087] text-white border-[#003087]"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={setDateYesterday}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-slate-200"
          >
            Yesterday
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003087]"
          />

          <button
            onClick={fetchDepartmentAttendance}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            title="Refresh Attendance Status"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#003087]" : ""}`} />
          </button>

          {/* Export Dropdown / Action Buttons */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <button
              onClick={() => handleDownloadExcel(filteredSections, "AIML_Department_Attendance")}
              disabled={loading || !data}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-all border border-emerald-200 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              title="Download Department Excel (CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => handleDownloadPdf(filteredSections, "Department Attendance Consolidated Report")}
              disabled={loading || !data}
              className="px-3 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              title="Download Department Attendance PDF File"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Who Has Not Marked Attendance Card (Crucial Feature Requested) ── */}
      {!loading && data && (
        <div>
          {data.pendingIncharges.length > 0 ? (
            <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-rose-950">
                      Attendance Pending for {selectedDate} ({data.pendingIncharges.length} Sections)
                    </h3>
                    <p className="text-xs text-rose-800 mt-0.5">
                      The following Class Incharges have not yet submitted attendance for their assigned sections.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-200 text-rose-900 self-start sm:self-auto border border-rose-300">
                  {data.summary.pendingSections} of {data.summary.totalSections} Pending
                </span>
              </div>

              {/* Grid of Pending Incharges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {data.pendingIncharges.map((pi) => (
                  <div
                    key={`${pi.batch}__${pi.section}`}
                    className="bg-white border-2 border-rose-200 rounded-xl p-4 shadow-sm space-y-2.5 hover:border-rose-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                        Section {pi.section}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Batch {pi.batch}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{pi.inchargeName}</h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Staff Code: {pi.staffCode || "—"} · {pi.studentCount} Students
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {pi.inchargePhone ? (
                        <a
                          href={`tel:${pi.inchargePhone}`}
                          className="flex-1 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call Incharge
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No phone on record</span>
                      )}

                      {pi.inchargeEmail && (
                        <a
                          href={`mailto:${pi.inchargeEmail}?subject=AIML Attendance Reminder - ${selectedDate}&body=Dear ${pi.inchargeName}, please mark today's attendance for Batch ${pi.batch} Section ${pi.section}.`}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition-colors"
                          title="Send Email Reminder"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-emerald-950">100% Attendance Completed for Today</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    All AIML Class Incharges have successfully submitted and locked their daily attendance rosters for {selectedDate}.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 shrink-0">
                All Sections Completed
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── 3. High-Level Metrics Strip ── */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</p>
            <p className="text-2xl font-black text-slate-800 mt-0.5">{data.summary.totalStudents}</p>
          </div>

          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Present (P)</p>
            <p className="text-2xl font-black text-emerald-800 mt-0.5">{data.summary.totalPresent}</p>
          </div>

          <div className="bg-rose-50/70 p-4 rounded-xl border border-rose-200 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent (A)</p>
            <p className="text-2xl font-black text-rose-800 mt-0.5">{data.summary.totalAbsent}</p>
          </div>

          <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 shadow-sm text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">On-Duty (OD)</p>
            <p className="text-2xl font-black text-indigo-800 mt-0.5">{data.summary.totalOd}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-[#003087] p-4 rounded-xl shadow-sm text-center text-white">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Dept Attendance Rate</p>
            <p className="text-2xl font-black mt-0.5">{data.summary.departmentAttendanceRate}%</p>
          </div>
        </div>
      )}

      {/* ── 4. Section-Wise Master Attendance Table ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              Sections &amp; Class Incharge Overview · {selectedDate}
            </h3>
            {data && (
              <span className="text-xs font-semibold text-slate-500">
                ({data.summary.markedSections}/{data.summary.totalSections} sections marked)
              </span>
            )}
          </div>

          {/* Batch Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedBatchFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                selectedBatchFilter === "ALL"
                  ? "bg-[#003087] text-white shadow-sm"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              All Batches
            </button>
            {batches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBatchFilter(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  selectedBatchFilter === b
                    ? "bg-[#003087] text-white shadow-sm"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#003087] mb-3" />
            <p className="text-xs font-bold text-slate-500">Aggregating attendance records across all sections...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-medium">
            No sections found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="px-5 py-3.5">Class / Section</th>
                  <th className="px-4 py-3.5">Class Incharge</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center">Lock Control</th>
                  <th className="px-3 py-3.5 text-center">Present</th>
                  <th className="px-3 py-3.5 text-center">Absent</th>
                  <th className="px-3 py-3.5 text-center">OD</th>
                  <th className="px-4 py-3.5 text-center">Rate</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSections.map((sec) => (
                  <tr key={`${sec.batch}__${sec.section}`} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. Class & Batch */}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          Section {sec.section}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          {sec.studentCount} Students
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Batch {sec.batch}
                      </p>
                    </td>

                    {/* 2. Class Incharge Info */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="font-bold text-slate-800 text-xs">
                        {sec.inchargeName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{sec.staffCode || "—"}</span>
                        {sec.inchargePhone && (
                          <span className="text-slate-400">· {sec.inchargePhone}</span>
                        )}
                      </div>
                    </td>

                    {/* 3. Status Badge */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      {sec.isMarked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3" /> Marked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>

                    {/* 4. Lock Control */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      {sec.isMarked ? (
                        <div className="inline-flex items-center gap-1.5">
                          {sec.isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <Lock className="w-3 h-3 text-emerald-600" /> Locked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Unlock className="w-3 h-3 text-amber-600" /> Unlocked
                            </span>
                          )}

                          <button
                            onClick={() => handleToggleLock(sec, !sec.isLocked)}
                            disabled={actionLoading}
                            className={`p-1 rounded-md text-[10px] font-bold transition-all ${
                              sec.isLocked
                                ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                            }`}
                            title={sec.isLocked ? "Unlock section so Incharge can edit" : "Lock section"}
                          >
                            {sec.isLocked ? "Unlock" : "Lock"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* 5. Present */}
                    <td className="px-3 py-3.5 align-middle text-center font-bold text-emerald-700 text-sm">
                      {sec.isMarked ? sec.presentCount : "—"}
                    </td>

                    {/* 6. Absent */}
                    <td className="px-3 py-3.5 align-middle text-center font-bold text-rose-700 text-sm">
                      {sec.isMarked ? sec.absentCount : "—"}
                    </td>

                    {/* 7. OD */}
                    <td className="px-3 py-3.5 align-middle text-center font-bold text-indigo-700 text-sm">
                      {sec.isMarked ? sec.odCount : "—"}
                    </td>

                    {/* 8. Rate */}
                    <td className="px-4 py-3.5 align-middle text-center">
                      {sec.isMarked ? (
                        <span
                          className={`font-black text-xs px-2 py-0.5 rounded ${
                            sec.attendanceRate >= 75
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {sec.attendanceRate}%
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* 9. Inspect Action */}
                    <td className="px-5 py-3.5 align-middle text-right">
                      {sec.isMarked ? (
                        <button
                          onClick={() => {
                            setSelectedSectionForModal(sec)
                            setModalSearch("")
                          }}
                          className="px-3 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect Roster
                        </button>
                      ) : (
                        sec.inchargePhone ? (
                          <a
                            href={`tel:${sec.inchargePhone}`}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all border border-rose-200 inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3" /> Alert Incharge
                          </a>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold">Not Marked</span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Inspect Section Student Attendance ── */}
      {selectedSectionForModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-8 overflow-y-auto"
          onClick={() => setSelectedSectionForModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] my-auto overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#003087] p-5 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-black uppercase">
                    Section {selectedSectionForModal.section}
                  </span>
                  <span className="text-xs font-bold text-blue-200">
                    Batch {selectedSectionForModal.batch} · {selectedDate}
                  </span>
                  {selectedSectionForModal.isLocked ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200 text-[10px] font-black uppercase flex items-center gap-1 border border-emerald-400/30">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 text-[10px] font-black uppercase flex items-center gap-1 border border-amber-400/30">
                      <Unlock className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-black mt-1">
                  Class Attendance Roster &amp; Verification
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Class Incharge: {selectedSectionForModal.inchargeName} ({selectedSectionForModal.staffCode})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleLock(selectedSectionForModal, !selectedSectionForModal.isLocked)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  {selectedSectionForModal.isLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-amber-300" /> Unlock for Incharge
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-emerald-300" /> Lock Section
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedSectionForModal(null)}
                  className="text-white/70 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search & Export Toolbar */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or register no..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#003087]"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-600 mr-2">
                  <span className="text-emerald-700">Present: {selectedSectionForModal.presentCount}</span>
                  <span className="text-rose-700">Absent: {selectedSectionForModal.absentCount}</span>
                  <span className="text-indigo-700">OD: {selectedSectionForModal.odCount}</span>
                </div>

                <button
                  onClick={() => handleDownloadExcel([selectedSectionForModal], `Section_${selectedSectionForModal.section}_Attendance`)}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  title="Export Section CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
                </button>

                <button
                  onClick={() => handleDownloadPdf([selectedSectionForModal], `Section_${selectedSectionForModal.section}_Attendance_Report`)}
                  className="px-2.5 py-1.5 bg-[#003087] hover:bg-[#002266] text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                  title="Download Section PDF File"
                >
                  <FileDown className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>

            {/* Student Records List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
              {modalRecords.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No student records match your query.
                </div>
              ) : (
                modalRecords.map((stu, idx) => {
                  const isP = stu.status === "PRESENT"
                  const isOd = stu.status === "OD"
                  const isA = stu.status === "ABSENT"
                  const isOdVerified = stu.odVerified || stu.odStatus === "VERIFIED"

                  return (
                    <div
                      key={stu.registerNumber || idx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="w-6 h-6 rounded-md bg-[#003087]/10 text-[#003087] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[#003087]/20">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-slate-800 text-xs font-bold bg-white px-2.5 py-0.5 rounded border border-slate-200">
                            {stu.registerNumber || "—"}
                          </span>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{stu.name}</p>
                        </div>

                        {/* If ABSENT: Show Reason or Pending status */}
                        {isA && (
                          <div className="mt-2 space-y-1">
                            {stu.absentReason ? (
                              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-950">
                                    {stu.absentCategory || "Reason Submitted"}
                                  </span>
                                  <span className="text-[10px] text-emerald-700 font-bold">
                                    Explained · No Issue
                                  </span>
                                  {stu.absentReasonSubmittedAt && (
                                    <span className="text-[10px] text-slate-400 font-mono">
                                      (Submitted: {new Date(stu.absentReasonSubmittedAt).toLocaleDateString()})
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-800 italic mt-1 font-medium">
                                  &ldquo;{stu.absentReason}&rdquo;
                                </p>
                                {stu.absentProofUrl && (
                                  <a
                                    href={stu.absentProofUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-[#003087] hover:underline inline-flex items-center gap-1 mt-1"
                                  >
                                    <ExternalLink className="w-3 h-3" /> View Medical Note / Proof
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                                <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Pending Explanation from Student
                                </span>
                                <span className="text-[10px] text-rose-600 font-semibold">Unexcused</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* If OD: Show Verification Status & Spot OD Approval */}
                        {isOd && (
                          <div className="mt-2 space-y-1">
                            {isOdVerified ? (
                              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800">
                                      OD Verified: {stu.odTitle || "Academic Duty"}
                                    </span>
                                  </div>
                                  {stu.odRefNumber && (
                                    <span className="text-[10px] font-mono text-indigo-600 ml-5 block mt-0.5">
                                      Ref: {stu.odRefNumber}
                                    </span>
                                  )}
                                </div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-200 text-indigo-900">
                                  Approved
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 bg-amber-50 border-2 border-amber-300 rounded-lg text-amber-900 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    <span className="text-[11px] font-bold text-amber-950">
                                      Spot OD Marked by Incharge (Pending HOD Approval)
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-amber-800 ml-5">
                                    Student claimed sudden duty. Verify and approve to officialize.
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleApproveSpotOd(selectedSectionForModal, stu.studentUid!, stu.name)}
                                  disabled={actionLoading}
                                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve Spot OD
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                            isP
                              ? "bg-emerald-100 text-emerald-800"
                              : isOd
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {isP && <Check className="w-3.5 h-3.5" />}
                          {isA && <X className="w-3.5 h-3.5" />}
                          {isOd && <Sparkles className="w-3.5 h-3.5" />}
                          {stu.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Last modified: {selectedSectionForModal.markedAt ? new Date(selectedSectionForModal.markedAt).toLocaleString() : "—"}
              </span>
              <button
                onClick={() => setSelectedSectionForModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
