import type { Message } from '../entities/message.js';

/**
 * Interface du repository Message
 * Définit les opérations de persistance pour les messages
 */
export interface MessageRepository {
  create(message: Message): Promise<Message>;
  findById(id: string): Promise<Message | null>;
  findByChannelId(channelId: string, limit?: number, before?: Date, userId?: string): Promise<Message[]>;
  searchInServer(serverId: string, query: string, limit?: number, userId?: string): Promise<Message[]>;
  update(id: string, content: string): Promise<Message>;
  softDelete(id: string): Promise<void>;
  deleteForUser(messageId: string, userId: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  countByChannelId(channelId: string): Promise<number>;
  findRecentByChannelId(channelId: string, limit: number, userId?: string): Promise<Message[]>;
  exists(id: string): Promise<boolean>;
  linkAttachments(messageId: string, attachmentIds: string[]): Promise<Message>;
}
