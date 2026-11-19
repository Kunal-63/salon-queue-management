# AGENTS.md — Salon Queue Management

Queue app for a salon: customers join from their phone, see wait time and get
called; reception and barbers manage the queue; a TV shows who is next.

## Read first
- docs/01-brief.md -> features + what NOT to build
- docs/02-screens.md -> every screen's layout and behaviour
- docs/03-flows-rules.md -> flows, queue rules, test checklist

## Stack
React + Vite + TypeScript + Tailwind (client/), Node + Express + Socket.IO +
SQLite (server/). Run everything with `npm run dev`.
Hosting: Vercel (client), Render (server). No localhost URLs in code; use
environment variables.

## How to work
- One screen or one feature per task. Don't touch other screens.
- Theme: charcoal #1F2937 + gold #D4A017, rounded cards, mobile-first.
- All labels come from the EN/GU language file; no hard-coded text.
- Queue rules live in ONE module on the server; reuse them everywhere.
- The server is the source of truth; the client never calculates queue order.
- Never add features from the "Don't build" list.
- Run the app and test before saying anything works.
- After each task: list changed files and how to test, then commit.
