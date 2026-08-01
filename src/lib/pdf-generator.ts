import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import QRCode from "qrcode"

interface ODPdfParams {
  referenceNumber: string
  studentName: string
  registerNumber: string
  department: string
  classLabel: string
  eventName: string
  eventType: string
  organiser: string
  venue: string
  startDate: string
  endDate: string
  reason: string
  facultyName: string
  hodName: string
  facultyApproved: boolean
  hodApproved: boolean
  facultyRespondedAt?: any
  hodRespondedAt?: any
  verifyUrl: string
}

export async function generateFormalODPdf(params: ODPdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const black = rgb(0, 0, 0)
  const darkGray = rgb(0.2, 0.2, 0.2)
  const blue = rgb(0.1, 0.3, 0.7)

  let y = height - 50

  // ── Header ──
  page.drawText("RAJALAKSHMI INSTITUTE OF TECHNOLOGY", { x: width / 2 - 150, y, size: 14, font: fontBold, color: blue })
  y -= 15
  page.drawText("DEPARTMENT OF ARTIFICIAL INTELLIGENCE & MACHINE LEARNING", { x: width / 2 - 200, y, size: 11, font: fontBold, color: black })
  y -= 15
  page.drawText("ON-DUTY REQUISITION FORM", { x: width / 2 - 80, y, size: 12, font: fontBold, color: black })
  
  y -= 30
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  page.drawText(`Date: ${dateStr}`, { x: width - 150, y, size: 10, font: fontReg, color: black })
  page.drawText(`Ref: ${params.referenceNumber}`, { x: 50, y, size: 10, font: fontBold, color: black })
  
  y -= 40
  
  // ── From Address ──
  page.drawText("From", { x: 50, y, size: 11, font: fontBold, color: black })
  y -= 15
  page.drawText(params.studentName, { x: 70, y, size: 11, font: fontReg, color: black })
  y -= 15
  page.drawText(`Register Number: ${params.registerNumber}`, { x: 70, y, size: 11, font: fontReg, color: black })
  y -= 15
  page.drawText(`${params.classLabel}, ${params.department}`, { x: 70, y, size: 11, font: fontReg, color: black })
  y -= 15
  page.drawText("Rajalakshmi Institute of Technology, Chennai", { x: 70, y, size: 11, font: fontReg, color: black })
  
  y -= 25

  // ── To Address ──
  page.drawText("To", { x: 50, y, size: 11, font: fontBold, color: black })
  y -= 15
  page.drawText("The Head of the Department,", { x: 70, y, size: 11, font: fontReg, color: black })
  y -= 15
  page.drawText("Dept. of Artificial Intelligence & Machine Learning,", { x: 70, y, size: 11, font: fontReg, color: black })
  y -= 15
  page.drawText("Rajalakshmi Institute of Technology, Chennai", { x: 70, y, size: 11, font: fontReg, color: black })

  y -= 30

  // ── Salutation & Subject ──
  page.drawText("Respected Sir/Madam,", { x: 50, y, size: 11, font: fontBold, color: black })
  y -= 20
  page.drawText("Sub: Requisition for On-Duty (OD) to attend external event - Reg.", { x: 70, y, size: 11, font: fontBold, color: black })
  
  y -= 25

  // ── Body ──
  const dateText = params.startDate === params.endDate ? params.startDate : `${params.startDate} to ${params.endDate}`
  const bodyText = `I would like to bring to your kind notice that I have planned to attend the ${params.eventType} on "${params.eventName}" organized by ${params.organiser} at ${params.venue} on ${dateText}.`
  
  const words = bodyText.split(" ")
  let line = ""
  const lines: string[] = []
  for (const word of words) {
    if (fontReg.widthOfTextAtSize(`${line} ${word}`, 11) > 450) {
      lines.push(line.trim())
      line = word
    } else {
      line += ` ${word}`
    }
  }
  if (line.trim()) lines.push(line.trim())
  
  for (const l of lines) {
    page.drawText(l, { x: 70, y, size: 11, font: fontReg, color: black })
    y -= 18
  }

  y -= 5

  const reasonWords = `Reason/Purpose: ${params.reason}`.split(" ")
  let rLine = ""
  const rLines: string[] = []
  for (const word of reasonWords) {
    if (fontReg.widthOfTextAtSize(`${rLine} ${word}`, 11) > 450) {
      rLines.push(rLine.trim())
      rLine = word
    } else {
      rLine += ` ${word}`
    }
  }
  if (rLine.trim()) rLines.push(rLine.trim())
  for (const l of rLines) {
    page.drawText(l, { x: 70, y, size: 11, font: fontItalic, color: darkGray })
    y -= 18
  }

  y -= 10
  page.drawText("I kindly request you to grant me On-Duty for the above-mentioned date(s) and oblige.", { x: 70, y, size: 11, font: fontReg, color: black })

  y -= 30

  // ── Signatures ──
  page.drawText("Thanking you,", { x: 50, y, size: 11, font: fontReg, color: black })
  y -= 40
  
  page.drawText("Yours obediently,", { x: width - 180, y, size: 11, font: fontReg, color: black })
  y -= 25
  page.drawText("(Digitally verified)", { x: width - 180, y, size: 9, font: fontItalic, color: darkGray })
  y -= 15
  page.drawText(params.studentName, { x: width - 180, y, size: 11, font: fontBold, color: black })

  y -= 40

  // ── Approval Section ──
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: black })
  y -= 20
  page.drawText("OFFICIAL APPROVAL", { x: 50, y, size: 11, font: fontBold, color: black })
  y -= 25

  // Class Incharge
  page.drawText("Class Incharge:", { x: 50, y, size: 10, font: fontBold, color: black })
  page.drawText(params.facultyName || "—", { x: 130, y, size: 10, font: fontReg, color: black })
  if (params.facultyApproved) {
    page.drawText("APPROVED", { x: 250, y, size: 10, font: fontBold, color: rgb(0, 0.5, 0) })
    if (params.facultyRespondedAt) {
       const fd = new Date(params.facultyRespondedAt._seconds * 1000).toLocaleDateString("en-IN")
       page.drawText(`(${fd})`, { x: 330, y, size: 9, font: fontReg, color: darkGray })
    }
  } else {
    page.drawText("Pending", { x: 250, y, size: 10, font: fontReg, color: darkGray })
  }

  y -= 20

  // HOD
  page.drawText("Head of Dept:", { x: 50, y, size: 10, font: fontBold, color: black })
  page.drawText(params.hodName || "—", { x: 130, y, size: 10, font: fontReg, color: black })
  if (params.hodApproved) {
    page.drawText("APPROVED", { x: 250, y, size: 10, font: fontBold, color: rgb(0, 0.5, 0) })
    if (params.hodRespondedAt) {
       const hd = new Date(params.hodRespondedAt._seconds * 1000).toLocaleDateString("en-IN")
       page.drawText(`(${hd})`, { x: 330, y, size: 9, font: fontReg, color: darkGray })
    }
  } else {
    page.drawText("Pending", { x: 250, y, size: 10, font: fontReg, color: darkGray })
  }

  // ── QR Code ──
  const verifyUrl = params.verifyUrl
  const qrDataUrl  = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 })
  const qrBase64   = qrDataUrl.replace(/^data:image\/png;base64,/, "")
  const qrImage    = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"))
  
  page.drawImage(qrImage, { x: width - 120, y: y - 10, width: 70, height: 70 })
  page.drawText("Scan to Verify", { x: width - 118, y: y - 20, size: 8, font: fontReg, color: darkGray })
  
  return pdfDoc.save()
}
