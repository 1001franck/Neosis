// WebSocket setup
import io from 'socket.io-client';
import { env } from '@shared/config/env';
import { logger } from '@shared/utils/logger';
import { storage } from '@infrastructure/storage/localStorage';
import { STORAGE_KEYS } from '@shared/constants/app';

export const socket = io(env.SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 5000,
  autoConnect: false,
  withCredentials: false,
});

socket.on('connect', () => {
  logger.info('Socket connected', { socketId: socket.id });
});

socket.on('disconnect', () => {
  logger.warn('Socket disconnected');
});

export function connectSocket() {
  if (!socket.connected) {
    const token = storage.getItem<string>(STORAGE_KEYS.TOKEN);
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
