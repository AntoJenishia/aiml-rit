import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"

export async function GET() {
  const snap = await getDocs(query(collection(db, "admin_events"), orderBy("date", "desc")))
  const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json()
  const ref  = await addDoc(collection(db, "admin_events"), { ...body, createdAt: serverTimestamp() })
  return NextResponse.json({ id: ref.id })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  await deleteDoc(doc(db, "admin_events", id))
  return NextResponse.json({ ok: true })
}
