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
    // Transmettre le token JWT en auth pour les environnements sans cookies (Tauri)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
