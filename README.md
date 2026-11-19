# Salon Queue Management System

**Live demo:** https://salon-queue-demo.vercel.app  
**Hosted on:** Vercel (frontend) + Render (backend)  
**Test PIN / Access:** Open access for staff demo (or 1234)

## About
Queue app for a salon:
- Customers join from their mobile phone, select services, choose preferred barber (or 'Any'), view live queue position, circular countdown, and get real-time 'Start coming' & 'It's your turn!' alerts.
- Receptionists manage the queue, call next customer by barber preference (FCFS), add walk-ins, and mark no-shows.
- Barbers manage their chair with start/done buttons and break status.
- Waiting Area TV displays active customer per barber and up next tokens with chimes.
- Salon owner manages active services, prices, barbers on duty, and opens/closes the online queue.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + Socket.IO + SQLite (`better-sqlite3`)
- Single queue rules engine on the server
- Full English and Gujarati (EN/GU) bilingual support

## Quick Start
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Run both client and server concurrently
npm run dev
```

- Client: http://localhost:5173
- Server API: http://localhost:3001
