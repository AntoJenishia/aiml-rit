import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { FieldValue } from "firebase-admin/firestore"
import { logActivity } from "@/lib/auditLogger"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    const isHodOrAdmin =
      sessionUser.role === "hod" ||
      sessionUser.role === "admin" ||
      staffCode === "CS91" ||
      session.user?.email === "antojenishiadev@gmail.com"

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Forbidden: HOD access required" }, { status: 403 })
    }

    // Fetch all achievements without compound index requirement
    const snapshot = await adminDb.collection("achievements").get()
    
    const achievements = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAtIso || data.createdAt || null,
      }
    })

    // Sort newest first in memory
    achievements.sort((a: any, b: any) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0)
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0)
      return tB - tA
    })

    return NextResponse.json(achievements)
  } catch (error: any) {
    console.error("[GET /api/admin/achievements] Error fetching achievements:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    const isHodOrAdmin =
      sessionUser.role === "hod" ||
      sessionUser.role === "admin" ||
      staffCode === "CS91" ||
      session.user?.email === "antojenishiadev@gmail.com"

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Forbidden: HOD access required" }, { status: 403 })
    }

    const body = await req.json()
    const { id, action, remarks } = body

    if (!id || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Valid id and action ('approve' or 'reject') required" }, { status: 400 })
    }

    const achRef = adminDb.collection("achievements").doc(id)
    const achDoc = await achRef.get()
    if (!achDoc.exists) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }

    const achData = achDoc.data()!
    const newStatus = action === "approve" ? "VERIFIED" : "REJECTED"
    const verifiedBy = session.user.name || "Head of Department"

    const updates: Record<string, any> = {
      status: newStatus,
      verifiedBy,
      verifiedRole: "hod",
      verifiedAt: new Date().toISOString(),
      remarks: remarks || null,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (action === "reject") {
      updates.rejectedBy = verifiedBy
      updates.rejectReason = remarks || "Rejected by HOD"
    }

    await achRef.update(updates)

    // Audit log HOD decision with IP & Location
    logActivity({
      userId: sessionUser.uid || sessionUser.id,
      userName: verifiedBy,
      userEmail: session.user.email || "",
      userRole: "hod",
      staffCode: "CS91",
      action: action === "approve" ? "ACHIEVEMENT_VERIFIED" : "ACHIEVEMENT_REJECTED",
      entityType: "achievement",
      entityId: id,
      details: `HOD ${verifiedBy}: ${action === "approve" ? "Verified & Approved" : "Rejected"} achievement "${achData.title}" for ${achData.studentName} (${achData.registerNumber})`,
      metadata: { action, remarks, newStatus },
      req,
    })

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: any) {
    console.error("[PATCH /api/admin/achievements] Error updating achievement:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
