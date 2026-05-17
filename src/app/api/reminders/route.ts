import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, getDocs, addDoc, setDoc, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"

// GET: fetch all reminders for a faculty member
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid")
    if (!uid) return NextResponse.json({ error: "uid required" }, { status: 400 })

    const snap = await getDocs(
      query(collection(db, "faculty", uid, "reminders"), orderBy("dueDate", "asc"))
    )
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json(items)
  } catch (e) {
    console.error("[API /reminders GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST: create a new reminder
export async function POST(req: Request) {
  try {
    const { uid, title, dueDate, note } = await req.json()
    if (!uid || !title) return NextResponse.json({ error: "uid and title required" }, { status: 400 })

    const ref = await addDoc(collection(db, "faculty", uid, "reminders"), {
      title,
      dueDate: dueDate || "",
      note: note || "",
      done: false,
      createdAt: serverTimestamp(),
    })
    return NextResponse.json({ id: ref.id })
  } catch (e) {
    console.error("[API /reminders POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH: update a reminder (mark done, edit)
export async function PATCH(req: Request) {
  try {
    const { uid, id, ...fields } = await req.json()
    if (!uid || !id) return NextResponse.json({ error: "uid and id required" }, { status: 400 })
    await setDoc(doc(db, "faculty", uid, "reminders", id), fields, { merge: true })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /reminders PATCH]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE: remove a reminder
export async function DELETE(req: Request) {
  try {
    const { uid, id } = await req.json()
    if (!uid || !id) return NextResponse.json({ error: "uid and id required" }, { status: 400 })
    await deleteDoc(doc(db, "faculty", uid, "reminders", id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /reminders DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
