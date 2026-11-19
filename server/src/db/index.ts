import Database from 'better-sqlite3';
import { config } from '../config/index.js';

export const db: Database.Database = new Database(config.dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

export function initDatabase(): void {
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
      status TEXT DEFAULT 'free',
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
      services TEXT NOT NULL,
      total_duration INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'waiting',
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

  // Seed default settings if missing
  const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  if (!getSetting.get('online_queue_open')) {
    setSetting.run('online_queue_open', '1');
  }
  if (!getSetting.get('token_sequence')) {
    setSetting.run('token_sequence', '0');
  }
}
