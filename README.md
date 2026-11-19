# Salon Queue Management System

**Live demo:** [Live URL placeholder]
**Hosted on:** Vercel (client) + Render (server)

## About
Queue management system for a salon:
- Customers join from their mobile device, track estimated wait times, and receive real-time alerts.
- Receptionists and barbers manage queues and chair assignments.
- Waiting area TV displays active tokens and upcoming queue numbers.
- Bilingual interface with full English and Gujarati support.

## Stack
- **Client:** React + Vite + TypeScript + Tailwind CSS (Charcoal `#1F2937` + Gold `#D4A017` theme)
- **Server:** Node.js + Express + TypeScript + SQLite (`better-sqlite3`) + Socket.IO
- **Architecture:** Monorepo with modular server (routes, services, db, sockets, config)

## Run Commands

### Install All Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### Run Locally (Development)
Starts both server (port 3001) and client (port 5173) concurrently:
```bash
npm run dev
```

### Test API Health Check
```bash
curl http://localhost:3001/api/health
# Returns: {"status":"ok","db":"ok"}
```

### Build for Production
Compiles both server TypeScript and Vite client bundles:
```bash
npm run build
```
