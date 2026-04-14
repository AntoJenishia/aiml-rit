# AIML Department Website — Phase 1 (Static Frontend)

A premium, responsive static department website for the Artificial Intelligence & Machine Learning (AIML) department built with **Next.js App Router**, **TypeScript (strict)**, **Tailwind CSS**, **framer-motion**, and **clsx**.

## Prerequisites

- Node.js 18+ (recommended)
- npm 9+

## Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Lint via Next.js ESLint

## Folder Structure (Summary)

```text
src/
  app/
    layout.tsx
    page.tsx
    about/page.tsx
    hod/page.tsx
    faculty/page.tsx
    syllabus/page.tsx
    events/page.tsx
    achievements/page.tsx
    contact/page.tsx
  components/
    Navbar.tsx
    Footer.tsx
    HeroSection.tsx
    StatCard.tsx
    FacultyCard.tsx
    EventCard.tsx
    AchievementCard.tsx
    HodTeaserCard.tsx
    AnimatedBlob.tsx
    SectionHeading.tsx
  data/
    about.ts
    hod.ts
    faculty.ts
    events.ts
    achievements.ts
    syllabus.ts
    stats.ts
    quickLinks.ts
  lib/
    types.ts
    icons.ts
```

## Data & Types Rules (Implemented)

- All page content is sourced from `src/data/*.ts`.
- All data shapes are defined in `src/lib/types.ts`.
- All animations are implemented with `framer-motion`.
- Conditional class merging uses `clsx`.
