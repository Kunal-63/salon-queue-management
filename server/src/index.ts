import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/index.js';
import { initDatabase } from './db/index.js';
import { apiRouter } from './routes/index.js';
import { setupSockets } from './sockets/index.js';

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration supporting Vercel production and preview domains
const corsOriginHandler: cors.CorsOptions['origin'] = (origin, callback) => {
  // Allow curl, mobile apps, or same-origin server requests
  if (!origin) return callback(null, true);

  if (config.clientOrigin === '*') {
    return callback(null, true);
  }

  if (Array.isArray(config.clientOrigin)) {
    const isDirectMatch = config.clientOrigin.some((allowed) => {
      if (typeof allowed === 'string') return allowed === origin;
      return allowed.test(origin);
    });

    // Auto-allow all Vercel deployment and preview subdomains
    const isVercelDomain = /^https:\/\/.*\.vercel\.app$/.test(origin);

    if (isDirectMatch || isVercelDomain) {
      return callback(null, true);
    }
  }

  return callback(new Error(`Origin ${origin} not allowed by CORS`));
};

const corsOptions: cors.CorsOptions = {
  origin: corsOriginHandler,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Socket.IO configuration with matching CORS
export const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize SQLite database
initDatabase();

// Register WebSocket handlers
setupSockets(io);

// Mount API routes under /api
app.use('/api', apiRouter);

// Start server
server.listen(config.port, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
});

export { app, server };
