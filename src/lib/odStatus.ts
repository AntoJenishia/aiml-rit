// ─────────────────────────────────────────────────────────────────────────────
// Canonical OD Status Enum — single source of truth.
// Every Firestore write, dashboard filter, and label must use ONLY these values.
// ─────────────────────────────────────────────────────────────────────────────
export enum ODStatus {
  // ── Initial approval flow ─────────────────────────────────────────────────
  PENDING_FACULTY        = "PENDING_FACULTY",
  REJECTED_FACULTY       = "REJECTED_FACULTY",
  PENDING_HOD            = "PENDING_HOD",
  REJECTED_HOD           = "REJECTED_HOD",
  APPROVED               = "APPROVED",

  // ── Post-event proof flow ─────────────────────────────────────────────────
  /** Approved but student has not yet submitted post-event proof. Reserved/future. */
  PENDING_PROOF          = "PENDING_PROOF",
  PROOF_PENDING_FACULTY  = "PROOF_PENDING_FACULTY",
  PROOF_REJECTED_FACULTY = "PROOF_REJECTED_FACULTY",
  PROOF_PENDING_HOD      = "PROOF_PENDING_HOD",
  PROOF_REJECTED_HOD     = "PROOF_REJECTED_HOD",

  // ── Terminal states ───────────────────────────────────────────────────────
  /** OD fully completed — all proof reviewed and approved. */
  COMPLETED = "COMPLETED",
  /** Revoked after approval. Distinct from REJECTED — cannot be undone. */
  REVOKED   = "REVOKED",
}

// ─────────────────────────────────────────────────────────────────────────────
// Human-readable labels — import instead of writing prose strings inline.
// ─────────────────────────────────────────────────────────────────────────────
export const OD_STATUS_LABELS: Record<ODStatus, string> = {
  [ODStatus.PENDING_FACULTY]:        "Pending Faculty Approval",
  [ODStatus.REJECTED_FACULTY]:       "Rejected by Faculty",
  [ODStatus.PENDING_HOD]:            "Pending HOD Approval",
  [ODStatus.REJECTED_HOD]:           "Rejected by HOD",
  [ODStatus.APPROVED]:               "Approved",
  [ODStatus.PENDING_PROOF]:          "Proof Required",
  [ODStatus.PROOF_PENDING_FACULTY]:  "Post-Event Proof — Faculty Review",
  [ODStatus.PROOF_REJECTED_FACULTY]: "Post-Event Proof Rejected by Faculty",
  [ODStatus.PROOF_PENDING_HOD]:      "Post-Event Proof — HOD Review",
  [ODStatus.PROOF_REJECTED_HOD]:     "Post-Event Proof Rejected by HOD",
  [ODStatus.COMPLETED]:              "Completed",
  [ODStatus.REVOKED]:                "Revoked",
}

// ─────────────────────────────────────────────────────────────────────────────
// Styling tokens — canonical palette per spec.
// bg #F5F6FA | blue #3B5BFF | purple #7C3AED | green #16A34A
// gray #94A3B8 | red #EF4444 | amber bg #FEF3C7 / text #D97706
// ─────────────────────────────────────────────────────────────────────────────
export const OD_STATUS_STYLES: Record<ODStatus, { color: string; bg: string; border: string }> = {
  [ODStatus.PENDING_FACULTY]:        { color: "text-[#6B7280]", bg: "bg-[#F5F6FA]",  border: "border-[#E5E7EB]"  },
  [ODStatus.REJECTED_FACULTY]:       { color: "text-[#EF4444]", bg: "bg-red-50",      border: "border-[#EF4444]"  },
  [ODStatus.PENDING_HOD]:            { color: "text-[#3B5BFF]", bg: "bg-blue-50",     border: "border-[#3B5BFF]"  },
  [ODStatus.REJECTED_HOD]:           { color: "text-[#EF4444]", bg: "bg-red-50",      border: "border-[#EF4444]"  },
  [ODStatus.APPROVED]:               { color: "text-[#16A34A]", bg: "bg-green-50",    border: "border-[#16A34A]"  },
  [ODStatus.PENDING_PROOF]:          { color: "text-[#D97706]", bg: "bg-[#FEF3C7]",   border: "border-[#D97706]"  },
  [ODStatus.PROOF_PENDING_FACULTY]:  { color: "text-[#7C3AED]", bg: "bg-purple-50",   border: "border-[#7C3AED]"  },
  [ODStatus.PROOF_REJECTED_FACULTY]: { color: "text-[#EF4444]", bg: "bg-red-50",      border: "border-[#EF4444]"  },
  [ODStatus.PROOF_PENDING_HOD]:      { color: "text-[#3B5BFF]", bg: "bg-blue-50",     border: "border-[#3B5BFF]"  },
  [ODStatus.PROOF_REJECTED_HOD]:     { color: "text-[#EF4444]", bg: "bg-red-50",      border: "border-[#EF4444]"  },
  [ODStatus.COMPLETED]:              { color: "text-[#16A34A]", bg: "bg-green-50",    border: "border-[#16A34A]"  },
  [ODStatus.REVOKED]:                { color: "text-[#94A3B8]", bg: "bg-slate-100",   border: "border-[#94A3B8]"  },
}
