import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import QRCode from "qrcode"
import { formatDate } from "./dateUtils"
import fs from "fs"
import path from "path"

export interface ODPdfParams {
  referenceNumber: string
  status: string  // raw ODStatus enum value at generation time
  studentName: string
  registerNumber: string
  department: string   // e.g. "AIML" or "AIDS"
  classLabel: string
  section: string
  year: string | number
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  odDays: number       // Number of OD working days (max 3)
  reason: string
  facultyName: string
  hodName: string
  facultyApproved: boolean
  hodApproved: boolean
  facultyRespondedAt?: any
  hodRespondedAt?: any
  verifyUrl: string
  // For group OD
  groupMembers?: Array<{
    name: string
    registerNumber: string
    department: string
    section: string
    year: string | number
  }>
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function wrapText(text: string, maxWidth: number, font: any, size: number): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth) {
      if (line) lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function departmentLabel(dept: string): string {
  if (dept === "AIDS") return "Artificial Intelligence and Data Science"
  return "Artificial Intelligence and Machine Learning"
}

function statusBanner(status: string): string {
  const map: Record<string, string> = {
    PENDING_FACULTY: "STATUS: PENDING FACULTY APPROVAL — NOT YET APPROVED",
    REJECTED_FACULTY: "STATUS: REJECTED BY FACULTY",
    PENDING_HOD: "STATUS: PENDING HOD APPROVAL — FACULTY APPROVED",
    REJECTED_HOD: "STATUS: REJECTED BY HEAD OF DEPARTMENT",
    APPROVED: "STATUS: APPROVED",
    PENDING_PROOF: "STATUS: APPROVED — POST-EVENT PROOF REQUIRED",
    PROOF_PENDING_FACULTY: "STATUS: PROOF SUBMITTED — FACULTY REVIEW",
    PROOF_REJECTED_FACULTY: "STATUS: PROOF REJECTED BY FACULTY",
    PROOF_PENDING_HOD: "STATUS: PROOF — HOD REVIEW",
    PROOF_REJECTED_HOD: "STATUS: PROOF REJECTED BY HOD",
    COMPLETED: "STATUS: COMPLETED",
    REVOKED: "STATUS: REVOKED",
  }
  return map[status] ?? `STATUS: ${status.replace(/_/g, " ")}`
}

function bannerColor(status: string) {
  const approved = ["APPROVED", "COMPLETED"]
  const rejected = ["REJECTED_FACULTY", "REJECTED_HOD", "PROOF_REJECTED_FACULTY", "PROOF_REJECTED_HOD", "REVOKED"]
  if (approved.includes(status)) return rgb(0.05, 0.5, 0.1)   // green
  if (rejected.includes(status)) return rgb(0.8, 0.1, 0.1)    // red
  return rgb(0.55, 0.35, 0)                                    // amber/orange
}

function formatTimestamp(ts: any): string {
  if (!ts) return "—"
  try {
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts)
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  } catch {
    return "—"
  }
}

// ── Main Generator ────────────────────────────────────────────────────────────

export async function generateFormalODPdf(params: ODPdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()
  const margin = 50
  const contentWidth = width - margin * 2

  const fontBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontReg    = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const black    = rgb(0, 0, 0)
  const darkGray = rgb(0.3, 0.3, 0.3)
  const blue     = rgb(0.0, 0.19, 0.53) // #003087
  const lightGray = rgb(0.85, 0.85, 0.85)

  let y = height - margin

  // ── RIT Header Logo ──────────────────────────────────────────────────────
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "rit-header.png")
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath)
      const logoImg   = await pdfDoc.embedPng(logoBytes)
      const logoH     = 55
      const logoW     = (logoImg.width / logoImg.height) * logoH
      page.drawImage(logoImg, { x: margin, y: y - logoH, width: logoW, height: logoH })
      y -= logoH + 10
    } else {
      // Fallback text header if image missing
      page.drawText("RAJALAKSHMI INSTITUTE OF TECHNOLOGY", {
        x: margin, y, size: 13, font: fontBold, color: blue,
      })
      y -= 15
      page.drawText(`DEPARTMENT OF ${departmentLabel(params.department).toUpperCase()}`, {
        x: margin, y, size: 9, font: fontBold, color: black,
      })
      y -= 20
    }
  } catch {
    y -= 10
  }

  // ── Divider line ─────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1.5, color: blue })
  y -= 15

  // ── Status Banner ────────────────────────────────────────────────────────
  const bannerText = statusBanner(params.status)
  const bannerBg = bannerColor(params.status)
  const bannerHeight = 20
  page.drawRectangle({ x: margin, y: y - bannerHeight, width: contentWidth, height: bannerHeight, color: bannerBg, opacity: 0.12 })
  page.drawRectangle({ x: margin, y: y - bannerHeight, width: contentWidth, height: bannerHeight, borderColor: bannerBg, borderWidth: 1, opacity: 0 })
  page.drawText(bannerText, {
    x: margin + 6, y: y - bannerHeight + 5, size: 9, font: fontBold, color: bannerBg,
  })
  y -= bannerHeight + 12

  // ── Document Title ───────────────────────────────────────────────────────
  const titleText = "ON-DUTY REQUISITION LETTER"
  const titleW = fontBold.widthOfTextAtSize(titleText, 13)
  page.drawText(titleText, { x: (width - titleW) / 2, y, size: 13, font: fontBold, color: black })
  y -= 18

  // ── Date (top right, below title) ────────────────────────────────────────
  const todayStr = formatDate(new Date())
  page.drawText(`Date: ${todayStr}`, { x: width - margin - 90, y, size: 9, font: fontReg, color: darkGray })
  y -= 20

  // ── Reference ─────────────────────────────────────────────────────────────
  page.drawText(`Ref. No: ${params.referenceNumber}`, { x: margin, y, size: 9, font: fontBold, color: blue })
  y -= 22

  // ── FROM ─────────────────────────────────────────────────────────────────
  page.drawText("FROM:", { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 14
  page.drawText(params.studentName, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText(`Register No: ${params.registerNumber}`, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText(`${params.classLabel}, Dept. of ${departmentLabel(params.department)}`, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText("Rajalakshmi Institute of Technology, Chennai.", { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 20

  // ── TO ───────────────────────────────────────────────────────────────────
  page.drawText("TO:", { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 14
  page.drawText("The Head of the Department,", { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText(`Dept. of ${departmentLabel(params.department)} (${params.department}),`, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText("Rajalakshmi Institute of Technology, Chennai.", { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 20

  // ── THROUGH ──────────────────────────────────────────────────────────────
  page.drawText("THROUGH:", { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 14
  page.drawText(`${params.facultyName || "The Class Incharge"}`, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 13
  page.drawText(`Class Incharge, ${params.classLabel}`, { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 22

  // ── Salutation ───────────────────────────────────────────────────────────
  page.drawText("Respected Sir/Madam,", { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 18

  // ── Subject ──────────────────────────────────────────────────────────────
  const subjectText = `SUB: Request for On-Duty (OD) to attend ${params.eventName} – Reg.`
  const subjectLines = wrapText(subjectText, contentWidth, fontBold, 10)
  for (const l of subjectLines) {
    page.drawText(l, { x: margin, y, size: 10, font: fontBold, color: black })
    y -= 14
  }
  y -= 8

  // ── Body ─────────────────────────────────────────────────────────────────
  const isOneDay = params.odDays === 1 && params.startDate === params.endDate
  const dateClause = isOneDay
    ? `for 1 day on ${formatDate(new Date(params.startDate))}`
    : `for ${params.odDays} days from ${formatDate(new Date(params.startDate))} to ${formatDate(new Date(params.endDate))}`

  const bodyText = `I am writing to request On-Duty (OD) permission ${dateClause} to participate in the ${params.eventType} titled '${params.eventName}' organized by ${params.organiser} at ${params.venue}.`
  const bodyLines = wrapText(bodyText, contentWidth - 20, fontReg, 10)
  for (const l of bodyLines) {
    page.drawText(l, { x: margin + 10, y, size: 10, font: fontReg, color: black })
    y -= 14
  }
  y -= 6

  // ── Reason ───────────────────────────────────────────────────────────────
  const reasonText = `Reason / Purpose: ${params.reason}`
  const reasonLines = wrapText(reasonText, contentWidth - 20, fontItalic, 10)
  for (const l of reasonLines) {
    page.drawText(l, { x: margin + 10, y, size: 10, font: fontItalic, color: darkGray })
    y -= 14
  }
  y -= 6

  // ── Closing ──────────────────────────────────────────────────────────────
  page.drawText("I kindly request you to grant me OD for the aforementioned dates.", {
    x: margin + 10, y, size: 10, font: fontReg, color: black,
  })
  y -= 18
  page.drawText("Thank you for your consideration.", { x: margin + 10, y, size: 10, font: fontReg, color: black })
  y -= 25

  // ── Yours Obediently ─────────────────────────────────────────────────────
  page.drawText("Yours obediently,", { x: margin, y, size: 10, font: fontReg, color: black })
  y -= 30
  page.drawText(params.studentName, { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 25

  // ── Divider ──────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.8, color: lightGray })
  y -= 16

  // ── Student / Group Member Table ─────────────────────────────────────────
  const tableMembers = params.groupMembers && params.groupMembers.length > 0
    ? params.groupMembers
    : [{ name: params.studentName, registerNumber: params.registerNumber, department: params.department, section: params.section, year: params.year }]

  const headers = ["S.No", "Name", "Register No", "Dept", "Sec", "Year"]
  const colWidths = [30, 150, 90, 50, 30, 35]
  const rowH = 16
  const tableX = margin

  // Header row
  let tx = tableX
  page.drawRectangle({ x: tableX, y: y - rowH, width: contentWidth, height: rowH, color: rgb(0, 0.19, 0.53), opacity: 1 })
  for (let i = 0; i < headers.length; i++) {
    page.drawText(headers[i], { x: tx + 4, y: y - rowH + 5, size: 8, font: fontBold, color: rgb(1, 1, 1) })
    tx += colWidths[i]
  }
  y -= rowH

  // Data rows
  for (let r = 0; r < tableMembers.length; r++) {
    const m = tableMembers[r]
    const rowBg = r % 2 === 0 ? rgb(1, 1, 1) : rgb(0.96, 0.97, 0.98)
    page.drawRectangle({ x: tableX, y: y - rowH, width: contentWidth, height: rowH, color: rowBg })
    page.drawLine({ start: { x: tableX, y: y - rowH }, end: { x: tableX + contentWidth, y: y - rowH }, thickness: 0.4, color: lightGray })

    const rowData = [(r + 1).toString(), m.name, m.registerNumber, m.department, m.section, String(m.year)]
    tx = tableX
    for (let i = 0; i < rowData.length; i++) {
      const cellText = rowData[i].length > 20 ? rowData[i].slice(0, 19) + "…" : rowData[i]
      page.drawText(cellText, { x: tx + 4, y: y - rowH + 4, size: 8, font: fontReg, color: black })
      tx += colWidths[i]
    }
    y -= rowH
  }

  // Table border
  page.drawRectangle({ x: tableX, y, width: contentWidth, height: (tableMembers.length + 1) * rowH, borderColor: lightGray, borderWidth: 0.8, opacity: 0 })

  y -= 20

  // ── Approval Section ─────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.8, color: lightGray })
  y -= 14
  page.drawText("OFFICIAL APPROVAL", { x: margin, y, size: 10, font: fontBold, color: black })
  y -= 18

  // Class Incharge approval
  page.drawText("Approved by (Class Incharge):", { x: margin, y, size: 9, font: fontBold, color: black })
  y -= 8
  // Blank visual space reserved for physical signature
  page.drawRectangle({ x: margin, y: y - 28, width: 200, height: 28, borderColor: lightGray, borderWidth: 0.5, opacity: 0 })
  y -= 36
  if (params.facultyApproved) {
    page.drawText(`${params.facultyName || "Class Incharge"}, Class Incharge`, { x: margin, y, size: 9, font: fontReg, color: black })
    y -= 13
    page.drawText(`— ${formatTimestamp(params.facultyRespondedAt)}`, { x: margin, y, size: 8, font: fontItalic, color: darkGray })
  } else {
    page.drawText("Signature / Approval: Pending", { x: margin, y, size: 9, font: fontItalic, color: darkGray })
  }
  y -= 20

  // HOD approval
  page.drawText("Approved by (HOD):", { x: margin, y, size: 9, font: fontBold, color: black })
  y -= 8
  // Blank visual space reserved for physical signature
  page.drawRectangle({ x: margin, y: y - 28, width: 200, height: 28, borderColor: lightGray, borderWidth: 0.5, opacity: 0 })
  y -= 36
  if (params.hodApproved) {
    page.drawText(`${params.hodName || "HOD"}, Head of Department`, { x: margin, y, size: 9, font: fontReg, color: black })
    y -= 13
    page.drawText(`— ${formatTimestamp(params.hodRespondedAt)}`, { x: margin, y, size: 8, font: fontItalic, color: darkGray })
  } else {
    page.drawText("Signature / Approval: Pending", { x: margin, y, size: 9, font: fontItalic, color: darkGray })
  }
  y -= 25

  // ── QR Code + Reference Footer ───────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(params.verifyUrl, { width: 80, margin: 1 })
  const qrBase64  = qrDataUrl.replace(/^data:image\/png;base64,/, "")
  const qrImage   = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"))
  const qrSize    = 65

  page.drawImage(qrImage, { x: width - margin - qrSize, y: y - qrSize, width: qrSize, height: qrSize })
  page.drawText("Scan to Verify", { x: width - margin - qrSize + 5, y: y - qrSize - 10, size: 7, font: fontReg, color: darkGray })
  page.drawText(params.referenceNumber, { x: width - margin - qrSize + 2, y: y - qrSize - 19, size: 7, font: fontBold, color: blue })

  // Footer text
  page.drawText("This document is digitally generated and verified by the AIML OD Portal.", {
    x: margin, y: margin - 5, size: 7, font: fontItalic, color: darkGray,
  })
  page.drawText("Approval is conveyed via printed text only. No physical signatures are embedded.", {
    x: margin, y: margin - 15, size: 7, font: fontItalic, color: darkGray,
  })

  return pdfDoc.save()
}
