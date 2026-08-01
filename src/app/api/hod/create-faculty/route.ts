/**
 * POST /api/hod/create-faculty
 * HOD-only: Creates a new faculty account (Firebase Auth + Firestore doc).
 * Body: { username, password, displayName }
 *
 * PATCH /api/hod/create-faculty
 * HOD-only: Assigns a class incharge.
 * Body: { facultyUid, classId } — set classId: null to unassign.
 */
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

const INTERNAL_DOMAIN = "@internal.aiml.rit"

// ── POST — Create Faculty Account ─────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { username, password, displayName } = body

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { error: "username, password, and displayName are required" },
        { status: 400 }
      )
    }

    // Validate username (letters, numbers, underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username may only contain letters, numbers, and underscores" },
        { status: 400 }
      )
    }

    const internalEmail = `${username}${INTERNAL_DOMAIN}`

    // Check if username already taken
    try {
      const existing = await adminAuth.getUserByEmail(internalEmail)
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 })
      }
    } catch {
      // User not found — continue to create
    }

    // Create Firebase Auth user
    const authUser = await adminAuth.createUser({
      email: internalEmail,
      password,
      displayName,
      emailVerified: true,
    })

    // Create Firestore user doc
    await adminDb.collection("users").doc(authUser.uid).set({
      username,
      name: displayName,
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
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "hod") {
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
