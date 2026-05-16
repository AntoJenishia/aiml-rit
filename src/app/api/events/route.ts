import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"

export async function GET() {
  try {
    const snap = await getDocs(query(collection(db, "admin_events"), orderBy("date", "desc")))
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API /events GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ref = await addDoc(collection(db, "admin_events"), { ...body, createdAt: serverTimestamp() })
    return NextResponse.json({ id: ref.id })
  } catch (e) {
    console.error("[API /events POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await deleteDoc(doc(db, "admin_events", id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /events DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
