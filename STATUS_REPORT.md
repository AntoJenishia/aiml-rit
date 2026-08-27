# RIT-AIML Codebase Audit Report

**Date:** January 2025  
**Auditor:** Cascade AI  
**Scope:** Comprehensive audit of RIT-AIML department portal application

---

## Executive Summary

This report provides a comprehensive audit of the RIT-AIML department portal codebase. The application is a Next.js-based full-stack system that manages On-Duty (OD) requests, faculty portfolios, events, announcements, and department administration. The system integrates with Firebase for authentication, database, and storage, and uses Google Apps Script for file management workflows.

**Overall Assessment:** The codebase is well-structured with clear separation of concerns. Security is implemented through Firebase security rules and role-based access control. The application follows modern Next.js patterns with TypeScript for type safety.

---

## 1. AUTH & ROLES

### Key Files
- `src/app/(auth)/login/page.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/app/api/auth/[...nextauth]/route.ts`
- `firestore.rules` (lines 5-25)

### Implementation Details

**Authentication Flow:**
- Uses NextAuth.js for session management
- Supports Google OAuth for students
- Supports credential-based login for staff and HOD
- Firebase Admin SDK for user creation and role assignment

**Role-Based Access Control:**
- Three roles: `student`, `staff`, `hod`
- Roles stored in Firestore `users` collection
- Role validation in API routes and Firestore security rules

**Security Rules:**
- Helper functions: `isAuth()`, `role()`, `isHod()`, `isStaff()`, `isStudent()`
- Ownership checks via `isOwner(uid)`
- Role-based read/write permissions on all collections

### Findings
- **Strengths:** Clear role separation, comprehensive security rules
- **Observations:** Login form handles both OAuth and credentials with tab-based UI
- **No critical issues identified**

---

## 2. HOD DASHBOARD

### Key Files
- `src/app/(protected)/hod/page.tsx`
- `src/components/dashboard/HodDash.tsx`
- `src/app/api/hod/create-faculty/route.ts`

### Implementation Details

**Core Features:**
- Faculty account management (create, assign class incharge, reset password)
- Student promotion by semester
- OD request approval/rejection (final stage)
- Event creation and management
- Announcement posting
- Student list with filtering by batch, year, section

**Key Functions:**
- `handleHODApprove` - Approves OD requests via PATCH to `/api/od/[id]`
- `handleHODReject` - Rejects OD requests with reason
- `handlePromoteClass` - Promotes students to next semester/year
- Faculty management via `/api/hod/create-faculty`

### Findings
- **Strengths:** Comprehensive administrative interface, batch operations for student promotion
- **Observations:** Uses modal-based UI for actions, real-time data loading
- **No critical issues identified**

---

## 3. EVENTS & ANNOUNCEMENTS

### Key Files
- `src/app/api/events/route.ts`
- `src/app/api/announcements/route.ts`
- `src/lib/db/events.ts`

### Implementation Details

**Events:**
- HOD-only creation, update, delete
- All authenticated users can read
- Supports event types: Workshop, Hackathon, Seminar, Guest Lecture, FDP
- Includes registration subcollection for student signups

**Announcements:**
- HOD and staff can create and update
- HOD can delete
- All authenticated users can read

**Security Rules:**
- Events: HOD full control, staff read-only
- Announcements: Staff and HOD can create/update, HOD can delete

### Findings
- **Strengths:** Clear permission model, support for event registrations
- **Observations:** Events integrated with public website for display
- **No critical issues identified**

---

## 4. OD WORKFLOW

### Key Files
- `src/app/api/od/route.ts`
- `src/app/api/od/[id]/route.ts`
- `src/lib/pdf-generator.ts`

### Implementation Details

**Workflow Stages:**
1. Student submits OD request with event details and upfront proof
2. Faculty approves/rejects (status: `pending_faculty` → `approved`/`rejected_faculty`)
3. HOD approves/rejects (status: `pending_hod` → `approved`/`rejected_hod`)
4. Final approval generates formal PDF with QR code

**Key Features:**
- Reference number generation (format: OD-YYYY-XXXX)
- PDF generation using `pdf-lib` and `qrcode`
- Google Apps Script webhook integration for file storage
- Status tracking through Firestore

**API Endpoints:**
- `POST /api/od` - Create OD request
- `GET /api/od` - Fetch OD requests (role-scoped)
- `PATCH /api/od/[id]` - Approve/reject OD request

### Findings
- **Strengths:** Multi-stage approval workflow, PDF generation with verification QR
- **Observations:** Webhook integration for Google Drive file management
- **No critical issues identified**

---

## 5. POST-OD PROOF WORKFLOW

### Key Files
- `src/app/api/od/[id]/proof/route.ts`
- `src/components/dashboard/StudentDash.tsx` (lines 678-683)

### Implementation Details

**Workflow:**
- After OD approval, student can submit post-event proof
- Proof uploaded via Google Apps Script webhook
- Status transitions: `approved` → `post_pending_faculty` → `post_pending_hod` → `completed`
- Faculty and HOD can reject proofs with reason

**API Endpoint:**
- `POST /api/od/[id]/proof` - Submit post-OD proof
- Validates OD status before allowing proof submission
- Interacts with Google Apps Script for file upload

### Findings
- **Strengths:** Ensures proof of attendance, multi-level verification
- **Observations:** Rejection reasons displayed in student dashboard
- **No critical issues identified**

---

## 6. FACULTY-SIDE GOOGLE INTEGRATION

### Key Files
- `src/app/api/od/route.ts` (webhook integration)
- `src/app/api/od/[id]/route.ts` (webhook integration)
- `src/app/api/od/[id]/proof/route.ts` (webhook integration)

### Implementation Details

**Google Apps Script Webhook:**
- Environment variable: `NEXT_PUBLIC_APPS_SCRIPT_URL`
- Used for:
  - Uploading OD proofs to Google Drive
  - Storing generated PDFs
  - Updating file status

**Webhook Payloads:**
- OD creation: Sends student info, event details, proof file
- OD approval: Sends updated status, final PDF
- Proof submission: Sends post-event proof file

### Findings
- **Strengths:** Centralized file management via Google Drive
- **Observations:** Webhook URL is environment-specific
- **Potential Issue:** No fallback mechanism if webhook fails
- **Recommendation:** Add error handling and retry logic for webhook failures

---

## 7. REPORTS

### Key Files
- `src/app/(protected)/admin/reports/page.tsx`
- `src/components/admin/ReportsClient.tsx`

### Implementation Details

**Features:**
- Department enrollment trends visualization
- Event statistics
- Uses `recharts` for data visualization
- Line charts and bar charts for metrics

**Data Sources:**
- Firestore collections for enrollment data
- Events collection for event statistics

### Findings
- **Strengths:** Visual analytics for department performance
- **Observations:** Client-side data fetching and rendering
- **No critical issues identified**

---

## 8. STUDENT PROFILE

### Key Files
- `src/components/dashboard/StudentDash.tsx`
- `src/app/api/users/route.ts`

### Implementation Details

**Features:**
- View personal OD requests with status
- Download OD PDFs
- Submit post-OD proofs
- Verify OD requests via public link
- View profile information

**Dashboard UI:**
- Status badges with color coding
- Action buttons for PDF download, verification, proof submission
- Rejection reason display

### Findings
- **Strengths:** Clean UI, clear status indicators
- **Observations:** Integrated with public verification page
- **No critical issues identified**

---

## 9. PUBLIC WEBSITE

### Key Files
- `src/app/page.tsx` (homepage)
- `src/app/about/page.tsx`
- `src/app/faculty/page.tsx`
- `src/app/syllabus/page.tsx`
- `src/app/events/page.tsx`
- `src/app/achievements/page.tsx`
- `src/app/contact/page.tsx`
- `src/app/verify/[referenceNumber]/page.tsx`

### Implementation Details

**Pages:**
- **Homepage:** Hero section, statistics, quick links
- **About:** Vision, mission, programme outcomes, HOD teaser
- **Faculty:** Carousel display of faculty members
- **Syllabus:** Accordion-based semester-wise subject list
- **Events:** Dynamic events from Firestore + visual archive
- **Achievements:** Student wins and department timeline
- **Contact:** Contact form with map embed
- **Verify:** Public OD verification page

**UI Components:**
- `SectionHeading`, `RevealSection`, `CardReveal` for animations
- `FacultyCarousel` for faculty display
- Framer Motion for animations

**Data Sources:**
- Static data from `src/data/*.ts` files
- Dynamic events from Firestore via `getAdminEvents()`

### Findings
- **Strengths:** Modern UI with animations, responsive design
- **Observations:** Contact form uses mock submission (no backend integration)
- **Potential Issue:** Contact form doesn't actually send emails
- **Recommendation:** Implement email sending via nodemailer or email service API

---

## 10. DEPLOYMENT / INFRA STATE

### Key Files
- `package.json`
- `next.config.js`
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `.vercel/` directory

### Implementation Details

**Tech Stack:**
- Next.js 16.2.3 (App Router)
- React 18.3.1
- TypeScript 5.8.3
- Firebase 12.12.1 (client) + Firebase Admin 13.10.0
- NextAuth.js 4.24.14
- Tailwind CSS 3.4.17
- Framer Motion 12.38.0

**Deployment:**
- Vercel deployment (indicated by `.vercel/` directory)
- Environment variables: `.env.local` (gitignored)
- Firebase hosting configured via `firebase.json`

**Firebase Configuration:**
- Firestore security rules with role-based access
- Storage rules with file size limits:
  - OD upfront proof: 10 MB
  - OD post-event proof: 20 MB
  - Profile photos: 5 MB
  - Highlight proof: 20 MB

**Next.js Configuration:**
- Image optimization enabled for:
  - ui-avatars.com
  - picsum.photos
  - lh3.googleusercontent.com (Google OAuth)

### Findings
- **Strengths:** Modern stack, proper security rules, Vercel deployment
- **Observations:** Environment variables properly gitignored
- **No critical issues identified**

---

## Summary of Findings

### Critical Issues
None identified.

### Medium Priority Issues
1. **Google Apps Script Webhook Failure Handling:** No retry mechanism if webhook fails during OD workflow
2. **Contact Form Non-Functional:** Contact form uses mock submission without actual email sending

### Low Priority Observations
1. **Static Data Management:** Public website uses static data files that require code changes to update
2. **Error Logging:** Limited error logging in webhook integrations

### Recommendations
1. Add retry logic and error handling for Google Apps Script webhook calls
2. Implement email sending for contact form using nodemailer or email service
3. Consider CMS for static content management on public website
4. Add comprehensive error logging for monitoring

---

## Conclusion

The RIT-AIML codebase demonstrates a well-architected full-stack application with proper security measures, clear role-based access control, and modern development practices. The OD workflow is comprehensive with proper approval stages and proof verification. The public website provides a professional department presence with engaging UI.

The identified issues are non-critical and can be addressed in future iterations. The application is production-ready with minor enhancements recommended for improved reliability.
