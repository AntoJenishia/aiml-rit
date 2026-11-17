import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { adminAuth, adminDb } from "@/lib/firebaseAdmin"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await req.json()

    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    const trimmedPassword = newPassword.trim()
    if (trimmedPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      )
    }

    const userEmail = session.user.email?.trim()
    const regNo = (session.user as any).registerNumber || session.user.username || ""

    // Check that new password is not a trivial default
    const forbiddenDefaults = [
      "rit@123",
      "student",
      "123456",
      "12345678",
      "rit@aiml",
      `rit@${regNo}`.toLowerCase(),
      regNo.toLowerCase(),
    ]

    if (forbiddenDefaults.includes(trimmedPassword.toLowerCase())) {
      return NextResponse.json(
        { error: "Please choose a strong password that is not the default college pattern or your register number" },
        { status: 400 }
      )
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "No user email found in session to update credentials" },
        { status: 400 }
      )
    }

    // 1. Update or create user record in Firebase Auth via Admin SDK
    try {
      const userRecord = await adminAuth.getUserByEmail(userEmail)
      await adminAuth.updateUser(userRecord.uid, {
        password: trimmedPassword,
      })
      console.log(`[Change Password] Updated Firebase Auth password for ${userEmail} (${userRecord.uid})`)
    } catch (fbAuthErr: any) {
      if (fbAuthErr?.code === "auth/user-not-found") {
        const newUser = await adminAuth.createUser({
          email: userEmail,
          password: trimmedPassword,
          displayName: session.user.name || undefined,
        })
        console.log(`[Change Password] Created Firebase Auth user with new password for ${userEmail} (${newUser.uid})`)
      } else {
        console.error("[Change Password] Error updating Firebase Auth user:", fbAuthErr)
        throw fbAuthErr
      }
    }

    // 2. Mark password as changed in Firestore users collection
    const uid = session.user.uid || (session.user as any).id || (session.user as any).registerNumber
    if (uid) {
      try {
        const userDocRef = adminDb.collection("users").doc(uid)
        await userDocRef.set(
          {
            passwordChanged: true,
            mustChangePassword: false,
            passwordChangedAt: new Date(),
          },
          { merge: true }
        )
      } catch (fsErr) {
        console.warn("[Change Password] Firestore admin update warning by uid:", fsErr)
      }
    }

    // Also update by register number if different from uid
    if (regNo && regNo !== uid) {
      try {
        const regDocRef = adminDb.collection("users").doc(regNo)
        await regDocRef.set(
          {
            passwordChanged: true,
            mustChangePassword: false,
            passwordChangedAt: new Date(),
          },
          { merge: true }
        )
      } catch (fsErr) {
        console.warn("[Change Password] Firestore admin update warning by regNo:", fsErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password changed successfully! You may now continue to your dashboard.",
    })
  } catch (err: any) {
    console.error("[Change Password API] Error:", err)
    return NextResponse.json(
      { error: err?.message || "Failed to change password. Please try again." },
      { status: 500 }
    )
  }
}
