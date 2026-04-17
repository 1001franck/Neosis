/**
 * APPLICATION - MESSAGES
 * Hook personnalisé pour gérer les messages
 *
 * Responsabilités:
 * - Encapsuler la logique métier des messages
 * - Gérer les listeners WebSocket
 * - Combiner le store Zustand et le service
 * - Fournir une interface simple et cohérente aux composants
 */

import { useCallback } from 'react';
import { useMessageStore } from './messageStore';
import { useAuthStore } from '@application/auth/authStore';
import { messageService } from './messageService';
import type { CreateMessageRequest, UpdateMessageRequest } from '@domain/messages/types';
import { logger } from '@shared/utils/logger';

/**
 * Hook pour gérer les messages
 *
 * NOTE: Les listeners WebSocket sont gérés par useAuth (connectSocket + setupListeners).
 * Ce hook ne doit PAS appeler setupListeners/cleanupListeners pour éviter les doublons.
 *
 * @example
 * const { messages, isLoading, sendMessage } = useMessages();
 */
export function useMessages() {
  // === STATE SELECTORS ===
  const messages = useMessageStore((state) => state.messages);
  const isLoading = useMessageStore((state) => state.isLoading);
  const error = useMessageStore((state) => state.error);

  // === STORE ACTIONS ===
  const setMessages = useMessageStore((state) => state.setMessages);
  const addMessage = useMessageStore((state) => state.addMessage);
  const updateMessage = useMessageStore((state) => state.updateMessage);
  const removeMessage = useMessageStore((state) => state.removeMessage);
  const markAsDeleted = useMessageStore((state) => state.markAsDeleted);
  const setLoading = useMessageStore((state) => state.setLoading);
  const setError = useMessageStore((state) => state.setError);

  /**
   * Charger les messages d'un canal
   */
  const loadMessages = useCallback(
    async (channelId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Loading messages', { channelId });
        const messages = await messageService.getMessages(channelId);
        setMessages(messages);
        logger.info('Messages loaded', { channelId, count: messages.length });
        return messages;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to load messages', { error: message, channelId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setMessages, setLoading, setError]
  );

  /**
   * Envoyer un nouveau message
   */
  const sendMessage = useCallback(
    async (request: CreateMessageRequest) => {
      try {
        logger.info('Sending message', { channelId: request.channelId });
        const message = await messageService.createMessage(request);
        addMessage(message);
        logger.info('Message sent', { messageId: message.id });
        return message;
      } catch (err) {
        logger.error('Failed to send message', err);
        throw err;
      }
    },
    [addMessage]
  );

  /**
   * Modifier un message
   */
  const editMessage = useCallback(
    async (channelId: string, messageId: string, request: UpdateMessageRequest) => {
      try {
        logger.info('Editing message', { channelId, messageId });
        const message = await messageService.updateMessage(channelId, messageId, request);
        updateMessage(messageId, message);
        logger.info('Message edited', { messageId });
        return message;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to edit message', { error: message, messageId });
        throw err;
      }
    },
    [updateMessage]
  );

  /**
   * Supprimer un message
   */
  const deleteMessage = useCallback(
    async (channelId: string, messageId: string, scope?: 'me' | 'everyone') => {
      try {
        logger.info('Deleting message', { channelId, messageId, scope });
        await messageService.deleteMessage(channelId, messageId, scope);
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          markAsDeleted(messageId, currentUser.username, currentUser.id);
        } else {
          removeMessage(messageId);
        }
        logger.info('Message deleted', { messageId });
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to delete message', { error: message, messageId });
        throw err;
      }
    },
    [markAsDeleted, removeMessage]
  );

  return {
    // === STATE ===
    messages,
    isLoading,
    error,

    // === ACTIONS ===
    loadMessages,
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
