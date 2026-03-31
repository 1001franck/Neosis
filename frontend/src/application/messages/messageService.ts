/**
 * APPLICATION - MESSAGES SERVICE
 *
 * Le flux de message est: HTTP POST → backend crée le message → backend émet
 * via Socket.IO (message:new) → le listener frontend reçoit et ajoute au store.
 * On ne doit PAS émettre via socket ICI, sinon double création.
 */

import { messagesApi } from '@infrastructure/api/messages.api';
import type { Message, CreateMessageRequest, UpdateMessageRequest } from '@domain/messages/types';
import { normalizeMessages } from '@domain/messages/normalizeMessage';
import { EmptyMessageError, MessageTooLongError } from '@domain/messages/errors';
import { logger } from '@shared/utils/logger';
import { CONTENT_LIMITS } from '@shared/constants/app';

export class MessageService {
  async getMessages(channelId: string, limit?: number, before?: string): Promise<Message[]> {
    try {
      logger.info('Fetching messages', { channelId });
      const raw = await messagesApi.getMessages(channelId, limit, before);
      // Normaliser les messages du backend (toJSON) vers le type frontend
      return normalizeMessages(raw);
    } catch (error) {
      logger.error('Failed to fetch messages', error);
      throw error;
    }
  }

  async createMessage(request: CreateMessageRequest): Promise<Message> {
    if (!request.content.trim()) {
      throw new EmptyMessageError();
    }
    if (request.content.length > CONTENT_LIMITS.MAX_MESSAGE_LENGTH) {
      throw new MessageTooLongError();
    }

    try {
      logger.info('Creating message', { channelId: request.channelId });
      const message = await messagesApi.createMessage(request);
      return message;
    } catch (error) {
      logger.error('Failed to create message', error);
      throw error;
    }
  }

  async updateMessage(channelId: string, messageId: string, request: UpdateMessageRequest): Promise<Message> {
    try {
      logger.info('Updating message', { channelId, messageId });
      return await messagesApi.updateMessage(channelId, messageId, request);
    } catch (error) {
      logger.error('Failed to update message', error);
      throw error;
    }
  }

  async deleteMessage(channelId: string, messageId: string, scope?: 'me' | 'everyone'): Promise<void> {
    try {
      logger.info('Deleting message', { channelId, messageId, scope });
      return await messagesApi.deleteMessage(channelId, messageId, scope);
    } catch (error) {
      logger.error('Failed to delete message', error);
      throw error;
    }
  }
}

export const messageService = new MessageService();
