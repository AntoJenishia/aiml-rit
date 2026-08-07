import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      title, category, eventName, date, position, description, proofFileB64, proofFileName, proofMimeType
    } = body

    if (!title || !category || !eventName || !date || !position || !proofFileB64) {
      return NextResponse.json({ error: "All required fields must be filled." }, { status: 400 })
    }

    const uid = session.user.uid!

    // Fetch student profile for redundancy
    const userDoc = await adminDb.collection("users").doc(uid).get()
    if (!userDoc.exists) return NextResponse.json({ error: "User not found." }, { status: 404 })
    const userData = userDoc.data()!

    // Forward to Google Apps Script Webhook
    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (!scriptUrl) {
      throw new Error("Missing NEXT_PUBLIC_APPS_SCRIPT_URL in env")
    }

    const webhookPayload = {
      action: "create_achievement",
      studentName: userData.name || "Student",
      registerNumber: userData.registerNumber || "—",
      classId: userData.classId || "—",
      title,
      category,
      eventName,
      date,
      position,
      description: description || "",
      proofFile: proofFileB64,
      proofFileName,
      proofMimeType
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

    // Get public URL from Apps Script response
    const proofFileUrl = scriptData.proofUrl || ""

    const docRef = await adminDb.collection("achievements").add({
      studentUid: uid,
      studentName: userData.name || "Unknown",
      registerNumber: userData.registerNumber || "—",
      classId: userData.classId || "—",
      title,
      category,
      eventName,
      date,
      position,
      description: description || "",
      proofFileUrl,
      proofFileName: proofFileName || "Proof Document",
      status: "PENDING_VERIFICATION",
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (err: any) {
    console.error("[ACHIEVEMENT POST]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const uid = session.user.uid!
    const snapshot = await adminDb.collection("achievements")
      .where("studentUid", "==", uid)
      .orderBy("createdAt", "desc")
      .get()

    const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json(achievements)
  } catch (err: any) {
    console.error("[ACHIEVEMENT GET]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
