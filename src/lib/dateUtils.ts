/**
 * Shared utility for date formatting.
 */

/**
 * Formats a date value into "D MMM YYYY" format (e.g., "8 Aug 2026").
 * Accepts standard date strings or Firestore timestamp objects.
 */
export function formatDate(dateVal: any): string {
  if (!dateVal) return ""

  // Handle Firestore Timestamp object ({ seconds: ... } or { _seconds: ... })
  let d;
  if (typeof dateVal === "object") {
    if (dateVal.seconds) d = new Date(dateVal.seconds * 1000)
    else if (dateVal._seconds) d = new Date(dateVal._seconds * 1000)
    else if (typeof dateVal.toDate === "function") d = dateVal.toDate()
    else d = new Date(dateVal)
  } else {
    d = new Date(dateVal)
  }

  if (isNaN(d.getTime())) return ""

  // Format: day numeric (no leading zero), short month, numeric year
  // e.g., "8 Aug 2026"
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/**
 * Formats a date value into "D MMM YYYY, HH:MM AM/PM" format.
 * Includes the exact time for use in audit timelines.
 * e.g., "30 Aug 2026, 02:45 PM"
 */
export function formatDateTime(dateVal: any): string {
  if (!dateVal) return ""

  let d;
  if (typeof dateVal === "object") {
    if (dateVal.seconds) d = new Date(dateVal.seconds * 1000)
    else if (dateVal._seconds) d = new Date(dateVal._seconds * 1000)
    else if (typeof dateVal.toDate === "function") d = dateVal.toDate()
    else d = new Date(dateVal)
  } else {
    d = new Date(dateVal)
  }

  if (isNaN(d.getTime())) return ""

  const datePart = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  return `${datePart}, ${timePart}`
}
