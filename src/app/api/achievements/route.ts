import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"
import { logActivity } from "@/lib/auditLogger"

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

    // Fetch student profile from Supabase first, fallback to Firestore
    let studentName = session.user.name || "Student"
    let registerNumber = (session.user as any)?.registerNumber || "—"
    let classId = "—"
    let batch = "—"
    let section = "—"
    let department = "Artificial Intelligence & Machine Learning"

    const { data: studentData } = await supabaseAdmin
      .from("students")
      .select("id, name, register_no, class, batch, section, department")
      .eq("id", uid)
      .maybeSingle()

    if (studentData) {
      studentName = studentData.name || studentName
      registerNumber = studentData.register_no || registerNumber
      classId = studentData.class || classId
      batch = studentData.batch || batch
      section = studentData.section || section
      department = studentData.department || department
    } else {
      const userDoc = await adminDb.collection("users").doc(uid).get()
      if (userDoc.exists) {
        const u = userDoc.data()!
        studentName = u.name || studentName
        registerNumber = u.registerNumber || registerNumber
        classId = u.classId || u.class || classId
        batch = u.batch || batch
        section = u.section || section
      }
    }

    // 1. Direct upload proof file to Supabase Storage
    let proofFileUrl = ""
    if (proofFileB64) {
      try {
        const buffer = Buffer.from(proofFileB64, "base64")
        const safeName = (proofFileName || "achievement_proof.pdf").replace(/[^a-zA-Z0-9.-]/g, "_")
        const filePath = `achievements/${uid}_${Date.now()}_${safeName}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from("proofs")
          .upload(filePath, buffer, {
            contentType: proofMimeType || "application/pdf",
            upsert: true,
          })

        if (!uploadError) {
          const { data: pubData } = supabaseAdmin.storage
            .from("proofs")
            .getPublicUrl(filePath)
          proofFileUrl = pubData.publicUrl
        } else {
          console.error("[ACHIEVEMENTS POST] Supabase upload error:", uploadError)
        }
      } catch (bufErr) {
        console.error("[ACHIEVEMENTS POST] Buffer error:", bufErr)
      }
    }

    // 2. Forward to Google Apps Script Webhook (optional redundancy for Sheets)
    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const webhookPayload = {
          action: "create_achievement",
          studentName,
          registerNumber,
          classId,
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

        if (scriptRes.ok) {
          const scriptData = await scriptRes.json()
          if (!proofFileUrl && scriptData.proofUrl) {
            proofFileUrl = scriptData.proofUrl
          }
        }
      } catch (scriptErr) {
        console.warn("[ACHIEVEMENTS POST] Apps Script sync non-blocking error:", scriptErr)
      }
    }

    const docRef = await adminDb.collection("achievements").add({
      studentUid: uid,
      studentName,
      registerNumber,
      classId,
      batch,
      section,
      department,
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
      createdAtIso: new Date().toISOString(),
    })

    // Log activity with IP & Location
    logActivity({
      userId: uid,
      userName: studentName,
      userEmail: session.user.email || "",
      userRole: "student",
      registerNumber,
      action: "ACHIEVEMENT_SUBMITTED",
      entityType: "achievement",
      entityId: docRef.id,
      details: `Student logged achievement: "${title}" (${category} - ${position}) for event ${eventName}`,
      metadata: { title, category, eventName, date, position },
      req,
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
      .get()

    const achievements = snapshot.docs.map(doc => {
      const d = doc.data()
      return {
        id: doc.id,
        ...d,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAtIso || d.createdAt || null,
      }
    })

    achievements.sort((a: any, b: any) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0)
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0)
      return tB - tA
    })

    return NextResponse.json(achievements)
  } catch (err: any) {
    console.error("[ACHIEVEMENT GET]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
