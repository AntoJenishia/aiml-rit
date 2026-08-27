# 🔍 RIT-AIML Portal Codebase Audit (v2 - Evidence-Based)

*This report supersedes all previous audits. Every claim has been verified via direct source code tracing rather than mere file existence.*

---

## 🎯 Specific Verification Items

### 1. HOD Dashboard Routing
✅ **Verified working.** 
`src/app/(protected)/dashboard/hod/page.tsx` performs a clean redirect to `/admin`. The Admin layout utilizes `src/components/admin/AdminNav.tsx` to handle tab-based navigation (`?tab=...`), which correctly conditionally renders `HodDash.tsx`.

### 2. HOD Dashboard Features 
✅ **Verified working.** 
`src/components/dashboard/HodDash.tsx` contains 1,450 lines of explicit implementation for:
- Faculty Management (`CreateFacultyModal`, fetching via `/api/users?role=staff`)
- OD Approvals (`odRequests.filter` for HOD level, `handleApprove`/`handleReject` PATCH requests)
- Student Directory
- Events and Announcements management

### 3. Faculty Profile Fields
✅ **Verified working.** 
In `src/components/dashboard/StaffDash.tsx` (lines 590-612), the "My Profile" tab correctly renders dynamic sections for Email (`user?.email`), Role ("Faculty / Staff"), Department ("Artificial Intelligence & Machine Learning"), and Class Assigned (`classId`).

### 4. Student Dashboard "Signed Letter" Link
✅ **Verified working.** 
In `src/components/dashboard/StudentDash.tsx` (line 669), the UI maps the "PDF" download button specifically to `href={od.finalPdfUrl || od.pdfUrl}`. It does NOT incorrectly link to `od.postODProofsUrl`.

### 5. OD PDF QR Code Target URL
⚠️ **Partially working / Potential Risk.** 
While the QR code URL uses `process.env.NEXTAUTH_URL`, there are hardcoded localhost fallbacks remaining in production code paths. 
- *Evidence:* `src/app/api/od/[id]/route.ts` (line 10): ``const verifyUrl = od.qrCodeUrl || `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify/${od.referenceNumber}```

### 6. Post-OD Proof Review PDF Target
✅ **Verified working.** 
Both `HodDash.tsx` and `StaffDash.tsx` correctly implement a conditional check (`isProof`). When reviewing a submitted proof, the UI renders a link to `od.finalPdfUrl` (Approved Letter) instead of the draft `od.pdfUrl`.

### 7. OD Requests vs Proof Approvals Partition
✅ **Verified working.** 
Both faculty (`StaffDash.tsx`) and HOD (`HodDash.tsx`) dashboards implement a dedicated sub-tab state (`odSubTab`) with toggle buttons for "OD Requests" and "Proof Approvals", properly splitting the views rather than mixing them in a single table.

### 8. Faculty-Side OD Google Sheet Integration
❌ **Not working / Not built.** 
There is no OD submission flow built for Faculty in the UI (`StaffDash.tsx`) or API. The Google Apps Script webhook integration is strictly tied to Student OD requests (`/api/od/route.ts`).

### 9. Google Drive OD Folder Structure
⚠️ **Partially working / Incomplete.** 
The initial OD creation (`/api/od/route.ts`) explicitly passes `createUpfrontSubfolder: true` to generate an "Upfront Proof" folder. However, the Post-OD Proof submission payload (`/api/od/[id]/proof/route.ts`) only passes `folderId` and `files` with no flags to request a secondary sub-folder creation.

### 10. Public Site "Departments" and "Research" Sections
❌ **Not working / Not built.** 
These sections do not exist. `src/app/page.tsx` contains only the Hero, Stats, Intro, and Quick Links. Furthermore, there are no `app/departments` or `app/research` routes present in the codebase.

### 11. Reports Dashboard Approval-Rate Calculation
❌ **Not working / Not built.** 
`src/components/admin/ReportsClient.tsx` uses completely hardcoded dummy data (`const summaryCards = [ { label: "Total Enrolled", value: "180" } ]`). There is no active calculation of OD approval/rejection rates against the database.

### 12. Verification Page Student Name (`verify/[referenceNumber]`)
✅ **Verified working.** 
`src/app/verify/[referenceNumber]/page.tsx` actively guards against missing names. If `od.studentName` is missing from the OD document, it uses `raw.studentUid` to fetch the actual name from the `users` collection directly before rendering.

---

## 🏗️ General Codebase Audit

### 1. Routing & Access Control
- Uses Next.js App Router with a `(protected)` group for authenticated areas.
- NextAuth handles sessions; role-based redirects (`/dashboard/student`, `/dashboard/staff`, `/admin`) are correctly implemented via route handlers and middleware.

### 2. Dashboard & Layout Structure
- **Admin/HOD**: Centralized in `admin/page.tsx` rendering `HodDash.tsx`.
- **Faculty**: Centralized in `StaffDash.tsx`.
- **Student**: Centralized in `StudentDash.tsx`.
- Uses a unified layout wrapper providing sidebar navigation (`AdminNav`, etc.).

### 3. Student Portal Features
- Displays student profile stats fetched directly from `users` collection.
- OD Application modal accurately generates start/end dates and handles upfront proof processing (Base64).
- Post-OD Proof modal supports multiple file uploads.

### 4. Faculty Portal Features
- Portfolio management is active (`/api/faculty/portfolio`).
- Class Incharge features (OD approvals, student list) correctly conditionally render based on the `isClassIncharge` flag.

### 5. HOD Portal Features
- Fully built-out monolithic component (`HodDash.tsx`). 
- Capable of creating faculty accounts, approving/rejecting ODs, reviewing proofs, and managing global announcements.

### 6. OD Workflow Logic
- **State Machine**: Correctly tracks transitions: `pending_faculty` -> `pending_hod` -> `approved` -> `post_pending_faculty` -> `completed`.
- Rejection captures specific reasons (`facultyRejectReason`, `hodRejectReason`).

### 7. Data Models & API Endpoints
- Relies heavily on Firestore (`adminDb.collection`).
- APIs are cleanly scoped (e.g., `/api/od` uses NextAuth session to filter student vs staff vs HOD views securely).

### 8. External Integrations
- **PDF Generation**: Verified via `generateFormalODPdf` utility.
- **Google Apps Script**: Webhook correctly invoked for Drive uploads/Sheet syncs, but as noted, lacks faculty OD support and post-proof subfolder flags.

### 9. Public Pages
- Present: `/about`, `/contact`, `/events`, `/faculty`, `/achievements`, `/syllabus`.
- Missing: Departments, Research.

### 10. Global UI/UX & Theming
- High-quality styling using Tailwind CSS, Lucide icons, and Recharts for dummy data visualisations.
- Extensive use of modern UI patterns (glassmorphism, gradients, micro-animations).

---
*Audit completed by Antigravity.*
