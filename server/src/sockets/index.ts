import { Server, Socket } from 'socket.io';

export function setupSockets(io: Server): void {
  io.on('connection', (socket: Socket) => {
    socket.emit('connected', { message: 'Connected to Salon Queue WebSocket' });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}
