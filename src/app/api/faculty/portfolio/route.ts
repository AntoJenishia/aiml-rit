import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"
import { FieldValue } from "firebase-admin/firestore"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid") || session.user.uid

    const snap = await adminDb.collection("faculty_portfolios")
      .where("uid", "==", uid)
      .get()
      
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
    data.sort((a: any, b: any) => {
      const aTime = a.createdAt?.toMillis?.() || new Date(a.createdAt).getTime() || 0
      const bTime = b.createdAt?.toMillis?.() || new Date(b.createdAt).getTime() || 0
      return bTime - aTime
    })
    
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API /faculty/portfolio GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { title, type, date, description, link } = body

    if (!title || !type) {
      return NextResponse.json({ error: "Title and Type are required" }, { status: 400 })
    }

    const docRef = await adminDb.collection("faculty_portfolios").add({
      uid: session.user.uid,
      title,
      type,
      date: date || new Date().toISOString(),
      description: description || "",
      link: link || "",
      status: "submitted",
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ ok: true, id: docRef.id })
  } catch (e) {
    console.error("[API /faculty/portfolio POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await adminDb.collection("faculty_portfolios").doc(id).delete()
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /faculty/portfolio DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
