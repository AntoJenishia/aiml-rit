// Batch-wise enrollment data for AIML department
// Each batch represents a 4-year engineering cohort

export interface BatchEnrollment {
  batch: string       // e.g. "2021"
  label: string       // e.g. "2021–25"
  totalStudents: number
  maleCount: number
  femaleCount: number
  currentYear: string // e.g. "IV" or "Graduated"
  status: "active" | "graduated"
}

export const batchEnrollments: BatchEnrollment[] = [
  { batch: "2022", label: "2022–26", totalStudents: 60, maleCount: 35, femaleCount: 25, currentYear: "IV",  status: "active" },
  { batch: "2023", label: "2023–27", totalStudents: 62, maleCount: 32, femaleCount: 30, currentYear: "III", status: "active" },
  { batch: "2024", label: "2024–28", totalStudents: 63, maleCount: 30, femaleCount: 33, currentYear: "II",  status: "active" },
  { batch: "2025", label: "2025–29", totalStudents: 65, maleCount: 33, femaleCount: 32, currentYear: "I",   status: "active" },
]

// Summary stats derived from enrollment
export const departmentStats = {
  totalStudents: 250,
  totalStaff: 15,
  activeBatches: 4,
  totalAnnouncements: 12,
}
