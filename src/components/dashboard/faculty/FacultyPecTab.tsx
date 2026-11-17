"use client"
import { useState, useEffect } from "react"
import {
  BookOpen, Users, CalendarDays, CheckCircle, Clock,
  Save, Download, Loader2, AlertCircle, FileCheck, Award
} from "lucide-react"
import * as XLSX from "xlsx"

export default function FacultyPecTab() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCoordinator, setIsCoordinator] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Current session edit state
  const [currentStudents, setCurrentStudents] = useState<any[]>([])
  const [outcome, setOutcome] = useState({
    topicsRevised: "",
    commonGaps: "",
    improvementObserved: "",
    followUpActions: "",
  })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/pec")
      if (!res.ok) throw new Error("Failed to load PEC sessions")
      const data = await res.json()
      setSessions(data.sessions || [])
      setIsCoordinator(Boolean(data.isCoordinator))
      if (data.sessions?.length > 0 && !selectedSessionId) {
        selectSession(data.sessions[0])
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const selectSession = (s: any) => {
    setSelectedSessionId(s.id)
    setCurrentStudents(s.students || [])
    setOutcome({
      topicsRevised: s.outcomeSummary?.topicsRevised || "",
      commonGaps: s.outcomeSummary?.commonGaps || "",
      improvementObserved: s.outcomeSummary?.improvementObserved || "",
      followUpActions: s.outcomeSummary?.followUpActions || "",
    })
    setSaveMsg(null)
  }

  const activeSession = sessions.find((s) => s.id === selectedSessionId)

  // Toggle attendance for student
  const toggleAttendance = (index: number) => {
    const copy = [...currentStudents]
    const current = copy[index].attendance
    copy[index].attendance = current === "PRESENT" ? "ABSENT" : "PRESENT"
    setCurrentStudents(copy)
  }

  // Update marks for student
  const updateStudentField = (index: number, field: string, val: string | number) => {
    const copy = [...currentStudents]
    copy[index][field] = val
    setCurrentStudents(copy)
  }

  // Save changes to backend
  const handleSave = async () => {
    if (!selectedSessionId) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch("/api/pec", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSessionId,
          students: currentStudents,
          outcomeSummary: outcome,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update record")
      setSaveMsg("✅ Changes saved successfully!")
      // update local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSessionId
            ? { ...s, students: currentStudents, outcomeSummary: outcome }
            : s
        )
      )
    } catch (err: any) {
      setSaveMsg(`❌ ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Download Attendance Sheet matching PDF Sample Attendance Sheet
  const downloadAttendanceSheet = () => {
    if (!activeSession) return
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      ["DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"],
      ["SAMPLE ATTENDANCE SHEET"],
      [],
      ["DEPARTMENT :", activeSession.dept || "AIML"],
      ["SUBJECT CODE & NAME :", `${activeSession.courseCode || ""} ${activeSession.courseName || ""}`],
      ["SUBJECT HANDLER :", activeSession.facultyName || activeSession.facultyCode || ""],
      ["DATE :", activeSession.date || ""],
      ["TIMING :", activeSession.revisionTiming || "03.00 PM to 04.00 PM"],
      [],
      ["SL.NO", "REGISTER NO", "STUDENT NAME", `${activeSession.date || "DATE"} (ATTENDANCE)`],
      ...currentStudents.map((s, idx) => [
        idx + 1,
        s.registerNo,
        s.studentName,
        s.attendance || "PENDING",
      ]),
      [],
      [],
      ["PEC COORDINATOR", "", "", "HOD"],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Attendance Sheet")
    XLSX.writeFile(wb, `PEC_Attendance_${activeSession.courseCode || "Class"}_${activeSession.date || "Date"}.xlsx`)
  }

  // Download Assessment Sheet matching PDF Sample Assessment Sheet
  const downloadAssessmentSheet = () => {
    if (!activeSession) return
    const wb = XLSX.utils.book_new()
    const rows: any[][] = [
      ["DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"],
      ["SAMPLE ASSESSMENT SHEET"],
      [],
      ["COURSE CODE & NAME :", `${activeSession.courseCode || ""} ${activeSession.courseName || ""}`],
      ["FACULTY :", activeSession.facultyName || activeSession.facultyCode || ""],
      ["DATE :", activeSession.date || ""],
      [],
      ["SL.NO", "REGISTER NO", "STUDENT NAME", "CAT 1 (50)", "PEC Mark (20)"],
      ...currentStudents.map((s, idx) => [
        idx + 1,
        s.registerNo,
        s.studentName,
        s.cat1Marks ?? "",
        s.pecMarks ?? "",
      ]),
      [],
      [],
      ["PEC COORDINATOR", "", "", "HOD"],
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, "Assessment Sheet")
    XLSX.writeFile(wb, `PEC_Assessment_${activeSession.courseCode || "Class"}_${activeSession.date || "Date"}.xlsx`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#003087]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <div className="bg-[#003087] rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-blue-200" />
            <h1 className="text-xl font-black">Performance Enhancement Classes (PEC)</h1>
          </div>
          <p className="text-blue-100 text-xs">
            Mark attendance, record assessment marks (CAT 1 &amp; PEC), and submit outcome summaries for your assigned subjects.
          </p>
        </div>
        {isCoordinator && (
          <span className="self-start md:self-auto bg-amber-400 text-slate-900 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide">
            PEC Coordinator Mode
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No PEC Classes Assigned</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            You do not currently have any PEC classes assigned to you. Once the HOD or PEC Coordinator schedules a class for your subject, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Left Column: Session Selector ── */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Your Assigned PEC Sessions ({sessions.length})
            </h3>
            <div className="space-y-2">
              {sessions.map((s) => {
                const isSelected = s.id === selectedSessionId
                const presentCount = (s.students || []).filter((st: any) => st.attendance === "PRESENT").length
                return (
                  <div
                    key={s.id}
                    onClick={() => selectSession(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-[#003087] ring-2 ring-[#003087]/20 shadow-md"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-indigo-600">
                        {s.courseCode || "COURSE"}
                      </span>
                      <span className="text-slate-500 font-semibold">{s.date || "Date TBA"}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{s.courseName}</h4>
                    <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
                      <span>Batch: {s.semester || ""} {s.section ? `(${s.section})` : ""}</span>
                      <span className="font-semibold text-emerald-600">
                        {presentCount}/{s.students?.length || 0} Attended
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Right Column: Selected Session Actions & Attendance/Marks ── */}
          {activeSession && (
            <div className="lg:col-span-2 space-y-5">
              {/* Session Meta Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      {activeSession.dept || "AIML"} • {activeSession.semester} • Section {activeSession.section || "-"}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-1">
                      {activeSession.courseName} ({activeSession.courseCode})
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Faculty: <span className="font-semibold text-slate-800">{activeSession.facultyName || activeSession.facultyCode}</span> • Date: <span className="font-semibold text-slate-800">{activeSession.date}</span> • Timing: <span className="font-semibold text-slate-800">{activeSession.time}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadAttendanceSheet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      title="Download Attendance Sheet (Excel)"
                    >
                      <Download className="w-3.5 h-3.5" /> Attendance
                    </button>
                    <button
                      onClick={downloadAssessmentSheet}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                      title="Download Assessment Sheet (Excel)"
                    >
                      <Download className="w-3.5 h-3.5" /> Assessment
                    </button>
                  </div>
                </div>

                {/* ── Attendance & Assessment Table ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      Eligible Students ({currentStudents.length})
                    </h4>
                    <span className="text-[11px] text-slate-400">Click button to toggle Present / Absent</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 text-left">Sl.No</th>
                          <th className="py-2.5 px-3 text-left">Register No</th>
                          <th className="py-2.5 px-3 text-left">Student Name</th>
                          <th className="py-2.5 px-3 text-center">Attendance</th>
                          <th className="py-2.5 px-3 text-center">CAT 1 (50)</th>
                          <th className="py-2.5 px-3 text-center">PEC Mark (20)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentStudents.map((st: any, idx: number) => {
                          const isPresent = st.attendance === "PRESENT"
                          return (
                            <tr key={idx} className={isPresent ? "bg-emerald-50/20" : ""}>
                              <td className="py-2 px-3 text-slate-500 font-mono">{idx + 1}</td>
                              <td className="py-2 px-3 font-mono font-bold text-slate-800">{st.registerNo}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{st.studentName}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleAttendance(idx)}
                                  className={`px-3 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
                                    isPresent
                                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                      : "bg-red-100 text-red-700 hover:bg-red-200"
                                  }`}
                                >
                                  {isPresent ? "Present" : "Absent"}
                                </button>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="text"
                                  className="w-16 text-center border border-slate-200 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="0-50"
                                  value={st.cat1Marks ?? ""}
                                  onChange={(e) => updateStudentField(idx, "cat1Marks", e.target.value)}
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="text"
                                  className="w-16 text-center border border-slate-200 rounded px-1.5 py-1 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  placeholder="0-20"
                                  value={st.pecMarks ?? ""}
                                  onChange={(e) => updateStudentField(idx, "pecMarks", e.target.value)}
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Outcome Summary Section ── */}
                <div className="mt-6 pt-5 border-t border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-slate-400" />
                    Outcome Summary (Post-PEC Completion)
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Topics Revised</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        placeholder="Key course concepts and units covered..."
                        value={outcome.topicsRevised}
                        onChange={(e) => setOutcome({ ...outcome, topicsRevised: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Common Learning Gaps Identified</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        placeholder="Areas where students struggled in CAT 1..."
                        value={outcome.commonGaps}
                        onChange={(e) => setOutcome({ ...outcome, commonGaps: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Improvement Observed</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        placeholder="Progress in test scores and understanding..."
                        value={outcome.improvementObserved}
                        onChange={(e) => setOutcome({ ...outcome, improvementObserved: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">Follow-up Actions Recommended</label>
                      <textarea
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        placeholder="Next steps, practice sets or remedial guidance..."
                        value={outcome.followUpActions}
                        onChange={(e) => setOutcome({ ...outcome, followUpActions: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-100">
                  {saveMsg ? (
                    <span className="text-xs font-semibold">{saveMsg}</span>
                  ) : <div />}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-[#003087] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-900 transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Attendance &amp; Marks
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

