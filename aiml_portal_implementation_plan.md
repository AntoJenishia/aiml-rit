# AIML Department Portal — Implementation Plan

**Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + Firebase (Auth, Firestore, Storage)
**Context:** Public-facing site (Home, About, Faculty, Events, Achievements, HOD, Contact, Syllabus) already exists with static mock data. This plan covers turning it into a full management portal.
**Timeline constraint:** ~1.5 days, solo build (may get help). Build in the phase order below; later phases are explicitly droppable if time runs out.

---

## 1. Roles

Exactly three roles, no more:
- **HOD** — highest privilege
- **Faculty**
- **Student**

---

## 2. Authentication Rules

- **Students:** Google sign-in restricted to `@aiml.ritchennai.edu.in` domain only. Any other domain must be rejected at sign-in.
- **Students — first login:** account is auto-created (self-provisioned) on first successful Google login. No pre-uploaded roster check required.
- **Faculty:** accounts are created only by the HOD, using a username + password (not self-registration, not Google sign-in).
- **HOD:** one account, created manually (seed it directly in Firebase, not through app UI).
- **Password resets (faculty/HOD):** no self-service "forgot password" flow. Only HOD can reset a faculty member's password (build this as an HOD action, e.g. "Reset Password" button on the faculty management screen that triggers Firebase Admin SDK password reset).
- **Sessions:** expire after ~3 weeks of inactivity for all roles. Use Firebase Auth's persistence settings + a last-active timestamp check; do not force shorter re-logins.

---

## 3. Class Structure

- A **class** = Year + Section + specific batch/group (e.g. "II Year - AIML - A - Batch 2024–2028").
- Each class has **exactly one Class Incharge** (a faculty member).
- Each faculty member is Class Incharge for **at most one class** (strict 1:1 mapping).
- **HOD manually assigns** which faculty is incharge of which class (build an HOD screen: list of classes, dropdown to assign/reassign a faculty as incharge).
- A student's "Class Incharge" field on their profile is **derived automatically** from this mapping (student's class → look up incharge), not manually entered per student.

---

## 4. Student Profile — Fields

Keep from existing profile page:
- Email
- Department
- Batch (e.g. 2024–2028)
- Current Year
- Register Number
- ID Card (linked status)
- Role

Changes:
- **Remove:** Roll Number field (drop entirely)
- **Add:** Class Incharge field — read-only, auto-populated from the HOD's class→faculty mapping (see §3)

---

## 5. Dashboards — Role Scope

### Student Dashboard
- Stats: Semester, CGPA, Courses count, Awards count (student's own achievements only)
- My Courses list (semester, active/inactive status)
- Announcements
- Quick Links (Department Events, View Faculty, Syllabus, Achievements)
- OD: apply for OD, view OD status, download/print generated OD letter, upload post-event proof

**CGPA / course data is entered and updated by Faculty**, not by students, and not bulk-uploaded by HOD.

### Faculty Dashboard
- Scoped **only** to:
  - OD requests assigned to them (as class incharge)
  - Their own class's students (if they are a class incharge)
- A faculty member who is *not* a class incharge still logs in but has a narrower dashboard (no OD queue) — confirm exact empty-state content during build, not specified in detail yet.
- Faculty actions: approve/reject OD requests (reason required on reject), update student grades/course data, submit conference/academic activity highlights (for HOD approval), view achievements of their own class's students.

### HOD Dashboard
- Create/manage faculty accounts (including password reset action)
- Assign class → faculty incharge mapping
- Final OD approval/rejection queue
- Validate post-event proof submissions (after faculty has validated first)
- Analytics: OD counts/trends (approved/rejected/pending, by class, by event type), faculty response time/pending workload, achievements & events summary — department-wide view
- Generate reports: both auto-generated on schedule AND manually triggerable with custom date range
- Approve faculty-submitted highlights before they appear publicly
- Create department events
- HOD access is scoped to these explicit capabilities — **not** blanket read access to every student's full profile/history beyond what's needed for the above.

---

## 6. OD (On-Duty) Request — Full Spec

### 6.1 Form fields (student-facing)
- Event Name (text)
- Event Type (fixed dropdown: Workshop, Symposium, Internship, Hackathon, Conference, Guest Lecture, Other)
- Organiser / Organisation (text)
- Venue (text)
- Dates: single day or date range
  - **Max 5 days** per request
  - If Event Type = Internship and more days are needed, student must flag a "special need" via the days field (build as: checkbox/flag "Special need (internship)" that unlocks a longer range with a required justification field)
- Reason (text/textarea)
- Upfront proof upload — **always required at submission time** (e.g. registration confirmation, invitation, or offer letter for internships). Store in Firebase Storage, reference in Firestore doc.

### 6.2 Timestamps (required on every OD record)
- Created date & time (on submission)
- Faculty response date & time (on approve/reject)
- HOD response date & time (on approve/reject)

### 6.3 Workflow
1. Student fills form and submits.
2. System generates a PDF immediately and stores it. Student can preview/download this pre-approval version.
3. Faculty (the student's class incharge) reviews → approves or rejects.
   - Rejection **requires** a mandatory reason/comment.
4. HOD reviews → approves or rejects.
   - Rejection **requires** a mandatory reason/comment.
5. On both approvals, the PDF is **regenerated** (or updated) to include: approval metadata, class incharge signature, HOD signature, and the full timestamp trail.
6. Student prints the **approved** PDF and physically submits the hard copy to both the Class Incharge and the HOD.
7. After the event: student uploads post-event proof (see §7).

### 6.4 Rejection & resubmission
- On rejection at either faculty or HOD stage, the **same request is edited and resubmitted** by the student (not a new request) — this preserves one reference number and gives a status trail (e.g. Rejected → Edited → Resubmitted). Do not force re-upload of proof docs that were already fine.

### 6.5 Anti-forgery
- Every OD PDF must carry a **unique reference number and a QR code**.
- The QR code links to a public verification page showing live status (issued / faculty-approved / HOD-approved / completed) and the timestamp trail from §6.2 — so anyone can scan the printed letter and confirm it's genuine and matches current system state.
- Regenerate/re-lock the PDF only at defined transition points (initial generation, post-approval) — do not allow an editable "final" PDF state that could be tampered with after printing.

### 6.6 PDF template requirements
- RIT logo
- Proper letter template layout with all field details (from §6.1) clearly laid out
- Signature blocks for Class Incharge and HOD (populated only after real approval — see §6.3 step 5)
- Reference number + QR code (see §6.5)

### 6.7 Escalation
- If faculty does not act on a pending OD request within a defined time limit, send a **reminder to the same faculty member only** (in-app notification). Do **not** escalate to HOD automatically.
- (Exact time limit not yet specified — use a placeholder like 48 hours and make it configurable.)

---

## 7. Post-Event Proof

- Required, all three, every time: **photos + certificate + written feedback** (not optional, not event-type-dependent).
- **Deadline: 3 days** after the event ends. Flag/lock submission after this unless HOD manually reopens it (implementation detail, not yet specified further).
- Validation order: **Faculty (class incharge) first, then HOD.**
- On both validations passing, OD is marked "Completed."

---

## 8. Notifications

- **In-app only** (bell icon / notifications page). No email, SMS, or WhatsApp integration.
- Trigger notifications for: OD submitted (faculty), OD faculty-approved (HOD + student), OD approved/rejected (student), reminder to faculty on pending requests (faculty only, no escalation), post-event proof deadline approaching (student).

---

## 9. Events

- Only **HOD** can create department events (faculty cannot create/propose events).
- Events have a real **student registration flow** — students register for a specific event, and registration status is tracked (not a static/mock "Registered" label).

---

## 10. Faculty Highlights

- Faculty can submit conference/academic activities.
- These require **HOD approval** before appearing publicly as a department highlight — not shown immediately on submission.

---

## 11. Suggested Firestore Data Model (adjust as needed — not locked in)

```
users/{uid}
  role: 'student' | 'faculty' | 'hod'
  email, name
  // student-only:
  department, batch, currentYear, registerNumber, idCardLinked, classId
  // faculty-only:
  isClassIncharge: boolean, classId (if incharge)

classes/{classId}
  year, section, batch
  classInchargeUid: string | null

courses/{courseId}
  studentUid, courseName, semester, active, cgpaContribution / grade

odRequests/{odId}
  studentUid, referenceNumber, qrCodeUrl
  eventName, eventType, organiser, venue
  startDate, endDate, isSpecialNeed, specialNeedJustification
  reason, upfrontProofUrl
  status: 'pending_faculty' | 'rejected_faculty' | 'pending_hod' | 'rejected_hod' | 'approved' | 'completed'
  createdAt, facultyRespondedAt, facultyRejectReason, hodRespondedAt, hodRejectReason
  pdfUrl (pre-approval), finalPdfUrl (post-approval, signed)
  postEventProof: { photosUrls[], certificateUrl, feedback, uploadedAt, facultyValidatedAt, hodValidatedAt }

events/{eventId}
  title, description, type, date, createdByUid
  registrations: subcollection or array of studentUids

highlights/{highlightId}
  facultyUid, title, description, proofUrl
  status: 'pending' | 'approved'

notifications/{notificationId}
  userUid, type, message, read, createdAt
```

---

## 12. Build Phases (priority order)

**Phase 0 — Firebase setup**
Create project, enable Google Auth (domain-restricted) + username/password auth, enable Firestore + Storage, draft role-based security rules, seed one HOD account and one test faculty account.

**Phase 1 — Auth + role routing**
Student Google sign-in with domain check + auto-create user doc. Faculty/HOD username-password login. Role-based redirect to `/dashboard/student`, `/dashboard/faculty`, `/dashboard/hod`. Protected route wrapper.

**Phase 2 — Core dashboards**
Student profile (with Class Incharge auto-fill, Roll Number removed), stats cards, My Courses. Faculty OD queue scoped to their class, approve/reject with reason. HOD faculty-account creation + class-incharge assignment, OD final-approval queue, dept-wide achievements view. Reuse existing site components/styling where possible.

**Phase 3 — OD workflow (highest priority)**
Full form (§6.1), PDF generation (§6.6) with reference number + QR (§6.5), faculty approve/reject, HOD approve/reject, timestamp trail (§6.2), PDF regeneration with signatures on approval, rejection/resubmission flow (§6.4), QR verification public page.

**Phase 4 — Post-event proof (if time allows)**
Upload flow (§7), faculty validation, HOD validation, mark completed.

**Deferred / stretch (post-hackathon):**
- Auto-escalation reminders beyond simple faculty reminder
- Scheduled auto-generated monthly reports (manual date-range export is enough for now)
- Faculty highlight submission + approval UI (§10)
- Full event creation/registration UI (§9) — can stub if time-constrained
- Real analytics dashboard — a simple counts table is an acceptable substitute under time pressure

---

## 13. Explicit Non-Goals For This Build Pass

- Do not build email/SMS notification integrations.
- Do not build self-service password reset for faculty/HOD.
- Do not let faculty create or propose department events.
- Do not skip the mandatory rejection-reason field at either approval stage.
- Do not generate a "final" signed PDF before both approvals are complete.
