/**
 * Shared utility for date formatting.
 */

/**
 * Formats a date value into "D MMM YYYY" format (e.g., "8 Aug 2026").
 * Accepts standard date strings or Firestore timestamp objects.
 */
export function formatDate(dateVal: any): string {
  if (!dateVal) return ""

  // Handle Firestore Timestamp object ({ seconds: ... })
  const d = typeof dateVal === "object" && dateVal.seconds 
    ? new Date(dateVal.seconds * 1000) 
    : new Date(dateVal)

  if (isNaN(d.getTime())) return ""

  // Format: day numeric (no leading zero), short month, numeric year
  // e.g., "8 Aug 2026"
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
