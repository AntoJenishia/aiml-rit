import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { supabaseAdmin } from "@/lib/supabase"
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

    const { description, files, refNumber, folderId, category, position } = await req.json()

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

    // 1. Direct upload proof files to Supabase Storage
    const uploadedUrls: string[] = []
    if (files && Array.isArray(files)) {
      for (const f of files) {
        if (!f.base64) continue
        try {
          const buffer = Buffer.from(f.base64, "base64")
          const safeName = (f.name || "proof.jpg").replace(/[^a-zA-Z0-9.-]/g, "_")
          const path = `od-proofs/${id}/${Date.now()}_${safeName}`

          const { error: uploadErr } = await supabaseAdmin.storage
            .from("proofs")
            .upload(path, buffer, {
              contentType: f.mimeType || "image/jpeg",
              upsert: true,
            })

          if (!uploadErr) {
            const { data: pubData } = supabaseAdmin.storage
              .from("proofs")
              .getPublicUrl(path)
            uploadedUrls.push(pubData.publicUrl)
          } else {
            console.error("[OD PROOF POST] Supabase upload error:", uploadErr)
          }
        } catch (bufErr) {
          console.error("[OD PROOF POST] Buffer error:", bufErr)
        }
      }
    }

    // 2. Forward to Google Apps Script Webhook (optional redundancy)
    let driveProofFolderUrl = ""
    const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
    if (scriptUrl) {
      try {
        const webhookPayload = {
          action: "submit_post_proof",
          refNumber: odData.refNumber || odData.referenceNumber,
          folderId: odData.driveFolderId,
          description: description || "Post-event proof submitted via portal",
          files
        }

        const scriptRes = await fetch(scriptUrl, {
          method: "POST",
          body: JSON.stringify(webhookPayload)
        })

        if (scriptRes.ok) {
          const scriptData = await scriptRes.json()
          if (!scriptData.error) {
            driveProofFolderUrl = scriptData.proofFolderUrl || ""
          }
        }
      } catch (scriptErr) {
        console.warn("[OD PROOF POST] Apps Script sync non-blocking error:", scriptErr)
      }
    }

    const primaryProofUrl = uploadedUrls[0] || driveProofFolderUrl || ""

    await odRef.update({
      status: "post_pending_faculty",
      postProofUrls: uploadedUrls,
      postODProofsUrl: primaryProofUrl,
      postODDescription: description || "",
      postODCategory: category || odData.eventType || "Competition / Hackathon",
      postODPosition: position || "Participation / Completion",
      proofSubmittedAt: FieldValue.serverTimestamp()
    })

    return NextResponse.json({ success: true, urls: uploadedUrls })
  } catch (err: any) {
    console.error("[OD PROOF POST]", err)
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 })
  }
}
