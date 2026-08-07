import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebaseAdmin"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

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
        studentName: student.name || "Unknown Student",
        studentEmail: student.email || "N/A",
        rollNumber: student.rollNumber || "N/A",
        department: student.department || "Unknown",
        batch: student.batch || "Unknown",
        classId: student.classId || "Unknown",
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
      newStatus = "VERIFIED"
    } else if (action === "reject") {
      newStatus = "REJECTED"
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const odDoc = await adminDb.collection("odRequests").doc(odId).get()
    const odData = odDoc.exists ? odDoc.data() : null

    await adminDb.collection("odRequests").doc(odId).update({
      status: newStatus,
      hodRemarks: remarks || null,
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
        fetch("https://script.google.com/macros/s/AKfycby5t4cZc8_R321F5aU9w3GgXmKIDQG872wzJ5N66Rj-5iF9R6qfJ3E5728oV28wX7J9/exec", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookPayload),
        }).catch(console.error)
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
