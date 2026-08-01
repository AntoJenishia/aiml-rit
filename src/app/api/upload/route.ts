import { NextResponse } from "next/server"
import { getStorage } from "firebase-admin/storage"
import { getApps } from "firebase-admin/app"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import "@/lib/firebaseAdmin" // Ensure admin is initialized

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    const app = getApps()[0]
    const bucketName = (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").replace(".firebasestorage.app", ".appspot.com")
    const bucket = getStorage(app).bucket(bucketName)
    const fileRef = bucket.file(filename)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    await fileRef.save(buffer, { contentType: file.type })
    await fileRef.makePublic()
    
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filename}`

    return NextResponse.json({ url: downloadURL })
  } catch (e) {
    console.error("[API /upload POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
