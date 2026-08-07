import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    
    // 1. Fetch Faculty Profile
    const facultyDoc = await adminDb.collection("users").doc(session.user.id).get()
    if (!facultyDoc.exists) return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    
    const facultyData = facultyDoc.data()
    if (facultyData?.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 })
    }

    const { isClassIncharge, classId } = facultyData!
    if (!isClassIncharge || !classId) {
      return NextResponse.json([])
    }

    // 2. Fetch students in the class to get their UIDs
    const studentsSnap = await adminDb.collection("users")
      .where("role", "==", "student")
      .where("classId", "==", classId)
      .get()

    if (studentsSnap.empty) return NextResponse.json([])
    
    const studentUids = studentsSnap.docs.map(d => d.id)

    // 3. Firestore doesn't support 'in' queries for >10 items.
    // Instead, since it's a dashboard, we could fetch all ODs with studentUid in list, or just fetch all recent ODs and filter.
    // Assuming class sizes are ~60, we can chunk the `in` queries.
    const odRequests = []
    
    // Chunk array into groups of 10
    for (let i = 0; i < studentUids.length; i += 10) {
      const chunk = studentUids.slice(i, i + 10)
      const odSnap = await adminDb.collection("odRequests")
        .where("studentUid", "in", chunk)
        .orderBy("createdAt", "desc")
        .get()
        
      odSnap.forEach(doc => {
        odRequests.push({ id: doc.id, ...doc.data() })
      })
    }
    
    // Sort combined results by descending creation date
    odRequests.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0
      const timeB = b.createdAt?.seconds || 0
      return timeB - timeA
    })

    return NextResponse.json(odRequests)
  } catch (error) {
    console.error("Error fetching faculty ODs:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
