import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { FieldValue } from "firebase-admin/firestore"
import { logActivity } from "@/lib/auditLogger"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // 1. Fetch Faculty
    const uid = (session.user as any).uid || (session.user as any).id
    const facultyDoc = await adminDb.collection("users").doc(uid).get()
    const facultyData = facultyDoc.data()
    if (!facultyDoc.exists || (facultyData?.role !== "staff" && facultyData?.role !== "hod" && facultyData?.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { action, reason } = body

    const { id } = await params
    const odRef = adminDb.collection("odRequests").doc(id)
    const odDoc = await odRef.get()
    if (!odDoc.exists) return NextResponse.json({ error: "OD not found" }, { status: 404 })
    
    const odData = odDoc.data()!
    const isProof = odData.status === "post_pending_faculty"

    const auditLog = {
      action: isProof ? `Proof ${action}` : `OD ${action}`,
      by: facultyData.name,
      timestamp: new Date().toISOString(),
      reason: reason || null
    }

    let updates: any = {
      auditLogs: [...(odData.auditLogs || []), auditLog]
    }

    if (action === "approve") {
      updates.status = isProof ? "ACTIVITY_COMPLETED" : "VERIFIED"
      if (isProof) {
        // Auto-create or sync to department achievements!
        try {
          await adminDb.collection("achievements").add({
            studentUid: odData.studentUid,
            studentName: odData.studentName || "Student",
            registerNumber: odData.registerNumber || "—",
            classId: odData.classId || "—",
            title: odData.eventName,
            category: odData.postODCategory || odData.eventType || "Competition / Hackathon",
            eventName: odData.eventName,
            date: odData.endDate || odData.startDate || new Date().toISOString().split("T")[0],
            position: odData.postODPosition || "Participation / Completion",
            description: odData.postODDescription || odData.reason || "",
            proofFileUrl: odData.postODProofsUrl || "",
            proofFileName: "OD Completion Certificate / Proof",
            status: "APPROVED",
            verifiedBy: facultyData.name,
            verifiedAt: new Date().toISOString(),
            odRefNumber: odData.referenceNumber || odData.refNumber || id,
            createdAt: FieldValue.serverTimestamp(),
          })
        } catch (achieveErr) {
          console.error("Auto-sync achievement error:", achieveErr)
        }
      }
    } else if (action === "reject") {
      updates.status = "REJECTED"
      updates.facultyRejectReason = reason
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await odRef.update(updates)

    // Audit log OD status change with IP & location
    logActivity({
      userId: uid,
      userName: facultyData.name || "Faculty",
      userEmail: session.user.email || "",
      userRole: facultyData.role || "staff",
      action: action === "reject" ? "OD_REJECTED" : (isProof ? "OD_PROOF_VERIFIED" : "OD_VERIFIED"),
      entityType: "od",
      entityId: id,
      details: `${facultyData.name} (${facultyData.role?.toUpperCase()}): ${action === "reject" ? `Rejected OD` : `Verified ${isProof ? "Proof" : "OD"}`} for ${odData.studentName || "Student"} [Ref: ${odData.referenceNumber}]`,
      metadata: { action, reason, newStatus: updates.status },
      req,
    })
    
    // 2. Call Google Apps Script webhook to notify backend spreadsheets if needed
    try {
      const webhookPayload = {
        action: "update_status",
        referenceNumber: odData.referenceNumber,
        status: updates.status,
        rejectReason: updates.facultyRejectReason || "",
        verifiedBy: facultyData.name,
      }
      // Fire and forget
      fetch("https://script.google.com/macros/s/AKfycby5t4cZc8_R321F5aU9w3GgXmKIDQG872wzJ5N66Rj-5iF9R6qfJ3E5728oV28wX7J9/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }).catch(console.error)
    } catch (e) {
      console.error("Webhook trigger failed", e)
    }

    return NextResponse.json({ success: true, status: updates.status })
  } catch (error) {
    console.error("Error updating OD status:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
