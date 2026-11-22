# AGENTS.md — LUXE CUTS Architecture Rules
## Instructions for AI Agents & Developers

### Project Overview
LUXE CUTS is a production-grade, real-time salon queue orchestration platform built with React + Vite + TypeScript + Tailwind CSS + Node.js.

### Core Working Rules
1. **Design System (Anti-Generic / Bespoke Look):**
   - Theme must be **Dynamic Blue & White**: Pure White (`#FFFFFF`), Ice Blue (`#F0F7FF`), Royal Sapphire (`#1D4ED8`, `#2563EB`), Sky Blue (`#0284C7`), Deep Marine Navy (`#0A192F`).
   - Use ambient living orbs (`.ambient-bg`) and elevated interactive cards (`.dynamic-card`).
   - Do NOT use generic template aesthetics.
2. **State Management & Storage:**
   - All shared queue state lives in Zustand `queueStore.ts`.
   - Real-time updates utilize a 3-layer architecture:
     1. Node.js backend server (`server/server.js`) on port 3001 with persistent JSON DB and Server-Sent Events (`/api/events`).
     2. Supabase PostgreSQL cloud sync via `@supabase/supabase-js`.
     3. Cross-tab `BroadcastChannel` fallback.
3. **Audio & Sensory Feedback:**
   - Web Audio API pure synthesizer (528 Hz / 1056 Hz harmonic tone) for chime alerts.
   - Canvas physics engine for feedback confetti.
4. **Security & Routes:**
   - Route guard `ProtectedRoute.tsx` protects `/admin` and `/analytics`.
   - Store session in `useAuthStore.ts` with PIN `7788` or Email `admin@luxecuts.com` / `luxe2026`.
