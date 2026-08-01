You are implementing a feature upgrade to an existing Next.js (App Router) + TypeScript + Tailwind CSS project — an AI & ML department website that currently has a working public-facing site (Home, About, Faculty, Events, Achievements, HOD, Contact, Syllabus) built with static mock data.

A full specification file, `aiml_portal_implementation_plan.md`, has been placed in the project root. **Read that file in full before writing any code.** It contains the complete requirements: roles, auth rules, class/incharge structure, profile fields, per-role dashboard scope, the full OD (on-duty) request workflow including anti-forgery/QR verification and PDF generation, post-event proof rules, notifications, events, faculty highlights, a suggested Firestore data model, and the build-phase order. Follow it precisely — it reflects deliberate product decisions, not suggestions to reinterpret.

Timeline note: this is a ~1.5 day solo build. Build strictly in the phase order given in the plan file (Phase 0 → Phase 4). If time runs out, stop after completing the current phase cleanly rather than half-building the next one. The plan file's "Deferred / stretch" and "Explicit Non-Goals" sections list what NOT to build in this pass — do not add them even if they seem easy, since scope creep is the main risk on this timeline.

In addition to the plan file, apply these two fixes that are not yet in it:

## 1. Landing page — missing Login/Sign Up button
The current public homepage navbar (Home / About / HOD / Faculty / Syllabus / Events / Achievements / Contact) has no way to log in or sign up. Add a clearly visible "Login" (or "Login / Sign Up") button to the navbar, styled consistently with the existing homepage design language (dark navbar, existing button/typography conventions). It should route to the appropriate auth entry point — Google sign-in for students, and a login form for faculty/HOD (can be the same page with role selection, or separate routes — use your judgment based on what's cleanest given the existing routing).

## 2. Dashboard visual style (dashboards only — do not touch other pages)
The public-facing pages (Home, About, Faculty, etc.) keep their current look exactly as-is. Apply the following visual treatment **only** to the Student, Faculty, and HOD dashboard shells (sidebar, topbar, stat cards, panels):

**Color palette:**
- Page background: `#F5F6FA` (soft off-white/lavender-gray)
- Panel/card background: `#FFFFFF`, with a subtle border (e.g. `#E5E7EB`)
- Primary accent (active nav state, primary CTA buttons, primary stat card left-border): `#3B5BFF`
- Secondary accent (secondary CTA buttons, some badges): `#7C3AED`
- Success/positive (active status, upward trend labels): `#16A34A`
- Neutral/pending (gray-toned card border): `#94A3B8`
- Alert/urgent (red-toned card border, warnings): `#EF4444`
- Warning badge: background `#FEF3C7`, text `#D97706`
- Heading text: `#111827`
- Muted/secondary text: `#6B7280`

**Structural style:**
- Stat cards: white background, a colored **left border accent** (4px, using the palette above per card's meaning) rather than colored icon chips or gradients
- Small pill-shaped badges for tags/statuses (e.g. event type, OD status)
- Solid-color CTA buttons/blocks (not outlined, not gradient) using the primary/secondary accents
- Sidebar: white background, active nav item highlighted with a light tint of the primary accent plus the accent color for text/icon
- No glassmorphism, no blurred background blobs, no dark theme on dashboards — keep this clean, white, and light

**Important:** Do not change any copy, wording, field labels, or fonts from what's already defined in the plan file or the existing project — this is a palette and structural styling change only, applied strictly to the dashboard views.

---

Before writing code, confirm your understanding of the phase you're starting with and flag anything in the plan file that seems ambiguous or contradictory rather than silently guessing.
