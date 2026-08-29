/**
 * Single source of truth for all OD status-related UI styles.
 * Used across all dashboards (Student, Faculty, HOD) and shared components.
 * Palette: bg #F5F6FA, blue #3B5BFF, purple #7C3AED, green #16A34A,
 *          gray #94A3B8, red #EF4444, yellow #FEF3C7/#D97706
 */

import { ODStatus } from "@/lib/odStatus";

export interface StatusStyle {
  label: string;
  /** Tailwind classes for a badge (background + text color) */
  badgeCls: string;
  /** Hex color for programmatic use (e.g. PDF, charts) */
  color: string;
  bg: string;
}

export const STATUS_STYLES: Record<string, StatusStyle> = {
  [ODStatus.PENDING_FACULTY]: {
    label: "Pending Faculty",
    badgeCls: "bg-[#F5F6FA] text-[#94A3B8]",
    color: "#94A3B8",
    bg: "#F5F6FA",
  },
  [ODStatus.REJECTED_FACULTY]: {
    label: "Rejected by Faculty",
    badgeCls: "bg-red-100 text-[#EF4444]",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  [ODStatus.PENDING_HOD]: {
    label: "Pending HOD",
    badgeCls: "bg-blue-100 text-[#3B5BFF]",
    color: "#3B5BFF",
    bg: "#DBEAFE",
  },
  [ODStatus.REJECTED_HOD]: {
    label: "Rejected by HOD",
    badgeCls: "bg-rose-100 text-rose-700",
    color: "#EF4444",
    bg: "#FFE4E6",
  },
  [ODStatus.APPROVED]: {
    label: "Approved",
    badgeCls: "bg-green-100 text-[#16A34A]",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  [ODStatus.PENDING_PROOF]: {
    label: "Proof Required",
    badgeCls: "bg-yellow-100 text-[#D97706]",
    color: "#D97706",
    bg: "#FEF3C7",
  },
  [ODStatus.PROOF_PENDING_FACULTY]: {
    label: "Proof — Faculty Review",
    badgeCls: "bg-purple-100 text-[#7C3AED]",
    color: "#7C3AED",
    bg: "#EDE9FE",
  },
  [ODStatus.PROOF_REJECTED_FACULTY]: {
    label: "Proof Rejected (Faculty)",
    badgeCls: "bg-red-100 text-[#EF4444]",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  [ODStatus.PROOF_PENDING_HOD]: {
    label: "Proof — HOD Review",
    badgeCls: "bg-blue-100 text-[#3B5BFF]",
    color: "#3B5BFF",
    bg: "#DBEAFE",
  },
  [ODStatus.PROOF_REJECTED_HOD]: {
    label: "Proof Rejected (HOD)",
    badgeCls: "bg-red-100 text-[#EF4444]",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  [ODStatus.COMPLETED]: {
    label: "Completed",
    badgeCls: "bg-green-100 text-[#16A34A]",
    color: "#16A34A",
    bg: "#DCFCE7",
  },
  [ODStatus.REVOKED]: {
    label: "Revoked",
    badgeCls: "bg-slate-100 text-[#94A3B8]",
    color: "#94A3B8",
    bg: "#F1F5F9",
  },
};

/** Returns the StatusStyle for a given status, falling back to a generic gray badge. */
export function getStatusStyle(status: string): StatusStyle {
  return STATUS_STYLES[status] ?? {
    label: status.replace(/_/g, " "),
    badgeCls: "bg-slate-100 text-slate-600",
    color: "#94A3B8",
    bg: "#F5F6FA",
  };
}
