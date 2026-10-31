import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const email = (session.user.email || "").toLowerCase().trim()
    const sessionUid = session.user.uid

    // 1. Locate student in Supabase to get their batch and section
    let studentData: any = null
    if (email) {
      const { data } = await supabaseAdmin
        .from("students")
        .select("id, name, register_no, batch, section, class")
        .ilike("email", email)
        .maybeSingle()
      if (data) studentData = data
    }

    if (!studentData && sessionUid) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionUid)
      if (isUUID) {
        const { data } = await supabaseAdmin
          .from("students")
          .select("id, name, register_no, batch, section, class")
          .eq("id", sessionUid)
          .maybeSingle()
        if (data) studentData = data
      }
    }

    if (!studentData) {
      return NextResponse.json({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        odDays: 0,
        percentage: 100,
        history: [],
      })
    }

    const { id: studentUid, batch, section, register_no: regNo } = studentData

    // 2. Query all attendance documents for this batch and section
    const attSnap = await adminDb.collection("attendance")
      .where("batch", "==", batch)
      .where("section", "==", section)
      .get()

    let totalDays = 0
    let presentDays = 0
    let absentDays = 0
    let odDays = 0
    const history: any[] = []

    attSnap.docs.forEach((doc) => {
      const d = doc.data()
      const studentRecord = d.records?.[studentUid] || Object.values(d.records || {}).find(
        (r: any) => r.registerNumber === regNo
      ) as any

      if (studentRecord) {
        totalDays++
        const status = studentRecord.status || "PRESENT"
        if (status === "PRESENT") presentDays++
        else if (status === "OD") odDays++
        else if (status === "ABSENT") absentDays++

        history.push({
          date: d.date,
          day: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
          status,
          odTitle: studentRecord.odTitle || null,
          odRefNumber: studentRecord.odRefNumber || null,
          absentReason: studentRecord.absentReason || null,
          absentCategory: studentRecord.absentCategory || null,
          absentProofUrl: studentRecord.absentProofUrl || null,
          absentStatus: studentRecord.absentStatus || (status === "ABSENT" ? "REASON_PENDING" : null),
          absentReasonSubmittedAt: studentRecord.absentReasonSubmittedAt || null,
          batch: d.batch,
          section: d.section,
        })
      }
    })

    // Sort history descending by date
    history.sort((a, b) => b.date.localeCompare(a.date))

    // Anna University criteria: (Present + Approved OD) / Total Working Days * 100
    const attendedDays = presentDays + odDays
    const percentage = totalDays > 0 ? Math.round((attendedDays / totalDays) * 100) : 100

    return NextResponse.json({
      studentUid,
      batch,
      section,
      totalDays,
      presentDays,
      absentDays,
      odDays,
      attendedDays,
      percentage,
      isAboveMandatoryCriteria: percentage >= 75,
      history,
    })
  } catch (err: any) {
    console.error("[GET /api/attendance/student] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to load attendance" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { date, batch, section, reason, category, proofUrl } = body

    if (!date || !batch || !section || !reason) {
      return NextResponse.json({ error: "Date, batch, section, and reason are required" }, { status: 400 })
    }

    const email = (session.user.email || "").toLowerCase().trim()
    const sessionUid = session.user.uid

    // Lookup student id from Supabase
    let studentUid = sessionUid
    const { data: stu } = await supabaseAdmin
      .from("students")
      .select("id, register_no")
      .or(`email.ilike.${email},id.eq.${sessionUid}`)
      .maybeSingle()

    if (stu?.id) {
      studentUid = stu.id
    }

    const docId = `${batch.trim()}_${section.trim().toUpperCase()}_${date.trim()}`
    const docRef = adminDb.collection("attendance").doc(docId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Attendance record not found for this date" }, { status: 404 })
    }

    const existingRecords = docSnap.data()?.records || {}
    let targetKey = studentUid
    if (!existingRecords[targetKey]) {
      const foundKey = Object.keys(existingRecords).find(
        (k) =>
          existingRecords[k]?.studentUid === studentUid ||
          (stu?.register_no && existingRecords[k]?.registerNumber === stu.register_no)
      )
      if (foundKey) targetKey = foundKey
    }

    const recordKey = `records.${targetKey}`

    await docRef.update({
      [`${recordKey}.absentReason`]: reason.trim(),
      [`${recordKey}.absentCategory`]: category || "Personal / Medical",
      [`${recordKey}.absentProofUrl`]: proofUrl || null,
      [`${recordKey}.absentReasonSubmittedAt`]: new Date().toISOString(),
      [`${recordKey}.absentStatus`]: "REASON_SUBMITTED",
      updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      success: true,
      message: "Absence reason submitted successfully to Class Incharge.",
    })
  } catch (err: any) {
    console.error("[PATCH /api/attendance/student] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to submit reason" }, { status: 500 })
  }
}

