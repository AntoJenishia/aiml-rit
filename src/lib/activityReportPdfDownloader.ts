import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { RIT_LOGO_BASE64 } from "./ritLogoBase64"

export interface ActivityReportData {
  range: {
    fromDate: string
    toDate: string
    workingDays: number
  }
  kpi: {
    totalStudents: number
    overallAttendanceRate: number
    totalPresent: number
    totalAbsent: number
    totalOd: number
    totalOdRequests: number
    verifiedOdCount: number
    completedOdCount: number
    totalLeaveRequests: number
    approvedLeaveCount: number
    totalAchievementsCount: number
    frequentAbsenteesCount: number
  }
  sectionsSummary: {
    batch: string
    section: string
    inchargeName: string
    totalSessions: number
    presentCount: number
    absentCount: number
    odCount: number
    attendanceRate: number
    studentCount: number
  }[]
  frequentAbsentees: {
    uid: string
    name: string
    registerNumber: string
    batch: string
    section: string
    absentCount: number
    absentReasons: string[]
    inchargeName: string
  }[]
}

export function downloadActivityReportPdf(data: ActivityReportData) {
  if (!data) {
    alert("No report data available to export.")
    return
  }

  const { range, kpi, sectionsSummary, frequentAbsentees } = data

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Institutional Top Blue Stripe
  doc.setFillColor(0, 48, 135) // RIT Navy #003087
  doc.rect(0, 0, pageWidth, 5, "F")

  // 2. Add RIT Logo
  try {
    doc.addImage(RIT_LOGO_BASE64, "PNG", 14, 10, 40, 15)
  } catch (e) {
    console.error("[PDF Downloader] Logo render skipped:", e)
  }

  // 3. College & Department Headers
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(0, 48, 135)
  doc.text("RAJALAKSHMI INSTITUTE OF TECHNOLOGY", 60, 15)

  doc.setFontSize(8.5)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("An Autonomous Institution | Affiliated to Anna University, Chennai", 60, 20)
  doc.text("Kuthambakkam, Poonamallee, Chennai - 600 124", 60, 24)

  // Divider line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(14, 28, pageWidth - 14, 28)

  // 4. Report Title Banner
  doc.setFillColor(248, 250, 252)
  doc.rect(14, 30, pageWidth - 28, 14, "F")
  doc.setDrawColor(203, 213, 225)
  doc.rect(14, 30, pageWidth - 28, 14, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10.5)
  doc.setTextColor(15, 23, 42)
  doc.text("DEPARTMENT ACTIVITY & ATTENDANCE CONSOLIDATED REPORT", pageWidth / 2, 36, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(0, 48, 135)
  doc.text(
    `DATE RANGE: ${range.fromDate} to ${range.toDate}   |   WORKING DAYS LOGGED: ${range.workingDays}`,
    pageWidth / 2,
    41,
    { align: "center" }
  )

  // 5. 4-Box Key Performance Metrics Strip
  const startY = 47
  const boxWidth = (pageWidth - 28 - 9) / 4
  const boxHeight = 15

  const metricBoxes = [
    { label: "OVERALL ATTENDANCE", val: `${kpi.overallAttendanceRate}%`, color: [16, 185, 129] }, // Green
    { label: "VERIFIED ODs", val: `${kpi.verifiedOdCount + kpi.completedOdCount}`, color: [99, 102, 241] }, // Indigo
    { label: "APPROVED LEAVES", val: `${kpi.approvedLeaveCount}`, color: [245, 158, 11] }, // Amber
    { label: "ACHIEVEMENTS", val: `${kpi.totalAchievementsCount}`, color: [14, 165, 233] }, // Blue
  ]

  metricBoxes.forEach((b, idx) => {
    const x = 14 + idx * (boxWidth + 3)
    doc.setFillColor(255, 255, 255)
    doc.rect(x, startY, boxWidth, boxHeight, "F")
    doc.setDrawColor(226, 232, 240)
    doc.rect(x, startY, boxWidth, boxHeight, "S")

    // Left colored accent border
    doc.setFillColor(b.color[0], b.color[1], b.color[2])
    doc.rect(x, startY, 2.5, boxHeight, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text(b.label, x + 5, startY + 5)

    doc.setFontSize(11)
    doc.setTextColor(15, 23, 42)
    doc.text(b.val, x + 5, startY + 11.5)
  })

  // 6. Section Performance Matrix Table
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text("1. SECTION-WISE ATTENDANCE & ACTIVITY MATRIX", 14, startY + boxHeight + 6)

  const sectionTableData = sectionsSummary.map((sec, idx) => [
    (idx + 1).toString(),
    sec.batch,
    sec.section,
    sec.inchargeName,
    sec.totalSessions.toString(),
    sec.studentCount.toString(),
    sec.presentCount.toString(),
    sec.absentCount.toString(),
    sec.odCount.toString(),
    `${sec.attendanceRate}%`,
  ])

  autoTable(doc, {
    startY: startY + boxHeight + 8,
    head: [["S.No", "Batch", "Sec", "Class Incharge", "Marked Days", "Students", "Present", "Absent", "OD", "Att %"]],
    body: sectionTableData,
    theme: "grid",
    headStyles: {
      fillColor: [0, 48, 135],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 12, halign: "center" },
      3: { cellWidth: 46, halign: "left" },
      4: { cellWidth: 18, halign: "center" },
      5: { cellWidth: 16, halign: "center" },
      6: { cellWidth: 16, halign: "center" },
      7: { cellWidth: 16, halign: "center" },
      8: { cellWidth: 14, halign: "center" },
      9: { cellWidth: 14, halign: "center", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  })

  // @ts-ignore
  let currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 130

  // Check page overflow for Table 2
  if (currentY + 50 > pageHeight - 35) {
    doc.addPage()
    currentY = 20
  }

  // 7. Frequent Absentees Table (At-Risk Students >= 3 Absences)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(15, 23, 42)
  doc.text(
    `2. AT-RISK ATTENDANCE MONITOR (Frequent Absentees >= 3 Days in Range: ${frequentAbsentees.length})`,
    14,
    currentY
  )

  const absenteesTableData = frequentAbsentees.slice(0, 30).map((stu, idx) => [
    (idx + 1).toString(),
    stu.registerNumber,
    stu.name,
    `${stu.batch} - ${stu.section}`,
    stu.absentCount.toString(),
    stu.inchargeName,
    stu.absentReasons.length > 0 ? stu.absentReasons[0].slice(0, 40) : "No Reason Submitted",
  ])

  if (absenteesTableData.length === 0) {
    absenteesTableData.push(["—", "—", "All students maintain healthy attendance in this range", "—", "0", "—", "—"])
  }

  autoTable(doc, {
    startY: currentY + 3,
    head: [["S.No", "Register No", "Student Name", "Class", "Absent Days", "Incharge", "Latest Reason / Note"]],
    body: absenteesTableData,
    theme: "grid",
    headStyles: {
      fillColor: [190, 18, 60], // Dark Rose / Red for alerts
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 26, halign: "center" },
      2: { cellWidth: 40, halign: "left" },
      3: { cellWidth: 24, halign: "center" },
      4: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 32, halign: "left" },
      6: { cellWidth: 32, halign: "left" },
    },
    margin: { left: 14, right: 14 },
  })

  // @ts-ignore
  let signY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 18 : 220
  if (signY + 25 > pageHeight - 15) {
    doc.addPage()
    signY = 30
  }

  // 8. Signatures Block
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  doc.text("Prepared By", 25, signY)
  doc.text("Verified By (Class Incharge)", 85, signY)
  doc.text("Dr. SELVAKUMARAN S.", pageWidth - 55, signY)

  doc.setFont("helvetica", "bold")
  doc.text("Head of the Department", pageWidth - 55, signY + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text("Department of AIML, RIT", pageWidth - 55, signY + 7.5)

  // Generated timestamp footer
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(
    `Report Generated on: ${new Date().toLocaleString("en-IN")} · Official AIML Portal`,
    14,
    pageHeight - 8
  )

  // Instant direct file download
  doc.save(`RIT_AIML_Activity_Report_${range.fromDate}_to_${range.toDate}.pdf`)
}

