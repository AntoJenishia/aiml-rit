import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { adminDb } from "@/lib/firebaseAdmin"

export async function POST(req: Request) {
  try {
    const { identifier, email } = await req.json()
    const targetEmail = (email || identifier || "").trim()

    if (!targetEmail) {
      return NextResponse.json({ error: "College email address is required" }, { status: 400 })
    }

    if (!targetEmail.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid college email address (e.g. yourname.dept@ritchennai.edu.in)." },
        { status: 400 }
      )
    }

    // 1. Find the student in Supabase strictly by email
    const { data: student, error: studentErr } = await supabaseAdmin
      .from("students")
      .select("id, name, register_no, email, phone, class, staff_code, class_incharge_name")
      .ilike("email", targetEmail)
      .maybeSingle()

    if (studentErr || !student) {
      return NextResponse.json(
        { error: "No student found matching this email address. Please verify your college email." },
        { status: 404 }
      )
    }

    if (!student.phone || student.phone.trim().length < 6) {
      return NextResponse.json(
        {
          error: "Your mobile number is not registered in the system. Please reach out to your Class Incharge directly.",
        },
        { status: 400 }
      )
    }

    // 2. Identify the Class Incharge (staff_code and/or name)
    let inchargeStaffCode = student.staff_code || ""
    let inchargeName = student.class_incharge_name || ""
    let inchargeEmail = ""

    if (inchargeStaffCode) {
      const { data: staff } = await supabaseAdmin
        .from("staff")
        .select("staff_code, name, email")
        .ilike("staff_code", inchargeStaffCode)
        .maybeSingle()

      if (staff) {
        inchargeName = inchargeName || staff.name
        inchargeEmail = staff.email
      }
    } else if (inchargeName) {
      const { data: staff } = await supabaseAdmin
        .from("staff")
        .select("staff_code, name, email")
        .ilike("name", `%${inchargeName}%`)
        .maybeSingle()

      if (staff) {
        inchargeStaffCode = staff.staff_code
        inchargeEmail = staff.email
      }
    }

    // 3. Check if there's already a pending request for this student
    const existingSnap = await adminDb
      .collection("passwordResetRequests")
      .where("studentId", "==", student.id)
      .where("status", "==", "pending")
      .limit(1)
      .get()

    if (!existingSnap.empty) {
      return NextResponse.json({
        success: true,
        message: "A password reset request is already pending review with your Class Incharge.",
        inchargeName: inchargeName || "Class Incharge",
      })
    }

    // 4. Create the password reset escalation ticket in Firestore
    const newDoc = {
      studentId: student.id,
      studentName: student.name,
      registerNumber: student.register_no || "",
      studentEmail: student.email || "",
      studentPhone: student.phone.trim(),
      studentClass: student.class || "",
      inchargeStaffCode: inchargeStaffCode || "",
      inchargeName: inchargeName || "Class Incharge",
      inchargeEmail: inchargeEmail || "",
      status: "pending", // 'pending' | 'approved' | 'denied'
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await adminDb.collection("passwordResetRequests").add(newDoc)

    return NextResponse.json({
      success: true,
      message: `Your request has been sent to your Class Incharge (${inchargeName || "Class Incharge"}). Upon approval, your password will be reset to your registered mobile number.`,
      inchargeName: inchargeName || "Class Incharge",
    })
  } catch (err: any) {
    console.error("[Forgot Password Request Error]:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to submit password reset request." },
      { status: 500 }
    )
  }
}

