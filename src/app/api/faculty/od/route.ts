import { NextRequest, NextResponse } from "next/server"

/**
 * Faculty OD submission is NOT supported via this portal.
 * OD requests are student-only. Faculty ODs are approved directly
 * by the HOD outside this system.
 *
 * This stub returns 403 for all methods to prevent any accidental calls.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Faculty OD submission is not permitted via this portal. " +
        "Faculty ODs are approved directly by the HOD outside this system.",
    },
    { status: 403 }
  )
}

export async function GET(_req: NextRequest) {
  return NextResponse.json({ error: "Not found." }, { status: 404 })
}

