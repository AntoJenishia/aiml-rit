import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const uid = session.user.uid
    const doc = await adminDb.collection("users").doc(uid).get()

    if (!doc.exists) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const data = doc.data()!
    return NextResponse.json({
      bio: data.bio || "",
      qualification: data.qualification || "",
      designation: data.designation || "",
      experience: data.experience || "",
      specialization: data.specialization || ""
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const uid = session.user.uid
    const body = await req.json()
    const { bio, qualification, designation, experience, specialization } = body

    await adminDb.collection("users").doc(uid).update({
      bio: bio || "",
      qualification: qualification || "",
      designation: designation || "",
      experience: experience || "",
      specialization: specialization || ""
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
