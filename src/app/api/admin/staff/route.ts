import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as any)?.uid || (session?.user as any)?.id
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify HOD
    const hodDoc = await adminDb.collection("users").doc(uid).get()
    if (!hodDoc.exists || hodDoc.data()?.role !== "hod") {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 })
    }

    // Fetch all staff
    const snapshot = await adminDb.collection("users").where("role", "==", "staff").get()
    const staff = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any))
    
    // Sort alphabetically by name
    staff.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""))

    return NextResponse.json(staff)
  } catch (error) {
    console.error("[GET /api/admin/staff] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const adminUid = (session?.user as any)?.uid || (session?.user as any)?.id
    if (!adminUid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Verify HOD
    const hodDoc = await adminDb.collection("users").doc(adminUid).get()
    if (!hodDoc.exists || hodDoc.data()?.role !== "hod") {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 })
    }

    const body = await req.json()
    
    if (body.action === "assignClass") {
      const { uid, classId } = body
      if (!uid) return NextResponse.json({ error: "Missing faculty UID" }, { status: 400 })
      
      const updateData = {
        classId: classId || null,
        isClassIncharge: !!classId
      }

      await adminDb.collection("users").doc(uid).update(updateData)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[PATCH /api/admin/staff] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
