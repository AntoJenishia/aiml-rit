import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { getStorage } from "firebase-admin/storage"
import { getApps } from "firebase-admin/app"
import { FieldValue } from "firebase-admin/firestore"

async function regeneratePdf(od: any, facultyApproved: boolean, hodApproved: boolean): Promise<string> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842])
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontReg  = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const blue      = rgb(0.231, 0.357, 1.0)
  const darkGray  = rgb(0.067, 0.094, 0.153)
  const midGray   = rgb(0.42,  0.447, 0.502)
  const lightGray = rgb(0.898, 0.91,  0.922)
  const green     = rgb(0.086, 0.639, 0.29)
  const white     = rgb(1, 1, 1)

  // Header
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: blue })
  page.drawText("ON-DUTY LETTER", { x: 32, y: height - 36, size: 18, font: fontBold, color: white })
  page.drawText("AI & Machine Learning Department — Rajalakshmi Institute of Technology", {
    x: 32, y: height - 56, size: 8, font: fontReg, color: rgb(0.8, 0.85, 1),
  })
  page.drawText(`Ref: ${od.referenceNumber}`, { x: width - 180, y: height - 40, size: 9, font: fontBold, color: white })
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, {
    x: width - 180, y: height - 56, size: 8, font: fontReg, color: rgb(0.8, 0.85, 1),
  })

  const statusLabel = hodApproved ? "✓ FINAL APPROVED — OFFICIAL OD LETTER"
    : facultyApproved ? "FACULTY APPROVED — PENDING HOD APPROVAL"
    : "PENDING APPROVAL"
  const statusColor = hodApproved ? green : facultyApproved ? blue : midGray

  page.drawRectangle({ x: 32, y: height - 110, width: 250, height: 22, color: statusColor, opacity: 0.15 })
  page.drawRectangle({ x: 32, y: height - 110, width: 4,   height: 22, color: statusColor })
  page.drawText(statusLabel, { x: 42, y: height - 102, size: 8, font: fontBold, color: statusColor })

  let y = height - 140

  const sh = (label: string) => {
    page.drawText(label.toUpperCase(), { x: 32, y, size: 8, font: fontBold, color: blue })
    y -= 4
    page.drawLine({ start: { x: 32, y }, end: { x: width - 32, y }, thickness: 0.5, color: lightGray })
    y -= 12
  }

  const row = (label: string, value: string) => {
    page.drawText(label, { x: 32, y, size: 8, font: fontBold, color: midGray })
    page.drawText(value || "—", { x: 172, y, size: 8.5, font: fontReg, color: darkGray })
    y -= 16
  }

  sh("Student Information")
  row("Name",            od.studentName || "—")
  row("Register Number", od.registerNumber || "—")
  row("Department",      "AI & Machine Learning")
  row("Class",           od.classId || "—")
  y -= 8

  sh("Event Details")
  row("Event Name",  od.eventName)
  row("Event Type",  od.eventType)
  row("Organiser",   od.organiser)
  row("Venue",       od.venue)
  row("Date(s)",     od.startDate === od.endDate ? od.startDate : `${od.startDate} to ${od.endDate}`)
  y -= 8

  sh("Reason / Purpose")
  const words = (od.reason || "").split(" ")
  let line = "", lines: string[] = []
  for (const w of words) {
    if (fontReg.widthOfTextAtSize(`${line} ${w}`, 8.5) > 500) { lines.push(line.trim()); line = w }
    else line += ` ${w}`
  }
  if (line.trim()) lines.push(line.trim())
  for (const l of lines) { page.drawText(l, { x: 32, y, size: 8.5, font: fontReg, color: darkGray }); y -= 14 }
  y -= 8

  sh("Approval Status")

  const fBoxY = y - 55
  const boxW  = (width - 80) / 2 - 4
  const hodX  = 32 + boxW + 16

  page.drawRectangle({ x: 32,   y: fBoxY, width: boxW, height: 60, color: lightGray, opacity: 0.3 })
  page.drawRectangle({ x: 32,   y: fBoxY, width: 3,    height: 60, color: facultyApproved ? green : midGray })
  page.drawText("Class Incharge",        { x: 38, y: fBoxY + 42, size: 7,   font: fontBold, color: midGray })
  page.drawText(od.facultyName || "—",   { x: 38, y: fBoxY + 28, size: 9,   font: fontBold, color: darkGray })
  if (facultyApproved && od.facultyRespondedAt) {
    page.drawText(`Approved ${new Date(od.facultyRespondedAt._seconds * 1000).toLocaleDateString("en-IN")}`,
      { x: 38, y: fBoxY + 14, size: 7, font: fontReg, color: green })
    page.drawText("✓ APPROVED", { x: 38, y: fBoxY + 4, size: 8, font: fontBold, color: green })
  } else {
    page.drawText("Pending", { x: 38, y: fBoxY + 8, size: 8, font: fontReg, color: midGray })
  }

  page.drawRectangle({ x: hodX, y: fBoxY, width: boxW, height: 60, color: lightGray, opacity: 0.3 })
  page.drawRectangle({ x: hodX, y: fBoxY, width: 3,    height: 60, color: hodApproved ? green : midGray })
  page.drawText("Head of Department",    { x: hodX + 6, y: fBoxY + 42, size: 7,   font: fontBold, color: midGray })
  page.drawText(od.hodName || "HOD",     { x: hodX + 6, y: fBoxY + 28, size: 9,   font: fontBold, color: darkGray })
  if (hodApproved && od.hodRespondedAt) {
    page.drawText(`Approved ${new Date(od.hodRespondedAt._seconds * 1000).toLocaleDateString("en-IN")}`,
      { x: hodX + 6, y: fBoxY + 14, size: 7, font: fontReg, color: green })
    page.drawText("✓ APPROVED", { x: hodX + 6, y: fBoxY + 4, size: 8, font: fontBold, color: green })
  } else {
    page.drawText("Pending", { x: hodX + 6, y: fBoxY + 8, size: 8, font: fontReg, color: midGray })
  }

  y = fBoxY - 16

  // QR Code
  const verifyUrl = od.qrCodeUrl || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${od.referenceNumber}`
  const qrDataUrl  = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1 })
  const qrBase64   = qrDataUrl.replace(/^data:image\/png;base64,/, "")
  const qrImage    = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"))
  const qrSize = 80, qrX = width - 32 - qrSize, qrY = 60
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize })
  page.drawText("Scan to verify", { x: qrX + 5, y: qrY - 12, size: 6.5, font: fontReg, color: midGray })
  page.drawText(od.referenceNumber,  { x: qrX,     y: qrY - 22, size: 6.5, font: fontBold, color: darkGray })

  // Footer
  page.drawLine({ start: { x: 32, y: 50 }, end: { x: width - 32, y: 50 }, thickness: 0.5, color: lightGray })
  page.drawText("System-generated OD letter — AIML Department Portal, Rajalakshmi Institute of Technology.", {
    x: 32, y: 36, size: 6.5, font: fontReg, color: midGray,
  })
  page.drawText(`Verify at: ${verifyUrl}`, { x: 32, y: 24, size: 6.5, font: fontReg, color: blue })

  const pdfBytes = await pdfDoc.save()

  const app    = getApps()[0]
  const bucketName = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").replace(".firebasestorage.app", ".appspot.com")
  const bucket = getStorage(app).bucket(bucketName)
  const suffix = hodApproved ? "final" : "draft"
  const path   = `odPdf/${od.referenceNumber}/${suffix}.pdf`
  const file   = bucket.file(path)
  await file.save(Buffer.from(pdfBytes), { contentType: "application/pdf" })
  await file.makePublic()
  return `https://storage.googleapis.com/${bucket.name}/${path}`
}

// ── PATCH — Approve or reject an OD ─────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.role
    if (role !== "staff" && role !== "hod") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { action, reason } = await req.json() // action: 'approve' | 'reject'

    if (action === "reject" && !reason?.trim()) {
      return NextResponse.json({ error: "A reason is required for rejection." }, { status: 400 })
    }

    const odRef  = adminDb.collection("odRequests").doc(id)
    const odSnap = await odRef.get()
    if (!odSnap.exists) return NextResponse.json({ error: "OD not found." }, { status: 404 })
    const od = { id: odSnap.id, ...odSnap.data() } as any

    // Fetch student info for enriched PDF
    const studentDoc = await adminDb.collection("users").doc(od.studentUid).get()
    const studentData = studentDoc.data() || {}
    od.studentName   = studentData.name   || "—"
    od.registerNumber = studentData.registerNumber || "—"
    od.classId       = studentData.classId || "—"

    // Fetch faculty name
    let facultyName = "Class Incharge"
    if (studentData.classId) {
      const classDoc = await adminDb.collection("classes").doc(studentData.classId).get()
      if (classDoc.exists) {
        const inUid = classDoc.data()?.classInchargeUid
        if (inUid) {
          const facDoc = await adminDb.collection("users").doc(inUid).get()
          if (facDoc.exists) facultyName = facDoc.data()?.name || facultyName
        }
      }
    }
    od.facultyName = facultyName

    // Fetch HOD name
    const hodSnap = await adminDb.collection("users").where("role", "==", "hod").limit(1).get()
    od.hodName = hodSnap.empty ? "Head of Department" : hodSnap.docs[0].data().name

    let updateData: Record<string, any> = {}

    if (role === "staff") {
      if (od.status !== "pending_faculty") {
        return NextResponse.json({ error: "This OD is not awaiting faculty approval." }, { status: 400 })
      }
      if (action === "approve") {
        const newPdfUrl = await regeneratePdf({ ...od }, true, false)
        updateData = {
          status: "pending_hod",
          facultyRespondedAt: FieldValue.serverTimestamp(),
          pdfUrl: newPdfUrl,
        }
      } else {
        updateData = {
          status: "rejected_faculty",
          facultyRespondedAt: FieldValue.serverTimestamp(),
          facultyRejectReason: reason,
        }
      }
    } else if (role === "hod") {
      if (od.status !== "pending_hod") {
        return NextResponse.json({ error: "This OD is not awaiting HOD approval." }, { status: 400 })
      }
      if (action === "approve") {
        const finalPdfUrl = await regeneratePdf({ ...od }, true, true)
        updateData = {
          status: "approved",
          hodRespondedAt: FieldValue.serverTimestamp(),
          finalPdfUrl,
        }
      } else {
        updateData = {
          status: "rejected_hod",
          hodRespondedAt: FieldValue.serverTimestamp(),
          hodRejectReason: reason,
        }
      }
    }

    await odRef.update(updateData)
    return NextResponse.json({ success: true, ...updateData })
  } catch (err: any) {
    console.error("[OD PATCH]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
