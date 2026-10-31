import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB limit for student uploads

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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a compressed file.` },
        { status: 400 }
      )
    }

    // Create sanitized unique filename
    const ext = file.name.split(".").pop() || "jpg"
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${safeName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload directly to Supabase Storage 'proofs' bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from("proofs")
      .upload(filename, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      })

    if (uploadError) {
      console.error("[API /upload POST] Supabase storage error:", uploadError)
      throw new Error(`Storage upload error: ${uploadError.message}`)
    }

    const { data: publicData } = supabaseAdmin.storage
      .from("proofs")
      .getPublicUrl(filename)

    return NextResponse.json({ url: publicData.publicUrl, name: file.name, size: file.size })
  } catch (e: any) {
    console.error("[API /upload POST]", e)
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
