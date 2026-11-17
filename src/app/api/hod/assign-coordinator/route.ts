import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"
import { adminDb } from "@/lib/firebaseAdmin"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as any)?.role as string
    if (!session?.user || (role !== "hod" && role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized: HOD access required" }, { status: 403 })
    }

    const { staffCode } = await req.json()
    if (!staffCode || typeof staffCode !== "string") {
      return NextResponse.json({ error: "staffCode is required" }, { status: 400 })
    }

    const code = staffCode.trim().toUpperCase()

    // 1. Update in Supabase staff table
    const { error: sbError } = await supabaseAdmin
      .from("staff")
      .update({ is_pec_coordinator: true })
      .ilike("staff_code", code)

    if (sbError) {
      console.error("[assign-coordinator] Supabase error:", sbError)
    }

    // 2. Update in Firestore
    try {
      await adminDb.collection("pecConfig").doc("coordinator").set({
        staffCode: code,
        assignedBy: session.user.name || "HOD",
        assignedAt: new Date().toISOString(),
      }, { merge: true })

      const staffSnap = await adminDb
        .collection("staff")
        .where("staffCode", "==", code)
        .limit(1)
        .get()
      if (!staffSnap.empty) {
        await staffSnap.docs[0].ref.update({ isPecCoordinator: true })
      }
    } catch (fsErr) {
      console.warn("[assign-coordinator] Firestore update skipped:", fsErr)
    }

    return NextResponse.json({
      success: true,
      message: `Staff ${code} has been assigned as PEC Coordinator.`,
    })
  } catch (err: any) {
    console.error("[assign-coordinator] Error:", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const coordDoc = await adminDb.collection("pecConfig").doc("coordinator").get()
    const data = coordDoc.exists ? coordDoc.data() : null
    return NextResponse.json({ coordinator: data })
  } catch (err: any) {
    return NextResponse.json({ coordinator: null })
  }
}

