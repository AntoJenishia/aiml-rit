import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { generateFormalODPdf } from "@/lib/pdf-generator"

// ── Helpers ──────────────────────────────────────────────────────────────────
async function regeneratePdf(od: any, facultyApproved: boolean, hodApproved: boolean): Promise<string> {
  const verifyUrl = od.qrCodeUrl || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${od.referenceNumber}`
  
  const pdfBytes = await generateFormalODPdf({
    referenceNumber: od.referenceNumber,
    studentName: od.studentName || "—",
    registerNumber: od.registerNumber || "—",
    department: "AI & Machine Learning",
    classLabel: od.classId || "—",
    eventName: od.eventName,
    eventType: od.eventType,
    organiser: od.organiser,
    venue: od.venue,
    startDate: od.startDate,
    endDate: od.endDate,
    reason: od.reason || "",
    facultyName: od.facultyName || "Class Incharge",
    hodName: od.hodName || "Head of Department",
    facultyApproved,
    hodApproved,
    facultyRespondedAt: od.facultyRespondedAt,
    hodRespondedAt: od.hodRespondedAt,
    verifyUrl
  })
  
  return Buffer.from(pdfBytes).toString("base64")
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

    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (!scriptUrl) throw new Error("Missing NEXT_PUBLIC_APPS_SCRIPT_URL")

    if (role === "staff") {
      if (od.status !== "pending_faculty") {
        return NextResponse.json({ error: "This OD is not awaiting faculty approval." }, { status: 400 })
      }
      if (action === "approve") {
        const draftPdfBase64 = await regeneratePdf({ ...od }, true, false)
        
        // Notify webhook
        const scriptRes = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({
            action: "update_status",
            refNumber: od.referenceNumber,
            newStatus: "Pending HOD",
            folderId: od.driveFolderId
          })
        })
        if (!scriptRes.ok) throw new Error("Webhook failed")

        updateData = {
          status: "pending_hod",
          facultyRespondedAt: FieldValue.serverTimestamp(),
        }
      } else {
        await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({ action: "update_status", refNumber: od.referenceNumber, newStatus: "Rejected by Faculty" })
        })
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
        const finalPdfBase64 = await regeneratePdf({ ...od }, true, true)
        
        // Notify webhook & upload final PDF to Drive
        const scriptRes = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({
            action: "update_status",
            refNumber: od.referenceNumber,
            newStatus: "Approved",
            folderId: od.driveFolderId,
            finalPdfFile: finalPdfBase64
          })
        })
        if (!scriptRes.ok) throw new Error("Webhook failed")
        
        const scriptData = await scriptRes.json()
        
        updateData = {
          status: "approved",
          hodRespondedAt: FieldValue.serverTimestamp(),
          finalPdfUrl: scriptData.finalPdfUrl || "",
        }
      } else {
        await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify({ action: "update_status", refNumber: od.referenceNumber, newStatus: "Rejected by HOD" })
        })
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
