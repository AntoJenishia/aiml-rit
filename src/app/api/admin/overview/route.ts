import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    // 1. Verify HOD role
    const session = await getServerSession(authOptions)
    const uid = (session?.user as any)?.uid || (session?.user as any)?.id
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hodDoc = await adminDb.collection("users").doc(uid).get()
    if (!hodDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const hodData = hodDoc.data()!
    if (hodData.role !== "hod") {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 })
    }

    // 2. Fetch all collections
    const usersSnap = await adminDb.collection("users").get()
    const odSnap = await adminDb.collection("od").get()
    // achievements and events will be added here once their collections are established

    // 3. Aggregate data
    let aimlStudents = 0
    let aidsStudents = 0
    let aimlFaculty = 0
    let aidsFaculty = 0
    let aimlPendingOD = 0
    let aidsPendingOD = 0
    // Mock values for now for batches/sections as they are static or missing table
    const totalBatches = 6
    const activeSections = 18
    const upcomingEvents = 0

    usersSnap.forEach((doc) => {
      const data = doc.data()
      const dept = (data.department || data.deptCode || "").toLowerCase()
      const isAIML = dept.includes("aiml") || dept.includes("machine learning")
      const isAIDS = dept.includes("aids") || dept.includes("data science")
      
      if (data.role === "student") {
        if (isAIML) aimlStudents++
        else if (isAIDS) aidsStudents++
        else aimlStudents++ // Default fallback
      } else if (data.role === "staff") {
        if (isAIML) aimlFaculty++
        else if (isAIDS) aidsFaculty++
        else aimlFaculty++ // Default fallback
      }
    })

    odSnap.forEach((doc) => {
      const data = doc.data()
      if (data.status === "pending" || data.status === "faculty_verified" || data.status === "awaiting_signed_letter") {
        const dept = (data.department || "").toLowerCase()
        if (dept.includes("aids") || dept.includes("data science")) {
          aidsPendingOD++
        } else {
          aimlPendingOD++
        }
      }
    })

    const metrics = {
      totalStudents: aimlStudents + aidsStudents,
      totalFaculty: aimlFaculty + aidsFaculty,
      totalBatches,
      activeSections,
      pendingOD: aimlPendingOD + aidsPendingOD,
      pendingAchievements: 0,
      pendingPortfolios: 0,
      upcomingEvents,
      aiml: {
        students: aimlStudents,
        faculty: aimlFaculty,
        pendingOD: aimlPendingOD,
        achievements: 0
      },
      aids: {
        students: aidsStudents,
        faculty: aidsFaculty,
        pendingOD: aidsPendingOD,
        achievements: 0
      }
    }

    return NextResponse.json(metrics)
  } catch (error: any) {
    console.error("[HOD Overview API Error]:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
