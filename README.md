# Salon Queue Management System — LUXE CUTS

**Live demo:** https://salon-queue-management.vercel.app  
**Hosted on:** Vercel (frontend) + Render / Node.js (backend) + Supabase (database)

### Staff / Concierge Test Credentials
- **Admin PIN:** `7788` *(instant one-click passkey)*
- **Concierge Email:** `admin@luxecuts.com`
- **Concierge Password:** `luxe2026` *(or `admin` / `luxe`)*

---

## ✂️ About LUXE CUTS

**LUXE CUTS** is a production-grade, real-time queue orchestration and salon floor management platform designed to replace paper token slips, eliminate walkouts, and streamline stylist workflows.

Built with a bespoke **Dynamic Blue & White Design System**, zero-dependency Web Audio Solfeggio frequency chime alerts, live Server-Sent Events (SSE) data streaming, persistent JSON/PostgreSQL databases, and role-based concierge authentication.

---

## 🎨 Aesthetic & Design System

- **Color Palette (Blue & White):**
  - **Pure & Ice Whites:** `#FFFFFF`, `#F8FAFC`, `#F0F7FF`, `#EBF4FC`
  - **Royal Sapphire:** `#1D4ED8`, `#2563EB`, `#3B82F6`
  - **Sky Blue Accents:** `#0284C7`, `#38BDF8`, `#06B6D4`
  - **Deep Marine Navy:** `#0A192F`
- **Living Dynamic Elements:**
  - Dynamic ambient glowing orbs (`.ambient-bg`, keyframes `float-slow`, `blob`)
  - Elevated dynamic interactive cards with soft blue glow on hover (`.dynamic-card`)
  - Animated SVG circular progress rings tracking elapsed wait time
  - Global floating real-time event toasts (`LiveToast.tsx`)
- **Typography:**
  - Display titles: *Playfair Display* (luxury editorial serif)
  - Interface text & numbers: *Inter* (crisp, high-legibility grotesque sans)
- **Zero-Dependency Web Audio Chime:**
  - Harmonics synthesized in pure browser code (528 Hz + 1056 Hz Solfeggio tones) without any external audio asset files.
- **Canvas Physics Confetti:**
  - Interactive multi-particle celebration burst on 5-star customer feedback submissions.

---

## ⚡ Multi-Tier Real-Time & Database Architecture

1. **Node.js HTTP Server (`server/server.js`) on Port 3001:**
   - Persistent file-based JSON storage saved at `server/data/database.json`.
   - **Server-Sent Events (SSE)** endpoint at `/api/events` broadcasting state changes in real time across all displays and stations.
   - RESTful endpoints for token booking, stylist calls, completion, absence marking, stylist status, and database resets.
2. **Supabase PostgreSQL Cloud Integration (Optional):**
   - Direct integration via `@supabase/supabase-js`.
   - Schema, row-level security (RLS), and sample seeds included in [`supabase-schema.sql`](./supabase-schema.sql).
3. **Cross-Tab Web BroadcastChannel Engine:**
   - Zero-configuration real-time sync across multiple browser tabs and windows even if running completely offline.

---

## 🧭 Complete Route Map

| URL Path | Screen Name | Description |
| :--- | :--- | :--- |
| `/join` | **Guest Check-In** | Dynamic multi-service picker, price & duration ticker, stylist recommendation, English / Hindi toggle |
| `/token/:id` | **Live Patron Token** | SVG circular progress ring, dynamic elapsed minute counter, status stepper, cancel modal |
| `/display` | **TV Calling Board** | High-contrast Marine Navy display for lounge TV screens, animated audio visualizer, sound switch |
| `/barber/:id` | **Stylist Cockpit** | Dedicated console for Zara, Marcus, or Dev; service pace bar, overtime warning, break toggle |
| `/login` | **Concierge Login** | PIN / Email toggle with demo quick-fill buttons and error states |
| `/admin` | **Concierge Command** | Live queue ledger, real-time search & filters, walk-in modal, QR code popover, automated patron simulator |
| `/analytics` | **Stylist Analytics** | Hourly footfall histogram, service distribution bar chart, CSV export |
| `/feedback/:token` | **Patron Review** | 5-star interactive rating with canvas physics confetti celebration |
| `/closed` | **Lounge Closure** | Evening closing screen showing operating hours and morning return countdown |

---

## 🚀 Quickstart & Running Locally

### 1. Unified Concurrent Startup (Frontend + Backend Server)
Both the Node.js API server (`localhost:3001`) and the Vite development server (`localhost:5173`) start concurrently with one single command:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Standalone Commands
- **Frontend only:** `npm run client` (starts Vite on `http://localhost:5173`)
- **Backend server only:** `npm run server` (starts Node.js API on `http://localhost:3001`)
- **Production build:** `npm run build` (type-checks and bundles to `/dist`)

---

## 📡 Backend REST API Endpoints

- `GET /api/health` — Server health check and active queue stats
- `GET /api/events` — Server-Sent Events (SSE) live data stream
- `POST /api/auth/login` — Authenticate concierge session
- `GET /api/queue` — Fetch full current queue and stylist rosters
- `POST /api/queue/join` — Check in a new patron
- `POST /api/queue/call-next` — Stylist station calls next waiting customer
- `POST /api/queue/mark-done` — Complete current haircut / spa session
- `POST /api/queue/mark-absent` — Mark customer as absent / canceled
- `POST /api/barbers/status` — Set stylist status (`available`, `busy`, `break`, `off`)
- `POST /api/database/reset` — Restore database to initial default sample state

---

## 📁 Repository Structure

```
salon-queue-management/
├── AGENTS.md                   # AI Agent and Developer working rules
├── README.md                   # Project overview, credentials, routes, API docs
├── prompts.md                  # Complete log of prompts used during development
├── reflection.md               # Half-page reflection on vibe coding process
├── supabase-schema.sql         # PostgreSQL DDL schema & seed data
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Project dependencies and concurrent scripts
├── vite.config.ts              # Vite config with API proxy
├── tailwind.config.js          # Blue & White design system configuration
├── docs/
│   ├── 01-brief.md             # Project brief, scope, users, features
│   ├── 02-screens.md           # Full 9-screen specifications
│   └── 03-flows-rules.md       # Queue logic, business invariants, test checklist
├── server/
│   ├── server.js               # Node.js HTTP + SSE backend server
│   └── data/database.json      # Persistent local database store
└── src/
    ├── App.tsx                 # Master routing, ambient orbs, protected routes
    ├── index.css               # Design system variables and living animations
    ├── components/             # Reusable UI, QR Code, and Live Toasts
    ├── pages/                  # All 9 screens
    ├── stores/                 # Zustand queueStore & authStore
    └── lib/                    # Audio synthesizer, confetti engine, Supabase client
```
