import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import {
  collection, getDocs, getDoc, doc, setDoc,
  query, orderBy, where,
} from "firebase/firestore"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const uid     = searchParams.get("uid")
    const classId = searchParams.get("classId")
    const studentEmail = searchParams.get("studentEmail")

    // Single user fetch
    if (uid) {
      const snap = await getDoc(doc(db, "users", uid))
      if (!snap.exists()) {
        return NextResponse.json(null, { status: 404 })
      }
      return NextResponse.json({ uid: snap.id, ...snap.data() })
    }

    // Find class incharge by classId
    if (classId) {
      const q = query(collection(db, "users"),
        where("classId", "==", classId),
        where("isClassIncharge", "==", true)
      )
      const snap = await getDocs(q)
      if (snap.empty) return NextResponse.json(null, { status: 404 })
      const d = snap.docs[0]
      return NextResponse.json({ uid: d.id, ...d.data() })
    }

    // Find class incharge by studentEmail
    if (studentEmail) {
      // 1. Fetch student by email
      const stuQuery = query(collection(db, "users"), where("email", "==", studentEmail))
      const stuSnap = await getDocs(stuQuery)
      if (stuSnap.empty) return NextResponse.json(null, { status: 404 })
      
      const studentData = stuSnap.docs[0].data()
      if (!studentData.classId) return NextResponse.json(null, { status: 404 })

      // 2. Fetch class incharge for this classId
      const q = query(collection(db, "users"),
        where("classId", "==", studentData.classId),
        where("isClassIncharge", "==", true)
      )
      const snap = await getDocs(q)
      if (snap.empty) return NextResponse.json(null, { status: 404 })
      const d = snap.docs[0]
      return NextResponse.json({ uid: d.id, ...d.data() })
    }

    // All users
    const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")))
    const data = snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
    return NextResponse.json(data)
  } catch (e) {
    console.error("[API /users GET]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { uid, ...fields } = body
    if (!uid) {
      return NextResponse.json({ error: "uid required" }, { status: 400 })
    }
    await setDoc(doc(db, "users", uid), fields, { merge: true })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[API /users PATCH]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
