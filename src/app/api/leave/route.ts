import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const uid = session.user.uid
    const body = await req.json()
    const {
      startDate,
      endDate,
      category,
      reason,
      attachmentUrl,
      attachmentName,
    } = body

    if (!startDate || !endDate || !category || !reason) {
      return NextResponse.json(
        { error: "Start date, end date, category, and reason are required." },
        { status: 400 }
      )
    }

    // 1. Fetch student info from Supabase
    let studentName = session.user.name || "Student"
    let registerNumber = ""
    let batch = ""
    let section = ""
    let classInchargeName = ""
    let staffCode = ""

    const { data: studentData } = await supabaseAdmin
      .from("students")
      .select("id, name, register_no, batch, section, class_incharge_name, staff_code")
      .eq("id", uid)
      .maybeSingle()

    if (studentData) {
      studentName = studentData.name || studentName
      registerNumber = studentData.register_no || ""
      batch = studentData.batch || ""
      section = studentData.section || ""
      classInchargeName = studentData.class_incharge_name || ""
      staffCode = studentData.staff_code || ""
    } else {
      const userDoc = await adminDb.collection("users").doc(uid).get()
      if (userDoc.exists) {
        const u = userDoc.data()!
        studentName = u.name || studentName
        registerNumber = u.registerNumber || ""
        batch = u.batch || ""
        section = u.section || ""
      }
    }

    // Multi-tier workflow: First submitted to Class Incharge
    const leaveDoc = {
      studentUid: uid,
      studentName,
      registerNumber,
      batch,
      section,
      classInchargeName,
      staffCode,
      startDate,
      endDate,
      category,
      reason,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      status: "PENDING_INCHARGE", // Step 1: Awaiting Incharge Review
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const docRef = await adminDb.collection("leaveRequests").add(leaveDoc)

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Advance leave request submitted to Class Incharge for review.",
    })
  } catch (err: any) {
    console.error("[LEAVE POST Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const role = ((session.user as any)?.role || "student") as string
    const uid = session.user.uid
    const batchFilter = searchParams.get("batch")
    const sectionFilter = searchParams.get("section")
    const statusFilter = searchParams.get("status")

    let query: FirebaseFirestore.Query = adminDb.collection("leaveRequests")

    if (role === "student") {
      // Students see only their own leave requests
      query = query.where("studentUid", "==", uid)
    } else if (role === "staff") {
      if (batchFilter) query = query.where("batch", "==", batchFilter)
      if (sectionFilter) query = query.where("section", "==", sectionFilter)
    } else if (role === "hod" || role === "admin") {
      if (batchFilter) query = query.where("batch", "==", batchFilter)
      if (sectionFilter) query = query.where("section", "==", sectionFilter)
    }

    if (statusFilter && statusFilter !== "ALL") {
      query = query.where("status", "==", statusFilter)
    }

    const snap = await query.get()

    // 1. Fetch attendance records to compute real-time attendance rate
    const attSnap = await adminDb.collection("attendance").get()
    const studentStats: Record<string, { total: number; present: number; absent: number; od: number }> = {}

    attSnap.docs.forEach((doc) => {
      const d = doc.data()
      const records = d.records || {}
      Object.entries(records).forEach(([studentKey, r]: [string, any]) => {
        const keys = [studentKey, r.registerNumber, (r.name || "").toLowerCase().trim()].filter(Boolean)
        keys.forEach((k) => {
          if (!studentStats[k]) studentStats[k] = { total: 0, present: 0, absent: 0, od: 0 }
          studentStats[k].total++
          if (r.status === "PRESENT") studentStats[k].present++
          else if (r.status === "OD") studentStats[k].od++
          else studentStats[k].absent++
        })
      })
    })

    // 2. Fetch all leaves to calculate chronological leave sequence for each student
    const allLeavesSnap = await adminDb.collection("leaveRequests").get()
    const studentLeaveBuckets: Record<string, any[]> = {}

    allLeavesSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sKey = data.studentUid || data.registerNumber || (data.studentName || "").toLowerCase().trim()
      if (!studentLeaveBuckets[sKey]) studentLeaveBuckets[sKey] = []
      studentLeaveBuckets[sKey].push({
        id: doc.id,
        createdAtTime: data.createdAt?.toDate ? data.createdAt.toDate().getTime() : 0,
      })
    })

    const leaveSequenceMap: Record<string, { sequence: number; total: number }> = {}
    Object.values(studentLeaveBuckets).forEach((bucket) => {
      bucket.sort((a, b) => a.createdAtTime - b.createdAtTime)
      bucket.forEach((item, index) => {
        leaveSequenceMap[item.id] = { sequence: index + 1, total: bucket.length }
      })
    })

    const leaves = snap.docs.map((doc) => {
      const d = doc.data()
      const seq = leaveSequenceMap[doc.id] || { sequence: 1, total: 1 }
      const statKey = d.studentUid || d.registerNumber || (d.studentName || "").toLowerCase().trim()
      const stat = studentStats[statKey] || studentStats[d.studentUid] || studentStats[d.registerNumber] || {
        total: 0,
        present: 0,
        absent: 0,
        od: 0,
      }

      const totalDays = stat.total
      const presentCount = stat.present + stat.od
      const attendancePercentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 100

      return {
        id: doc.id,
        ...d,
        leaveSequence: seq.sequence,
        totalLeavesCount: seq.total,
        attendancePercentage,
        totalWorkingDays: totalDays,
        presentDays: stat.present,
        absentDays: stat.absent,
        odDays: stat.od,
        createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : d.createdAt || null,
        updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : d.updatedAt || null,
      }
    })

    // Sort newest first
    leaves.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tB - tA
    })

    return NextResponse.json({ leaves })
  } catch (err: any) {
    console.error("[LEAVE GET Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role as string
    if (!session?.user || (role !== "staff" && role !== "hod" && role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized: Faculty or HOD access required" }, { status: 403 })
    }

    const body = await req.json()
    const { id, action, reviewNotes } = body

    if (!id || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Valid id and action ('approve' or 'reject') required" }, { status: 400 })
    }

    const leaveRef = adminDb.collection("leaveRequests").doc(id)
    const leaveSnap = await leaveRef.get()
    if (!leaveSnap.exists) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 })
    }

    const currentData = leaveSnap.data()!
    const reviewerName = session.user.name || (role === "hod" ? "Dr. Selvakumaran S. (HOD)" : "Class Incharge")
    const isHod = role === "hod" || role === "admin"

    let newStatus: string
    let message: string
    const updates: Record<string, any> = {
      reviewNotes: reviewNotes || null,
      reviewedBy: reviewerName,
      reviewedRole: role,
      reviewedAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (action === "reject") {
      newStatus = "REJECTED"
      updates.status = "REJECTED"
      updates.rejectedBy = reviewerName
      updates.rejectedRole = role
      updates.rejectReason = reviewNotes || "Rejected"
      message = `Leave request rejected by ${isHod ? "HOD" : "Class Incharge"}.`
    } else {
      // Action is "approve"
      if (isHod) {
        // HOD provides final approval
        newStatus = "APPROVED"
        updates.status = "APPROVED"
        updates.hodApprovedBy = reviewerName
        updates.hodApprovedAt = new Date().toISOString()
        updates.hodNotes = reviewNotes || null
        message = "Leave request received final approval from HOD."
      } else {
        // Class Incharge approves -> Forward to HOD for final sign-off
        newStatus = "PENDING_HOD"
        updates.status = "PENDING_HOD"
        updates.inchargeApprovedBy = reviewerName
        updates.inchargeApprovedAt = new Date().toISOString()
        updates.inchargeNotes = reviewNotes || null
        message = "Leave approved by Class Incharge and forwarded to HOD for final sign-off."
      }
    }

    await leaveRef.update(updates)

    return NextResponse.json({
      success: true,
      status: newStatus,
      message,
    })
  } catch (err: any) {
    console.error("[LEAVE PATCH Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
