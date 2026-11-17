"use client"
import { useState, useRef } from "react"
import { Upload, Download, Loader2, Plus, Trash2, Users, BookOpen, UserCheck, CalendarDays, Sparkles, FileText } from "lucide-react"
import * as XLSX from "xlsx"
import { generateOfficialPecPdf } from "@/lib/pecPdfGenerator"

type SubjectInfo = {
  name: string
  staffCode: string
  staffName: string
  date: string
  time: string
  venue: string
  year: string
}

type StudentResult = {
  slNo: string | number
  registerNo: string
  studentName: string
  subjects: Record<string, string | number>
  failCount: string | number
}

export default function HodPecTab() {
  // ── File refs ─────────────────────────────────────────────
  const file1Ref = useRef<HTMLInputElement>(null)
  const file2Ref = useRef<HTMLInputElement>(null)

  // ── Parsed state ──────────────────────────────────────────
  const [dept, setDept] = useState("AIML")
  const [semester, setSemester] = useState("")
  const [section, setSection] = useState("")
  const [classYear, setClassYear] = useState("III Year")
  const [defaultTime, setDefaultTime] = useState("03.00 PM to 05.00 PM")
  const [defaultVenue, setDefaultVenue] = useState("")
  const [subjects, setSubjects] = useState<SubjectInfo[]>([])
  const [students, setStudents] = useState<StudentResult[]>([])
  const [subjectHeaders, setSubjectHeaders] = useState<string[]>([])

  // ── UI state ──────────────────────────────────────────────
  const [step, setStep] = useState<"upload" | "schedule" | "done">("upload")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file1Name, setFile1Name] = useState("")
  const [file2Name, setFile2Name] = useState("")

  // ── Coordinator assignment ────────────────────────────────
  const [coordCode, setCoordCode] = useState("")
  const [coordMsg, setCoordMsg] = useState<string | null>(null)
  const [coordLoading, setCoordLoading] = useState(false)

  // Date Auto-Allot State
  const [autoStartDate, setAutoStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day === 6) d.setDate(d.getDate() + 2)
    else if (day === 0) d.setDate(d.getDate() + 1)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dateStr = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${dateStr}`
  })

  // Helper to skip Saturday and Sunday
  const getNextWeekday = (d: Date): Date => {
    const next = new Date(d)
    const day = next.getDay()
    if (day === 6) {
      next.setDate(next.getDate() + 2)
    } else if (day === 0) {
      next.setDate(next.getDate() + 1)
    }
    return next
  }

  // Auto allot dates on next consecutive weekdays
  const autoAllotDates = (startFromStr?: string) => {
    let current: Date
    const chosen = startFromStr || autoStartDate
    if (chosen) {
      const [y, m, d] = chosen.split("-").map(Number)
      current = new Date(y, m - 1, d)
    } else {
      current = new Date()
      current.setDate(current.getDate() + 1)
    }
    current = getNextWeekday(current)

    const updated = subjects.map((subj, index) => {
      if (index > 0) {
        current.setDate(current.getDate() + 1)
        current = getNextWeekday(current)
      }
      const y = current.getFullYear()
      const m = String(current.getMonth() + 1).padStart(2, "0")
      const day = String(current.getDate()).padStart(2, "0")
      return {
        ...subj,
        date: `${y}-${m}-${day}`,
      }
    })
    setSubjects(updated)
  }

  // Helper to calculate Class / Year from Semester
  const calculateYearFromSemester = (semStr: string): string => {
    const s = semStr.toLowerCase().trim()
    const numMatch = s.match(/\b0?([1-8])\b/) || s.match(/([1-8])(?:st|nd|rd|th)?/)
    let semNum = 0
    if (numMatch) {
      semNum = parseInt(numMatch[1], 10)
    } else if (/\b(viii)\b/i.test(s)) semNum = 8
    else if (/\b(vii)\b/i.test(s)) semNum = 7
    else if (/\b(vi)\b/i.test(s)) semNum = 6
    else if (/\b(v)\b/i.test(s)) semNum = 5
    else if (/\b(iv)\b/i.test(s)) semNum = 4
    else if (/\b(iii)\b/i.test(s)) semNum = 3
    else if (/\b(ii)\b/i.test(s)) semNum = 2
    else if (/\b(i)\b/i.test(s)) semNum = 1

    if (semNum === 1 || semNum === 2) return "I Year"
    if (semNum === 3 || semNum === 4) return "II Year"
    if (semNum === 5 || semNum === 6) return "III Year"
    if (semNum === 7 || semNum === 8) return "IV Year"
    return "III Year"
  }

  // Helper to identify header / dummy rows
  const isDummyHeaderRow = (sName: string, sStaff: string): boolean => {
    const n = sName.toLowerCase().replace(/[^a-z0-9]/g, "")
    const s = sStaff.toLowerCase().replace(/[^a-z0-9]/g, "")
    return (
      n.includes("subcode") ||
      n.includes("subjectname") ||
      n.includes("coursename") ||
      n.includes("coursecode") ||
      n === "subject" ||
      n === "course" ||
      s.includes("facultyname") ||
      s.includes("staffname") ||
      s === "faculty" ||
      s === "staff"
    )
  }

  // ══════════════════════════════════════════════════════════
  // Parse File 1: Result_Analysis_Report_Staff_Wise
  // A1 = Dept Semester Section  |  Col B = Subject  |  Col C = Staff
  // ══════════════════════════════════════════════════════════
  const parseFile1 = (file: File) => {
    if (!file.name.startsWith("Result_Analysis_Report_Staff_Wise")) {
      setError("First file must be named starting with 'Result_Analysis_Report_Staff_Wise'")
      return
    }
    setFile1Name(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1:C100")

        // Read A1 and header area
        const a1Raw = (ws["A1"]?.v?.toString().trim() ?? "")

        let extractedDept = "AIML"
        let extractedSem = ""
        let extractedSec = ""

        if (a1Raw.includes("/")) {
          // Format is strictly: dept / semester / section
          const slashParts = a1Raw.split("/").map((p: string) => p.trim())
          if (slashParts[0]) {
            extractedDept = slashParts[0].replace(/^(?:DEPARTMENT\s+OF|B\.?E\.?|B\.?TECH\.?)\s*[:-]?\s*/i, "").trim() || slashParts[0]
          }
          if (slashParts[1]) {
            const rawSem = slashParts[1]
            const semNumMatch = rawSem.match(/0?([1-8])/)
            extractedSem = rawSem.toLowerCase().includes("sem")
              ? rawSem
              : (semNumMatch ? `Semester ${parseInt(semNumMatch[1], 10)}` : rawSem)
          }
          if (slashParts[2]) {
            extractedSec = slashParts[2].replace(/^(?:SECTION|SEC)\s*[:-]?\s*/i, "").trim().toUpperCase()
          }
        } else {
          // Fallback if not slash-separated
          let combinedHeader = a1Raw
          if (ws["A2"]) combinedHeader += " " + (ws["A2"]?.v?.toString().trim() ?? "")
          if (ws["B1"]) combinedHeader += " " + (ws["B1"]?.v?.toString().trim() ?? "")

          if (/AI&DS|AIDS|AIML|CSE|IT|ECE|EEE|MECH/i.test(combinedHeader)) {
            const deptMatch = combinedHeader.match(/(?:B\.?Tech\.?\s*)?(AI&DS|AIDS|AIML|CSE|IT|ECE|EEE|MECH)/i)
            if (deptMatch) extractedDept = deptMatch[1].toUpperCase()
          }

          const semMatch = combinedHeader.match(/(?:Semester|Sem)\s*[:\-]?\s*([IVX0-9]+|(?:1st|2nd|3rd|4th|5th|6th|7th|8th))/i) ||
                           combinedHeader.match(/([1-8](?:st|nd|rd|th)?)\s*(?:Semester|Sem)/i)
          if (semMatch) {
            extractedSem = semMatch[0].trim()
          }

          const secMatch = combinedHeader.match(/(?:Section|Sec)\s*[:\-]?\s*([A-Za-z])/i) ||
                           combinedHeader.match(/\b([A-D])\b/)
          if (secMatch) {
            extractedSec = secMatch[1].toUpperCase()
          }
        }

        // Calculate Year / Class from Semester
        const calculatedClassYear = calculateYearFromSemester(extractedSem || a1Raw)

        setDept(extractedDept)
        setSemester(extractedSem)
        setSection(extractedSec)
        setClassYear(calculatedClassYear)

        const extracted: SubjectInfo[] = []
        for (let r = 2; r <= range.e.r + 1; r++) {
          const subjCell = ws[`B${r}`]
          const staffCell = ws[`C${r}`]
          if (!subjCell) continue
          const name = subjCell.v?.toString().trim() ?? ""
          const staffRaw = staffCell?.v?.toString().trim() ?? ""

          // Skip empty or dummy column header rows (e.g. "Sub Code & Subject Name", "Faculty Name")
          if (!name || isDummyHeaderRow(name, staffRaw)) {
            continue
          }

          extracted.push({
            name,
            staffCode: staffRaw,
            staffName: staffRaw,
            date: "",
            time: "03.00 PM to 05.00 PM",
            venue: "",
            year: calculatedClassYear,
          })
        }
        setSubjects(extracted)
      } catch (err) {
        setError("Failed to parse first Excel file. Please check the format.")
      }
    }
    reader.readAsBinaryString(file)
  }

  // ══════════════════════════════════════════════════════════
  // Parse File 2: Result_Analysis_Report (student results)
  // ══════════════════════════════════════════════════════════
  const parseFile2 = (file: File) => {
    if (!file.name.startsWith("Result_Analysis_Report")) {
      setError("Second file must be named starting with 'Result_Analysis_Report'")
      return
    }
    setFile2Name(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "binary" })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 })
        if (!rows.length) return

        const headers = (rows[0] as string[]).map((h) => String(h ?? "").trim())
        // Detect subject columns (everything between STUDENT'S NAME LIST and No.of subjects failed)
        const nameIdx = headers.findIndex((h) => h.toLowerCase().includes("student"))
        const failIdx = headers.findIndex((h) => h.toLowerCase().includes("failed"))
        const subjHeaders = headers.slice(nameIdx + 1, failIdx === -1 ? undefined : failIdx)
        setSubjectHeaders(subjHeaders)

        const parsed: StudentResult[] = []
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i] as any[]
          if (!row[1]) continue // skip empty rows
          const subjectMap: Record<string, string | number> = {}
          subjHeaders.forEach((h, idx) => {
            subjectMap[h] = row[nameIdx + 1 + idx] ?? ""
          })
          parsed.push({
            slNo: row[0] ?? i,
            registerNo: String(row[1] ?? "").trim(),
            studentName: String(row[nameIdx] ?? "").trim(),
            subjects: subjectMap,
            failCount: row[failIdx] ?? 0,
          })
        }
        setStudents(parsed)
      } catch (err) {
        setError("Failed to parse second Excel file. Please check the format.")
      }
    }
    reader.readAsBinaryString(file)
  }

  // ══════════════════════════════════════════════════════════
  // Download Handlers (PDF & Excel)
  // ══════════════════════════════════════════════════════════
  const downloadOfficialPdf = () => {
    generateOfficialPecPdf({
      dept,
      semester,
      section,
      classYear,
      subjects,
      students,
    })
  }

  const downloadExcelWorkbook = () => {
    try {
      const wb = XLSX.utils.book_new()

      // ── Sheet 1: PEC TIMETABLE (Matching Page 2 of PDF) ───
      const timetableAoa: any[][] = [
        ["RAJALAKSHMI INSTITUTE OF TECHNOLOGY"],
        ["DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"],
        [],
        ["PEC TIMETABLE"],
        [],
        ["S.No", "DATE", "COURSE CODE", "COURSE NAME", "FACULTY NAME"],
      ]

      subjects.forEach((s, idx) => {
        const codeMatch = s.name.match(/\(([A-Za-z0-9]+)\)/)
        const cCode = codeMatch ? codeMatch[1] : ""
        const cName = s.name.replace(/\([A-Za-z0-9]+\)/, "").trim()
        timetableAoa.push([
          idx + 1,
          s.date || "TBA",
          cCode || s.name.slice(0, 7),
          cName || s.name,
          s.staffName || s.staffCode || "Faculty",
        ])
      })

      timetableAoa.push(
        [],
        ["All concerned students are advised to attend the Performance Enhancement Class I regularly and make use of this opportunity to improve their subject's knowledge."],
        [],
        ["PEC Coordinator", "", "", "", "HOD/AI&DS"]
      )
      const wsTt = XLSX.utils.aoa_to_sheet(timetableAoa)
      XLSX.utils.book_append_sheet(wb, wsTt, "PEC Timetable")

      // ── Sheet 2: CIRCULAR (Matching Page 1 of PDF) ────────
      const circularAoa: any[][] = [
        ["RAJALAKSHMI INSTITUTE OF TECHNOLOGY"],
        ["DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"],
        [new Date().toLocaleDateString("en-GB")],
        [],
        ["Circular"],
        [],
        [`Performance Enhancement Classes (PEC - I) for ${subjects[0]?.year || "III Year"} B.Tech. AI&DS (${semester || "Semester V"}) will be conducted for students who require additional academic support after the CAT-I examination.`],
        [],
        ["The objective of PEC is to strengthen students' understanding of course concepts through revision sessions, practice tests, and individual guidance."],
        [],
        ["PEC Timing:"],
        ["Revision 03.00 P.M to 4.00 P.M"],
        [],
        ["Pattern for PEC Test:"],
        ["Test: 04.00 P.M., to 05.00 P.M.,"],
        ["Part - A (5 Questions)"],
        ["Part - B (2 Questions)"],
        [],
        [],
        ["PEC Coordinator", "", "", "HOD"]
      ]
      const wsCirc = XLSX.utils.aoa_to_sheet(circularAoa)
      XLSX.utils.book_append_sheet(wb, wsCirc, "Circular")

      // ── Sheet 3: SAMPLE ATTENDANCE SHEET (Matching Page 3) 
      const attendanceAoa: any[][] = [
        ["SAMPLE ATTENDANCE SHEET"],
        [],
        ["DEPARTMENT :", dept || "AIML"],
        ["SUBJECT CODE & NAME :", subjects[0]?.name || ""],
        ["SUBJECT HANDLER :", subjects[0]?.staffName || subjects[0]?.staffCode || ""],
        [],
        ["SL.NO", "REGISTER NO", "STUDENT NAME", subjects[0]?.date || "DATE"],
      ]
      const firstFailed = students.filter((stu) => {
        const val = stu.subjects[subjects[0]?.name]
        return val === "F" || val === "AB" || (typeof val === "number" && val < 50)
      })
      firstFailed.forEach((s, idx) => {
        attendanceAoa.push([idx + 1, s.registerNo, s.studentName, ""])
      })
      attendanceAoa.push([], [], ["PEC COORDINATOR", "", "HOD"])
      const wsAtt = XLSX.utils.aoa_to_sheet(attendanceAoa)
      XLSX.utils.book_append_sheet(wb, wsAtt, "Sample Attendance Sheet")

      // ── Sheet 4: SAMPLE ASSESSMENT SHEET (Matching Page 4) 
      const assessmentAoa: any[][] = [
        ["SAMPLE ASSESSMENT SHEET"],
        [],
        ["COURSE CODE & NAME :", subjects[0]?.name || ""],
        [],
        ["SL.NO", "REGISTER NO", "STUDENT NAME", "CAT 1 (50)", "PEC Mark (20)"],
      ]
      firstFailed.forEach((s, idx) => {
        assessmentAoa.push([idx + 1, s.registerNo, s.studentName, "", ""])
      })
      const wsAss = XLSX.utils.aoa_to_sheet(assessmentAoa)
      XLSX.utils.book_append_sheet(wb, wsAss, "Sample Assessment Sheet")

      // ── Sheet 5: OUTCOME SUMMARY (Matching Page 5) ────────
      const outcomeAoa: any[][] = [
        ["OUTCOME SUMMARY"],
        [],
        ["Department:", "Artificial Intelligence and Data Science"],
        ["Course Code & Course Name:", subjects[0]?.name || ""],
        ["Faculty:", subjects[0]?.staffName || subjects[0]?.staffCode || ""],
        ["Date:", subjects[0]?.date || ""],
        [],
        ["Summary"],
        ["* Total Students Eligible :", firstFailed.length],
        ["* Students Attended :", ""],
        ["* Topics Revised :", ""],
        ["* Common Learning Gaps Identified :", ""],
        ["* Improvement Observed :", ""],
        ["* Follow-up Actions Recommended :", ""],
        [],
        ["Overall Outcome:"],
        ["The Performance Enhancement Class (PEC) was conducted successfully. Students demonstrated improved understanding of the key concepts through revision and assessment. The session helped identify learning gaps and provided targeted academic support to enhance their performance in future assessments."],
        [],
        [],
        ["Subject Handler", "PEC Coordinator", "Head of the Department"]
      ]
      const wsOut = XLSX.utils.aoa_to_sheet(outcomeAoa)
      XLSX.utils.book_append_sheet(wb, wsOut, "Outcome Summary")

      // ── Sheet 6: INSTRUCTIONS TO FACULTY (Matching Page 6) 
      const instructionsAoa: any[][] = [
        ["Instructions to Faculty"],
        [],
        ["1. Conduct the PEC class strictly as per the scheduled date and time."],
        ["2. Take attendance before commencing the revision session."],
        ["3. Conduct the Revision Session from 03.00 PM to 04.00 PM."],
        ["4. Conduct the PEC Test from 04.00 PM to 05.00 PM following the prescribed question paper pattern."],
        ["5. Evaluate the answer scripts and record the marks in the Assessment Sheet."],
        ["6. Provide necessary guidance and clarify students' doubts during the session."],
        ["7. Ensure discipline and regular attendance throughout the PEC class."],
        ["8. Course Coordinators shall collect and maintain the Attendance Sheet, Question Paper, Answer Key, and Assessment Sheet in the Course File."],
        ["9. Individual Subject Handling Faculty shall also maintain copies of the above documents for their respective classes in their Course File for academic records and audit purposes."],
        [],
        [],
        ["PEC COORDINATOR", "", "", "", "HOD"]
      ]
      const wsInst = XLSX.utils.aoa_to_sheet(instructionsAoa)
      XLSX.utils.book_append_sheet(wb, wsInst, "Instructions to Faculty")

      // ── Sheet 7: Student Results Raw Data ─────────────────
      const resHeaders = ["Sl.No", "Register No", "Student Name", ...subjectHeaders, "No. of Subjects Failed"]
      const resRows = students.map((s) => [
        s.slNo,
        s.registerNo,
        s.studentName,
        ...subjectHeaders.map((h) => s.subjects[h] ?? ""),
        s.failCount,
      ])
      const wsRes = XLSX.utils.aoa_to_sheet([resHeaders, ...resRows])
      XLSX.utils.book_append_sheet(wb, wsRes, "Student Results")

      // ── Per-subject failed student sheets ─────────────────
      subjects.forEach((subj) => {
        const failed = students.filter((stu) => {
          const val = stu.subjects[subj.name]
          return val === "F" || val === "AB" || (typeof val === "number" && val < 50) || String(val).toUpperCase() === "F" || String(val).toUpperCase() === "AB"
        })
        const sheetName = subj.name.slice(0, 25).replace(/[/\\?*[\]]/g, "-")
        const wsSubj = XLSX.utils.aoa_to_sheet([
          ["Subject:", subj.name],
          ["Staff:", subj.staffName || subj.staffCode],
          ["Date:", subj.date],
          ["Time:", subj.time || "03.00 PM to 05.00 PM"],
          ["Venue:", subj.venue],
          [],
          ["Sl.No", "Register No", "Student Name", "CAT 1 (50)", "PEC Mark (20)", "Attendance"],
          ...failed.map((s, i) => [i + 1, s.registerNo, s.studentName, "", "", ""]),
        ])
        XLSX.utils.book_append_sheet(wb, wsSubj, sheetName)
      })

      XLSX.writeFile(wb, `PEC_Timetable_${dept}_${semester}_${section}.xlsx`)
    } catch (e: any) {
      setError("Failed to download Excel workbook: " + e.message)
    }
  }

  // ══════════════════════════════════════════════════════════
  // Generate PEC Timetable & Save Sessions to Backend
  // ══════════════════════════════════════════════════════════
  const generateTimetable = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Prepare session objects for backend
      const sessionsToSave = subjects.map((subj) => {
        // Find students who failed this subject
        const failedStudents = students.filter((stu) => {
          const val = stu.subjects[subj.name]
          return (
            val === "F" ||
            val === "AB" ||
            String(val).toUpperCase() === "F" ||
            String(val).toUpperCase() === "AB" ||
            (typeof val === "number" && val < 50)
          )
        }).map((s, idx) => ({
          slNo: idx + 1,
          registerNo: s.registerNo,
          studentName: s.studentName,
          cat1Marks: "",
          pecMarks: "",
          attendance: "PENDING",
        }))

        // Extract Course Code from Subject name if present e.g. "Artificial Intelligence(AL23311)"
        const codeMatch = subj.name.match(/\(([A-Za-z0-9]+)\)/)
        const courseCode = codeMatch ? codeMatch[1] : ""
        const cleanCourseName = subj.name.replace(/\([A-Za-z0-9]+\)/, "").trim()

        return {
          dept: dept || "AIML",
          semester: semester || "",
          section: section || "",
          year: subj.year || "III Year",
          courseCode: courseCode || subj.name.slice(0, 7),
          courseName: cleanCourseName || subj.name,
          facultyCode: subj.staffCode || "",
          facultyName: subj.staffName || subj.staffCode || "",
          date: subj.date || "",
          time: subj.time || "03.00 PM to 05.00 PM",
          revisionTiming: "03.00 PM to 04.00 PM",
          testTiming: "04.00 PM to 05.00 PM",
          venue: subj.venue || "",
          students: failedStudents,
        }
      })

      // 2. Save sessions into Firestore / Backend
      try {
        await fetch("/api/pec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dept,
            semester,
            section,
            sessions: sessionsToSave,
          }),
        })
      } catch (saveErr) {
        console.warn("Backend save warning:", saveErr)
      }

      // 3. Automatically download official 6-page PDF matching exact attached format
      downloadOfficialPdf()

      setStep("done")
    } catch (err: any) {
      setError("Failed to generate timetable: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════
  // Assign PEC Coordinator
  // ══════════════════════════════════════════════════════════
  const assignCoordinator = async () => {
    if (!coordCode.trim()) return
    setCoordLoading(true)
    setCoordMsg(null)
    try {
      const res = await fetch("/api/hod/assign-coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffCode: coordCode.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to assign coordinator")
      setCoordMsg(`✅ ${data.message || "Coordinator assigned successfully."}`)
      setCoordCode("")
    } catch (err: any) {
      setCoordMsg(`❌ ${err.message}`)
    } finally {
      setCoordLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 pb-20">
      {/* ── Header ── */}
      <div className="bg-[#003087] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-1">
          <BookOpen className="w-6 h-6 text-blue-200" />
          <h1 className="text-xl font-black">Performance Enhancement Classes (PEC)</h1>
        </div>
        <p className="text-blue-200 text-sm">Upload result reports, schedule classes, and generate a downloadable PEC timetable.</p>
      </div>

      {/* ── Assign Coordinator ── */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Assign PEC Coordinator</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">Enter the staff code of the person who will coordinate PEC activities. They will get access to PEC features in their dashboard.</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-[#D1D5DB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Staff Code (e.g. CS91)"
            value={coordCode}
            onChange={(e) => setCoordCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={assignCoordinator}
            disabled={coordLoading || !coordCode.trim()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {coordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Assign
          </button>
        </div>
        {coordMsg && (
          <p className="mt-2 text-sm">{coordMsg}</p>
        )}
      </div>

      {/* ── Step 1: Upload Files ── */}
      {step === "upload" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 space-y-5">
          <h2 className="font-bold text-slate-800">Step 1: Upload Excel Reports</h2>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
          )}

          {/* File 1 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              File 1 — Result Analysis Report (Staff Wise)
            </label>
            <p className="text-xs text-slate-400 mb-2">Filename must start with <code className="bg-slate-100 px-1 rounded">Result_Analysis_Report_Staff_Wise</code>. Column A1 = Dept Semester Section, Column B = Subject, Column C = Staff</p>
            <div
              onClick={() => file1Ref.current?.click()}
              className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{file1Name || "Click to upload .xlsx / .xls"}</p>
            </div>
            <input ref={file1Ref} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) parseFile1(e.target.files[0]) }} />
          </div>

          {/* File 2 */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
              File 2 — Student Result Analysis Report
            </label>
            <p className="text-xs text-slate-400 mb-2">Filename must start with <code className="bg-slate-100 px-1 rounded">Result_Analysis_Report</code>. Columns: SL.NO, REGISTER NO, STUDENT&apos;S NAME, Subject columns, No.of subjects failed</p>
            <div
              onClick={() => file2Ref.current?.click()}
              className="border-2 border-dashed border-[#D1D5DB] rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{file2Name || "Click to upload .xlsx / .xls"}</p>
            </div>
            <input ref={file2Ref} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) parseFile2(e.target.files[0]) }} />
          </div>

          {/* Auto-filled & Editable Meta Information */}
          {(dept || semester || section || classYear) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Calculated Class &amp; Section (Autofetched &amp; Editable)
                </span>
                <span className="text-[11px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
                  Calculated from Semester
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Class / Year</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. III Year"
                    value={classYear}
                    onChange={(e) => {
                      const val = e.target.value
                      setClassYear(val)
                      setSubjects((prev) => prev.map((s) => ({ ...s, year: val })))
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Semester</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Semester V"
                    value={semester}
                    onChange={(e) => {
                      const val = e.target.value
                      setSemester(val)
                      const calculated = calculateYearFromSemester(val)
                      setClassYear(calculated)
                      setSubjects((prev) => prev.map((s) => ({ ...s, year: calculated })))
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Section</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. A"
                    value={section}
                    onChange={(e) => setSection(e.target.value.toUpperCase())}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. AIML"
                    value={dept}
                    onChange={(e) => setDept(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </div>
          )}

          {subjects.length > 0 && students.length > 0 && (
            <button
              onClick={() => setStep("schedule")}
              className="w-full bg-[#003087] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-900 transition-colors"
            >
              Next: Schedule PEC Classes →
            </button>
          )}
          {subjects.length > 0 && (
            <p className="text-xs text-slate-400 text-center">
              {subjects.length} subjects found · {students.length} students loaded
            </p>
          )}
        </div>
      )}

      {/* ── Step 2: Schedule ── */}
      {step === "schedule" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Step 2: Schedule PEC Classes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Class / Year is calculated from {semester || "semester"} as <span className="font-bold text-indigo-600">{classYear}</span>. You can edit any details below or apply batch settings.
              </p>
            </div>
            <button onClick={() => setStep("upload")} className="text-xs text-indigo-600 font-semibold hover:underline">← Back to Upload</button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm">{error}</div>
          )}

          {/* ── Batch Quick Set ── */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              Quick Batch Fill (Apply to All Subjects)
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Set All Class/Year</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={classYear}
                    onChange={(e) => setClassYear(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                    placeholder="e.g. III Year"
                  />
                  <button
                    type="button"
                    onClick={() => setSubjects((prev) => prev.map((s) => ({ ...s, year: classYear })))}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[10px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Set All Timing</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={defaultTime}
                    onChange={(e) => setDefaultTime(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                    placeholder="03.00 PM to 05.00 PM"
                  />
                  <button
                    type="button"
                    onClick={() => setSubjects((prev) => prev.map((s) => ({ ...s, time: defaultTime })))}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[10px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Set All Venue</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={defaultVenue}
                    onChange={(e) => setDefaultVenue(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1 text-xs"
                    placeholder="e.g. AIML Lab"
                  />
                  <button
                    type="button"
                    onClick={() => setSubjects((prev) => prev.map((s) => ({ ...s, venue: defaultVenue })))}
                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[10px]"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-medium block mb-1">Dept &amp; Section</label>
                <div className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-mono text-[11px] truncate">
                  {dept} • Sec {section || "-"}
                </div>
              </div>
            </div>

            {/* ── Auto Allot Dates (Consecutive Weekdays) ── */}
            <div className="pt-2.5 mt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-lg border">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-xs block">Auto Allot Consecutive Weekdays</span>
                  <span className="text-[10px] text-slate-400">Skips Saturdays &amp; Sundays automatically</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-slate-600">Starting Date:</label>
                <input
                  type="date"
                  value={autoStartDate}
                  onChange={(e) => setAutoStartDate(e.target.value)}
                  className="border border-slate-300 rounded-md px-2.5 py-1 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => autoAllotDates(autoStartDate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Auto Allot Dates
                </button>
              </div>
            </div>
          </div>

          {/* ── Subject Cards ── */}
          <div className="space-y-3">
            {subjects.map((subj, idx) => {
              // Count students failing this subject
              const failCount = students.filter((s) => {
                const val = s.subjects[subj.name]
                return val === "F" || val === "AB" || String(val).toUpperCase() === "F" || (typeof val === "number" && val < 50)
              }).length

              return (
                <div key={idx} className="border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm">{subj.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 ml-7">
                        Faculty Handler: <span className="font-semibold text-slate-700">{subj.staffCode}</span> •{" "}
                        <span className={failCount > 0 ? "text-red-600 font-bold" : "text-emerald-600 font-medium"}>
                          {failCount} student{failCount !== 1 ? "s" : ""} to attend
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSubjects((prev) => prev.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Class / Year (Auto-fetched)</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="e.g. III Year"
                        value={subj.year || classYear}
                        onChange={(e) => {
                          const copy = [...subjects]
                          copy[idx].year = e.target.value
                          setSubjects(copy)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={subj.date}
                        onChange={(e) => {
                          const copy = [...subjects]
                          copy[idx].date = e.target.value
                          setSubjects(copy)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Time</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="e.g. 03.00 PM to 05.00 PM"
                        value={subj.time}
                        onChange={(e) => {
                          const copy = [...subjects]
                          copy[idx].time = e.target.value
                          setSubjects(copy)
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Venue</label>
                      <input
                        type="text"
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        placeholder="e.g. AIML Lab / LH-101"
                        value={subj.venue}
                        onChange={(e) => {
                          const copy = [...subjects]
                          copy[idx].venue = e.target.value
                          setSubjects(copy)
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={generateTimetable}
              disabled={loading || subjects.length === 0}
              className="flex items-center justify-center gap-2 bg-[#003087] text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 text-blue-200" />}
              Generate &amp; Download Official PEC PDF (.pdf)
            </button>

            <button
              type="button"
              onClick={downloadExcelWorkbook}
              disabled={loading || subjects.length === 0}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-5 h-5" />
              Download Excel Workbook (.xlsx)
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ── */}
      {step === "done" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-10 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <div>
            <h2 className="text-xl font-black text-slate-800">PEC Timetable &amp; Circular Generated!</h2>
            <p className="text-slate-500 text-sm mt-1">
              The official 6-page institutional PDF has been generated and downloaded, matching the exact format of the circular.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-slate-700 space-y-2">
            <div className="font-bold text-slate-800 text-xs mb-1 uppercase tracking-wider">Generated Official Documents:</div>
            <div>📄 <b>Page 1:</b> Official Circular (Timing, Test Pattern, Coordinator)</div>
            <div>📄 <b>Page 2:</b> PEC Timetable with Course Codes, Dates &amp; Faculty</div>
            <div>📄 <b>Page 3:</b> Sample Attendance Sheet</div>
            <div>📄 <b>Page 4:</b> Sample Assessment Sheet &amp; Progress Bar Chart</div>
            <div>📄 <b>Page 5:</b> Outcome Summary (Eligible/Attended/Topics)</div>
            <div>📄 <b>Page 6:</b> Instructions to Faculty (Rules 1 to 9)</div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={downloadOfficialPdf}
              className="inline-flex items-center gap-2 bg-[#003087] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-200" /> Download PDF (.pdf)
            </button>
            <button
              onClick={downloadExcelWorkbook}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Excel (.xlsx)
            </button>
            <button
              onClick={() => { setStep("upload"); setSubjects([]); setStudents([]); setDept(""); setSemester(""); setSection(""); setFile1Name(""); setFile2Name("") }}
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-300 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Another PEC
            </button>
          </div>
        </div>
      )}

      {/* ── Student Preview ── */}
      {step === "schedule" && students.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-slate-500" />
            <h2 className="font-bold text-slate-700 text-sm">Student Results Preview ({students.length} students)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-[#E5E7EB] px-3 py-2 text-left font-semibold text-slate-600">Sl.No</th>
                  <th className="border border-[#E5E7EB] px-3 py-2 text-left font-semibold text-slate-600">Register No</th>
                  <th className="border border-[#E5E7EB] px-3 py-2 text-left font-semibold text-slate-600">Student Name</th>
                  {subjectHeaders.map((h) => (
                    <th key={h} className="border border-[#E5E7EB] px-3 py-2 text-left font-semibold text-slate-600 max-w-[120px] truncate">{h}</th>
                  ))}
                  <th className="border border-[#E5E7EB] px-3 py-2 text-left font-semibold text-slate-600">Failed</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 20).map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="border border-[#E5E7EB] px-3 py-1.5">{s.slNo}</td>
                    <td className="border border-[#E5E7EB] px-3 py-1.5">{s.registerNo}</td>
                    <td className="border border-[#E5E7EB] px-3 py-1.5">{s.studentName}</td>
                    {subjectHeaders.map((h) => (
                      <td key={h} className={`border border-[#E5E7EB] px-3 py-1.5 ${String(s.subjects[h]).toUpperCase() === "F" || String(s.subjects[h]).toUpperCase() === "AB" ? "text-red-600 font-bold" : ""}`}>
                        {String(s.subjects[h] ?? "")}
                      </td>
                    ))}
                    <td className={`border border-[#E5E7EB] px-3 py-1.5 font-bold ${Number(s.failCount) > 0 ? "text-red-600" : "text-green-600"}`}>{s.failCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length > 20 && (
              <p className="text-xs text-slate-400 mt-2 text-center">Showing first 20 of {students.length} students. All rows included in the generated Excel.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

