import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { ODStatus } from "@/lib/odStatus"
import { studentFieldsForOd } from "@/lib/studentIdentity"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as any)?.uid || (session?.user as any)?.id

    if (!uid || session?.user?.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all OD requests
    const snapshot = await adminDb.collection("odRequests").orderBy("startDate", "desc").get()
    
    // Fetch all students to attach names
    const usersSnap = await adminDb.collection("users").where("role", "==", "student").get()
    const userMap: Record<string, any> = {}
    usersSnap.docs.forEach(doc => {
      userMap[doc.id] = doc.data()
    })

    const ods = snapshot.docs.map(doc => {
      const data = doc.data()
      const student = userMap[data.studentUid] || {}
      return {
        id: doc.id,
        ...data,
        ...studentFieldsForOd(student),
        studentName: student.name || "Unknown Student",
      }
    })

    return NextResponse.json(ods)
  } catch (error: any) {
    console.error("Error fetching ODs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const uid = (session?.user as any)?.uid || (session?.user as any)?.id

    if (!uid || session?.user?.role !== "hod") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { odId, action, remarks } = body

    if (!odId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let newStatus = ""
    if (action === "approve") {
      newStatus = ODStatus.APPROVED
    } else if (action === "reject") {
      newStatus = ODStatus.REJECTED_HOD
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const odDoc = await adminDb.collection("odRequests").doc(odId).get()
    const odData = odDoc.exists ? odDoc.data() : null

    await adminDb.collection("odRequests").doc(odId).update({
      status: newStatus,
      hodRemarks: remarks || null,
      hodRespondedAt: FieldValue.serverTimestamp(),
      updatedAt: new Date().toISOString()
    })

    // Trigger Google Apps Script Webhook
    if (odData) {
      try {
        const webhookPayload = {
          action: "update_status",
          referenceNumber: odData.referenceNumber,
          status: newStatus,
          rejectReason: remarks || "",
          verifiedBy: "HOD",
        }
        const scriptUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL
        if (scriptUrl) {
          fetch(scriptUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(webhookPayload),
          }).catch(console.error)
        }
      } catch (e) {
        console.error("Webhook trigger failed", e)
      }
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error: any) {
    console.error("Error updating OD:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
