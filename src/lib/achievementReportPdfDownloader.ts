import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { RIT_LOGO_BASE64 } from "./ritLogoBase64"

export interface AchievementItem {
  id: string
  studentUid?: string
  studentName?: string
  registerNumber?: string
  class?: string
  batch?: string
  section?: string
  title?: string
  category?: string
  eventName?: string
  date?: string
  position?: string
  description?: string
  proofFileUrl?: string
  status?: string
  verifiedBy?: string
  createdAt?: string
}

export interface AchievementReportOptions {
  fromDate: string
  toDate: string
  achievements: AchievementItem[]
  includeProofs?: boolean
  generatedBy?: string
}

async function fetchImageAsBase64(url: string): Promise<{ dataUrl: string; format: "JPEG" | "PNG" } | null> {
  try {
    const res = await fetch(url, { mode: "cors" })
    if (!res.ok) return null
    const blob = await res.blob()
    if (!blob.type.startsWith("image/")) return null
    const format = blob.type.includes("png") ? "PNG" : "JPEG"
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          resolve({ dataUrl: reader.result, format })
        } else {
          resolve(null)
        }
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function downloadAchievementReportPdf({
  fromDate,
  toDate,
  achievements,
  includeProofs = false,
  generatedBy = "Head of Department",
}: AchievementReportOptions) {
  if (!achievements || achievements.length === 0) {
    alert("No achievements found in the selected date range to generate report.")
    return
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // 1. Institutional Top Navy Stripe
  doc.setFillColor(0, 48, 135) // RIT Navy #003087
  doc.rect(0, 0, pageWidth, 5, "F")

  // 2. Add RIT Logo
  try {
    doc.addImage(RIT_LOGO_BASE64, "PNG", 14, 10, 38, 14)
  } catch (e) {
    console.error("[AchievementReport] Logo render skipped:", e)
  }

  // 3. College & Department Headers
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(0, 48, 135)
  doc.text("RAJALAKSHMI INSTITUTE OF TECHNOLOGY", 56, 15)

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(75, 85, 99)
  doc.text("An Autonomous Institution | Affiliated to Anna University, Chennai", 56, 19.5)
  doc.text("Department of Artificial Intelligence & Machine Learning", 56, 23.5)

  // Divider Line
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.4)
  doc.line(14, 27, pageWidth - 14, 27)

  // 4. Report Title Banner
  doc.setFillColor(248, 250, 252)
  doc.rect(14, 29, pageWidth - 28, 13, "F")
  doc.setDrawColor(203, 213, 225)
  doc.rect(14, 29, pageWidth - 28, 13, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(15, 23, 42)
  doc.text("DEPARTMENT STUDENT ACHIEVEMENTS CONSOLIDATED REPORT", pageWidth / 2, 34.5, { align: "center" })

  doc.setFontSize(7.5)
  doc.setTextColor(0, 48, 135)
  const rangeStr = fromDate && toDate ? `${fromDate}  to  ${toDate}` : fromDate ? `From ${fromDate}` : toDate ? `Up to ${toDate}` : "All Recorded Periods"
  doc.text(`REPORT PERIOD: ${rangeStr}   |   GENERATED: ${new Date().toLocaleDateString("en-IN")}`, pageWidth / 2, 39, { align: "center" })

  // 5. Key Metrics Strip
  const totalCount = achievements.length
  const verifiedCount = achievements.filter((a) => a.status === "VERIFIED" || a.status === "APPROVED").length
  const winnersCount = achievements.filter((a) => {
    const pos = (a.position || "").toLowerCase()
    return pos.includes("win") || pos.includes("1st") || pos.includes("first") || pos.includes("2nd") || pos.includes("second") || pos.includes("3rd") || pos.includes("prize")
  }).length
  const pendingCount = achievements.filter((a) => a.status === "PENDING_VERIFICATION" || !a.status).length

  const startY = 45
  const boxWidth = (pageWidth - 28 - 9) / 4
  const boxHeight = 14

  const metricBoxes = [
    { label: "TOTAL ENTRIES", val: totalCount.toString(), color: [14, 165, 233] },
    { label: "VERIFIED & APPROVED", val: verifiedCount.toString(), color: [16, 185, 129] },
    { label: "PRIZES & WINNERS", val: winnersCount.toString(), color: [245, 158, 11] },
    { label: "PENDING VERIFICATION", val: pendingCount.toString(), color: [99, 102, 241] },
  ]

  metricBoxes.forEach((b, idx) => {
    const x = 14 + idx * (boxWidth + 3)
    doc.setFillColor(255, 255, 255)
    doc.rect(x, startY, boxWidth, boxHeight, "F")
    doc.setDrawColor(226, 232, 240)
    doc.rect(x, startY, boxWidth, boxHeight, "S")

    // Colored left indicator
    doc.setFillColor(b.color[0], b.color[1], b.color[2])
    doc.rect(x, startY, 2, boxHeight, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(6.5)
    doc.setTextColor(100, 116, 139)
    doc.text(b.label, x + 4.5, startY + 4.5)

    doc.setFontSize(10.5)
    doc.setTextColor(15, 23, 42)
    doc.text(b.val, x + 4.5, startY + 11)
  })

  // 6. Achievements Data Table
  const tableData = achievements.map((a, idx) => {
    const cleanDate = a.date || (a.createdAt ? a.createdAt.slice(0, 10) : "—")
    const classStr = a.class ? a.class.replace("B.E. CSE (AI & ML) / ", "") : a.batch ? `${a.batch} (${a.section || "A"})` : "AIML"
    const displayStatus = a.status === "VERIFIED" || a.status === "APPROVED" ? "Verified" : a.status === "REJECTED" ? "Rejected" : "Pending"

    return [
      (idx + 1).toString(),
      cleanDate,
      a.registerNumber || "—",
      a.studentName || "—",
      classStr,
      a.category || "General",
      `${a.title || a.eventName || "—"}${a.eventName && a.title && a.title !== a.eventName ? `\n(${a.eventName})` : ""}`,
      a.position || "Participation",
      displayStatus,
    ]
  })

  autoTable(doc, {
    startY: startY + boxHeight + 4,
    head: [["S.No", "Event Date", "Reg. No", "Student Name", "Class", "Category", "Title / Event", "Position / Prize", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [0, 48, 135],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 1.8,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 17, halign: "center" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 28, halign: "left" },
      4: { cellWidth: 16, halign: "center" },
      5: { cellWidth: 20, halign: "left" },
      6: { cellWidth: 38, halign: "left" },
      7: { cellWidth: 21, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 14, halign: "center" },
    },
    didParseCell: (data) => {
      // Color status column
      if (data.section === "body" && data.column.index === 8) {
        const val = data.cell.raw
        if (val === "Verified") {
          data.cell.styles.textColor = [16, 185, 129] // Emerald
          data.cell.styles.fontStyle = "bold"
        } else if (val === "Rejected") {
          data.cell.styles.textColor = [239, 68, 68] // Red
        } else {
          data.cell.styles.textColor = [217, 119, 6] // Amber
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 25 },
  })

  // 7. Signature Block
  // @ts-ignore
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 220
  if (finalY + 22 > pageHeight - 12) {
    doc.addPage()
    finalY = 25
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(51, 65, 85)

  doc.text("Prepared By", 25, finalY)
  doc.text("Department Coordinator", 85, finalY)
  doc.text("Dr. SELVAKUMARAN S.", pageWidth - 55, finalY)

  doc.setFont("helvetica", "bold")
  doc.text("Head of the Department", pageWidth - 55, finalY + 4)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(7)
  doc.text("Department of AIML, RIT", pageWidth - 55, finalY + 7.5)

  // 8. Annexure: Certificate Proof Copies & Verification Links (If requested by HOD)
  if (includeProofs) {
    const proofsList = achievements.filter((a) => a.proofFileUrl)
    if (proofsList.length > 0) {
      doc.addPage()
      doc.setFillColor(0, 48, 135)
      doc.rect(0, 0, pageWidth, 5, "F")

      // Annexure Header Banner
      doc.setFillColor(248, 250, 252)
      doc.rect(14, 12, pageWidth - 28, 14, "F")
      doc.setDrawColor(0, 48, 135)
      doc.setLineWidth(0.5)
      doc.rect(14, 12, pageWidth - 28, 14, "S")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(10.5)
      doc.setTextColor(0, 48, 135)
      doc.text("ANNEXURE: STUDENT CERTIFICATE COPIES & VERIFICATION PROOFS", pageWidth / 2, 18.5, { align: "center" })

      doc.setFontSize(7)
      doc.setTextColor(75, 85, 99)
      doc.text(`Official Document Dossier · ${proofsList.length} Verified Student Submission Attachments`, pageWidth / 2, 23, { align: "center" })

      let annexureY = 30

      for (let i = 0; i < proofsList.length; i++) {
        const item = proofsList[i]
        const cardHeight = 82

        // Page overflow check (2 cards per page comfortably)
        if (annexureY + cardHeight > pageHeight - 15) {
          doc.addPage()
          doc.setFillColor(0, 48, 135)
          doc.rect(0, 0, pageWidth, 5, "F")
          annexureY = 15
        }

        // Draw card border
        doc.setFillColor(255, 255, 255)
        doc.rect(14, annexureY, pageWidth - 28, cardHeight, "F")
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.3)
        doc.rect(14, annexureY, pageWidth - 28, cardHeight, "S")

        // Left accent strip
        doc.setFillColor(0, 48, 135)
        doc.rect(14, annexureY, 3, cardHeight, "F")

        // Card Header Title
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8.5)
        doc.setTextColor(15, 23, 42)
        doc.text(`Proof #${i + 1}: ${item.studentName || "Student"} (${item.registerNumber || "Reg No"})`, 20, annexureY + 6)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(100, 116, 139)
        doc.text(`Event: ${item.eventName || "—"}   |   Category: ${item.category || "General"}   |   Prize: ${item.position || "Participation"}`, 20, annexureY + 10.5)

        // Try embedding image
        const imgObj = await fetchImageAsBase64(item.proofFileUrl!)
        if (imgObj?.dataUrl) {
          try {
            doc.addImage(imgObj.dataUrl, imgObj.format, 20, annexureY + 13, 85, 62, undefined, "FAST")
          } catch (imgErr) {
            console.warn("Could not embed image into PDF:", imgErr)
          }
        } else {
          // Document badge for PDF or non-image
          doc.setFillColor(241, 245, 249)
          doc.rect(20, annexureY + 13, 85, 62, "F")
          doc.setDrawColor(203, 213, 225)
          doc.rect(20, annexureY + 13, 85, 62, "S")

          doc.setFont("helvetica", "bold")
          doc.setFontSize(8)
          doc.setTextColor(71, 85, 105)
          doc.text("Official Document Proof", 62.5, annexureY + 41, { align: "center" })
          doc.setFont("helvetica", "normal")
          doc.setFontSize(6.5)
          doc.text("Certificate file attached in cloud storage", 62.5, annexureY + 46, { align: "center" })
        }

        // Right details block
        const rightX = 110
        doc.setFont("helvetica", "bold")
        doc.setFontSize(8)
        doc.setTextColor(15, 23, 42)
        doc.text("Achievement Details:", rightX, annexureY + 17)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(7)
        doc.setTextColor(75, 85, 99)
        const titleSnippet = doc.splitTextToSize(`Title: ${item.title || "—"}`, pageWidth - rightX - 18)[0]
        doc.text(titleSnippet, rightX, annexureY + 22)
        doc.text(`Event Date: ${item.date || "—"}`, rightX, annexureY + 27)
        doc.text(`Class/Batch: ${item.batch || "AIML"} (${item.section || "A"})`, rightX, annexureY + 32)
        doc.text(`Verified Status: ${item.status || "VERIFIED"}`, rightX, annexureY + 37)

        if (item.description) {
          doc.setFont("helvetica", "italic")
          const descLines = doc.splitTextToSize(`"${item.description}"`, pageWidth - rightX - 18)
          doc.text(descLines.slice(0, 3), rightX, annexureY + 43)
        }

        // Clickable URL to high-resolution original file
        doc.setFont("helvetica", "bold")
        doc.setFontSize(7.5)
        doc.setTextColor(0, 48, 135)
        doc.textWithLink("🔗 View High-Resolution Original Proof File", rightX, annexureY + 68, { url: item.proofFileUrl! })

        annexureY += cardHeight + 5
      }
    }
  }

  // 9. Numbered Footer on All Pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Official AIML Student Achievements Report · Generated: ${new Date().toLocaleString("en-IN")}`,
      14,
      pageHeight - 6
    )
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 25, pageHeight - 6)
  }

  // Save the PDF file
  const proofSuffix = includeProofs ? "_with_proofs" : ""
  const filename = `RIT_AIML_Achievements_Report_${fromDate || "Start"}_to_${toDate || "End"}${proofSuffix}.pdf`
  doc.save(filename)
}

export function exportAchievementsCsv(achievements: AchievementItem[], fromDate?: string, toDate?: string) {
  if (!achievements || achievements.length === 0) {
    alert("No achievements found to export.")
    return
  }

  const headers = [
    "S.No",
    "Event Date",
    "Register Number",
    "Student Name",
    "Batch",
    "Section",
    "Category",
    "Title / Project",
    "Event Name",
    "Position / Prize",
    "Status",
    "Description",
    "Proof Document URL",
    "Submission Date",
  ]

  const rows = achievements.map((a, idx) => {
    const clean = (val: any) => `"${(val || "").toString().replace(/"/g, '""')}"`
    return [
      idx + 1,
      clean(a.date || (a.createdAt ? a.createdAt.slice(0, 10) : "")),
      clean(a.registerNumber),
      clean(a.studentName),
      clean(a.batch),
      clean(a.section),
      clean(a.category),
      clean(a.title),
      clean(a.eventName),
      clean(a.position),
      clean(a.status),
      clean(a.description),
      clean(a.proofFileUrl),
      clean(a.createdAt ? a.createdAt.slice(0, 10) : ""),
    ].join(",")
  })

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n")
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute(
    "download",
    `RIT_AIML_Student_Achievements_${fromDate || "Start"}_to_${toDate || "End"}.csv`
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
