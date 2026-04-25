import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, getDocs, doc, updateDoc,
  query, orderBy,
} from "firebase/firestore"

export async function GET() {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))
  const data = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { uid, role } = await req.json()
  await updateDoc(doc(db, "users", uid), { role })
  return NextResponse.json({ ok: true })
}
