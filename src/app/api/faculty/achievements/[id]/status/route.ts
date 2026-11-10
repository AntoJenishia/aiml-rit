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
    
    const sessionUser = session.user as any
    const staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    const role = sessionUser.role || "staff"
    const isAllowed = role === "staff" || role === "hod" || role === "admin" || staffCode === "CS91"

    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { action, reason } = body

    const { id } = await params
    const achRef = adminDb.collection("achievements").doc(id)
    const achDoc = await achRef.get()
    if (!achDoc.exists) return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    
    const achData = achDoc.data()!
    const reviewerName = session.user.name || "Faculty"

    let updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
      verifiedBy: reviewerName,
      verifiedRole: role,
      verifiedAt: new Date().toISOString(),
    }

    if (action === "approve") {
      updates.status = "VERIFIED"
    } else if (action === "reject") {
      updates.status = "REJECTED"
      updates.facultyRemarks = reason || "Rejected by reviewer"
      updates.rejectReason = reason || "Rejected by reviewer"
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await achRef.update(updates)

    // Audit log verification
    logActivity({
      userId: sessionUser.uid || sessionUser.id,
      userName: reviewerName,
      userEmail: session.user.email || "",
      userRole: role as any,
      staffCode,
      action: action === "approve" ? "ACHIEVEMENT_VERIFIED" : "ACHIEVEMENT_REJECTED",
      entityType: "achievement",
      entityId: id,
      details: `${reviewerName} (${role.toUpperCase()}): ${action === "approve" ? "Verified & Approved" : "Rejected"} achievement "${achData.title}" for ${achData.studentName} (${achData.registerNumber})`,
      metadata: { action, reason, newStatus: updates.status },
      req,
    })

    return NextResponse.json({ success: true, status: updates.status })
  } catch (error: any) {
    console.error("Error updating achievement:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
