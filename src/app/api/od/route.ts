import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { generateFormalODPdf } from "@/lib/pdf-generator"
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
      startDate, endDate, reason,
      isSpecialNeed, specialNeedJustification,
      proofFileB64, proofFileName, proofMimeType,
    } = body

    if (!eventName || !eventType || !organiser || !venue || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 })
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
    const pdfBytes = await generateFormalODPdf({
      referenceNumber: refNumber,
      studentName: userData.name || "Student",
      registerNumber: userData.registerNumber || "—",
      department: "AI & Machine Learning",
      classLabel: userData.classId || "—",
      eventName, eventType, organiser, venue, startDate, endDate, reason,
      facultyName,
      hodName: "Head of Department",
      facultyApproved: false,
      hodApproved: false,
      verifyUrl,
    })

    // Forward to Google Apps Script Webhook
    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (!scriptUrl) {
      throw new Error("Missing NEXT_PUBLIC_APPS_SCRIPT_URL in env")
    }

    const draftPdfBase64 = Buffer.from(pdfBytes).toString("base64")

    const webhookPayload = {
      action: "create_od",
      refNumber,
      studentName: userData.name || "Student",
      registerNumber: userData.registerNumber || "—",
      classId: userData.classId || "—",
      eventName,
      eventType,
      organiser,
      startDate,
      endDate,
      proofFile: proofFileB64 || "",
      proofFileName: proofFileName || "",
      proofMimeType: proofMimeType || "",
      draftPdfFile: draftPdfBase64
    }

    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify(webhookPayload)
    })
    
    if (!scriptRes.ok) {
      throw new Error("Failed to contact Google Apps Script Webhook.")
    }
    
    const scriptData = await scriptRes.json()
    if (scriptData.error) {
      throw new Error("Apps Script Error: " + scriptData.error)
    }

    // Save to Firestore with Drive URLs
    const docRef = await adminDb.collection("odRequests").add({
      studentUid: uid,
      referenceNumber: refNumber,
      qrCodeUrl: verifyUrl,
      eventName, eventType, organiser, venue,
      startDate, endDate,
      isSpecialNeed: isSpecialNeed || false,
      specialNeedJustification: specialNeedJustification || "",
      reason,
      upfrontProofUrl: scriptData.proofUrl || "",
      status: "pending_faculty",
      pdfUrl: scriptData.draftPdfUrl || "",
      driveFolderId: scriptData.folderId || "",
      driveFolderUrl: scriptData.folderUrl || "",
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: docRef.id, referenceNumber: refNumber, pdfUrl: scriptData.draftPdfUrl })
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
        .get()
    } else if (role === "staff") {
      docs = await adminDb.collection("odRequests")
        .where("status", "==", "pending_faculty")
        .get()

      const userDoc = await adminDb.collection("users").doc(uid).get()
      const classId = userDoc.data()?.classId
      if (!classId) return NextResponse.json([])

      const studentsSnap = await adminDb.collection("users")
        .where("classId", "==", classId)
        .where("role", "==", "student")
        .get()
      const studentUids = studentsSnap.docs.map(d => d.id)
      if (studentUids.length === 0) return NextResponse.json([])

      const filtered = docs.docs
        .filter(d => studentUids.includes(d.data().studentUid))
        .map(d => ({ id: d.id, ...d.data() }))

      // Enrich with student names
      const enriched = await Promise.all(filtered.map(async (req: any) => {
        const studentDoc = await adminDb.collection("users").doc(req.studentUid).get()
        return { ...req, studentName: studentDoc.data()?.name || "Unknown" }
      }))

      enriched.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0))
      return NextResponse.json(enriched)
    } else if (role === "hod") {
      docs = await adminDb.collection("odRequests")
        .where("status", "==", "pending_hod")
        .get()

      const data = docs.docs.map(d => ({ id: d.id, ...d.data() }))
      const enriched = await Promise.all(data.map(async (req: any) => {
        const studentDoc = await adminDb.collection("users").doc(req.studentUid).get()
        return { ...req, studentName: studentDoc.data()?.name || "Unknown" }
      }))
      
      enriched.sort((a, b) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0))
      return NextResponse.json(enriched)
    } else {
      return NextResponse.json({ error: "Unknown role" }, { status: 403 })
    }

    const results = docs.docs.map(d => ({ id: d.id, ...d.data() }))
    results.sort((a, b) => ((b as any).createdAt?._seconds || 0) - ((a as any).createdAt?._seconds || 0))
    return NextResponse.json(results)
  } catch (err: any) {
    console.error("[OD GET]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// force reload
