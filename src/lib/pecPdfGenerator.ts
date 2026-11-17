import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { RIT_LOGO_BASE64 } from "./ritLogoBase64"

export interface PecPdfSubject {
  name: string
  staffCode: string
  staffName: string
  date: string
  time: string
  venue: string
  year: string
}

export interface PecPdfStudent {
  slNo: string | number
  registerNo: string
  studentName: string
  subjects: Record<string, string | number>
  failCount: string | number
}

export interface PecPdfOptions {
  dept: string
  semester: string
  section: string
  classYear: string
  subjects: PecPdfSubject[]
  students: PecPdfStudent[]
  issueDate?: string
}

export function generateOfficialPecPdf(options: PecPdfOptions) {
  const {
    dept = "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE",
    semester = "Semester V",
    section = "A",
    classYear = "III Year",
    subjects = [],
    students = [],
    issueDate = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, "."),
  } = options

  // Clean Dept Name
  let deptFull = dept.toUpperCase()
  if (!deptFull.startsWith("DEPARTMENT OF")) {
    if (deptFull === "AIML") {
      deptFull = "DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING"
    } else if (deptFull === "AI&DS" || deptFull === "AIDS") {
      deptFull = "DEPARTMENT OF ARTIFICIAL INTELLIGENCE AND DATA SCIENCE"
    } else if (deptFull === "CSE") {
      deptFull = "DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING"
    } else {
      deptFull = `DEPARTMENT OF ${deptFull}`
    }
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth() // 210
  const pageHeight = doc.internal.pageSize.getHeight() // 297

  // Helper to add RIT Logo
  const addLogo = () => {
    try {
      doc.addImage(RIT_LOGO_BASE64, "PNG", 20, 15, 45, 14)
    } catch (e) {
      // fallback text
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.setTextColor(0, 48, 135)
      doc.text("RIT", 20, 25)
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 1: CIRCULAR
  // ══════════════════════════════════════════════════════════════════════════
  addLogo()

  // Department Header
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text(deptFull, pageWidth / 2, 42, { align: "center" })

  // Date on right
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10.5)
  doc.text(issueDate, pageWidth - 22, 50, { align: "right" })

  // Circular Title
  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("Circular", pageWidth / 2, 65, { align: "center" })

  // Body Paragraph 1
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10.5)
  doc.setTextColor(30, 41, 59)

  const degreeText = dept.includes("CSE") ? "B.E. CSE" : "B.Tech. AI&DS"
  const para1 = `Performance Enhancement Classes (PEC – I) for ${classYear} ${degreeText} (${semester}) will be conducted for students who require additional academic support after the CAT–I examination.`
  const splitPara1 = doc.splitTextToSize(para1, pageWidth - 44)
  doc.text(splitPara1, 22, 76)

  // Body Paragraph 2
  const para2 = "The objective of PEC is to strengthen students' understanding of course concepts through revision sessions, practice tests, and individual guidance."
  const splitPara2 = doc.splitTextToSize(para2, pageWidth - 44)
  doc.text(splitPara2, 22, 98)

  // Timing Section
  doc.setFont("helvetica", "bold")
  doc.text("PEC Timing:", 22, 116)
  doc.setFont("helvetica", "normal")
  doc.text("Revision 03.00 P.M to 4.00", 30, 124)

  // Pattern for PEC Test
  doc.setFont("helvetica", "bold")
  doc.text("Pattern for PEC Test:", 22, 134)
  doc.setFont("helvetica", "normal")
  doc.text("Test: 04.00 P.M., to 05.00 P.M.,", 30, 142)
  doc.text("Part – A (5 Questions)", 30, 150)
  doc.text("Part – B (2 Questions)", 30, 158)

  // Footer: PEC Coordinator
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("PEC Coordinator", pageWidth - 25, 230, { align: "right" })

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 2: PEC TIMETABLE
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  addLogo()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.text(deptFull, pageWidth / 2, 42, { align: "center" })

  doc.setFontSize(11)
  doc.text("PEC TIMETABLE", pageWidth / 2, 50, { align: "center" })

  // Timetable table rows
  const ttBody = subjects.map((subj, index) => {
    const codeMatch = subj.name.match(/\(([A-Za-z0-9]+)\)/)
    const code = codeMatch ? codeMatch[1] : (subj.name.slice(0, 7) || `C0${index + 1}`)
    const cleanName = subj.name.replace(/\([A-Za-z0-9]+\)/, "").trim()

    // Format date e.g. 27.07.26
    let formattedDate = subj.date || "TBA"
    if (formattedDate.includes("-")) {
      const [yy, mm, dd] = formattedDate.split("-")
      formattedDate = `${dd}.${mm}.${yy.slice(-2)}`
    }

    return [
      String(index + 1),
      formattedDate,
      code,
      cleanName.toUpperCase(),
      subj.staffName || subj.staffCode || "Faculty Handler",
    ]
  })

  autoTable(doc, {
    startY: 58,
    margin: { left: 20, right: 20 },
    head: [["S.No", "DATE", "COURSE CODE", "COURSE NAME", "FACULTY NAME"]],
    body: ttBody,
    theme: "plain",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.35,
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 3.5,
      valign: "middle",
    },
    headStyles: {
      font: "helvetica",
      fontStyle: "bold",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.35,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 14 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "center", cellWidth: 26 },
      3: { halign: "left", cellWidth: 54 },
      4: { halign: "left" },
    },
  })

  const finalTtY = (doc as any).lastAutoTable.finalY || 180

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const adviseText = "All concerned students are advised to attend the Performance Enhancement Class I regularly and make use of this opportunity to improve their subject’s knowledge."
  const splitAdvise = doc.splitTextToSize(adviseText, pageWidth - 40)
  doc.text(splitAdvise, 20, finalTtY + 14)

  // Signatures at bottom
  const hodDeptCode = dept.includes("CSE") ? "HOD/CSE" : (dept.includes("AIML") ? "HOD/AIML" : "HOD/AI&DS")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("PEC Coordinator", 30, pageHeight - 35)
  doc.text(hodDeptCode, pageWidth - 30, pageHeight - 35, { align: "right" })

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 3: SAMPLE ATTENDANCE SHEET
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  addLogo()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("SAMPLE ATTENDANCE SHEET", pageWidth / 2, 45, { align: "center" })
  // underline
  const titleWidth = doc.getTextWidth("SAMPLE ATTENDANCE SHEET")
  doc.line((pageWidth / 2) - (titleWidth / 2), 46.5, (pageWidth / 2) + (titleWidth / 2), 46.5)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10.5)
  doc.text("DEPARTMENT", 22, 56)
  doc.text(":", 70, 56)
  doc.text(dept.toUpperCase(), 75, 56)

  const firstSubj = subjects[0] || { name: "", staffName: "", staffCode: "", date: "" }
  doc.text("SUBJECT CODE & NAME", 22, 64)
  doc.text(":", 70, 64)
  doc.text(firstSubj.name || "", 75, 64)

  doc.text("SUBJECT HANDLER", 22, 72)
  doc.text(":", 70, 72)
  doc.text(firstSubj.staffName || firstSubj.staffCode || "", 75, 72)

  // Attendance Date
  let attDateStr = firstSubj.date || issueDate
  if (attDateStr.includes("-")) {
    const [yy, mm, dd] = attDateStr.split("-")
    attDateStr = `${dd}.${mm}.${yy}`
  }

  // Get failed students for first subject or sample list
  const failedFirst = students.filter((s) => {
    const val = s.subjects[firstSubj.name]
    return val === "F" || val === "AB" || (typeof val === "number" && val < 50) || String(val).toUpperCase() === "F"
  })

  // Show up to 10 rows or sample rows
  const attRows = (failedFirst.length > 0 ? failedFirst : students).slice(0, 10).map((s, idx) => [
    String(idx + 1),
    s.registerNo || "",
    s.studentName || "",
    "",
  ])

  // If fewer than 3, pad empty rows like sample
  while (attRows.length < 3) {
    attRows.push([String(attRows.length + 1), "", "", ""])
  }

  autoTable(doc, {
    startY: 80,
    margin: { left: 20, right: 20 },
    head: [["SL.NO", "REGISTER NO", "STUDENT NAME", attDateStr]],
    body: attRows,
    theme: "plain",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.35,
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 4,
      valign: "middle",
    },
    headStyles: {
      font: "helvetica",
      fontStyle: "bold",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.35,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { halign: "center", cellWidth: 50 },
      2: { halign: "left", cellWidth: 65 },
      3: { halign: "center" },
    },
  })

  // Footer: PEC COORDINATOR and HOD
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("PEC COORDINATOR", 25, pageHeight - 40)
  doc.text("HOD", pageWidth - 35, pageHeight - 40, { align: "right" })

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 4: SAMPLE ASSESSMENT SHEET
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  addLogo()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.text("SAMPLE ASSESSMENT SHEET", pageWidth / 2, 45, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  doc.text("COURSE CODE & NAME", 22, 56)
  doc.text(":", 70, 56)
  doc.setFont("helvetica", "normal")
  doc.text(firstSubj.name || "", 75, 56)

  const assRows = (failedFirst.length > 0 ? failedFirst : students).slice(0, 10).map((s, idx) => [
    String(idx + 1),
    s.registerNo || "",
    s.studentName || "",
    "",
    "",
  ])

  while (assRows.length < 3) {
    assRows.push([String(assRows.length + 1), "", "", "", ""])
  }

  autoTable(doc, {
    startY: 64,
    margin: { left: 20, right: 20 },
    head: [["SL.NO", "REGISTER NO", "STUDENT NAME", "CAT 1 (50)", "PEC\nMark (20)"]],
    body: assRows,
    theme: "plain",
    tableLineColor: [0, 0, 0],
    tableLineWidth: 0.35,
    styles: {
      font: "helvetica",
      fontSize: 9.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
      cellPadding: 3.5,
      valign: "middle",
    },
    headStyles: {
      font: "helvetica",
      fontStyle: "bold",
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      halign: "center",
      valign: "middle",
      lineWidth: 0.35,
      lineColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 18 },
      1: { halign: "center", cellWidth: 46 },
      2: { halign: "left", cellWidth: 58 },
      3: { halign: "center", cellWidth: 24 },
      4: { halign: "center" },
    },
  })

  const finalAssY = (doc as any).lastAutoTable.finalY || 130

  // Draw Illustrative Chart Box (matching Page 4)
  const chartBoxX = 35
  const chartBoxY = Math.max(finalAssY + 12, 135)
  const chartW = 140
  const chartH = 75

  doc.setDrawColor(200, 200, 200)
  doc.rect(chartBoxX, chartBoxY, chartW, chartH)

  // Legend
  doc.setFillColor(59, 130, 246) // Blue
  doc.rect(chartBoxX + 65, chartBoxY + 5, 4, 3, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text("CAT 1 (25)", chartBoxX + 71, chartBoxY + 7.5)

  doc.setFillColor(249, 115, 22) // Orange
  doc.rect(chartBoxX + 95, chartBoxY + 5, 4, 3, "F")
  doc.text("PEC Mark (20)", chartBoxX + 101, chartBoxY + 7.5)

  // Chart Y axis gridlines
  const yAxisX = chartBoxX + 15
  const baselineY = chartBoxY + 60
  doc.setDrawColor(230, 230, 230)
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  for (let val = 0; val <= 16; val += 2) {
    const yPos = baselineY - (val * 2.8)
    doc.line(yAxisX, yPos, chartBoxX + chartW - 10, yPos)
    doc.text(String(val), yAxisX - 4, yPos + 1, { align: "right" })
  }

  // Draw Sample Comparison Bars
  const sampleBars = [
    { reg: failedFirst[0]?.registerNo || "2117240020007", cat: 10, pec: 15 },
    { reg: failedFirst[1]?.registerNo || "2117240020017", cat: 3, pec: 13 },
    { reg: failedFirst[2]?.registerNo || "2117240020041", cat: 11, pec: 14 },
  ]

  const barGroupWidth = 32
  sampleBars.forEach((b, i) => {
    const groupX = yAxisX + 12 + (i * 38)
    // Blue bar (CAT 1)
    const catHeight = b.cat * 2.8
    doc.setFillColor(59, 130, 246)
    doc.rect(groupX, baselineY - catHeight, 8, catHeight, "F")

    // Orange bar (PEC)
    const pecHeight = b.pec * 2.8
    doc.setFillColor(249, 115, 22)
    doc.rect(groupX + 8, baselineY - pecHeight, 8, pecHeight, "F")

    // Label below
    doc.setFontSize(7)
    doc.setTextColor(50, 50, 50)
    doc.text(b.reg, groupX + 8, baselineY + 6, { align: "center" })
  })

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 5: OUTCOME SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  addLogo()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("OUTCOME SUMMARY", pageWidth / 2, 45, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  doc.text(`Department: ${dept.replace(/DEPARTMENT OF\s*/i, "").trim() || "Artificial Intelligence and Data Science"}`, 22, 56)

  doc.text("Course Code & Course Name: ________________________________________________", 22, 66)
  doc.text("Faculty: __________________________________________________________________", 22, 76)
  doc.text("Date: ___________________", 22, 86)

  doc.setFontSize(11)
  doc.text("Summary", 22, 98)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10.5)
  doc.text("•  Total Students Eligible : _______", 26, 108)
  doc.text("•  Students Attended : _______", 26, 118)
  doc.text("•  Topics Revised : _______________________________________________________", 26, 128)
  doc.text("•  Common Learning Gaps Identified : ________________________________________", 26, 138)
  doc.text("•  Improvement Observed : _________________________________________________", 26, 148)
  doc.text("•  Follow-up Actions Recommended : _________________________________________", 26, 158)

  doc.setFont("helvetica", "bold")
  doc.text("Overall Outcome:", 22, 172)

  doc.setFont("helvetica", "normal")
  const outcomePara = "The Performance Enhancement Class (PEC) was conducted successfully. Students demonstrated improved understanding of the key concepts through revision and assessment. The session helped identify learning gaps and provided targeted academic support to enhance their performance in future assessments."
  const splitOutcome = doc.splitTextToSize(outcomePara, pageWidth - 44)
  doc.text(splitOutcome, 22, 182)

  // 3 Signatures at bottom
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  doc.text("Subject Handler", 25, pageHeight - 35)
  doc.text("PEC Coordinator", pageWidth / 2, pageHeight - 35, { align: "center" })
  doc.text("Head of the Department", pageWidth - 25, pageHeight - 35, { align: "right" })

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE 6: INSTRUCTIONS TO FACULTY
  // ══════════════════════════════════════════════════════════════════════════
  doc.addPage()
  addLogo()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text("Instructions to Faculty", 22, 45)

  const instructions = [
    { text: "Conduct the PEC class strictly as per the scheduled date and time.", bold: "" },
    { text: "Take attendance before commencing the revision session.", bold: "" },
    { text: "Conduct the Revision Session from 03.00 PM to 04.00 PM.", bold: "Revision Session from 03.00 PM to 04.00 PM." },
    { text: "Conduct the PEC Test from 04.00 PM to 05.00 PM following the prescribed question paper pattern.", bold: "PEC Test from 04.00 PM to 05.00 PM" },
    { text: "Evaluate the answer scripts and record the marks in the Assessment Sheet.", bold: "" },
    { text: "Provide necessary guidance and clarify students' doubts during the session.", bold: "" },
    { text: "Ensure discipline and regular attendance throughout the PEC class.", bold: "" },
    { text: "Course Coordinators shall collect and maintain the Attendance Sheet, Question Paper, Answer Key, and Assessment Sheet in the Course File.", bold: "Attendance Sheet, Question Paper, Answer Key, and Assessment Sheet" },
    { text: "Individual Subject Handling Faculty shall also maintain copies of the above documents for their respective classes in their Course File for academic records and audit purposes.", bold: "" },
  ]

  let curY = 56
  instructions.forEach((inst, i) => {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10.5)
    doc.text(`${i + 1}.`, 22, curY)
    const splitLines = doc.splitTextToSize(inst.text, pageWidth - 55)
    doc.text(splitLines, 30, curY)
    curY += (splitLines.length * 6) + 4
  })

  // Footer: PEC COORDINATOR and HOD
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("PEC COORDINATOR", 25, pageHeight - 35)
  doc.text("HOD", pageWidth - 35, pageHeight - 35, { align: "right" })

  // Save PDF
  const cleanDept = dept.replace(/[^a-zA-Z0-9]/g, "_")
  const cleanSem = semester.replace(/[^a-zA-Z0-9]/g, "_")
  doc.save(`PEC_Official_Document_${cleanDept}_${cleanSem}_Sec${section}.pdf`)
}

