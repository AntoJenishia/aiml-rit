import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    const sessionUser = session.user as any
    const staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    const email = session.user.email?.toLowerCase().trim()
    const isHod = sessionUser.role === "hod" || staffCode === "CS91" || email === "antojenishiadev@gmail.com"

    let assignedStudentUids: string[] = []

    if (!isHod) {
      // Find students assigned to this faculty via staff_code
      const { data: students } = await supabaseAdmin
        .from("students")
        .select("id, class, batch, section, staff_code")
        .eq("staff_code", staffCode)

      if (students && students.length > 0) {
        assignedStudentUids = students.map((s) => s.id)
      }
    }

    // Fetch OD requests from Firestore
    const odsSnap = await adminDb.collection("odRequests").get()
    if (odsSnap.empty) return NextResponse.json([])

    let ods = odsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // If not HOD, filter to only assigned students
    if (!isHod) {
      ods = ods.filter((od: any) => assignedStudentUids.includes(od.studentUid))
    }

    // Sort newest first
    ods.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : 0)
      return timeB - timeA
    })

    return NextResponse.json(ods)
  } catch (error) {
    console.error("[GET /api/faculty/ods] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
