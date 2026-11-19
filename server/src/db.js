import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'salon.db');

export const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_en TEXT NOT NULL,
      name_gu TEXT NOT NULL,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      is_on_duty INTEGER DEFAULT 1,
      status TEXT DEFAULT 'free', -- 'free', 'busy', 'break'
      current_ticket_id INTEGER DEFAULT NULL,
      service_started_at TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      preferred_barber TEXT DEFAULT 'Any',
      assigned_barber TEXT DEFAULT NULL,
      services TEXT NOT NULL, -- JSON string array
      total_duration INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'waiting', -- 'waiting', 'called', 'in_chair', 'done', 'cancelled', 'no_show'
      is_walkin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      called_at TEXT DEFAULT NULL,
      started_at TEXT DEFAULT NULL,
      completed_at TEXT DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default services if table is empty
  const serviceCount = db.prepare('SELECT count(*) as count FROM services').get().count;
  if (serviceCount === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (name_en, name_gu, duration, price, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);
    const defaultServices = [
      ['Haircut', 'હેરકટ', 30, 150, 1],
      ['Beard trim', 'દાઢી ટ્રીમ', 15, 80, 1],
      ['Hair spa', 'હેર સ્પા', 45, 400, 1],
      ['Hair color', 'હેર કલર', 60, 600, 1],
      ['Shave', 'શેવિંગ', 20, 100, 1],
    ];
    const insertMany = db.transaction((services) => {
      for (const s of services) insertService.run(...s);
    });
    insertMany(defaultServices);
  }

  // Seed default barbers if table is empty
  const barberCount = db.prepare('SELECT count(*) as count FROM barbers').get().count;
  if (barberCount === 0) {
    const insertBarber = db.prepare(`
      INSERT INTO barbers (name, is_on_duty, status)
      VALUES (?, ?, ?)
    `);
    const defaultBarbers = [
      ['Ravi', 1, 'free'],
      ['Amit', 1, 'free'],
      ['Imran', 1, 'free'],
    ];
    const insertMany = db.transaction((barbers) => {
      for (const b of barbers) insertBarber.run(...b);
    });
    insertMany(defaultBarbers);
  }

  // Seed default settings if not exists
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  if (!getSetting.get('online_queue_open')) {
    setSetting.run('online_queue_open', '1');
  }
  if (!getSetting.get('token_sequence')) {
    setSetting.run('token_sequence', '0');
  }
}

/**
 * Generates the next sequential token (e.g. S-1, S-2, ...)
 */
export function getNextToken() {
  const getSeq = db.prepare("SELECT value FROM settings WHERE key = 'token_sequence'");
  const updateSeq = db.prepare("UPDATE settings SET value = ? WHERE key = 'token_sequence'");

  let seq = parseInt(getSeq.get()?.value || '0', 10) + 1;
  updateSeq.run(String(seq));
  return `S-${seq}`;
}
