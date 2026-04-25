import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface Announcement {
  id?: string
  title: string
  body: string
  target: "all" | "students" | "staff"
  postedBy: string
  createdAt: Date | null
}

/** Reject if Firestore doesn't respond within `ms` milliseconds */
function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout — check Firebase Console: create the Firestore database in test mode.")), ms)
    ),
  ])
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"))
  const snap = await withTimeout(getDocs(q))
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement))
}

export async function addAnnouncement(data: Omit<Announcement, "id" | "createdAt">) {
  return withTimeout(
    addDoc(collection(db, "announcements"), { ...data, createdAt: serverTimestamp() })
  )
}

export async function deleteAnnouncement(id: string) {
  return withTimeout(deleteDoc(doc(db, "announcements", id)))
}
