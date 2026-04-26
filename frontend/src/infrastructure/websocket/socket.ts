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

let isConnecting = false;

socket.on('connect', () => {
  isConnecting = false;
  logger.info('Socket connected', { socketId: socket.id });
});

socket.on('connect_error', (error) => {
  isConnecting = false;
  logger.warn('Socket connection error', { message: error.message });
});

socket.on('disconnect', () => {
  isConnecting = false;
  logger.warn('Socket disconnected');
});

export function connectSocket() {
  const isActive = (socket as unknown as { active?: boolean }).active === true;
  if (socket.connected || isActive || isConnecting) {
    return;
  }

  const token = storage.getItem<string>(STORAGE_KEYS.TOKEN);
  if (!token) {
    logger.warn('Socket connect skipped: no auth token available');
    return;
  }

  socket.auth = { token };
  isConnecting = true;
  socket.connect();
}

export function disconnectSocket() {
  isConnecting = false;
  const isActive = (socket as unknown as { active?: boolean }).active === true;
  if (socket.connected || isActive) {
    socket.disconnect();
  }
}
