import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { RIT_LOGO_BASE64 } from "./ritLogoBase64"

export interface ExportSectionSummary {
  batch: string
  section: string
  classTitle?: string
  studentCount: number
  staffCode: string | null
  inchargeName: string
  isMarked: boolean
  isLocked: boolean
  presentCount: number
  absentCount: number
  odCount: number
  attendanceRate: number
  records: any[] | Record<string, any> | null
}

export function downloadOfficialAttendancePdf(
  sectionsToExport: ExportSectionSummary[],
  selectedDate: string,
  reportTitle: string = "Department Attendance Consolidated Report"
) {
  if (!sectionsToExport || sectionsToExport.length === 0) {
    alert("No attendance records to export.")
    return
  }

  // 1. Initialize A4 Document (210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Calculate totals
  let totalEnrolled = 0
  let totalP = 0
  let totalA = 0
  let totalOd = 0

  const allStudentsList: {
    regNo: string
    name: string
    batch: string
    section: string
    status: string
    remarks: string
  }[] = []

  sectionsToExport.forEach((sec) => {
    if (sec.isMarked) {
      totalEnrolled += sec.studentCount
      totalP += sec.presentCount
      totalA += sec.absentCount
      totalOd += sec.odCount
    }

    const raw = sec.records
    const recs: any[] = Array.isArray(raw)
      ? raw
      : raw ? Object.values(raw) : []

    recs.forEach((r) => {
      let remarks = "—"
      if (r.status === "ABSENT") {
        remarks = r.absentReason
          ? `Reason: ${r.absentReason} (${r.absentCategory || "Explained"})`
          : "Explanation Pending"
      } else if (r.status === "OD") {
        remarks = `OD: ${r.odTitle || "Academic"} (Ref: ${r.odRefNumber || "Verified"})`
      }

      allStudentsList.push({
        regNo: r.registerNumber || "—",
        name: r.name || "Student",
        batch: sec.batch,
        section: sec.section,
        status: r.status || (sec.isMarked ? "PRESENT" : "NOT_MARKED"),
        remarks,
      })
    })
  })

  // Sort strictly by register number
  allStudentsList.sort((a, b) =>
    a.regNo.localeCompare(b.regNo, undefined, { numeric: true })
  )

  const overallRate = totalEnrolled > 0 ? Math.round(((totalP + totalOd) / totalEnrolled) * 100) : 100

  // ── Header Function (for Page 1) ──
  const startY = 12

  // 1. Logo
  try {
    doc.addImage(RIT_LOGO_BASE64, "PNG", 12, startY, 32, 14, undefined, "FAST")
  } catch (e) {
    console.warn("Could not draw RIT logo", e)
  }

  // 2. Institution Text
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(0, 48, 135) // RIT Navy Blue
  doc.text("RAJALAKSHMI INSTITUTE OF TECHNOLOGY", 48, startY + 4)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(71, 85, 105)
  doc.text("An Autonomous Institution · Affiliated to Anna University, Chennai", 48, startY + 8)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(2, 132, 199)
  doc.text("DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", 48, startY + 12)

  // Top dividing line
  doc.setDrawColor(0, 48, 135)
  doc.setLineWidth(0.6)
  doc.line(12, startY + 16, pageWidth - 12, startY + 16)

  // Report Title Badge & Meta Box
  let currentY = startY + 22
  doc.setFillColor(0, 48, 135)
  doc.roundedRect(12, currentY - 4, 85, 6.5, 1.5, 1.5, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text(reportTitle.toUpperCase(), 15, currentY)

  // Metadata right aligned
  doc.setTextColor(15, 23, 42)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.text(`Date: ${selectedDate}`, pageWidth - 12, currentY - 1, { align: "right" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(`Generated: ${new Date().toLocaleTimeString()} | HOD: Dr. Selvakumaran S.`, pageWidth - 12, currentY + 3, { align: "right" })

  currentY += 8

  // ── Executive Stats Row (5 blocks) ──
  const statBoxWidth = (pageWidth - 24 - 4 * 3) / 5
  const statBoxHeight = 11

  const stats = [
    { label: "TOTAL ENROLLED", val: `${totalEnrolled}`, bg: [248, 250, 252], tc: [15, 23, 42] },
    { label: "PRESENT (P)", val: `${totalP}`, bg: [240, 253, 244], tc: [22, 101, 52] },
    { label: "ABSENT (A)", val: `${totalA}`, bg: [254, 242, 242], tc: [153, 27, 27] },
    { label: "ON-DUTY (OD)", val: `${totalOd}`, bg: [238, 242, 255], tc: [55, 48, 163] },
    { label: "ATTENDANCE RATE", val: `${overallRate}%`, bg: [0, 48, 135], tc: [255, 255, 255] },
  ]

  stats.forEach((s, idx) => {
    const boxX = 12 + idx * (statBoxWidth + 3)
    doc.setFillColor(s.bg[0], s.bg[1], s.bg[2])
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.2)
    doc.roundedRect(boxX, currentY, statBoxWidth, statBoxHeight, 1, 1, "FD")

    // Label
    doc.setFont("helvetica", "bold")
    doc.setFontSize(6)
    if (s.tc[0] === 255) {
      doc.setTextColor(186, 230, 253)
    } else {
      doc.setTextColor(100, 116, 139)
    }
    doc.text(s.label, boxX + statBoxWidth / 2, currentY + 3.8, { align: "center" })

    // Val
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(s.tc[0], s.tc[1], s.tc[2])
    doc.text(s.val, boxX + statBoxWidth / 2, currentY + 8.8, { align: "center" })
  })

  currentY += statBoxHeight + 5

  // ── Table 1: Section Consolidation ──
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(0, 48, 135)
  doc.text("1. SECTION-WISE CONSOLIDATION SUMMARY", 12, currentY)
  currentY += 2

  const sectionRows = sectionsToExport.map((s) => [
    `Batch ${s.batch}`,
    `Sec ${s.section}`,
    `${s.inchargeName} (${s.staffCode || "—"})`,
    `${s.studentCount}`,
    s.isMarked ? `${s.presentCount}` : "—",
    s.isMarked ? `${s.absentCount}` : "—",
    s.isMarked ? `${s.odCount}` : "—",
    s.isMarked ? `${s.attendanceRate}%` : "Pending",
    s.isMarked ? (s.isLocked ? "Locked" : "Unlocked") : "Not Marked",
  ])

  autoTable(doc, {
    startY: currentY,
    margin: { left: 12, right: 12 },
    head: [["Batch", "Section", "Class Incharge", "Total", "Present", "Absent", "OD", "Rate", "Status"]],
    body: sectionRows,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", halign: "left", cellWidth: 26 },
      1: { halign: "center", cellWidth: 16 },
      2: { halign: "left" },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "center", cellWidth: 16, fontStyle: "bold", textColor: [22, 101, 52] },
      5: { halign: "center", cellWidth: 16, fontStyle: "bold", textColor: [153, 27, 27] },
      6: { halign: "center", cellWidth: 14, fontStyle: "bold", textColor: [55, 48, 163] },
      7: { halign: "center", cellWidth: 18, fontStyle: "bold" },
      8: { halign: "center", cellWidth: 22 },
    },
  })

  // ── Table 2: Complete Student Roster (Sorted by Register Number) ──
  // @ts-ignore
  let afterTable1Y = (doc as any).lastAutoTable?.finalY + 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(0, 48, 135)
  doc.text(`2. COMPLETE STUDENT ATTENDANCE ROSTER (${allStudentsList.length} Students)`, 12, afterTable1Y)
  afterTable1Y += 2

  const studentRows = allStudentsList.map((st, i) => [
    `${i + 1}`,
    st.regNo,
    st.name,
    `${st.batch} (${st.section})`,
    st.status,
    st.remarks,
  ])

  autoTable(doc, {
    startY: afterTable1Y,
    margin: { left: 12, right: 12, bottom: 24 },
    head: [["S.No", "Register No", "Student Name", "Class", "Status", "Remarks / Reason / OD Details"]],
    body: studentRows,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontSize: 7.5,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 1.6,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 12, fontStyle: "bold" },
      1: { halign: "center", cellWidth: 28, fontStyle: "bold", textColor: [0, 48, 135] },
      2: { halign: "left", fontStyle: "bold" },
      3: { halign: "center", cellWidth: 24 },
      4: { halign: "center", cellWidth: 20, fontStyle: "bold" },
      5: { halign: "left", fontSize: 6.8 },
    },
    didParseCell: (data) => {
      // Colorize Status column (column index 4)
      if (data.section === "body" && data.column.index === 4) {
        const val = String(data.cell.raw).toUpperCase()
        if (val === "PRESENT") {
          data.cell.styles.textColor = [22, 101, 52]
          data.cell.styles.fillColor = [240, 253, 244]
        } else if (val === "ABSENT") {
          data.cell.styles.textColor = [153, 27, 27]
          data.cell.styles.fillColor = [254, 242, 242]
        } else if (val === "OD") {
          data.cell.styles.textColor = [55, 48, 163]
          data.cell.styles.fillColor = [238, 242, 255]
        }
      }
    },
  })

  // ── Official Signatures & Footer on Final Page ──
  const totalPages = doc.getNumberOfPages()

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)

    // Footer page number & computer generated stamp
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(
      "Official Academic Document · Rajalakshmi Institute of Technology · Department of AIML",
      12,
      pageHeight - 6
    )
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - 12, pageHeight - 6, { align: "right" })
  }

  // Draw Signatures on the last page if there is space, otherwise add a clean signature block
  doc.setPage(totalPages)
  // @ts-ignore
  let finalY = (doc as any).lastAutoTable?.finalY || 200

  // If table went too close to bottom, add new page for signature block
  if (finalY > pageHeight - 38) {
    doc.addPage()
    finalY = 25
  } else {
    finalY += 14
  }

  const sigBlockY = finalY + 12
  const sigColWidth = (pageWidth - 24) / 3

  // Class Incharge
  doc.setDrawColor(71, 85, 105)
  doc.setLineWidth(0.4)
  doc.line(18, sigBlockY, 18 + 40, sigBlockY)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text("CLASS INCHARGE", 18 + 20, sigBlockY + 4, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text("Department of AIML", 18 + 20, sigBlockY + 7.5, { align: "center" })

  // HOD
  const hodX = 12 + sigColWidth + (sigColWidth - 40) / 2
  doc.line(hodX, sigBlockY, hodX + 40, sigBlockY)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text("HEAD OF DEPARTMENT", hodX + 20, sigBlockY + 4, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text("Dr. Selvakumaran S. (AIML)", hodX + 20, sigBlockY + 7.5, { align: "center" })

  // Principal
  const prinX = pageWidth - 12 - 45
  doc.line(prinX, sigBlockY, prinX + 40, sigBlockY)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(15, 23, 42)
  doc.text("PRINCIPAL", prinX + 20, sigBlockY + 4, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.setTextColor(100, 116, 139)
  doc.text("Rajalakshmi Inst. of Tech.", prinX + 20, sigBlockY + 7.5, { align: "center" })

  // ── Trigger Instant Direct File Download ──
  const cleanFilename = `${reportTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}_${selectedDate}.pdf`
  doc.save(cleanFilename)
}

