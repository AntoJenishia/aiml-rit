import { NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs, limit, query } from "firebase/firestore"

export async function GET() {
  const results: Record<string, string> = {
    projectId:   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "MISSING",
    authDomain:  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "MISSING",
    appId:       process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "MISSING",
  }

  try {
    const q   = query(collection(db, "_test_"), limit(1))
    await Promise.race([
      getDocs(q),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 8s")), 8000)),
    ])
    results.firestore = "✅ Connected"
  } catch (e: unknown) {
    results.firestore = `❌ ${e instanceof Error ? e.message : String(e)}`
  }

  return NextResponse.json(results, { status: 200 })
}
