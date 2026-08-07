import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const uid = (session.user as any).uid || (session.user as any).id
    const facultyDoc = await adminDb.collection("users").doc(uid).get()
    if (!facultyDoc.exists) return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    
    const facultyData = facultyDoc.data()
    if (facultyData?.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 })
    }

    const { isClassIncharge, classId } = facultyData!
    if (!isClassIncharge || !classId) {
      // If not a class incharge, return empty list for now (until we add more responsibilities)
      return NextResponse.json([])
    }

    // 2. Fetch students belonging to the class
    const snapshot = await adminDb.collection("users")
      .where("role", "==", "student")
      .where("classId", "==", classId)
      .get()

    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any))
    
    // Sort by register number
    students.sort((a: any, b: any) => (a.registerNumber || "").localeCompare(b.registerNumber || ""))

    return NextResponse.json(students)
  } catch (error) {
    console.error("Error fetching faculty students:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
