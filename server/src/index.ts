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

// Cross-Origin Resource Sharing
app.use(cors({
  origin: config.clientOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Socket.IO configuration
export const io = new Server(server, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
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
