# Prompts Log — Salon Queue Management System
## Complete Chronological Prompt Record

- **Student:** Kunal Adwani | **Roll Number:** 202612050 | **Program:** MSc IT (Sem 1)

---

---

### Step 1 — Initial Lab Prompt & Scope Expansion
**Prompt:**
> *"@[Salon_Queue_Management_Vibe_Coding_Guide.pdf] we have to do this, in this dont copy exact prompts given, add something from your end make it bigger, and theme should be changes obv, ADD THINGS TO GIVEN, AND CHANGE THE GENERIC THINGS, ALSO DO WHATEVER YOU WANT"*

**Outcome:**
- Analyzed the assignment PDF (MSc IT Lab Handout).
- Designed a comprehensive 12-module Vibe Coding guide (`LuxeCuts_VibeCoding_Guide.md`, ~2,064 lines).
- Upgraded the fictional salon to **LUXE CUTS**, expanded from 5 generic screens to 9 dedicated screens, added procedural audio chime synthesis, analytics histograms, and customer feedback with canvas confetti.

---

### Step 2 — Anti-Generic Bespoke Aesthetic
**Prompt:**
> *"now do it, make sure it doesnt look AI from looks"*

**Outcome:**
- Established custom CSS variables, editorial typography pairing (*Playfair Display* serif headlines + *Inter* grotesque tabular font), micro-animations, glassmorphism cards, and zero-dependency Web Audio Solfeggio 528 Hz chime generator.

---

### Step 3 — Full Project Implementation
**Prompt:**
> *"continue on making whole project"*

**Outcome:**
- Scaffolded modern React + Vite + TypeScript application in `luxe-cuts/`.
- Created components for all screens: `JoinQueue.tsx`, `CustomerToken.tsx`, `LiveDisplay.tsx`, `BarberDashboard.tsx`, `AdminDashboard.tsx`, `BarberAnalytics.tsx`, `CustomerFeedback.tsx`, `QueueClosed.tsx`, `NotFound.tsx`.
- Integrated Zustand stores (`queueStore.ts`, `authStore.ts`).

---

### Step 4 — Blue & White Theme + Database Connection
**Prompt:**
> *"change theme to blue and white, and little bit shades of blue, also make everything dynamic and working connect it with DB"*

**Outcome:**
- Refactored entire design system to **Blue and White** with rich blue shades (Pure White `#FFFFFF`, Ice Blue `#F0F7FF`, Royal Sapphire `#1D4ED8`/`#2563EB`, Sky Blue `#0284C7`, Deep Marine Navy `#0A192F`).
- Built persistent Node.js backend server (`server/server.js`) with JSON database storage at `server/data/database.json`.
- Integrated Supabase PostgreSQL client (`src/lib/supabase.ts`) and wrote `supabase-schema.sql`.

---

### Step 5 — Dynamic Living Design & Real-Time Enhancements
**Prompt:**
> *"MAKE THE DESIGN DYNAMIC"*

**Outcome:**
- Added dynamic glowing ambient background orbs (`.ambient-bg`).
- Added animated SVG circular progress ring for live queue countdown on the token screen.
- Created `LiveToastContainer` and `LiveToast.tsx` for real-time notifications across the entire app.
- Built active audio visualizer bars on the wall TV display (`LiveDisplay.tsx`).
- Created dynamic automated patron simulator in `AdminDashboard.tsx`.

---

### Step 6 — Backend Sync & Admin Authentication
**Prompt:**
> *"connect it with backend and database to make it working, add login page for admin as well and other things as well"*

**Outcome:**
- Created `AdminLogin.tsx` (`/login`) with dual PIN (`7788`) and Email/Password (`admin@luxecuts.com` / `luxe2026`) authentication.
- Created `ProtectedRoute.tsx` route guard.
- Added Server-Sent Events (SSE) stream (`/api/events`) in `server/server.js`.
- Connected Zustand store `queueStore.ts` directly to REST endpoints (`/api/queue/join`, `/api/queue/call-next`, `/api/queue/mark-done`, `/api/queue/mark-absent`, `/api/barbers/status`, `/api/database/reset`).
- Added Sign Out buttons in `AdminDashboard.tsx` and `BarberAnalytics.tsx`.

---

### Step 7 — Git & Assignment Delivery
**Prompt:**
> *"upload it to the github - https://github.com/Kunal-63/salon-queue-management.git and check everything mentioned in the assignment is done"*

**Outcome:**
- Verified all assignment requirements from the handout.
- Formatted `README.md`, `prompts.md`, `reflection.md`, `AGENTS.md`, and `docs/`.
- Configured git remote and pushed the repository.
