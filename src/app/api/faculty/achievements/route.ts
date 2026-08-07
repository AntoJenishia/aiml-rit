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
      return NextResponse.json([])
    }

    // Since achievements store classId, we can directly query by classId!
    const achievementsSnap = await adminDb.collection("achievements")
      .where("classId", "==", classId)
      .get()

    if (achievementsSnap.empty) return NextResponse.json([])
    
    const achievements = achievementsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    // Sort combined results by descending creation date in JS to avoid composite index error
    achievements.sort((a: any, b: any) => {
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeB - timeA
    })

    return NextResponse.json(achievements)
  } catch (error) {
    console.error("Error fetching faculty achievements:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
