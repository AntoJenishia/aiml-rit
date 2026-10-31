import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
import { FieldValue } from "firebase-admin/firestore"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      (session?.user as any)?.username === "CS91" ||
      session?.user?.email === "antojenishiadev@gmail.com"

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Unauthorized: HOD access only" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const date = (searchParams.get("date") || new Date().toISOString().split("T")[0]).trim()

    // 1. Fetch all students and staff from Supabase in parallel
    const [stuRes, staffRes] = await Promise.all([
      supabaseAdmin
        .from("students")
        .select("id, name, register_no, batch, section, class, staff_code, class_incharge_name")
        .order("register_no", { ascending: true }),
      supabaseAdmin
        .from("staff")
        .select("staff_code, name, phone, email, profile_url, designation")
    ])

    if (stuRes.error) {
      console.error("[GET /api/admin/attendance] Students error:", stuRes.error)
      return NextResponse.json({ error: "Failed to load students" }, { status: 500 })
    }

    const staffMap: Record<string, any> = {}
    ;(staffRes.data || []).forEach((st) => {
      const code = (st.staff_code || "").trim().toUpperCase()
      if (code) staffMap[code] = st
    })

    // 2. Group sections
    const sectionGroups: Record<string, {
      batch: string
      section: string
      classTitle: string
      staffCode: string | null
      studentCount: number
      studentUids: string[]
      enrolledStudents: {
        id: string
        name: string
        registerNumber: string
      }[]
    }> = {}

    ;(stuRes.data || []).forEach((stu) => {
      if (!stu.batch || !stu.section) return
      const k = `${stu.batch}__${stu.section}`
      if (!sectionGroups[k]) {
        sectionGroups[k] = {
          batch: stu.batch,
          section: stu.section,
          classTitle: stu.class || `Batch ${stu.batch} - Section ${stu.section}`,
          staffCode: stu.staff_code || null,
          studentCount: 0,
          studentUids: [],
          enrolledStudents: []
        }
      }
      sectionGroups[k].studentCount++
      sectionGroups[k].studentUids.push(stu.id)
      sectionGroups[k].enrolledStudents.push({
        id: stu.id,
        name: stu.name,
        registerNumber: stu.register_no || ""
      })
    })

    // 3. Fetch all attendance docs for this date from Firestore
    const attSnap = await adminDb.collection("attendance")
      .where("date", "==", date)
      .get()

    const attendanceBySection: Record<string, any> = {}
    attSnap.docs.forEach((doc) => {
      const data = doc.data()
      const k = `${data.batch}__${data.section}`
      attendanceBySection[k] = data
    })

    // 3b. Fetch all approved or incharge-recommended leaves for this date
    const leaveSnap = await adminDb.collection("leaveRequests")
      .where("status", "in", ["APPROVED", "PENDING_HOD"])
      .get()

    const approvedLeavesByStudent: Record<string, { id: string; category: string; reason: string; status: string }> = {}
    leaveSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sDate = data.startDate
      const eDate = data.endDate || data.startDate
      const studentUid = data.studentUid
      if (sDate && eDate && studentUid && date >= sDate && date <= eDate) {
        approvedLeavesByStudent[studentUid] = {
          id: doc.id,
          category: data.category || "General Leave",
          reason: data.reason || "",
          status: data.status,
        }
      }
    })

    // 4. Assemble section breakdown
    const sections = Object.values(sectionGroups).map((sec) => {
      const k = `${sec.batch}__${sec.section}`
      const attData = attendanceBySection[k]
      const staffInfo = sec.staffCode ? staffMap[sec.staffCode.toUpperCase()] : null

      const isMarked = Boolean(attData)
      const presentCount = attData ? Number(attData.presentCount || 0) : 0
      const absentCount = attData ? Number(attData.absentCount || 0) : 0
      const odCount = attData ? Number(attData.odCount || 0) : 0
      const totalStudents = attData ? Number(attData.totalStudents || sec.studentCount) : sec.studentCount

      const attendanceRate = totalStudents > 0
        ? Math.round(((presentCount + odCount) / totalStudents) * 100)
        : 100

      // Default isLocked to true if marked, unless explicitly unlocked by HOD
      const isLocked = attData ? Boolean(attData.isLocked ?? true) : false

      // Assemble full student list sorted strictly by Register Number ascending
      const savedRecords = attData?.records || {}
      const recordsList = sec.enrolledStudents.map((s) => {
        const saved = savedRecords[s.id] || Object.values(savedRecords).find(
          (r: any) => r.registerNumber === s.registerNumber
        ) as any

        const approvedLeave = approvedLeavesByStudent[s.id] || null

        if (saved) {
          return {
            studentUid: s.id,
            name: s.name || saved.name,
            registerNumber: s.registerNumber || saved.registerNumber,
            status: saved.status || "PRESENT",
            odTitle: saved.odTitle || null,
            odRefNumber: saved.odRefNumber || null,
            odVerified: Boolean(saved.odVerified),
            odStatus: saved.odStatus || (saved.status === "OD" ? (saved.odVerified ? "VERIFIED" : "PENDING_HOD_APPROVAL") : null),
            absentReason: saved.absentReason || (approvedLeave ? `Approved Leave: ${approvedLeave.reason}` : null),
            absentCategory: saved.absentCategory || (approvedLeave ? approvedLeave.category : null),
            absentProofUrl: saved.absentProofUrl || null,
            absentStatus: saved.absentStatus || (approvedLeave ? "VERIFIED" : null),
            absentReasonSubmittedAt: saved.absentReasonSubmittedAt || null,
            approvedLeave,
          }
        }

        return {
          studentUid: s.id,
          name: s.name,
          registerNumber: s.registerNumber,
          status: isMarked ? "PRESENT" : "NOT_MARKED",
          odTitle: null,
          odRefNumber: null,
          odVerified: false,
          odStatus: null,
          absentReason: approvedLeave ? `Approved Leave: ${approvedLeave.reason}` : null,
          absentCategory: approvedLeave ? approvedLeave.category : null,
          absentProofUrl: null,
          absentStatus: approvedLeave ? "VERIFIED" : null,
          absentReasonSubmittedAt: null,
          approvedLeave,
        }
      })

      // Sort strictly by registerNumber numeric/natural order
      recordsList.sort((a, b) =>
        (a.registerNumber || "").localeCompare(b.registerNumber || "", undefined, { numeric: true })
      )

      return {
        batch: sec.batch,
        section: sec.section,
        classTitle: sec.classTitle,
        studentCount: sec.studentCount,
        staffCode: sec.staffCode,
        inchargeName: staffInfo?.name || "Not Assigned",
        inchargePhone: staffInfo?.phone || null,
        inchargeEmail: staffInfo?.email || null,
        isMarked,
        isLocked,
        lockedAt: attData?.lockedAt || null,
        lockedBy: attData?.lockedBy || null,
        markedAt: attData?.savedAt || null,
        markedBy: attData?.savedBy || null,
        markedByName: attData?.savedByName || null,
        presentCount,
        absentCount,
        odCount,
        attendanceRate,
        records: recordsList
      }
    })

    // Sort sections by batch descending, then section ascending
    sections.sort((a, b) => {
      const cmp = b.batch.localeCompare(a.batch)
      return cmp !== 0 ? cmp : a.section.localeCompare(b.section)
    })

    // 5. Aggregate Department Metrics
    let totalStudents = 0
    let totalPresent = 0
    let totalAbsent = 0
    let totalOd = 0
    let markedSectionsCount = 0
    let pendingSectionsCount = 0

    const pendingIncharges: any[] = []

    sections.forEach((sec) => {
      totalStudents += sec.studentCount
      if (sec.isMarked) {
        markedSectionsCount++
        totalPresent += sec.presentCount
        totalAbsent += sec.absentCount
        totalOd += sec.odCount
      } else {
        pendingSectionsCount++
        pendingIncharges.push({
          batch: sec.batch,
          section: sec.section,
          classTitle: sec.classTitle,
          studentCount: sec.studentCount,
          inchargeName: sec.inchargeName,
          staffCode: sec.staffCode,
          inchargePhone: sec.inchargePhone,
          inchargeEmail: sec.inchargeEmail
        })
      }
    })

    const totalMarkedStudents = totalPresent + totalAbsent + totalOd
    const departmentAttendanceRate = totalMarkedStudents > 0
      ? Math.round(((totalPresent + totalOd) / totalMarkedStudents) * 100)
      : 0

    return NextResponse.json({
      date,
      summary: {
        totalSections: sections.length,
        markedSections: markedSectionsCount,
        pendingSections: pendingSectionsCount,
        totalStudents,
        totalPresent,
        totalAbsent,
        totalOd,
        departmentAttendanceRate,
        allMarked: pendingSectionsCount === 0 && sections.length > 0
      },
      pendingIncharges,
      sections
    })
  } catch (err: any) {
    console.error("[GET /api/admin/attendance] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to fetch department attendance" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    const isHodOrAdmin =
      role === "hod" ||
      role === "admin" ||
      (session?.user as any)?.username === "CS91" ||
      session?.user?.email === "antojenishiadev@gmail.com"

    if (!isHodOrAdmin) {
      return NextResponse.json({ error: "Unauthorized: HOD access only" }, { status: 403 })
    }

    const body = await req.json()
    const { action, batch, section, date, isLocked, studentUid, eventName } = body

    if (!batch || !section || !date) {
      return NextResponse.json({ error: "Batch, section, and date are required" }, { status: 400 })
    }

    const docId = `${batch.trim()}_${section.trim().toUpperCase()}_${date.trim()}`
    const docRef = adminDb.collection("attendance").doc(docId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Attendance document not found for this section and date" }, { status: 404 })
    }

    // ACTION 1: Toggle Lock / Unlock Section Attendance
    if (action === "toggle_lock") {
      const lockState = Boolean(isLocked)
      await docRef.update({
        isLocked: lockState,
        unlockedAt: !lockState ? new Date().toISOString() : null,
        unlockedBy: !lockState ? (session?.user?.name || "HOD") : null,
        updatedAt: FieldValue.serverTimestamp(),
      })

      return NextResponse.json({
        success: true,
        isLocked: lockState,
        message: lockState
          ? "Attendance locked successfully."
          : "Attendance unlocked. Class incharge can now edit and re-submit.",
      })
    }

    // ACTION 2: Approve Sudden / Spot OD Request
    if (action === "approve_spot_od") {
      if (!studentUid) {
        return NextResponse.json({ error: "studentUid is required for spot OD approval" }, { status: 400 })
      }

      const existingRecords = docSnap.data()?.records || {}
      let targetKey = studentUid
      if (!existingRecords[targetKey]) {
        const found = Object.keys(existingRecords).find(
          (k) => existingRecords[k]?.studentUid === studentUid
        )
        if (found) targetKey = found
      }

      const spotRefNumber = `SPOT-OD-${Date.now().toString().slice(-6)}`
      const studentRec = existingRecords[targetKey] || {}
      const recordKey = `records.${targetKey}`

      // Update attendance document in Firestore
      await docRef.update({
        [`${recordKey}.status`]: "OD",
        [`${recordKey}.odRefNumber`]: spotRefNumber,
        [`${recordKey}.odTitle`]: eventName || "Spot On-Duty Approved by HOD",
        [`${recordKey}.odVerified`]: true,
        [`${recordKey}.odStatus`]: "VERIFIED",
        [`${recordKey}.odVerifiedBy`]: session?.user?.name || "Dr. Selvakumaran S. (HOD)",
        [`${recordKey}.odVerifiedAt`]: new Date().toISOString(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      // Recalculate section metrics
      const updatedSnap = await docRef.get()
      const allRecords = updatedSnap.data()?.records || {}
      let pCount = 0
      let aCount = 0
      let oCount = 0
      Object.values(allRecords).forEach((r: any) => {
        if (r.status === "PRESENT") pCount++
        else if (r.status === "ABSENT") aCount++
        else if (r.status === "OD") oCount++
      })

      await docRef.update({
        presentCount: pCount,
        absentCount: aCount,
        odCount: oCount,
      })

      // Store in odRequests collection for permanent audit record
      await adminDb.collection("odRequests").add({
        studentUid,
        studentName: studentRec.name || "Student",
        registerNumber: studentRec.registerNumber || "",
        batch,
        section,
        eventName: eventName || "Spot On-Duty Approved by HOD",
        eventType: "Academic / Representation",
        startDate: date,
        endDate: date,
        status: "VERIFIED",
        referenceNumber: spotRefNumber,
        approvedBy: session?.user?.name || "Dr. Selvakumaran S. (HOD)",
        approvedAt: new Date().toISOString(),
        isSpotOd: true,
        createdAt: FieldValue.serverTimestamp(),
      })

      return NextResponse.json({
        success: true,
        message: "Spot OD approved and verified successfully.",
        refNumber: spotRefNumber,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    console.error("[PATCH /api/admin/attendance] Error:", err)
    return NextResponse.json({ error: err.message || "Failed to update attendance" }, { status: 500 })
  }
}


