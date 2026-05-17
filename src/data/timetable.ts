// Faculty timetable data — read-only weekly schedule

export interface TimetableSlot {
  day: string
  period: number
  time: string
  subject: string
  batch: string
  room: string
}

// Generic timetable — in production, filter by faculty UID or name
export const weeklyTimetable: TimetableSlot[] = [
  // Monday
  { day: "Mon", period: 1, time: "09:00–09:50", subject: "Machine Learning",    batch: "III Year", room: "AI Lab 1" },
  { day: "Mon", period: 2, time: "09:50–10:40", subject: "Machine Learning",    batch: "III Year", room: "AI Lab 1" },
  { day: "Mon", period: 4, time: "11:30–12:20", subject: "Deep Learning",       batch: "IV Year",  room: "Room 301" },
  // Tuesday
  { day: "Tue", period: 1, time: "09:00–09:50", subject: "Python Programming",  batch: "I Year",   room: "Room 101" },
  { day: "Tue", period: 3, time: "10:40–11:30", subject: "Data Structures",     batch: "II Year",  room: "Room 201" },
  { day: "Tue", period: 5, time: "12:20–01:10", subject: "ML Lab",              batch: "III Year", room: "AI Lab 2" },
  // Wednesday
  { day: "Wed", period: 2, time: "09:50–10:40", subject: "Deep Learning",       batch: "IV Year",  room: "Room 301" },
  { day: "Wed", period: 3, time: "10:40–11:30", subject: "Python Programming",  batch: "I Year",   room: "Room 101" },
  { day: "Wed", period: 6, time: "02:00–02:50", subject: "Data Structures",     batch: "II Year",  room: "Room 201" },
  // Thursday
  { day: "Thu", period: 1, time: "09:00–09:50", subject: "Machine Learning",    batch: "III Year", room: "AI Lab 1" },
  { day: "Thu", period: 4, time: "11:30–12:20", subject: "Deep Learning Lab",   batch: "IV Year",  room: "AI Lab 2" },
  { day: "Thu", period: 5, time: "12:20–01:10", subject: "Deep Learning Lab",   batch: "IV Year",  room: "AI Lab 2" },
  // Friday
  { day: "Fri", period: 2, time: "09:50–10:40", subject: "Python Programming",  batch: "I Year",   room: "Room 101" },
  { day: "Fri", period: 3, time: "10:40–11:30", subject: "Data Structures",     batch: "II Year",  room: "Room 201" },
  { day: "Fri", period: 6, time: "02:00–02:50", subject: "ML Lab",              batch: "III Year", room: "AI Lab 2" },
]

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
export const periods = [1, 2, 3, 4, 5, 6]
export const periodTimes = [
  "09:00–09:50", "09:50–10:40", "10:40–11:30",
  "11:30–12:20", "12:20–01:10", "02:00–02:50",
]
