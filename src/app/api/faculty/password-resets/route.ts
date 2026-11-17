import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { adminDb, adminAuth } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"

/**
 * GET: Fetch password reset requests assigned to the logged-in Class Incharge (or HOD)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const role = sessionUser?.role
    if (role !== "staff" && role !== "hod") {
      return NextResponse.json({ error: "Forbidden: Staff only" }, { status: 403 })
    }

    const email = (session.user.email || "").toLowerCase().trim()
    const staffCode = (sessionUser?.staffCode || sessionUser?.username || "").trim()
    const facultyName = (session.user.name || "").trim()
    const isHod = role === "hod" || staffCode.toUpperCase() === "CS91"

    // Query Firestore passwordResetRequests
    let query: FirebaseFirestore.Query = adminDb.collection("passwordResetRequests")

    // If regular staff, filter by staffCode or inchargeName
    // Because Firestore doesn't easily do OR queries across different fields without indexes,
    // fetch requests and filter in-memory if needed, or query pending
    const snap = await query.orderBy("createdAt", "desc").limit(50).get()

    let requests = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : null,
      updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : null,
    })) as any[]

    if (!isHod) {
      requests = requests.filter((r) => {
        const matchCode = staffCode && r.inchargeStaffCode && r.inchargeStaffCode.toLowerCase() === staffCode.toLowerCase()
        const matchName = facultyName && r.inchargeName && facultyName.toLowerCase().includes(r.inchargeName.toLowerCase())
        const matchEmail = email && r.inchargeEmail && r.inchargeEmail.toLowerCase() === email
        return matchCode || matchName || matchEmail
      })
    }

    return NextResponse.json({ requests })
  } catch (err: any) {
    console.error("[Faculty Password Resets GET Error]:", err)
    return NextResponse.json({ error: err?.message || "Failed to fetch requests" }, { status: 500 })
  }
}

/**
 * PATCH: Class Incharge Approves or Denies the password reset request
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionUser = session.user as any
    const role = sessionUser?.role
    if (role !== "staff" && role !== "hod") {
      return NextResponse.json({ error: "Forbidden: Staff only" }, { status: 403 })
    }

    const { requestId, action } = await req.json()
    if (!requestId || !action || !["approve", "deny"].includes(action)) {
      return NextResponse.json({ error: "Invalid action or request ID" }, { status: 400 })
    }

    const docRef = adminDb.collection("passwordResetRequests").doc(requestId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    const requestData = docSnap.data()!
    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: `This request has already been ${requestData.status}.` },
        { status: 400 }
      )
    }

    const studentId = requestData.studentId
    const studentEmail = requestData.studentEmail
    const studentPhone = requestData.studentPhone

    if (action === "deny") {
      await docRef.update({
        status: "denied",
        reviewedBy: session.user.name || session.user.email,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Password reset request has been denied.",
      })
    }

    // Action === "approve"
    if (!studentPhone) {
      return NextResponse.json(
        { error: "Student does not have a registered phone number to reset password." },
        { status: 400 }
      )
    }

    // 1. Update password in Firebase Auth to the phone number
    if (studentEmail) {
      try {
        const userRecord = await adminAuth.getUserByEmail(studentEmail)
        await adminAuth.updateUser(userRecord.uid, {
          password: studentPhone,
        })
        console.log(`[Password Reset Approval] Updated Firebase Auth password to phone for ${studentEmail}`)
      } catch (fbErr: any) {
        if (fbErr?.code === "auth/user-not-found") {
          await adminAuth.createUser({
            email: studentEmail,
            password: studentPhone,
            displayName: requestData.studentName,
          })
          console.log(`[Password Reset Approval] Created Firebase Auth user with phone for ${studentEmail}`)
        } else {
          console.warn("[Password Reset Approval] Firebase Auth warning:", fbErr)
        }
      }
    }

    // 2. Mark Firestore users doc as mustChangePassword: true and passwordChanged: false
    // so when the student logs in with their mobile number, they are mandatorily prompted to change it!
    if (studentId) {
      try {
        const userRef = adminDb.collection("users").doc(studentId)
        await userRef.set(
          {
            passwordChanged: false,
            mustChangePassword: true,
            resetToPhoneAt: new Date(),
            updatedAt: new Date(),
          },
          { merge: true }
        )
      } catch (fsErr) {
        console.warn("[Password Reset Approval] Firestore update warning:", fsErr)
      }
    }

    // 3. Mark the escalation ticket as approved
    await docRef.update({
      status: "approved",
      reviewedBy: session.user.name || session.user.email,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: `Password has been reset to student's mobile number (${studentPhone}). The student will be prompted to change it upon login.`,
    })
  } catch (err: any) {
    console.error("[Faculty Password Resets PATCH Error]:", err)
    return NextResponse.json({ error: err?.message || "Failed to process request" }, { status: 500 })
  }
}

