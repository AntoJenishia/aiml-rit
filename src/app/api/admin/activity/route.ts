import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role
    if (!session?.user || (role !== "hod" && (role as string) !== "admin")) {
      return NextResponse.json({ error: "Unauthorized: HOD access only" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const today = new Date().toISOString().split("T")[0]
    
    // Default to last 7 days if not provided
    const defaultFrom = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const fromDate = (searchParams.get("fromDate") || defaultFrom).trim()
    const toDate = (searchParams.get("toDate") || today).trim()

    // 1. Fetch Students from Supabase
    const { data: students, error: stuErr } = await supabaseAdmin
      .from("students")
      .select("id, name, register_no, batch, section, class, staff_code, class_incharge_name")
      .order("register_no", { ascending: true })

    if (stuErr) {
      console.error("[ACTIVITY API] Supabase students error:", stuErr)
      return NextResponse.json({ error: "Failed to fetch student roster" }, { status: 500 })
    }

    const studentMap: Record<string, any> = {}
    ;(students || []).forEach((s) => {
      studentMap[s.id] = s
    })

    // 2. Fetch Staff from Supabase for Incharge names
    const { data: staffList } = await supabaseAdmin
      .from("staff")
      .select("staff_code, name, phone, email")

    const staffMap: Record<string, any> = {}
    ;(staffList || []).forEach((st) => {
      if (st.staff_code) staffMap[st.staff_code.toUpperCase()] = st
    })

    // 3. Query Firestore Attendance across date range
    const attSnap = await adminDb.collection("attendance")
      .where("date", ">=", fromDate)
      .where("date", "<=", toDate)
      .get()

    // Track working dates and section summaries
    const workingDatesSet = new Set<string>()
    const sectionAgg: Record<string, {
      batch: string
      section: string
      inchargeName: string
      staffCode: string | null
      inchargePhone: string | null
      totalSessions: number
      totalPresent: number
      totalAbsent: number
      totalOd: number
      totalHeadcount: number
    }> = {}

    // Track student attendance stats in this range
    const studentStats: Record<string, {
      uid: string
      name: string
      registerNumber: string
      batch: string
      section: string
      presentCount: number
      absentCount: number
      odCount: number
      absentReasons: string[]
      inchargeName: string
    }> = {}

    // Initialize all enrolled students in studentStats
    ;(students || []).forEach((s) => {
      studentStats[s.id] = {
        uid: s.id,
        name: s.name,
        registerNumber: s.register_no || "—",
        batch: s.batch,
        section: s.section,
        presentCount: 0,
        absentCount: 0,
        odCount: 0,
        absentReasons: [],
        inchargeName: s.class_incharge_name || "Faculty",
      }

      const secKey = `${s.batch}__${s.section}`
      if (!sectionAgg[secKey]) {
        const staffInfo = s.staff_code ? staffMap[s.staff_code.toUpperCase()] : null
        sectionAgg[secKey] = {
          batch: s.batch,
          section: s.section,
          inchargeName: s.class_incharge_name || staffInfo?.name || "Not Assigned",
          staffCode: s.staff_code || null,
          inchargePhone: staffInfo?.phone || null,
          totalSessions: 0,
          totalPresent: 0,
          totalAbsent: 0,
          totalOd: 0,
          totalHeadcount: 0,
        }
      }
      sectionAgg[secKey].totalHeadcount++
    })

    // Daily breakdown tracking
    const dailyMap: Record<string, { present: number; absent: number; od: number; total: number }> = {}

    attSnap.docs.forEach((doc) => {
      const data = doc.data()
      const d = data.date
      if (!d) return
      workingDatesSet.add(d)

      if (!dailyMap[d]) {
        dailyMap[d] = { present: 0, absent: 0, od: 0, total: 0 }
      }

      const secKey = `${data.batch}__${data.section}`
      if (sectionAgg[secKey]) {
        sectionAgg[secKey].totalSessions++
        sectionAgg[secKey].totalPresent += Number(data.presentCount || 0)
        sectionAgg[secKey].totalAbsent += Number(data.absentCount || 0)
        sectionAgg[secKey].totalOd += Number(data.odCount || 0)
      }

      dailyMap[d].present += Number(data.presentCount || 0)
      dailyMap[d].absent += Number(data.absentCount || 0)
      dailyMap[d].od += Number(data.odCount || 0)
      dailyMap[d].total += Number(data.presentCount || 0) + Number(data.absentCount || 0) + Number(data.odCount || 0)

      // Student records map
      const records = data.records || {}
      Object.entries(records).forEach(([stuUid, rec]: [string, any]) => {
        if (studentStats[stuUid]) {
          if (rec.status === "PRESENT") studentStats[stuUid].presentCount++
          else if (rec.status === "ABSENT") {
            studentStats[stuUid].absentCount++
            if (rec.absentReason) {
              studentStats[stuUid].absentReasons.push(`${d}: ${rec.absentReason}`)
            }
          } else if (rec.status === "OD") studentStats[stuUid].odCount++
        }
      })
    })

    // 4. Query OD Requests in Range
    const odSnap = await adminDb.collection("odRequests").get()
    let totalOdRequests = 0
    let verifiedOdCount = 0
    let completedOdCount = 0
    let pendingOdCount = 0
    let rejectedOdCount = 0
    const odByCategory: Record<string, number> = {}

    odSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sDate = data.startDate
      const eDate = data.endDate || sDate

      // Check if dates overlap [fromDate, toDate]
      if (sDate && eDate && sDate <= toDate && eDate >= fromDate) {
        totalOdRequests++
        const cat = data.eventType || "Other"
        odByCategory[cat] = (odByCategory[cat] || 0) + 1

        if (data.status === "VERIFIED") verifiedOdCount++
        else if (data.status === "ACTIVITY_COMPLETED" || data.status === "COMPLETED") completedOdCount++
        else if (data.status === "REJECTED") rejectedOdCount++
        else pendingOdCount++
      }
    })

    // 5. Query Advance Leave Requests in Range
    const leaveSnap = await adminDb.collection("leaveRequests").get()
    let totalLeaveRequests = 0
    let approvedLeaveCount = 0
    let pendingLeaveCount = 0
    let rejectedLeaveCount = 0
    const leaveByCategory: Record<string, number> = {}

    leaveSnap.docs.forEach((doc) => {
      const data = doc.data()
      const sDate = data.startDate
      const eDate = data.endDate || sDate

      if (sDate && eDate && sDate <= toDate && eDate >= fromDate) {
        totalLeaveRequests++
        const cat = data.category || "General Leave"
        leaveByCategory[cat] = (leaveByCategory[cat] || 0) + 1

        if (data.status === "APPROVED") approvedLeaveCount++
        else if (data.status === "REJECTED") rejectedLeaveCount++
        else pendingLeaveCount++
      }
    })

    // 6. Query Achievements in Range
    const achSnap = await adminDb.collection("achievements").get()
    let totalAchievementsCount = 0
    const achievementsList: any[] = []

    achSnap.docs.forEach((doc) => {
      const data = doc.data()
      const achDate = data.date || ""
      if (achDate >= fromDate && achDate <= toDate) {
        totalAchievementsCount++
        achievementsList.push({
          id: doc.id,
          title: data.title || data.eventName,
          studentName: data.studentName,
          registerNumber: data.registerNumber,
          category: data.category,
          position: data.position,
          date: achDate,
          proofFileUrl: data.proofFileUrl || null,
        })
      }
    })

    // 7. Calculate Section Summaries
    const sectionsSummary = Object.values(sectionAgg).map((sec) => {
      const totalMarked = sec.totalPresent + sec.totalAbsent + sec.totalOd
      const rate = totalMarked > 0
        ? Math.round(((sec.totalPresent + sec.totalOd) / totalMarked) * 100)
        : 100

      return {
        batch: sec.batch,
        section: sec.section,
        inchargeName: sec.inchargeName,
        staffCode: sec.staffCode,
        inchargePhone: sec.inchargePhone,
        totalSessions: sec.totalSessions,
        presentCount: sec.totalPresent,
        absentCount: sec.totalAbsent,
        odCount: sec.totalOd,
        attendanceRate: rate,
        studentCount: sec.totalHeadcount,
      }
    })

    // Sort sections: Batch descending, Section ascending
    sectionsSummary.sort((a, b) => {
      const cmp = b.batch.localeCompare(a.batch)
      return cmp !== 0 ? cmp : a.section.localeCompare(b.section)
    })

    // 8. Identify Frequent Absentees (>= 3 absences in the selected range)
    const frequentAbsentees = Object.values(studentStats)
      .filter((s) => s.absentCount >= 3)
      .sort((a, b) => b.absentCount - a.absentCount)

    // 9. Overall Totals
    let deptTotalP = 0
    let deptTotalA = 0
    let deptTotalOd = 0

    sectionsSummary.forEach((s) => {
      deptTotalP += s.presentCount
      deptTotalA += s.absentCount
      deptTotalOd += s.odCount
    })

    const deptTotalMarked = deptTotalP + deptTotalA + deptTotalOd
    const overallAttendanceRate = deptTotalMarked > 0
      ? Math.round(((deptTotalP + deptTotalOd) / deptTotalMarked) * 100)
      : 100

    // Format daily trend array
    const dailyTrend = Object.entries(dailyMap).map(([d, counts]) => ({
      date: d,
      present: counts.present,
      absent: counts.absent,
      od: counts.od,
      attendanceRate: counts.total > 0 ? Math.round(((counts.present + counts.od) / counts.total) * 100) : 100,
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      range: {
        fromDate,
        toDate,
        workingDays: workingDatesSet.size,
      },
      kpi: {
        totalStudents: students?.length || 0,
        overallAttendanceRate,
        totalPresent: deptTotalP,
        totalAbsent: deptTotalA,
        totalOd: deptTotalOd,
        totalOdRequests,
        verifiedOdCount,
        completedOdCount,
        pendingOdCount,
        rejectedOdCount,
        totalLeaveRequests,
        approvedLeaveCount,
        pendingLeaveCount,
        rejectedLeaveCount,
        totalAchievementsCount,
        frequentAbsenteesCount: frequentAbsentees.length,
      },
      odByCategory,
      leaveByCategory,
      sectionsSummary,
      frequentAbsentees,
      dailyTrend,
      achievementsList: achievementsList.slice(0, 10),
    })
  } catch (err: any) {
    console.error("[ADMIN ACTIVITY GET Error]:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

