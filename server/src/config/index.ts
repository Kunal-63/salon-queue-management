import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCorsOrigins(rawOrigin?: string): (string | RegExp)[] | string {
  if (!rawOrigin || rawOrigin === '*') {
    return '*';
  }
  const origins = rawOrigin.split(',').map((o) => o.trim());
  return origins;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientOrigin: parseCorsOrigins(process.env.CLIENT_ORIGIN),
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', '..', 'salon.db'),
};
