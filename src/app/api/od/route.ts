import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import QRCode from "qrcode"
import { getStorage } from "firebase-admin/storage"
import { FieldValue } from "firebase-admin/firestore"
import { initializeApp, getApps } from "firebase-admin/app"

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateRefNumber(): string {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `OD-${y}${m}${d}-${rand}`
}

async function generateODPdf({
  referenceNumber,
  studentName,
  registerNumber,
  department,
  classLabel,
  eventName,
  eventType,
  organiser,
  venue,
  startDate,
  endDate,
  reason,
  facultyName,
  hodName,
  status,
  facultyApproved,
  hodApproved,
  verifyUrl,
}: {
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
  status: string
  facultyApproved: boolean
  hodApproved: boolean
  verifyUrl: string
}): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const blue = rgb(0.231, 0.357, 1.0)   // #3B5BFF
  const darkGray = rgb(0.067, 0.094, 0.153) // #111827
  const midGray = rgb(0.42, 0.447, 0.502)   // #6B7280
  const lightGray = rgb(0.898, 0.91, 0.922)  // #E5E7EB
  const green = rgb(0.086, 0.639, 0.29)       // #16A34A
  const red = rgb(0.937, 0.267, 0.267)        // #EF4444
  const white = rgb(1, 1, 1)

  // ── Header bar ──────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 80, width, height: 80, color: blue })

  page.drawText("ON-DUTY LETTER", {
    x: 32, y: height - 36,
    size: 18, font: fontBold, color: white,
  })
  page.drawText("AI & Machine Learning Department — Rajalakshmi Institute of Technology", {
    x: 32, y: height - 56,
    size: 8, font: fontReg, color: rgb(0.8, 0.85, 1),
  })

  // Ref number top-right
  page.drawText(`Ref: ${referenceNumber}`, {
    x: width - 180, y: height - 40,
    size: 9, font: fontBold, color: white,
  })
  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`, {
    x: width - 180, y: height - 56,
    size: 8, font: fontReg, color: rgb(0.8, 0.85, 1),
  })

  // ── Status badge ────────────────────────────────────────────────────────────
  const statusLabel = hodApproved
    ? "HOD APPROVED"
    : facultyApproved
    ? "FACULTY APPROVED — PENDING HOD"
    : "PENDING FACULTY APPROVAL"
  const statusColor = hodApproved ? green : facultyApproved ? blue : midGray

  page.drawRectangle({ x: 32, y: height - 110, width: 180, height: 22, color: statusColor, opacity: 0.15 })
  page.drawRectangle({ x: 32, y: height - 110, width: 4, height: 22, color: statusColor })
  page.drawText(statusLabel, {
    x: 42, y: height - 102,
    size: 8, font: fontBold, color: statusColor,
  })

  // ── Section helper ───────────────────────────────────────────────────────────
  let y = height - 140

  function sectionHeader(label: string) {
    page.drawText(label.toUpperCase(), { x: 32, y, size: 8, font: fontBold, color: blue })
    y -= 4
    page.drawLine({ start: { x: 32, y }, end: { x: width - 32, y }, thickness: 0.5, color: lightGray })
    y -= 12
  }

  function row(label: string, value: string, indent = 32) {
    page.drawText(label, { x: indent, y, size: 8, font: fontBold, color: midGray })
    page.drawText(value || "—", { x: indent + 140, y, size: 8.5, font: fontReg, color: darkGray })
    y -= 16
  }

  // ── Student info ────────────────────────────────────────────────────────────
  sectionHeader("Student Information")
  row("Name", studentName)
  row("Register Number", registerNumber)
  row("Department", department)
  row("Class", classLabel)
  y -= 8

  // ── Event details ────────────────────────────────────────────────────────────
  sectionHeader("Event Details")
  row("Event Name", eventName)
  row("Event Type", eventType)
  row("Organiser", organiser)
  row("Venue", venue)
  row("Date(s)", startDate === endDate ? startDate : `${startDate} to ${endDate}`)
  y -= 8

  // ── Reason ──────────────────────────────────────────────────────────────────
  sectionHeader("Reason / Purpose")
  const words = (reason || "").split(" ")
  let line = ""
  const lines: string[] = []
  for (const word of words) {
    if (fontReg.widthOfTextAtSize(`${line} ${word}`, 8.5) > 500) {
      lines.push(line.trim())
      line = word
    } else {
      line += ` ${word}`
    }
  }
  if (line.trim()) lines.push(line.trim())
  for (const l of lines) {
    page.drawText(l, { x: 32, y, size: 8.5, font: fontReg, color: darkGray })
    y -= 14
  }
  y -= 8

  // ── Approval trail ──────────────────────────────────────────────────────────
  sectionHeader("Approval Status")

  // Faculty block
  const fBoxY = y - 50
  page.drawRectangle({ x: 32, y: fBoxY, width: (width - 80) / 2 - 4, height: 55,
    color: lightGray, opacity: 0.3 })
  page.drawRectangle({ x: 32, y: fBoxY, width: 3, height: 55,
    color: facultyApproved ? green : midGray })

  page.drawText("Class Incharge", { x: 38, y: fBoxY + 38, size: 7, font: fontBold, color: midGray })
  page.drawText(facultyName, { x: 38, y: fBoxY + 24, size: 9, font: fontBold, color: darkGray })
  if (facultyApproved) {
    page.drawText("✓ APPROVED", { x: 38, y: fBoxY + 10, size: 8, font: fontBold, color: green })
  } else {
    page.drawText("Pending", { x: 38, y: fBoxY + 10, size: 8, font: fontReg, color: midGray })
  }

  // HOD block
  const hodX = 32 + (width - 80) / 2 + 12
  page.drawRectangle({ x: hodX, y: fBoxY, width: (width - 80) / 2 - 4, height: 55,
    color: lightGray, opacity: 0.3 })
  page.drawRectangle({ x: hodX, y: fBoxY, width: 3, height: 55,
    color: hodApproved ? green : midGray })

  page.drawText("Head of Department", { x: hodX + 6, y: fBoxY + 38, size: 7, font: fontBold, color: midGray })
  page.drawText(hodName, { x: hodX + 6, y: fBoxY + 24, size: 9, font: fontBold, color: darkGray })
  if (hodApproved) {
    page.drawText("✓ APPROVED", { x: hodX + 6, y: fBoxY + 10, size: 8, font: fontBold, color: green })
  } else {
    page.drawText("Pending", { x: hodX + 6, y: fBoxY + 10, size: 8, font: fontReg, color: midGray })
  }

  y = fBoxY - 20

  // ── QR Code ─────────────────────────────────────────────────────────────────
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 100, margin: 1 })
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "")
  const qrImage = await pdfDoc.embedPng(Buffer.from(qrBase64, "base64"))

  const qrSize = 80
  const qrX = width - 32 - qrSize
  const qrY = 60

  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize })
  page.drawText("Scan to verify authenticity", { x: qrX - 10, y: qrY - 12, size: 6.5, font: fontReg, color: midGray })
  page.drawText(referenceNumber, { x: qrX, y: qrY - 22, size: 6.5, font: fontBold, color: darkGray })

  // ── Footer ──────────────────────────────────────────────────────────────────
  page.drawLine({ start: { x: 32, y: 50 }, end: { x: width - 32, y: 50 }, thickness: 0.5, color: lightGray })
  page.drawText("This is a system-generated On-Duty letter from the AIML Department Portal — Rajalakshmi Institute of Technology.", {
    x: 32, y: 36, size: 6.5, font: fontReg, color: midGray,
  })
  page.drawText(`Verify at: ${verifyUrl}`, { x: 32, y: 24, size: 6.5, font: fontReg, color: blue })

  return pdfDoc.save()
}

// ── POST — Submit new OD request ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      eventName, eventType, organiser, venue,
      startDate, endDate, reason, upfrontProofUrl,
      isSpecialNeed, specialNeedJustification,
    } = body

    if (!eventName || !eventType || !organiser || !venue || !startDate || !endDate || !reason || !upfrontProofUrl) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 })
    }

    const uid = session.user.uid!

    // Fetch student profile
    const userDoc = await adminDb.collection("users").doc(uid).get()
    if (!userDoc.exists) return NextResponse.json({ error: "User not found." }, { status: 404 })
    const userData = userDoc.data()!

    // Resolve class incharge
    let facultyName = "Class Incharge"
    if (userData.classId) {
      const classDoc = await adminDb.collection("classes").doc(userData.classId).get()
      if (classDoc.exists) {
        const inchargeUid = classDoc.data()?.classInchargeUid
        if (inchargeUid) {
          const facDoc = await adminDb.collection("users").doc(inchargeUid).get()
          if (facDoc.exists) facultyName = facDoc.data()?.name || facultyName
        }
      }
    }

    const refNumber = generateRefNumber()
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const verifyUrl = `${baseUrl}/verify/${refNumber}`

    // Generate pre-approval PDF
    const pdfBytes = await generateODPdf({
      referenceNumber: refNumber,
      studentName: userData.name || "Student",
      registerNumber: userData.registerNumber || "—",
      department: "AI & Machine Learning",
      classLabel: userData.classId || "—",
      eventName, eventType, organiser, venue, startDate, endDate, reason,
      facultyName,
      hodName: "Head of Department",
      status: "pending_faculty",
      facultyApproved: false,
      hodApproved: false,
      verifyUrl,
    })

    // Upload PDF to Firebase Storage via Admin SDK
    const app = getApps()[0]
    const bucketName = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").replace(".firebasestorage.app", ".appspot.com")
    const bucket = getStorage(app).bucket(bucketName)
    const pdfPath = `odPdf/${refNumber}/draft.pdf`
    const file = bucket.file(pdfPath)
    await file.save(Buffer.from(pdfBytes), { contentType: "application/pdf" })
    await file.makePublic()
    const pdfUrl = `https://storage.googleapis.com/${bucket.name}/${pdfPath}`

    // Save to Firestore
    const docRef = await adminDb.collection("odRequests").add({
      studentUid: uid,
      referenceNumber: refNumber,
      qrCodeUrl: verifyUrl,
      eventName, eventType, organiser, venue,
      startDate, endDate,
      isSpecialNeed: isSpecialNeed || false,
      specialNeedJustification: specialNeedJustification || "",
      reason,
      upfrontProofUrl,
      status: "pending_faculty",
      pdfUrl,
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: docRef.id, referenceNumber: refNumber, pdfUrl })
  } catch (err: any) {
    console.error("[OD POST]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// ── GET — Fetch OD requests (role-scoped) ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const uid = session.user.uid!
    const role = session.user.role

    let docs: FirebaseFirestore.QuerySnapshot

    if (role === "student") {
      docs = await adminDb.collection("odRequests")
        .where("studentUid", "==", uid)
        .orderBy("createdAt", "desc")
        .get()
    } else if (role === "staff") {
      // Find this faculty's class, then get all students in it
      const userDoc = await adminDb.collection("users").doc(uid).get()
      const classId = userDoc.data()?.classId
      if (!classId) return NextResponse.json([])

      const studentsSnap = await adminDb.collection("users")
        .where("classId", "==", classId)
        .where("role", "==", "student")
        .get()
      const studentUids = studentsSnap.docs.map(d => d.id)
      if (studentUids.length === 0) return NextResponse.json([])

      docs = await adminDb.collection("odRequests")
        .where("status", "==", "pending_faculty")
        .orderBy("createdAt", "desc")
        .get()

      const filtered = docs.docs
        .filter(d => studentUids.includes(d.data().studentUid))
        .map(d => ({ id: d.id, ...d.data() }))

      // Enrich with student names
      const enriched = await Promise.all(filtered.map(async (req: any) => {
        const studentDoc = await adminDb.collection("users").doc(req.studentUid).get()
        return { ...req, studentName: studentDoc.data()?.name || "Unknown" }
      }))

      return NextResponse.json(enriched)
    } else if (role === "hod") {
      docs = await adminDb.collection("odRequests")
        .where("status", "==", "pending_hod")
        .orderBy("createdAt", "desc")
        .get()

      const data = docs.docs.map(d => ({ id: d.id, ...d.data() }))
      const enriched = await Promise.all(data.map(async (req: any) => {
        const studentDoc = await adminDb.collection("users").doc(req.studentUid).get()
        return { ...req, studentName: studentDoc.data()?.name || "Unknown" }
      }))
      return NextResponse.json(enriched)
    } else {
      return NextResponse.json({ error: "Unknown role" }, { status: 403 })
    }

    const results = docs.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json(results)
  } catch (err: any) {
    console.error("[OD GET]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
