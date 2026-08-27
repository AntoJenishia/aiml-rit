import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

function generateRefNumber(): string {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `ODF-${y}${m}${d}-${rand}`
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      eventName, eventType, organiser, venue,
      startDate, endDate, reason, gpsLocation,
      proofFileB64, proofFileName, proofMimeType,
    } = body

    if (!eventName || !eventType || !organiser || !venue || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 })
    }

    const uid = session.user.uid!

    const userDoc = await adminDb.collection("users").doc(uid).get()
    if (!userDoc.exists) return NextResponse.json({ error: "User not found." }, { status: 404 })
    const userData = userDoc.data()!

    const refNumber = generateRefNumber()

    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (!scriptUrl) throw new Error("Missing NEXT_PUBLIC_APPS_SCRIPT_URL in env")

    const webhookPayload = {
      action: "create_od",
      refNumber,
      studentName: userData.name || "Faculty", // Maps to Name column in sheet
      registerNumber: userData.staffId || "—", // Maps to Reg/Staff ID
      classId: userData.department || "—",
      eventName,
      eventType,
      organiser,
      startDate,
      endDate,
      proofFile: proofFileB64 || "",
      proofFileName: proofFileName || "",
      proofMimeType: proofMimeType || "",
      gpsLat: gpsLocation?.lat || null,
      gpsLng: gpsLocation?.lng || null,
      gpsAccuracy: gpsLocation?.accuracy || null,
      createUpfrontSubfolder: true,
      upfrontSubfolderName: "Faculty Request",
      skipPdfGeneration: true,
      "Submitter Type": "Faculty"
    }

    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    })

    if (!scriptRes.ok) throw new Error("Failed to contact Google Apps Script Webhook.")
    const scriptData = await scriptRes.json()
    if (scriptData.error) throw new Error("Apps Script Error: " + scriptData.error)

    const docRef = await adminDb.collection("odRequests").add({
      facultyUid: uid,
      isFacultyRequest: true,
      referenceNumber: refNumber,
      eventName, eventType, organiser, venue,
      startDate, endDate,
      reason,
      gpsLocation: gpsLocation || null,
      signedLetterUrl: scriptData.proofUrl || "",
      status: "pending_hod",
      driveFolderId: scriptData.folderId || "",
      driveFolderUrl: scriptData.folderUrl || "",
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ id: docRef.id, referenceNumber: refNumber, signedLetterUrl: scriptData.proofUrl })
  } catch (err: any) {
    console.error("[FACULTY OD POST]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
