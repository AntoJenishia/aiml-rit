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

    // Fetch all students
    const snapshot = await adminDb.collection("users").where("role", "==", "student").get()
    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
    
    // Sort by register number or name
    students.sort((a, b) => (a.registerNumber || a.name || "").localeCompare(b.registerNumber || b.name || ""))

    return NextResponse.json(students)
  } catch (error) {
    console.error("[GET /api/admin/students] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
