import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { FieldValue } from "firebase-admin/firestore"

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
    const achRef = adminDb.collection("achievements").doc(id)
    const achDoc = await achRef.get()
    if (!achDoc.exists) return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    
    const achData = achDoc.data()!
    if (achData.classId !== facultyData.classId) {
      return NextResponse.json({ error: "Forbidden: Not in your class" }, { status: 403 })
    }

    let updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
      verifiedBy: facultyData.name
    }

    if (action === "approve") {
      updates.status = "VERIFIED"
    } else if (action === "reject") {
      updates.status = "REJECTED"
      updates.facultyRemarks = reason
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    await achRef.update(updates)

    return NextResponse.json({ success: true, status: updates.status })
  } catch (error: any) {
    console.error("Error updating achievement:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
