import { io, Socket } from 'socket.io-client';

// Use environment variable, fallback to current origin (works with reverse proxy or same domain)
const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export const socket: Socket = io(SERVER_URL, {
  autoConnect: true,
  transports: ['websocket', 'polling'],
});
