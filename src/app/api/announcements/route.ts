import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"

export async function GET() {
  try {
    const snap = await getDocs(query(collection(db, "announcements"), orderBy("createdAt", "desc")))
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API /announcements GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const ref = await addDoc(collection(db, "announcements"), { ...body, createdAt: serverTimestamp() })
    return NextResponse.json({ id: ref.id })
  } catch (e) {
    console.error("[API /announcements POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await deleteDoc(doc(db, "announcements", id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /announcements DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
