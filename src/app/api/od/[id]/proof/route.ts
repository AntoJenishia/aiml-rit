import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

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
    if (odData.status !== "VERIFIED" && !(odData.status === "REJECTED" && odData.postODProofsUrl)) {
      return NextResponse.json({ error: "OD is not in verified state." }, { status: 400 })
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
      body: JSON.stringify(webhookPayload)
    })

    if (!scriptRes.ok) throw new Error("Failed to contact Google Apps Script Webhook.")
    const scriptData = await scriptRes.json()
    if (scriptData.error) throw new Error("Apps Script Error: " + scriptData.error)

    await odRef.update({
      status: "post_pending_faculty",
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
