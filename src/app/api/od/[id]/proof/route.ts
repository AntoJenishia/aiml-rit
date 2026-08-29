import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { ODStatus } from "@/lib/odStatus"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description, files, refNumber, folderId } = await req.json()

    if (!description && (!files || files.length === 0)) {
      return NextResponse.json({ error: "Description or files required." }, { status: 400 })
    }

    const odRef = adminDb.collection("odRequests").doc(id)
    const odSnap = await odRef.get()
    if (!odSnap.exists) return NextResponse.json({ error: "OD not found." }, { status: 404 })
    const odData = odSnap.data()!

    if (odData.studentUid !== session.user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Allow proof submission only when APPROVED or when proof was previously rejected (PROOF_REJECTED_FACULTY / PROOF_REJECTED_HOD)
    const allowedStatuses: string[] = [ODStatus.APPROVED, ODStatus.PROOF_REJECTED_FACULTY, ODStatus.PROOF_REJECTED_HOD]
    if (!allowedStatuses.includes(odData.status)) {
      return NextResponse.json({ error: "OD must be APPROVED before post-event proof can be submitted." }, { status: 400 })
    }

    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (!scriptUrl) throw new Error("Missing NEXT_PUBLIC_APPS_SCRIPT_URL")

    const webhookPayload = {
      action: "submit_post_proof",
      refNumber: odData.refNumber,
      folderId: odData.driveFolderId,
      description: description || "Post-event proof submitted via portal",
      files
    }

    const scriptRes = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload)
    })

    if (!scriptRes.ok) throw new Error("Failed to contact Google Apps Script Webhook.")
    const scriptData = await scriptRes.json()
    if (scriptData.error) throw new Error("Apps Script Error: " + scriptData.error)

    await odRef.update({
      status: ODStatus.PROOF_PENDING_FACULTY,
      postODProofsUrl: scriptData.proofFolderUrl || "",
      postODDescription: description || "",
      proofSubmittedAt: FieldValue.serverTimestamp()
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("[OD PROOF POST]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}

