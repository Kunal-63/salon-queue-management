import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  dbPath: process.env.DB_PATH || path.join(__dirname, '..', '..', 'salon.db'),
};
