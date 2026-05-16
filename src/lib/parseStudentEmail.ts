/**
 * Parse a student institutional email to extract profile fields.
 *
 * Email format: name.YYnnnn@dept.ritchennai.edu.in
 *   e.g. antojenishia.240007@aiml.ritchennai.edu.in
 *
 * Extracts:
 *   - admissionYear:  2024  (first 2 digits of code → "24" → 2024)
 *   - rollNumber:     "007" (last 3 digits of the numeric code)
 *   - deptCode:       "aiml"
 *   - department:     "Artificial Intelligence & Machine Learning"
 *   - batch:          "2024 – 2028"
 *   - currentYear:    "II"  (Roman numeral, calculated from current date)
 *   - name:           fetched from Google account, NOT parsed from email
 */

const DEPT_MAP: Record<string, string> = {
  aiml: "Artificial Intelligence & Machine Learning",
  aids: "Artificial Intelligence & Data Science",
  cse:  "Computer Science & Engineering",
  ece:  "Electronics & Communication Engineering",
  vlsi: "VLSI Design & Technology",
  cce:  "Computer & Communication Engineering",
  mech: "Mechanical Engineering",
  eee:  "Electrical & Electronics Engineering",
  civil: "Civil Engineering",
  it:   "Information Technology",
}

const YEAR_ROMAN: Record<number, string> = {
  1: "I",
  2: "II",
  3: "III",
  4: "IV",
}

export interface ParsedStudentProfile {
  name: string
  admissionYear: number
  rollNumber: string
  deptCode: string
  department: string
  batch: string
  currentYear: string
  currentYearNum: number
}

/**
 * Returns null if the email doesn't match the expected student pattern.
 */
export function parseStudentEmail(email: string): ParsedStudentProfile | null {
  // Pattern: name.YYnnnn@dept.ritchennai.edu.in
  const match = email.match(
    /^([a-zA-Z]+)\.(\d{2})(\d+)@([a-zA-Z]+)\.ritchennai\.edu\.in$/i
  )
  if (!match) return null

  const [, , yearCode, rollDigits, deptCode] = match

  // Name: left empty — should be populated from Google account name
  const name = ""

  // Admission year: "24" → 2024
  const yearPrefix = parseInt(yearCode, 10)
  const admissionYear = yearPrefix >= 50 ? 1900 + yearPrefix : 2000 + yearPrefix

  // Roll number: always use the last 3 digits
  const rollNumber = rollDigits.slice(-3).padStart(3, "0")

  // Department
  const dept = deptCode.toLowerCase()
  const department = DEPT_MAP[dept] ?? dept.toUpperCase()

  // Batch: 4-year program
  const batch = `${admissionYear} – ${admissionYear + 4}`

  // Current academic year
  const now = new Date()
  // Academic year starts in June/July, so if month >= 6, we're in the next academic year
  const effectiveYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1
  const currentYearNum = Math.min(Math.max(effectiveYear - admissionYear + 1, 1), 4)
  const currentYear = YEAR_ROMAN[currentYearNum] ?? `${currentYearNum}`

  return {
    name,
    admissionYear,
    rollNumber,
    deptCode: dept,
    department,
    batch,
    currentYear,
    currentYearNum,
  }
}
