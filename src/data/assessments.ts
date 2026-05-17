// Internal Assessment Performance data for AIML department
// CAT1, CAT2, CAT3 average scores per semester per batch

export interface AssessmentScore {
  batch: string
  semester: number
  cat1Avg: number
  cat2Avg: number
  cat3Avg: number
}

export const assessmentScores: AssessmentScore[] = [
  // Batch 2022 (currently Year IV — completed 7 semesters)
  { batch: "2022", semester: 1, cat1Avg: 72, cat2Avg: 68, cat3Avg: 74 },
  { batch: "2022", semester: 2, cat1Avg: 70, cat2Avg: 73, cat3Avg: 75 },
  { batch: "2022", semester: 3, cat1Avg: 74, cat2Avg: 71, cat3Avg: 76 },
  { batch: "2022", semester: 4, cat1Avg: 73, cat2Avg: 75, cat3Avg: 78 },
  { batch: "2022", semester: 5, cat1Avg: 76, cat2Avg: 74, cat3Avg: 79 },
  { batch: "2022", semester: 6, cat1Avg: 78, cat2Avg: 77, cat3Avg: 81 },
  { batch: "2022", semester: 7, cat1Avg: 80, cat2Avg: 79, cat3Avg: 83 },

  // Batch 2023 (currently Year III — completed 5 semesters)
  { batch: "2023", semester: 1, cat1Avg: 69, cat2Avg: 65, cat3Avg: 71 },
  { batch: "2023", semester: 2, cat1Avg: 72, cat2Avg: 70, cat3Avg: 74 },
  { batch: "2023", semester: 3, cat1Avg: 71, cat2Avg: 73, cat3Avg: 75 },
  { batch: "2023", semester: 4, cat1Avg: 74, cat2Avg: 72, cat3Avg: 77 },
  { batch: "2023", semester: 5, cat1Avg: 75, cat2Avg: 76, cat3Avg: 78 },

  // Batch 2024 (currently Year II — completed 3 semesters)
  { batch: "2024", semester: 1, cat1Avg: 68, cat2Avg: 64, cat3Avg: 70 },
  { batch: "2024", semester: 2, cat1Avg: 71, cat2Avg: 69, cat3Avg: 73 },
  { batch: "2024", semester: 3, cat1Avg: 73, cat2Avg: 72, cat3Avg: 76 },

  // Batch 2025 (currently Year I — completed 1 semester)
  { batch: "2025", semester: 1, cat1Avg: 66, cat2Avg: 62, cat3Avg: 69 },
]

// Attendance data per batch
export interface BatchAttendance {
  batch: string
  semester: number
  attendancePercent: number
}

export const batchAttendance: BatchAttendance[] = [
  { batch: "2022", semester: 7, attendancePercent: 88 },
  { batch: "2023", semester: 5, attendancePercent: 82 },
  { batch: "2024", semester: 3, attendancePercent: 85 },
  { batch: "2025", semester: 1, attendancePercent: 91 },
]
