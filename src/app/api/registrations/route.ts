import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, getDocs, getDoc, setDoc, deleteDoc,
  doc, query, where,
} from "firebase/firestore"

// GET: fetch registrations for an event or for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get("eventId")
    const uid = searchParams.get("uid")

    if (eventId) {
      // Get all registrations for a specific event
      const snap = await getDocs(
        query(collection(db, "event_registrations"), where("eventId", "==", eventId))
      )
      const regs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      return NextResponse.json(regs)
    }

    if (uid) {
      // Get all registrations for a specific user
      const snap = await getDocs(
        query(collection(db, "event_registrations"), where("uid", "==", uid))
      )
      const regs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      return NextResponse.json(regs)
    }

    // Get all registrations (for HOD dashboard)
    const snap = await getDocs(collection(db, "event_registrations"))
    const regs = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    return NextResponse.json(regs)
  } catch (e) {
    console.error("[API /registrations GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST: register a student for an event
export async function POST(req: Request) {
  try {
    const { eventId, uid, name, email } = await req.json()
    if (!eventId || !uid) {
      return NextResponse.json({ error: "eventId and uid required" }, { status: 400 })
    }

    // Fetch student profile for extra details
    let department = "", currentYear = "", registerNumber = ""
    try {
      const userSnap = await getDoc(doc(db, "users", uid))
      if (userSnap.exists()) {
        const u = userSnap.data()
        department = u.department || ""
        currentYear = u.currentYear || ""
        registerNumber = u.registerNumber || ""
      }
    } catch { /* ignore — save with what we have */ }

    // Use composite ID to prevent duplicates
    const regId = `${eventId}_${uid}`
    await setDoc(doc(db, "event_registrations", regId), {
      eventId,
      uid,
      name: name || "",
      email: email || "",
      department,
      currentYear,
      registerNumber,
      registeredAt: new Date().toISOString(),
    })
    return NextResponse.json({ id: regId, ok: true })
  } catch (e) {
    console.error("[API /registrations POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE: unregister a student from an event
export async function DELETE(req: Request) {
  try {
    const { eventId, uid } = await req.json()
    const regId = `${eventId}_${uid}`
    await deleteDoc(doc(db, "event_registrations", regId))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /registrations DELETE]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
