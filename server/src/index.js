import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDatabase, getNextToken } from './db.js';
import {
  QUEUE_STATUSES,
  isValidStatusTransition,
  hasActiveSpot,
  pickNextCustomerForBarber,
  calculateEstimatedWait,
  annotateQueueWithWaitTimes,
} from './queueRules.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// CORS setup supporting both local dev and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize SQLite database
initDatabase();

// Helper to broadcast state updates to all connected clients
function broadcastQueueUpdate(alertData = null) {
  const state = getSalonState();
  io.emit('queue_updated', state);
  if (alertData) {
    io.emit('customer_called', alertData);
  }
}

// Function to assemble the full salon state
function getSalonState() {
  const barbers = db.prepare('SELECT * FROM barbers').all();
  const services = db.prepare('SELECT * FROM services WHERE is_active = 1').all();
  const queueSettings = db.prepare("SELECT value FROM settings WHERE key = 'online_queue_open'").get();
  const isOnlineQueueOpen = queueSettings ? queueSettings.value === '1' : true;

  // Active barbers count for wait-time calculation (on duty and not on break)
  const activeBarbers = barbers.filter(b => b.is_on_duty === 1 && b.status !== 'break');
  const activeBarbersCount = Math.max(activeBarbers.length, 1);

  // All active queue items: waiting, called, in_chair
  const rawWaitingQueue = db.prepare(`
    SELECT * FROM queue 
    WHERE status = '${QUEUE_STATUSES.WAITING}' 
    ORDER BY id ASC
  `).all().map(c => ({
    ...c,
    services: JSON.parse(c.services || '[]'),
  }));

  const waitingQueue = annotateQueueWithWaitTimes(rawWaitingQueue, activeBarbersCount);

  const activeChairQueue = db.prepare(`
    SELECT * FROM queue 
    WHERE status IN ('${QUEUE_STATUSES.CALLED}', '${QUEUE_STATUSES.IN_CHAIR}')
    ORDER BY id ASC
  `).all().map(c => ({
    ...c,
    services: JSON.parse(c.services || '[]'),
  }));

  // Barbers with enriched current customer information
  const enrichedBarbers = barbers.map(barber => {
    let currentCustomer = null;
    if (barber.current_ticket_id) {
      currentCustomer = db.prepare('SELECT * FROM queue WHERE id = ?').get(barber.current_ticket_id);
      if (currentCustomer) {
        currentCustomer.services = JSON.parse(currentCustomer.services || '[]');
      }
    }
    // Also find next customer specifically eligible for this barber
    const nextForBarber = pickNextCustomerForBarber(rawWaitingQueue, barber.name);

    return {
      ...barber,
      currentCustomer,
      nextCustomer: nextForBarber,
    };
  });

  const totalWaiting = waitingQueue.length;
  const totalWaitMinutes = waitingQueue.reduce((acc, c) => acc + (c.total_duration || 0), 0);
  const overallEstimatedWait = calculateEstimatedWait(totalWaitMinutes, activeBarbersCount);

  return {
    isOnlineQueueOpen,
    totalWaiting,
    overallEstimatedWait,
    activeBarbersCount,
    barbers: enrichedBarbers,
    services,
    waitingQueue,
    activeChairQueue,
  };
}

// REST API Endpoints

// 1. Get full state
app.get('/api/state', (req, res) => {
  try {
    const state = getSalonState();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get services list
app.get('/api/services', (req, res) => {
  try {
    const includeInactive = req.query.all === 'true';
    const query = includeInactive 
      ? 'SELECT * FROM services ORDER BY id ASC' 
      : 'SELECT * FROM services WHERE is_active = 1 ORDER BY id ASC';
    const services = db.prepare(query).all();
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get barbers list
app.get('/api/barbers', (req, res) => {
  try {
    const barbers = db.prepare('SELECT * FROM barbers').all();
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Join Queue (remote or walk-in)
app.post('/api/queue/join', (req, res) => {
  try {
    const { name, phone, serviceIds, preferredBarber, isWalkIn } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Valid 10-digit phone number is required' });
    }

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({ error: 'At least one service must be selected' });
    }

    if (serviceIds.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 services allowed' });
    }

    // Check if online queue is open
    const queueSetting = db.prepare("SELECT value FROM settings WHERE key = 'online_queue_open'").get();
    const isOnlineOpen = queueSetting ? queueSetting.value === '1' : true;
    if (!isOnlineOpen && !isWalkIn) {
      return res.status(403).json({ error: 'Online queue is closed. Walk-ins only.' });
    }

    // Check if phone already has an active spot
    const activeTickets = db.prepare(`
      SELECT * FROM queue 
      WHERE phone = ? AND status IN ('${QUEUE_STATUSES.WAITING}', '${QUEUE_STATUSES.CALLED}', '${QUEUE_STATUSES.IN_CHAIR}')
    `).all(cleanPhone);

    if (activeTickets.length > 0) {
      // Return existing spot without creating a duplicate
      const existing = activeTickets[0];
      return res.json({
        ticket: existing,
        message: 'Already in queue with this phone number',
        isExisting: true,
      });
    }

    // Fetch selected services
    const placeholders = serviceIds.map(() => '?').join(',');
    const services = db.prepare(`SELECT * FROM services WHERE id IN (${placeholders})`).all(...serviceIds);

    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0);
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const serviceNames = services.map(s => s.name_en);

    const token = getNextToken();
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO queue (
        token, customer_name, phone, preferred_barber, services,
        total_duration, total_price, status, is_walkin, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      token,
      name.trim(),
      cleanPhone,
      preferredBarber || 'Any',
      JSON.stringify(serviceNames),
      totalDuration,
      totalPrice,
      QUEUE_STATUSES.WAITING,
      isWalkIn ? 1 : 0,
      createdAt
    );

    const newTicket = db.prepare('SELECT * FROM queue WHERE id = ?').get(result.lastInsertRowid);
    newTicket.services = JSON.parse(newTicket.services);

    broadcastQueueUpdate();

    res.status(201).json({ ticket: newTicket, isExisting: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get customer ticket details & position
app.get('/api/queue/:identifier', (req, res) => {
  try {
    const { identifier } = req.params;
    let ticket = null;

    if (identifier.startsWith('S-')) {
      ticket = db.prepare('SELECT * FROM queue WHERE token = ?').get(identifier);
    } else if (!isNaN(Number(identifier))) {
      ticket = db.prepare('SELECT * FROM queue WHERE id = ?').get(Number(identifier));
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.services = JSON.parse(ticket.services || '[]');

    // If waiting, calculate current position and wait time
    if (ticket.status === QUEUE_STATUSES.WAITING) {
      const state = getSalonState();
      const waitingItem = state.waitingQueue.find(q => q.id === ticket.id);
      if (waitingItem) {
        ticket.position = waitingItem.position;
        ticket.estimated_wait = waitingItem.estimated_wait;
        ticket.is_second = waitingItem.is_second;
      }
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Cancel spot
app.post('/api/queue/:token/cancel', (req, res) => {
  try {
    const { token } = req.params;
    const ticket = db.prepare('SELECT * FROM queue WHERE token = ?').get(token);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!isValidStatusTransition(ticket.status, QUEUE_STATUSES.CANCELLED)) {
      return res.status(400).json({ 
        error: `Cannot cancel ticket with status '${ticket.status}'` 
      });
    }

    db.prepare('UPDATE queue SET status = ? WHERE id = ?').run(QUEUE_STATUSES.CANCELLED, ticket.id);

    broadcastQueueUpdate();
    res.json({ success: true, message: 'Ticket cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Receptionist / Barber: Call Next Customer
app.post('/api/queue/call-next', (req, res) => {
  try {
    const { barberName } = req.body;
    if (!barberName) {
      return res.status(400).json({ error: 'barberName is required' });
    }

    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(barberName);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    if (barber.current_ticket_id) {
      return res.status(400).json({ error: `${barberName} already has an active customer in chair` });
    }

    // Get all waiting customers ordered by id (FCFS)
    const waitingList = db.prepare(`
      SELECT * FROM queue WHERE status = '${QUEUE_STATUSES.WAITING}' ORDER BY id ASC
    `).all();

    // Use queueRules to select the customer
    const nextCustomer = pickNextCustomerForBarber(waitingList, barberName);

    if (!nextCustomer) {
      return res.status(404).json({ error: 'No eligible customer in queue for ' + barberName });
    }

    const calledAt = new Date().toISOString();

    db.prepare(`
      UPDATE queue 
      SET status = '${QUEUE_STATUSES.CALLED}', assigned_barber = ?, called_at = ?
      WHERE id = ?
    `).run(barberName, calledAt, nextCustomer.id);

    db.prepare(`
      UPDATE barbers 
      SET status = 'busy', current_ticket_id = ?
      WHERE name = ?
    `).run(nextCustomer.id, barberName);

    broadcastQueueUpdate({
      token: nextCustomer.token,
      customerName: nextCustomer.customer_name,
      barberName: barberName,
    });

    res.json({
      success: true,
      calledCustomer: {
        ...nextCustomer,
        assigned_barber: barberName,
        status: QUEUE_STATUSES.CALLED,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Barber: Start Service (called -> in_chair)
app.post('/api/barber/start', (req, res) => {
  try {
    const { barberName } = req.body;
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(barberName);
    if (!barber || !barber.current_ticket_id) {
      return res.status(400).json({ error: 'No active ticket for this barber to start' });
    }

    const ticket = db.prepare('SELECT * FROM queue WHERE id = ?').get(barber.current_ticket_id);
    if (!ticket || !isValidStatusTransition(ticket.status, QUEUE_STATUSES.IN_CHAIR)) {
      return res.status(400).json({ error: 'Invalid transition to in_chair' });
    }

    const startedAt = new Date().toISOString();
    db.prepare(`UPDATE queue SET status = '${QUEUE_STATUSES.IN_CHAIR}', started_at = ? WHERE id = ?`)
      .run(startedAt, ticket.id);
    db.prepare(`UPDATE barbers SET service_started_at = ? WHERE id = ?`)
      .run(startedAt, barber.id);

    broadcastQueueUpdate();
    res.json({ success: true, startedAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Barber: Done Service (in_chair -> done)
app.post('/api/barber/done', (req, res) => {
  try {
    const { barberName } = req.body;
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(barberName);
    if (!barber || !barber.current_ticket_id) {
      return res.status(400).json({ error: 'No customer currently in chair' });
    }

    const ticket = db.prepare('SELECT * FROM queue WHERE id = ?').get(barber.current_ticket_id);
    if (!ticket || !isValidStatusTransition(ticket.status, QUEUE_STATUSES.DONE)) {
      return res.status(400).json({ error: 'Invalid transition to done' });
    }

    const completedAt = new Date().toISOString();
    db.prepare(`UPDATE queue SET status = '${QUEUE_STATUSES.DONE}', completed_at = ? WHERE id = ?`)
      .run(completedAt, ticket.id);
    db.prepare(`UPDATE barbers SET status = 'free', current_ticket_id = NULL, service_started_at = NULL WHERE id = ?`)
      .run(barber.id);

    broadcastQueueUpdate();
    res.json({ success: true, message: 'Service completed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Mark No-Show (called -> no_show)
app.post('/api/queue/no-show', (req, res) => {
  try {
    const { ticketId, barberName } = req.body;
    const ticket = db.prepare('SELECT * FROM queue WHERE id = ?').get(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (!isValidStatusTransition(ticket.status, QUEUE_STATUSES.NO_SHOW)) {
      return res.status(400).json({ error: 'Can only mark as no-show when status is called' });
    }

    db.prepare(`UPDATE queue SET status = '${QUEUE_STATUSES.NO_SHOW}' WHERE id = ?`).run(ticket.id);

    // Free the barber if assigned
    if (barberName) {
      db.prepare(`
        UPDATE barbers 
        SET status = 'free', current_ticket_id = NULL, service_started_at = NULL 
        WHERE name = ?
      `).run(barberName);
    } else {
      db.prepare(`
        UPDATE barbers 
        SET status = 'free', current_ticket_id = NULL, service_started_at = NULL 
        WHERE current_ticket_id = ?
      `).run(ticket.id);
    }

    broadcastQueueUpdate();
    res.json({ success: true, message: 'Marked as no-show' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Toggle Barber Break Status
app.post('/api/barber/break-toggle', (req, res) => {
  try {
    const { barberName } = req.body;
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(barberName);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const newStatus = barber.status === 'break' ? 'free' : 'break';
    db.prepare('UPDATE barbers SET status = ? WHERE id = ?').run(newStatus, barber.id);

    broadcastQueueUpdate();
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Admin: Toggle Online Queue
app.post('/api/admin/toggle-queue', (req, res) => {
  try {
    const current = db.prepare("SELECT value FROM settings WHERE key = 'online_queue_open'").get();
    const newValue = current?.value === '1' ? '0' : '1';
    db.prepare("UPDATE settings SET value = ? WHERE key = 'online_queue_open'").run(newValue);

    broadcastQueueUpdate();
    res.json({ success: true, isOpen: newValue === '1' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Admin: Toggle Barber On-Duty
app.post('/api/admin/toggle-barber-duty', (req, res) => {
  try {
    const { barberId } = req.body;
    const barber = db.prepare('SELECT * FROM barbers WHERE id = ?').get(barberId);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }

    const newDuty = barber.is_on_duty === 1 ? 0 : 1;
    db.prepare('UPDATE barbers SET is_on_duty = ? WHERE id = ?').run(newDuty, barber.id);

    broadcastQueueUpdate();
    res.json({ success: true, is_on_duty: newDuty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Admin: Toggle Service Active
app.post('/api/admin/toggle-service', (req, res) => {
  try {
    const { serviceId } = req.body;
    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const newActive = service.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE services SET is_active = ? WHERE id = ?').run(newActive, service.id);

    broadcastQueueUpdate();
    res.json({ success: true, is_active: newActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Admin: Stats
app.get('/api/admin/stats', (req, res) => {
  try {
    const servedCount = db.prepare(`SELECT count(*) as count FROM queue WHERE status = '${QUEUE_STATUSES.DONE}'`).get().count;
    const noShowCount = db.prepare(`SELECT count(*) as count FROM queue WHERE status = '${QUEUE_STATUSES.NO_SHOW}'`).get().count;

    // Calculate average wait time for finished customers
    const finishedWithTimes = db.prepare(`
      SELECT total_duration FROM queue WHERE status = '${QUEUE_STATUSES.DONE}'
    `).all();

    const avgWait = finishedWithTimes.length > 0 
      ? Math.round(finishedWithTimes.reduce((acc, c) => acc + c.total_duration, 0) / finishedWithTimes.length)
      : 15;

    res.json({
      customersServed: servedCount,
      noShows: noShowCount,
      avgWaitTime: avgWait,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket connection handling
io.on('connection', (socketClient) => {
  // Send initial state on connection
  socketClient.emit('queue_updated', getSalonState());
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
