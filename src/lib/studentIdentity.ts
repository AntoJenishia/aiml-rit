/**
 * Student identity helpers for OD review / ledgers.
 *
 * User documents store academic year as `currentYear` (e.g. "III") and
 * `section` (e.g. "A"). There is no `year` field. Callers that interpolate
 * `${year}-${section}` therefore render the literal "undefined-undefined".
 *
 * Roll on the user doc is the last-3 `rollNumber` (e.g. "007"); the full
 * register number lives in `registerNumber`.
 */

const UNSET = new Set(["", "undefined", "null", "—", "-", "n/a", "na", "unknown"])

export function isUnsetValue(value: unknown): boolean {
  if (value === undefined || value === null) return true
  return UNSET.has(String(value).trim().toLowerCase())
}

function formatDeptShort(student: { department?: unknown; deptCode?: unknown }): string {
  if (!isUnsetValue(student.deptCode)) {
    return String(student.deptCode).trim().toUpperCase()
  }
  if (isUnsetValue(student.department)) return ""
  const raw = String(student.department).trim()
  const lower = raw.toLowerCase()
  if (lower === "aiml" || lower.includes("machine learning")) return "AIML"
  if (lower === "aids" || lower.includes("data science")) return "AIDS"
  return raw.toUpperCase()
}

export function formatStudentClass(student: {
  classId?: unknown
  currentYear?: unknown
  year?: unknown
  section?: unknown
  department?: unknown
  deptCode?: unknown
}): string {
  const year = !isUnsetValue(student.currentYear)
    ? String(student.currentYear).trim()
    : !isUnsetValue(student.year)
      ? String(student.year).trim()
      : ""
  const section = !isUnsetValue(student.section) ? String(student.section).trim() : ""
  const dept = formatDeptShort(student)

  const parts = [year, dept, section].filter(Boolean)
  if (parts.length > 0) return parts.join("-")
  if (!isUnsetValue(student.classId)) return String(student.classId).trim()
  return "Not set"
}

export function formatStudentRoll(student: {
  registerNumber?: unknown
  studentRollNo?: unknown
  rollNumber?: unknown
}): string {
  if (!isUnsetValue(student.registerNumber)) return String(student.registerNumber).trim()
  if (!isUnsetValue(student.studentRollNo)) return String(student.studentRollNo).trim()
  if (!isUnsetValue(student.rollNumber)) return String(student.rollNumber).trim()
  return "Not set"
}

/** Fields to overlay onto an OD payload from the student user document. */
export function studentFieldsForOd(student: Record<string, unknown> | undefined | null) {
  const s = student || {}
  const currentYear = !isUnsetValue(s.currentYear)
    ? s.currentYear
    : !isUnsetValue(s.year)
      ? s.year
      : ""
  const section = !isUnsetValue(s.section) ? s.section : ""
  const registerNumber = !isUnsetValue(s.registerNumber) ? s.registerNumber : ""
  const classId = !isUnsetValue(s.classId) ? s.classId : ""
  const rollNumber = !isUnsetValue(s.rollNumber) ? s.rollNumber : ""

  return {
    studentName: (s.name as string) || "Unknown",
    studentEmail: (s.email as string) || "",
    registerNumber,
    // Prefer full register number for "Roll" display; keep short roll as fallback only
    rollNumber: registerNumber || rollNumber,
    classId,
    currentYear,
    section,
    // Alias so leftover `${year}-${section}` templates never stringify JS undefined
    year: currentYear,
    department: (s.department as string) || "",
    deptCode: (s.deptCode as string) || odDepartmentCode(s),
    batch: (s.batch as string) || "",
  }
}

/** Stored on odRequests — must stay "AIML" | "AIDS" so list queries match. */
export function odDepartmentCode(student: Record<string, unknown> | undefined | null): "AIML" | "AIDS" {
  const s = student || {}
  const code = String(s.deptCode || "").toLowerCase()
  if (code === "aids") return "AIDS"
  const name = String(s.department || "").toLowerCase()
  if (name.includes("data science") || name === "aids") return "AIDS"
  return "AIML"
}

/** Drop the literal strings "undefined" / "null" so they are not persisted. */
export function omitLiteralUndefinedStrings<T extends Record<string, unknown>>(fields: T): T {
  const out = { ...fields }
  for (const [key, value] of Object.entries(out)) {
    if (typeof value !== "string") continue
    const lowered = value.trim().toLowerCase()
    if (lowered === "undefined" || lowered === "null") {
      delete (out as Record<string, unknown>)[key]
    }
  }
  return out
}
