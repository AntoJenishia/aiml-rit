import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid") || session.user.uid

    const q = query(
      collection(db, "faculty_portfolios"),
      where("uid", "==", uid),
      orderBy("createdAt", "desc")
    )
    const snap = await getDocs(q)
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    
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

    const docRef = await addDoc(collection(db, "faculty_portfolios"), {
      uid: session.user.uid,
      title,
      type,
      date: date || new Date().toISOString(),
      description: description || "",
      link: link || "",
      status: "submitted",
      createdAt: new Date().toISOString(),
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

    await deleteDoc(doc(db, "faculty_portfolios", id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /faculty/portfolio DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
