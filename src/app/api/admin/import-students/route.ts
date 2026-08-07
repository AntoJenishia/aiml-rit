import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { adminDb } from "@/lib/firebaseAdmin"

// ── CSV Parser helper ─────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

function getAdmissionYear(email: string): number {
  const emailMatch = email.match(/\.(\d{2})\d+@/)
  if (emailMatch) {
    const yr = parseInt(emailMatch[1], 10)
    return yr >= 50 ? 1900 + yr : 2000 + yr
  }
  return 2024
}

function getSemesterYear(sem: number): string {
  if (sem <= 2) return "I"
  if (sem <= 4) return "II"
  if (sem <= 6) return "III"
  return "IV"
}

// ── POST /api/admin/import-students ──────────────────────────────────────────
// Accepts: { csvContent: string } — raw CSV text
// Returns: { total, imported, duplicates, invalid, errors }
export async function POST(req: NextRequest) {
  try {
    // Auth guard — HOD only
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== "hod") {
      return NextResponse.json({ error: "Forbidden: HOD access only" }, { status: 403 })
    }

    const body = await req.json()
    const csvContent: string = body.csvContent || ""
    if (!csvContent) {
      return NextResponse.json({ error: "No CSV content provided" }, { status: 400 })
    }

    const lines = csvContent.split("\n").map((l: string) => l.trim()).filter(Boolean)
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV is empty or has only a header row" }, { status: 400 })
    }

    // Skip header row
    const dataLines = lines.slice(1)

    let imported = 0
    let duplicates = 0
    let invalid = 0
    const errors: string[] = []
    const seenEmails = new Set<string>()
    const seenRegNos = new Set<string>()

    const BATCH_SIZE = 400
    let batch = adminDb.batch()
    let batchCount = 0

    for (let idx = 0; idx < dataLines.length; idx++) {
      const line = dataLines[idx]
      const lineNum = idx + 2 // 1-indexed, accounting for header

      const fields = parseCSVLine(line)
      if (fields.length < 7) {
        errors.push(`Row ${lineNum}: Insufficient columns (got ${fields.length}, need 7)`)
        invalid++
        continue
      }

      const [name, register_no, email, phone, fullClass, semesterStr, section] = fields

      // Validate required fields
      if (!name) { errors.push(`Row ${lineNum}: Missing name`); invalid++; continue }
      if (!email) { errors.push(`Row ${lineNum}: Missing email (name: ${name})`); invalid++; continue }
      if (!register_no) { errors.push(`Row ${lineNum}: Missing register number (name: ${name})`); invalid++; continue }

      // Validate semester
      const sem = parseInt(semesterStr, 10)
      if (isNaN(sem) || sem < 1 || sem > 8) {
        errors.push(`Row ${lineNum}: Invalid semester "${semesterStr}" for ${name}`)
        invalid++
        continue
      }

      // Check for duplicates within this import batch
      if (seenEmails.has(email)) {
        errors.push(`Row ${lineNum}: Duplicate email in CSV — ${email}`)
        duplicates++
        continue
      }
      if (seenRegNos.has(register_no)) {
        errors.push(`Row ${lineNum}: Duplicate register number in CSV — ${register_no}`)
        duplicates++
        continue
      }

      // Check if already exists in Firestore
      try {
        const existingSnap = await adminDb.collection("users").doc(email).get()
        if (existingSnap.exists) {
          const existing = existingSnap.data()
          // If already merged (has uid), skip
          if (existing?.uid) {
            errors.push(`Row ${lineNum}: Student already exists and is active — ${email}`)
            duplicates++
            continue
          }
        }
      } catch (dbErr) {
        errors.push(`Row ${lineNum}: DB check failed for ${email}`)
        invalid++
        continue
      }

      seenEmails.add(email)
      seenRegNos.add(register_no)

      const admissionYear = getAdmissionYear(email)
      const currentYear = getSemesterYear(sem)
      const secLower = section.toLowerCase()
      const classId = `${currentYear.toLowerCase()}-aiml-${secLower}-${admissionYear}`
      const rollNumber = register_no.slice(-3)
      const dept = (fullClass || "AIML").toUpperCase()

      const studentRef = adminDb.collection("users").doc(email)
      batch.set(studentRef, {
        name: name.toUpperCase(),
        email,
        registerNumber: register_no,
        rollNumber,
        phone: phone || "",
        role: "student",
        photoURL: "",
        department: dept === "AIDS" ? "Artificial Intelligence & Data Science" : "Artificial Intelligence & Machine Learning",
        deptCode: dept === "AIDS" ? "aids" : "aiml",
        class: dept,
        batch: `${admissionYear} – ${admissionYear + 4}`,
        currentYear,
        semester: sem,
        section: section.toUpperCase(),
        classId,
        profileComplete: true,
        createdAt: new Date(),
        lastLogin: new Date(),
      }, { merge: true })

      imported++
      batchCount++

      // Firestore batch limit is 500 — commit every 400 to be safe
      if (batchCount >= BATCH_SIZE) {
        await batch.commit()
        batch = adminDb.batch()
        batchCount = 0
      }
    }

    // Commit remaining
    if (batchCount > 0) {
      await batch.commit()
    }

    return NextResponse.json({
      success: true,
      total: dataLines.length,
      imported,
      duplicates,
      invalid,
      errors: errors.slice(0, 50), // cap error list
    })

  } catch (err: any) {
    console.error("[import-students] Error:", err)
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 })
  }
}
