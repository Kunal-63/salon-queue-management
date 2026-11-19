import { db } from '../db/index.js';

export interface ServiceItem {
  id: number;
  name_en: string;
  name_gu: string;
  duration: number;
  price: number;
  is_active: number;
}

export interface BarberItem {
  id: number;
  name: string;
  is_on_duty: number;
  status: string; // 'free' | 'busy' | 'break' | 'calling'
  current_ticket_id: number | null;
  service_started_at: string | null;
  current_customer_name?: string;
  current_token?: string;
}

export interface QueueTicket {
  id: number;
  token: string;
  customer_name: string;
  phone: string;
  preferred_barber: string;
  assigned_barber: string | null;
  services: string; // JSON array of service names or IDs
  total_duration: number;
  total_price: number;
  status: 'waiting' | 'called' | 'in_chair' | 'done' | 'cancelled' | 'noshow';
  is_walkin: number;
  created_at: string;
  called_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  position?: number;
  estimated_wait?: number;
}

export class QueueService {
  /**
   * Health check database verification
   */
  static verifyDbHealth(): boolean {
    const result = db.prepare('SELECT 1 as alive').get() as { alive: number } | undefined;
    return !!result && result.alive === 1;
  }

  /**
   * Seed demo data if queue is empty
   */
  static seedDemoDataIfEmpty(): void {
    const count = (db.prepare('SELECT COUNT(*) as count FROM queue').get() as { count: number }).count;
    if (count > 0) return;

    // Seed realistic initial state matching docs/02-screens.md
    const now = new Date();
    const iso = (minsAgo: number) => new Date(now.getTime() - minsAgo * 60000).toISOString();

    // Ravi busy with S-12
    // Amit free
    // Imran on break
    const insertTicket = db.prepare(`
      INSERT INTO queue (
        token, customer_name, phone, preferred_barber, assigned_barber,
        services, total_duration, total_price, status, is_walkin, created_at, called_at, started_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // S-12: in chair with Ravi
    insertTicket.run('S-12', 'Arjun Patel', '9876543210', 'Ravi', 'Ravi', JSON.stringify(['Haircut', 'Beard trim']), 45, 230, 'in_chair', 0, iso(40), iso(25), iso(20));

    // Waiting queue: 6 people waiting (S-13 to S-18)
    insertTicket.run('S-13', 'Devendra Shah', '9822334455', 'Any', null, JSON.stringify(['Haircut']), 30, 150, 'waiting', 0, iso(35), null, null);
    insertTicket.run('S-14', 'Kunal Sharma', '9898989898', 'Amit', null, JSON.stringify(['Haircut', 'Hair spa']), 75, 550, 'waiting', 0, iso(30), null, null);
    insertTicket.run('S-15', 'Vikram Joshi', '9711223344', 'Ravi', null, JSON.stringify(['Haircut']), 30, 150, 'waiting', 1, iso(25), null, null);
    insertTicket.run('S-16', 'Rahul Mehta', '9655443322', 'Any', null, JSON.stringify(['Beard trim', 'Shave']), 35, 180, 'waiting', 0, iso(20), null, null);
    insertTicket.run('S-17', 'Samir Desai', '9544332211', 'Any', null, JSON.stringify(['Hair color']), 60, 600, 'waiting', 0, iso(15), null, null);
    insertTicket.run('S-18', 'Pooja Trivedi', '9433221100', 'Amit', null, JSON.stringify(['Haircut', 'Hair spa']), 75, 550, 'waiting', 0, iso(10), null, null);

    // Completed tickets earlier today
    insertTicket.run('S-09', 'Nilesh Dave', '9123456780', 'Ravi', 'Ravi', JSON.stringify(['Haircut']), 30, 150, 'done', 0, iso(90), iso(80), iso(75));
    insertTicket.run('S-10', 'Bhavin Patel', '9123456781', 'Amit', 'Amit', JSON.stringify(['Shave']), 20, 100, 'done', 1, iso(80), iso(70), iso(65));
    insertTicket.run('S-11', 'Chirag Rana', '9123456782', 'Imran', 'Imran', JSON.stringify(['Beard trim']), 15, 80, 'done', 0, iso(70), iso(60), iso(55));

    // Update Barbers
    db.prepare("UPDATE barbers SET status = 'busy', current_ticket_id = 1, service_started_at = ? WHERE name = 'Ravi'").run(iso(20));
    db.prepare("UPDATE barbers SET status = 'free', current_ticket_id = NULL, service_started_at = NULL WHERE name = 'Amit'").run();
    db.prepare("UPDATE barbers SET status = 'break', current_ticket_id = NULL, service_started_at = NULL WHERE name = 'Imran'").run();

    // Sequence
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('token_sequence', '18')").run();
  }

  static getServices(): ServiceItem[] {
    return db.prepare('SELECT * FROM services ORDER BY id ASC').all() as ServiceItem[];
  }

  static updateService(id: number, is_active: number, price?: number, duration?: number): void {
    if (price !== undefined && duration !== undefined) {
      db.prepare('UPDATE services SET is_active = ?, price = ?, duration = ? WHERE id = ?').run(is_active, price, duration, id);
    } else {
      db.prepare('UPDATE services SET is_active = ? WHERE id = ?').run(is_active, id);
    }
  }

  static getBarbers(): BarberItem[] {
    const barbers = db.prepare('SELECT * FROM barbers ORDER BY id ASC').all() as BarberItem[];
    for (const b of barbers) {
      if (b.current_ticket_id) {
        const t = db.prepare('SELECT customer_name, token FROM queue WHERE id = ?').get(b.current_ticket_id) as { customer_name: string; token: string } | undefined;
        if (t) {
          b.current_customer_name = t.customer_name;
          b.current_token = t.token;
        }
      }
    }
    return barbers;
  }

  static toggleBarberBreak(name: string): BarberItem {
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(name) as BarberItem | undefined;
    if (!barber) throw new Error(`Barber ${name} not found`);

    const newStatus = barber.status === 'break' ? 'free' : 'break';
    db.prepare('UPDATE barbers SET status = ? WHERE name = ?').run(newStatus, name);
    return { ...barber, status: newStatus };
  }

  static toggleBarberDuty(name: string): BarberItem {
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(name) as BarberItem | undefined;
    if (!barber) throw new Error(`Barber ${name} not found`);

    const newDuty = barber.is_on_duty ? 0 : 1;
    db.prepare('UPDATE barbers SET is_on_duty = ? WHERE name = ?').run(newDuty, name);
    return { ...barber, is_on_duty: newDuty };
  }

  static getQueue(): QueueTicket[] {
    const tickets = db.prepare(`
      SELECT * FROM queue 
      WHERE status IN ('waiting', 'called', 'in_chair') 
      ORDER BY 
        CASE status 
          WHEN 'in_chair' THEN 1 
          WHEN 'called' THEN 2 
          WHEN 'waiting' THEN 3 
        END ASC,
        id ASC
    `).all() as QueueTicket[];

    return this.enrichQueueWithWaitTimes(tickets);
  }

  static enrichQueueWithWaitTimes(tickets: QueueTicket[]): QueueTicket[] {
    const onDutyBarbersCount = (db.prepare("SELECT COUNT(*) as count FROM barbers WHERE is_on_duty = 1 AND status != 'break'").get() as { count: number }).count || 1;

    let cumulativeWaitingDuration = 0;
    let waitingPos = 0;

    return tickets.map((ticket) => {
      if (ticket.status === 'waiting') {
        waitingPos += 1;
        cumulativeWaitingDuration += ticket.total_duration;
        const estWait = Math.max(5, Math.round(cumulativeWaitingDuration / Math.max(1, onDutyBarbersCount)));
        return {
          ...ticket,
          position: waitingPos,
          estimated_wait: estWait,
        };
      }
      return {
        ...ticket,
        position: 0,
        estimated_wait: 0,
      };
    });
  }

  static getTicket(tokenOrId: string | number): QueueTicket | null {
    let ticket: QueueTicket | undefined;
    if (typeof tokenOrId === 'number' || !isNaN(Number(tokenOrId))) {
      ticket = db.prepare('SELECT * FROM queue WHERE id = ?').get(tokenOrId) as QueueTicket | undefined;
    }
    if (!ticket) {
      ticket = db.prepare('SELECT * FROM queue WHERE token = ? COLLATE NOCASE').get(String(tokenOrId)) as QueueTicket | undefined;
    }
    if (!ticket) return null;

    // Calculate position and estimated wait
    if (ticket.status === 'waiting') {
      const allWaiting = db.prepare("SELECT id, total_duration FROM queue WHERE status = 'waiting' ORDER BY id ASC").all() as { id: number; total_duration: number }[];
      let pos = 0;
      let durationAhead = 0;
      for (const w of allWaiting) {
        pos++;
        if (w.id === ticket.id) break;
        durationAhead += w.total_duration;
      }
      const onDutyBarbers = (db.prepare("SELECT COUNT(*) as count FROM barbers WHERE is_on_duty = 1 AND status != 'break'").get() as { count: number }).count || 1;
      ticket.position = pos;
      ticket.estimated_wait = Math.max(5, Math.round(durationAhead / onDutyBarbers));
    } else {
      ticket.position = 0;
      ticket.estimated_wait = 0;
    }

    return ticket;
  }

  static getActiveTicketByPhone(phone: string): QueueTicket | null {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const ticket = db.prepare(`
      SELECT * FROM queue 
      WHERE phone = ? AND status IN ('waiting', 'called', 'in_chair') 
      ORDER BY id DESC LIMIT 1
    `).get(cleanPhone) as QueueTicket | undefined;

    return ticket ? this.getTicket(ticket.token) : null;
  }

  static joinQueue(data: {
    customer_name: string;
    phone: string;
    preferred_barber?: string;
    service_names?: string[];
    is_walkin?: boolean;
  }): QueueTicket {
    const isOnlineOpen = this.isOnlineQueueOpen();
    if (!data.is_walkin && !isOnlineOpen) {
      throw new Error('Online queue is currently closed. Walk-ins available at reception.');
    }

    const cleanPhone = data.phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }

    // Rule: One active spot per phone number
    const existing = this.getActiveTicketByPhone(cleanPhone);
    if (existing) {
      return existing;
    }

    // Calculate total duration and price from chosen services
    const servicesList = this.getServices();
    const chosenNames = data.service_names || ['Haircut'];
    let totalDuration = 0;
    let totalPrice = 0;

    for (const name of chosenNames) {
      const match = servicesList.find((s) => s.name_en.toLowerCase() === name.toLowerCase());
      if (match) {
        totalDuration += match.duration;
        totalPrice += match.price;
      } else {
        totalDuration += 30;
        totalPrice += 150;
      }
    }

    // Generate Token
    const seqRow = db.prepare("SELECT value FROM settings WHERE key = 'token_sequence'").get() as { value: string } | undefined;
    const nextSeq = (seqRow ? parseInt(seqRow.value, 10) : 0) + 1;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('token_sequence', ?)").run(String(nextSeq));

    const token = `S-${String(nextSeq).padStart(2, '0')}`;
    const now = new Date().toISOString();

    const result = db.prepare(`
      INSERT INTO queue (
        token, customer_name, phone, preferred_barber, assigned_barber,
        services, total_duration, total_price, status, is_walkin, created_at
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'waiting', ?, ?)
    `).run(
      token,
      data.customer_name.trim(),
      cleanPhone,
      data.preferred_barber || 'Any',
      JSON.stringify(chosenNames),
      totalDuration,
      totalPrice,
      data.is_walkin ? 1 : 0,
      now
    );

    return this.getTicket(Number(result.lastInsertRowid))!;
  }

  /**
   * Rule: Call next for barber X picks the earliest customer who chose X or 'Any'.
   * A customer who chose Ravi is never given to another barber.
   * A barber has only one customer in the chair at a time.
   */
  static callNext(barberName: string): QueueTicket | null {
    const barber = db.prepare('SELECT * FROM barbers WHERE name = ?').get(barberName) as BarberItem | undefined;
    if (!barber) throw new Error(`Barber ${barberName} not found`);

    // Check if barber already has customer in chair
    if (barber.current_ticket_id) {
      const currentTicket = db.prepare('SELECT * FROM queue WHERE id = ?').get(barber.current_ticket_id) as QueueTicket | undefined;
      if (currentTicket && (currentTicket.status === 'in_chair' || currentTicket.status === 'called')) {
        throw new Error(`Barber ${barberName} already has an active customer (${currentTicket.token})`);
      }
    }

    // Pick earliest waiting customer who chose barberName or 'Any'
    const nextCustomer = db.prepare(`
      SELECT * FROM queue 
      WHERE status = 'waiting' 
        AND (preferred_barber = ? OR preferred_barber = 'Any') 
      ORDER BY id ASC LIMIT 1
    `).get(barberName) as QueueTicket | undefined;

    if (!nextCustomer) return null;

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE queue 
      SET status = 'called', assigned_barber = ?, called_at = ? 
      WHERE id = ?
    `).run(barberName, now, nextCustomer.id);

    db.prepare(`
      UPDATE barbers 
      SET status = 'busy', current_ticket_id = ?, service_started_at = NULL 
      WHERE name = ?
    `).run(nextCustomer.id, barberName);

    return this.getTicket(nextCustomer.id);
  }

  static startService(token: string): QueueTicket {
    const ticket = this.getTicket(token);
    if (!ticket) throw new Error(`Ticket ${token} not found`);

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE queue 
      SET status = 'in_chair', started_at = ? 
      WHERE id = ?
    `).run(now, ticket.id);

    if (ticket.assigned_barber) {
      db.prepare(`
        UPDATE barbers 
        SET status = 'busy', current_ticket_id = ?, service_started_at = ? 
        WHERE name = ?
      `).run(ticket.id, now, ticket.assigned_barber);
    }

    return this.getTicket(ticket.id)!;
  }

  static doneService(token: string): QueueTicket {
    const ticket = this.getTicket(token);
    if (!ticket) throw new Error(`Ticket ${token} not found`);

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE queue 
      SET status = 'done', completed_at = ? 
      WHERE id = ?
    `).run(now, ticket.id);

    if (ticket.assigned_barber) {
      db.prepare(`
        UPDATE barbers 
        SET status = 'free', current_ticket_id = NULL, service_started_at = NULL 
        WHERE name = ?
      `).run(ticket.assigned_barber);
    }

    return this.getTicket(ticket.id)!;
  }

  static cancelTicket(token: string): QueueTicket {
    const ticket = this.getTicket(token);
    if (!ticket) throw new Error(`Ticket ${token} not found`);

    db.prepare("UPDATE queue SET status = 'cancelled' WHERE id = ?").run(ticket.id);

    if (ticket.assigned_barber) {
      db.prepare(`
        UPDATE barbers 
        SET status = 'free', current_ticket_id = NULL, service_started_at = NULL 
        WHERE name = ? AND current_ticket_id = ?
      `).run(ticket.assigned_barber, ticket.id);
    }

    return this.getTicket(ticket.id)!;
  }

  static markNoShow(token: string): QueueTicket {
    const ticket = this.getTicket(token);
    if (!ticket) throw new Error(`Ticket ${token} not found`);

    db.prepare("UPDATE queue SET status = 'noshow' WHERE id = ?").run(ticket.id);

    if (ticket.assigned_barber) {
      db.prepare(`
        UPDATE barbers 
        SET status = 'free', current_ticket_id = NULL, service_started_at = NULL 
        WHERE name = ? AND current_ticket_id = ?
      `).run(ticket.assigned_barber, ticket.id);
    }

    return this.getTicket(ticket.id)!;
  }

  static getTodayStats() {
    const waitingCount = (db.prepare("SELECT COUNT(*) as count FROM queue WHERE status = 'waiting'").get() as { count: number }).count;
    const servedCount = (db.prepare("SELECT COUNT(*) as count FROM queue WHERE status = 'done'").get() as { count: number }).count;
    const noShowsCount = (db.prepare("SELECT COUNT(*) as count FROM queue WHERE status = 'noshow'").get() as { count: number }).count;
    const totalRevenue = (db.prepare("SELECT SUM(total_price) as sum FROM queue WHERE status = 'done'").get() as { sum: number }).sum || 0;

    const waitTimes = db.prepare("SELECT total_duration FROM queue WHERE status = 'waiting'").all() as { total_duration: number }[];
    const totalMinutes = waitTimes.reduce((acc, curr) => acc + curr.total_duration, 0);
    const barbersWorking = (db.prepare("SELECT COUNT(*) as count FROM barbers WHERE is_on_duty = 1 AND status != 'break'").get() as { count: number }).count || 1;
    const approxWait = waitingCount > 0 ? Math.round(totalMinutes / barbersWorking) : 0;

    return {
      waitingCount,
      servedCount,
      noShowsCount,
      approxWait,
      totalRevenue,
    };
  }

  static isOnlineQueueOpen(): boolean {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'online_queue_open'").get() as { value: string } | undefined;
    return row ? row.value === '1' : true;
  }

  static setOnlineQueueOpen(isOpen: boolean): void {
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('online_queue_open', ?)").run(isOpen ? '1' : '0');
  }
}
