import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const batch = (searchParams.get("batch") || "").trim()
    const section = (searchParams.get("section") || "").trim().toUpperCase()
    const date = (searchParams.get("date") || new Date().toISOString().split("T")[0]).trim()

    if (!batch || !section) {
      return NextResponse.json({ error: "Batch and section are required" }, { status: 400 })
    }

    // 1. Fetch enrolled students from Supabase
    const { data: students, error: stuErr } = await supabaseAdmin
      .from("students")
      .select("id, name, register_no, class, batch, section, gender, email, phone, profile_url, staff_code")
      .eq("batch", batch)
      .eq("section", section)
      .order("register_no", { ascending: true })

    if (stuErr) {
      console.error("[GET /api/attendance] Supabase Error:", stuErr)
      return NextResponse.json({ error: "Failed to load students" }, { status: 500 })
    }

    // 2. Fetch existing saved attendance record from Firestore
    const docId = `${batch}_${section}_${date}`
    const attSnap = await adminDb.collection("attendance").doc(docId).get()
    const existingData = attSnap.exists ? attSnap.data() : null

    // 3. Find approved OD requests for that date
    // Approved statuses: VERIFIED, COMPLETED, ACTIVITY_COMPLETED
    const approvedOdSnap = await adminDb.collection("odRequests")
      .where("status", "in", ["VERIFIED", "COMPLETED", "ACTIVITY_COMPLETED"])
      .get()

    // Map approved ODs for the target date
    const approvedOdsByStudent: Record<string, { refNumber: string; eventName: string; eventType: string }> = {}

    approvedOdSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sDate = data.startDate
      const eDate = data.endDate || data.startDate
      const studentUid = data.studentUid

      if (sDate && eDate && studentUid) {
        // Date compare (YYYY-MM-DD)
        if (date >= sDate && date <= eDate) {
          approvedOdsByStudent[studentUid] = {
            refNumber: data.referenceNumber || doc.id,
            eventName: data.eventName || "Approved OD",
            eventType: data.eventType || "Academic Event",
          }
        }
      }
    })

    // 3b. Find approved or incharge-recommended advance leave requests for that date
    const leaveSnap = await adminDb.collection("leaveRequests")
      .where("status", "in", ["APPROVED", "PENDING_HOD"])
      .get()

    const approvedLeavesByStudent: Record<string, { id: string; category: string; reason: string; status: string }> = {}
    const pendingHodLeavesByStudent: Record<string, { id: string; category: string; reason: string; status: string }> = {}

    leaveSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sDate = data.startDate
      const eDate = data.endDate || data.startDate
      const studentUid = data.studentUid

      if (sDate && eDate && studentUid) {
        if (date >= sDate && date <= eDate) {
          const item = {
            id: doc.id,
            category: data.category || "General Leave",
            reason: data.reason || "",
            status: data.status,
          }
          if (data.status === "APPROVED") {
            approvedLeavesByStudent[studentUid] = item
          } else {
            pendingHodLeavesByStudent[studentUid] = item
          }
        }
      }
    })

    return NextResponse.json({
      date,
      batch,
      section,
      docId,
      isMarked: attSnap.exists,
      isLocked: attSnap.exists ? Boolean(existingData?.isLocked ?? true) : false,
      lockedAt: existingData?.lockedAt || null,
      lockedBy: existingData?.lockedBy || null,
      savedAt: existingData?.savedAt || null,
      savedBy: existingData?.savedByName || null,
      records: existingData?.records || null,
      stats: existingData ? {
        total: existingData.totalStudents,
        present: existingData.presentCount,
        absent: existingData.absentCount,
        od: existingData.odCount,
      } : null,
      students: (students || []).map((s) => ({
        uid: s.id,
        name: s.name,
        registerNumber: s.register_no,
        classTitle: s.class,
        gender: s.gender,
        approvedOd: approvedOdsByStudent[s.id] || null,
        approvedLeave: approvedLeavesByStudent[s.id] || null,
        pendingHodLeave: pendingHodLeavesByStudent[s.id] || null,
      })),
    })
  } catch (err: any) {
    console.error("[GET /api/attendance] Error:", err)
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { batch, section, date, records } = body

    if (!batch || !section || !date || !Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 })
    }

    const docId = `${batch.trim()}_${section.trim().toUpperCase()}_${date.trim()}`
    const existingSnap = await adminDb.collection("attendance").doc(docId).get()
    const existingData = existingSnap.exists ? existingSnap.data() : null
    const existingRecords = existingData?.records || {}

    // Check lock status: If already locked, only HOD / Admin can override directly, otherwise incharge must have HOD unlock it
    const role = (session.user as any)?.role
    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      (session.user as any)?.username === "CS91" ||
      session.user?.email === "antojenishiadev@gmail.com"

    if (existingData?.isLocked && !isHodOrAdmin) {
      return NextResponse.json({
        error: "Attendance is locked. Please request HOD unlock access to make modifications."
      }, { status: 423 })
    }

    // Calculate metrics
    let presentCount = 0
    let absentCount = 0
    let odCount = 0

    const updatedRecords: Record<string, any> = {}

    for (const r of records) {
      const studentId = r.studentUid
      const status = r.status || "PRESENT"

      if (status === "PRESENT") presentCount++
      else if (status === "ABSENT") absentCount++
      else if (status === "OD") odCount++

      // Preserve existing absent reason if student had submitted one
      const prev = existingRecords[studentId] || {}

      const hasApprovedOd = Boolean(r.odRefNumber || prev.odRefNumber || prev.odVerified)
      const odStatus = status === "OD"
        ? (hasApprovedOd || prev.odVerified ? "VERIFIED" : "PENDING_HOD_APPROVAL")
        : null

      updatedRecords[studentId] = {
        studentUid: studentId,
        registerNumber: r.registerNumber,
        name: r.name,
        status, // PRESENT | ABSENT | OD
        odRefNumber: r.odRefNumber || prev.odRefNumber || null,
        odTitle: r.odTitle || prev.odTitle || null,
        odVerified: prev.odVerified || hasApprovedOd,
        odStatus,
        absentReason: prev.absentReason || null,
        absentCategory: prev.absentCategory || null,
        absentProofUrl: prev.absentProofUrl || null,
        absentReasonSubmittedAt: prev.absentReasonSubmittedAt || null,
        absentStatus: prev.absentStatus || (status === "ABSENT" ? "REASON_PENDING" : null),
      }
    }

    const totalStudents = records.length

    const payload = {
      docId,
      batch: batch.trim(),
      section: section.trim().toUpperCase(),
      date: date.trim(),
      totalStudents,
      presentCount,
      absentCount,
      odCount,
      isLocked: true, // Auto-lock attendance upon submission
      lockedAt: new Date().toISOString(),
      lockedBy: (session.user as any)?.staffCode || session.user.name,
      savedBy: (session.user as any)?.staffCode || session.user.name,
      savedByName: session.user.name || "Class Incharge",
      savedAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
      records: updatedRecords,
    }

    await adminDb.collection("attendance").doc(docId).set(payload, { merge: true })

    return NextResponse.json({
      success: true,
      docId,
      isLocked: true,
      stats: { totalStudents, presentCount, absentCount, odCount },
    })
  } catch (err: any) {
    console.error("[POST /api/attendance] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to save attendance" }, { status: 500 })
  }
}

