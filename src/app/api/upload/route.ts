import { NextResponse } from "next/server"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "uploads"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Create unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    const storageRef = ref(storage, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await uploadBytes(storageRef, buffer, { contentType: file.type })
    const downloadURL = await getDownloadURL(storageRef)

    return NextResponse.json({ url: downloadURL })
  } catch (e) {
    console.error("[API /upload POST]", e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
