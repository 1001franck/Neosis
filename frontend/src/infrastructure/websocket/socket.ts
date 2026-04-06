// WebSocket setup
import io from 'socket.io-client';
import { env } from '@shared/config/env';
import { logger } from '@shared/utils/logger';

export const socket = io(env.SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 5000,
  autoConnect: false,
  withCredentials: true,
});

socket.on('connect', () => {
  logger.info('Socket connected', { socketId: socket.id });
});

socket.on('disconnect', () => {
  logger.warn('Socket disconnected');
});

export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
