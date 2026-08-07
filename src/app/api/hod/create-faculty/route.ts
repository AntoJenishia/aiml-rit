/**
 * POST /api/hod/create-faculty
 * HOD-only: Creates a new faculty account (Firebase Auth + Firestore doc).
 * Body: { username, password, displayName }
 *
 * PATCH /api/hod/create-faculty
 * HOD-only: Assigns a class incharge.
 * Body: { facultyUid, classId } — set classId: null to unassign.
 */
import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

const INTERNAL_DOMAIN = "@internal.aiml.rit"

// ── POST — Create Faculty Account ─────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token || token.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { staff_name, staff_code, department, designation, email, phone, gender, password } = body

    if (!staff_name || !staff_code || !password) {
      return NextResponse.json(
        { error: "Staff name, staff code, and password are required" },
        { status: 400 }
      )
    }

    // Use provided email or fallback to an internal one
    const userEmail = email?.trim() || `${staff_code.toLowerCase()}@internal.aiml.rit`

    // Check if email already taken
    try {
      const existing = await adminAuth.getUserByEmail(userEmail)
      if (existing) {
        return NextResponse.json({ error: "Email or Staff Code already taken" }, { status: 409 })
      }
    } catch {
      // User not found — continue to create
    }

    // Create Firebase Auth user
    const authUser = await adminAuth.createUser({
      email: userEmail,
      password,
      displayName: staff_name,
      emailVerified: true,
    })

    // Create Firestore user doc
    await adminDb.collection("users").doc(authUser.uid).set({
      name: staff_name,
      staffCode: staff_code,
      department: department || "",
      designation: designation || "",
      email: userEmail,
      phone: phone || "",
      gender: gender || "",
      role: "staff",
      photoURL: "",
      isClassIncharge: false,
      classId: null,
      profileComplete: true,
      createdAt: new Date(),
      lastLogin: new Date(),
    })

    return NextResponse.json({ ok: true, uid: authUser.uid })
  } catch (e) {
    console.error("[API /hod/create-faculty POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// ── PATCH — Assign Class Incharge ─────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req })
    if (!token || token.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { action, facultyUid, classId } = body

    if (action === "assignClass") {
      if (!facultyUid) {
        return NextResponse.json({ error: "facultyUid required" }, { status: 400 })
      }

      const batch = adminDb.batch()

      // If assigning a new class, unset any previous incharge for that class
      if (classId) {
        const prev = await adminDb
          .collection("users")
          .where("classId", "==", classId)
          .where("role", "==", "staff")
          .get()
        prev.forEach((doc) => {
          batch.update(doc.ref, { classId: null, isClassIncharge: false })
        })
      }

      // Update the faculty's doc
      const facultyRef = adminDb.collection("users").doc(facultyUid)
      batch.update(facultyRef, {
        classId: classId ?? null,
        isClassIncharge: classId ? true : false,
      })

      // Update the classes collection if classId provided
      if (classId) {
        const classRef = adminDb.collection("classes").doc(classId)
        batch.set(classRef, { classInchargeUid: facultyUid }, { merge: true })
      }

      await batch.commit()
      return NextResponse.json({ ok: true })
    }

    if (action === "resetPassword") {
      const { newPassword } = body
      if (!facultyUid || !newPassword) {
        return NextResponse.json({ error: "facultyUid and newPassword required" }, { status: 400 })
      }
      await adminAuth.updateUser(facultyUid, { password: newPassword })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (e) {
    console.error("[API /hod/create-faculty PATCH]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
