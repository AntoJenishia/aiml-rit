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
    let assignedClasses: string[] = []

    if (!isHod) {
      // Find students assigned to this faculty via staff_code
      const { data: students } = await supabaseAdmin
        .from("students")
        .select("id, class, batch, section, staff_code")
        .eq("staff_code", staffCode)

      if (students && students.length > 0) {
        assignedStudentUids = students.map((s) => s.id)
        assignedClasses = Array.from(new Set(students.map((s) => s.class).filter(Boolean)))
      }
    }

    // Fetch achievements from Firestore
    const achievementsSnap = await adminDb.collection("achievements").get()
    if (achievementsSnap.empty) return NextResponse.json([])
    
    let achievements = achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // If not HOD, filter for assigned students or classes
    if (!isHod) {
      achievements = achievements.filter((ach: any) => {
        if (assignedStudentUids.includes(ach.studentUid)) return true
        if (ach.classId && assignedClasses.includes(ach.classId)) return true
        return false
      })
    }
    
    // Sort newest first
    achievements.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (a.createdAt ? new Date(a.createdAt).getTime() : (a.date ? new Date(a.date).getTime() : 0))
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (b.createdAt ? new Date(b.createdAt).getTime() : (b.date ? new Date(b.date).getTime() : 0))
      return timeB - timeA
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("[GET /api/faculty/achievements] Error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
