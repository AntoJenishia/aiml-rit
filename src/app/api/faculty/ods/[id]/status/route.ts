import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ODStatus } from "@/lib/odStatus"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // 1. Fetch Faculty
    const uid = (session.user as any).uid || (session.user as any).id
    const facultyDoc = await adminDb.collection("users").doc(uid).get()
    const facultyData = facultyDoc.data()
    if (!facultyDoc.exists || facultyData?.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { action, reason } = body

    const { id } = await params
    const odRef = adminDb.collection("odRequests").doc(id)
    const odDoc = await odRef.get()
    if (!odDoc.exists) return NextResponse.json({ error: "OD not found" }, { status: 404 })
    
    const odData = odDoc.data()!
    const isProof = odData.status === ODStatus.PROOF_PENDING_FACULTY

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
      updates.status = isProof ? ODStatus.PROOF_PENDING_HOD : ODStatus.PENDING_HOD
      updates.facultyRespondedAt = FieldValue.serverTimestamp()
    } else if (action === "reject") {
      updates.status = isProof ? ODStatus.PROOF_REJECTED_FACULTY : ODStatus.REJECTED_FACULTY
      updates.facultyRejectReason = reason
      updates.facultyRespondedAt = FieldValue.serverTimestamp()
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await odRef.update(updates)
    
    // 2. Call Google Apps Script webhook to sync status to spreadsheet
    try {
      const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
      if (scriptUrl) {
        const webhookPayload = {
          action: "update_status",
          refNumber: odData.referenceNumber,
          status: updates.status,
          rejectReason: updates.facultyRejectReason || "",
          verifiedBy: facultyData.name,
        }
        // Fire and forget
        fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        }).catch(console.error)
      }
    } catch (e) {
      console.error("Webhook trigger failed", e)
    }

    return NextResponse.json({ success: true, status: updates.status })
  } catch (error) {
    console.error("Error updating OD status:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
