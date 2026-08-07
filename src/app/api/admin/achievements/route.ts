import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as any)?.uid || (session?.user as any)?.id

    if (!uid || session?.user?.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all achievements
    const snapshot = await adminDb.collection("achievements").orderBy("createdAt", "desc").get()
    
    // Fetch all students to attach names (optional, as studentName is stored in achievement directly)
    const achievements = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json(achievements)
  } catch (error: any) {
    console.error("Error fetching achievements:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
