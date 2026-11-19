import { Router, Request, Response } from 'express';
import { QueueService } from '../services/queueService.js';
import { io } from '../index.js';

export const queueRouter = Router();

function broadcastQueueUpdate(calledInfo?: { token: string; barber: string }) {
  try {
    const queue = QueueService.getQueue();
    const barbers = QueueService.getBarbers();
    const stats = QueueService.getTodayStats();
    const isOnlineOpen = QueueService.isOnlineQueueOpen();

    io.emit('queue:updated', { queue, barbers, stats, isOnlineOpen });

    if (calledInfo) {
      io.emit('ticket:called', calledInfo);
    }
  } catch (err) {
    console.error('Error broadcasting socket update:', err);
  }
}

// GET /api/services
queueRouter.get('/services', (_req: Request, res: Response) => {
  try {
    const services = QueueService.getServices();
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PUT /api/services/:id
queueRouter.put('/services/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { is_active, price, duration } = req.body;
    QueueService.updateService(id, is_active, price, duration);
    const services = QueueService.getServices();
    res.json({ success: true, services });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/barbers
queueRouter.get('/barbers', (_req: Request, res: Response) => {
  try {
    const barbers = QueueService.getBarbers();
    res.json({ barbers });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/barbers/:name/toggle-break
queueRouter.post('/barbers/:name/toggle-break', (req: Request, res: Response) => {
  try {
    const barber = QueueService.toggleBarberBreak(req.params.name);
    broadcastQueueUpdate();
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/barbers/:name/toggle-duty
queueRouter.post('/barbers/:name/toggle-duty', (req: Request, res: Response) => {
  try {
    const barber = QueueService.toggleBarberDuty(req.params.name);
    broadcastQueueUpdate();
    res.json({ barber });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/queue
queueRouter.get('/queue', (_req: Request, res: Response) => {
  try {
    const queue = QueueService.getQueue();
    const barbers = QueueService.getBarbers();
    const stats = QueueService.getTodayStats();
    const isOnlineOpen = QueueService.isOnlineQueueOpen();
    res.json({ queue, barbers, stats, isOnlineOpen });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/queue/stats
queueRouter.get('/queue/stats', (_req: Request, res: Response) => {
  try {
    const stats = QueueService.getTodayStats();
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/queue/ticket/:tokenOrId
queueRouter.get('/queue/ticket/:tokenOrId', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.getTicket(req.params.tokenOrId);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/queue/phone/:phone
queueRouter.get('/queue/phone/:phone', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.getActiveTicketByPhone(req.params.phone);
    res.json({ ticket });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/queue/join
queueRouter.post('/queue/join', (req: Request, res: Response) => {
  try {
    const { customer_name, phone, preferred_barber, service_names, is_walkin } = req.body;
    const ticket = QueueService.joinQueue({
      customer_name,
      phone,
      preferred_barber,
      service_names,
      is_walkin,
    });
    broadcastQueueUpdate();
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/queue/call-next
queueRouter.post('/queue/call-next', (req: Request, res: Response) => {
  try {
    const { barber } = req.body;
    if (!barber) return res.status(400).json({ error: 'Barber name required' });

    const ticket = QueueService.callNext(barber);
    if (!ticket) {
      return res.status(404).json({ error: `No waiting customers for barber ${barber} or Any` });
    }

    broadcastQueueUpdate({ token: ticket.token, barber });
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/queue/:token/start
queueRouter.post('/queue/:token/start', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.startService(req.params.token);
    broadcastQueueUpdate();
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/queue/:token/done
queueRouter.post('/queue/:token/done', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.doneService(req.params.token);
    broadcastQueueUpdate();
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/queue/:token/cancel
queueRouter.post('/queue/:token/cancel', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.cancelTicket(req.params.token);
    broadcastQueueUpdate();
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// POST /api/queue/:token/noshow
queueRouter.post('/queue/:token/noshow', (req: Request, res: Response) => {
  try {
    const ticket = QueueService.markNoShow(req.params.token);
    broadcastQueueUpdate();
    res.json({ ticket });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// GET & POST /api/settings/queue-open
queueRouter.get('/settings/queue-open', (_req: Request, res: Response) => {
  try {
    const isOpen = QueueService.isOnlineQueueOpen();
    res.json({ isOpen });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

queueRouter.post('/settings/queue-open', (req: Request, res: Response) => {
  try {
    const { isOpen } = req.body;
    QueueService.setOnlineQueueOpen(Boolean(isOpen));
    broadcastQueueUpdate();
    res.json({ isOpen: QueueService.isOnlineQueueOpen() });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
