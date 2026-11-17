import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"

// ── GET: Fetch PEC sessions ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = (session.user as any)?.role || "student"
    const staffCode = ((session.user as any)?.staffCode || "").trim().toUpperCase()
    const staffName = (session.user.name || "").trim().toLowerCase()

    // Check if staff is PEC coordinator
    let isCoordinator = role === "hod" || role === "admin"
    if (!isCoordinator && staffCode) {
      const coordDoc = await adminDb.collection("pecConfig").doc("coordinator").get()
      if (coordDoc.exists && coordDoc.data()?.staffCode?.toUpperCase() === staffCode) {
        isCoordinator = true
      }
      if (!isCoordinator) {
        const { data: staffData } = await supabaseAdmin
          .from("staff")
          .select("is_pec_coordinator")
          .ilike("staff_code", staffCode)
          .maybeSingle()
        if (staffData?.is_pec_coordinator) {
          isCoordinator = true
        }
      }
    }

    const snap = await adminDb.collection("pecSessions").orderBy("createdAt", "desc").get()
    const allSessions = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // If HOD, admin, or PEC coordinator -> see all sessions
    if (isCoordinator) {
      return NextResponse.json({ sessions: allSessions, isCoordinator: true })
    }

    // Otherwise staff only sees sessions where they are assigned as faculty
    const filtered = allSessions.filter((s: any) => {
      const fCode = (s.facultyCode || "").toUpperCase()
      const fName = (s.facultyName || "").toLowerCase()
      return (staffCode && fCode.includes(staffCode)) || (staffName && fName.includes(staffName))
    })

    return NextResponse.json({ sessions: filtered, isCoordinator: false })
  } catch (err: any) {
    console.error("[PEC GET Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// ── POST: Create PEC sessions (HOD or Coordinator) ───────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = (session.user as any)?.role || "student"
    const staffCode = ((session.user as any)?.staffCode || "").trim().toUpperCase()

    // Permission check: HOD, admin, or PEC coordinator
    let isAuthorized = role === "hod" || role === "admin"
    if (!isAuthorized && staffCode) {
      const coordDoc = await adminDb.collection("pecConfig").doc("coordinator").get()
      if (coordDoc.exists && coordDoc.data()?.staffCode?.toUpperCase() === staffCode) {
        isAuthorized = true
      }
      if (!isAuthorized) {
        const { data: staffData } = await supabaseAdmin
          .from("staff")
          .select("is_pec_coordinator")
          .ilike("staff_code", staffCode)
          .maybeSingle()
        if (staffData?.is_pec_coordinator) isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: HOD or PEC Coordinator access required" }, { status: 403 })
    }

    const body = await req.json()
    const { sessions, dept, semester, section } = body

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json({ error: "No sessions provided" }, { status: 400 })
    }

    const batch = adminDb.batch()
    const createdIds: string[] = []

    for (const s of sessions) {
      const ref = adminDb.collection("pecSessions").doc()
      batch.set(ref, {
        dept: s.dept || dept || "AIML",
        semester: s.semester || semester || "",
        section: s.section || section || "",
        year: s.year || "",
        courseCode: s.courseCode || "",
        courseName: s.courseName || s.name || "",
        facultyCode: s.facultyCode || s.staffCode || "",
        facultyName: s.facultyName || s.staffName || s.facultyCode || "",
        date: s.date || "",
        time: s.time || "03.00 PM to 05.00 PM",
        revisionTiming: s.revisionTiming || "03.00 PM to 04.00 PM",
        testTiming: s.testTiming || "04.00 PM to 05.00 PM",
        venue: s.venue || "",
        students: s.students || [],
        outcomeSummary: s.outcomeSummary || null,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: session.user.name || staffCode || "HOD",
      })
      createdIds.push(ref.id)
    }

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `${createdIds.length} PEC sessions created successfully.`,
      ids: createdIds,
    })
  } catch (err: any) {
    console.error("[PEC POST Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

// ── PATCH: Update Attendance / Assessment / Outcome for a session ────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { id, students, outcomeSummary } = body

    if (!id) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const ref = adminDb.collection("pecSessions").doc(id)
    const doc = await ref.get()
    if (!doc.exists) {
      return NextResponse.json({ error: "PEC session not found" }, { status: 404 })
    }

    const updates: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.user.name || "Staff",
    }

    if (students !== undefined) {
      updates.students = students
    }
    if (outcomeSummary !== undefined) {
      updates.outcomeSummary = outcomeSummary
    }

    await ref.update(updates)

    return NextResponse.json({ success: true, message: "PEC record updated successfully." })
  } catch (err: any) {
    console.error("[PEC PATCH Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

