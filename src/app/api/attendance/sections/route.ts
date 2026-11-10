import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const sessionEmail = session.user?.email?.toLowerCase().trim() || ""
    const sessionName = (session.user?.name || "").trim()
    const sessionUid = (sessionUser?.uid || sessionUser?.id || "").trim()

    let staffCode = (sessionUser.staffCode || sessionUser.username || "").toUpperCase().trim()
    let isHod =
      sessionUser.role === "hod" ||
      staffCode === "CS91" ||
      sessionEmail === "antojenishiadev@gmail.com" ||
      sessionEmail === "selvakumaran.s@ritchennai.edu.in"

    // Robust Staff Resolution: If staffCode is empty or is an email address, lookup Supabase staff table
    if (!staffCode || staffCode.includes("@")) {
      let facultyRow: any = null

      if (sessionEmail && !sessionEmail.includes("@internal.aiml.rit")) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .ilike("email", sessionEmail)
          .maybeSingle()
        if (data) facultyRow = data
      }

      if (!facultyRow && sessionEmail?.includes("@internal.aiml.rit")) {
        const code = sessionEmail.split("@")[0].trim().toUpperCase()
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .ilike("staff_code", code)
          .maybeSingle()
        if (data) facultyRow = data
      }

      if (!facultyRow && sessionName && !sessionName.toLowerCase().includes("test")) {
        const { data } = await supabaseAdmin
          .from("staff")
          .select("*")
          .ilike("name", sessionName)
          .maybeSingle()
        if (data) facultyRow = data
      }

      if (!facultyRow && sessionUid) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionUid)
        if (isUUID) {
          const { data } = await supabaseAdmin
            .from("staff")
            .select("*")
            .eq("id", sessionUid)
            .maybeSingle()
          if (data) facultyRow = data
        }
      }

      if (facultyRow) {
        staffCode = (facultyRow.staff_code || "").toUpperCase().trim()
        if (facultyRow.role === "hod" || staffCode === "CS91") {
          isHod = true
        }
      }
    }

    // Fetch student section mappings
    const { data: students, error: stuErr } = await supabaseAdmin
      .from("students")
      .select("batch, section, class, staff_code, class_incharge_name")

    if (stuErr) {
      console.error("[GET /api/attendance/sections] Supabase error:", stuErr)
      return NextResponse.json({ error: "Failed to load sections" }, { status: 500 })
    }

    const sectionMap = new Map<string, {
      key: string
      batch: string
      section: string
      classTitle: string
      staffCode: string
      classInchargeName: string
      studentCount: number
    }>()

    students.forEach((s) => {
      if (!s.batch || !s.section) return
      const batch = s.batch.trim()
      const section = s.section.trim().toUpperCase()
      const key = `${batch}__${section}`
      const studentStaffCode = (s.staff_code || "").trim().toUpperCase()
      const studentInchargeName = (s.class_incharge_name || "").trim()

      if (!sectionMap.has(key)) {
        sectionMap.set(key, {
          key,
          batch,
          section,
          classTitle: s.class || `Batch ${batch} · Section ${section}`,
          staffCode: studentStaffCode,
          classInchargeName: studentInchargeName,
          studentCount: 0,
        })
      } else {
        const existing = sectionMap.get(key)!
        // If existing record was missing staffCode, update with current row's staffCode
        if (!existing.staffCode && studentStaffCode) {
          existing.staffCode = studentStaffCode
        }
        if (!existing.classInchargeName && studentInchargeName) {
          existing.classInchargeName = studentInchargeName
        }
      }
      sectionMap.get(key)!.studentCount++
    })

    const allSections = Array.from(sectionMap.values()).sort(
      (a, b) => a.batch.localeCompare(b.batch) || a.section.localeCompare(b.section)
    )

    // Sections specifically assigned to this staff member
    const assignedSections = allSections.filter(
      (s) => s.staffCode && s.staffCode === staffCode
    )

    // Strict Security Rule:
    // HOD has access to all department sections.
    // Regular faculty ONLY gets their assigned section(s).
    const allowedSections = isHod ? allSections : assignedSections

    return NextResponse.json({
      sections: allowedSections,
      assignedSections,
      defaultSection: assignedSections[0] || (isHod ? allSections[0] : null),
      isClassIncharge: assignedSections.length > 0 || isHod,
      isHod,
      resolvedStaffCode: staffCode,
    })
  } catch (error: any) {
    console.error("[GET /api/attendance/sections] Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
