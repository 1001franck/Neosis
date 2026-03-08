/**
 * DOMAIN - MESSAGES TYPES
 * Types métier purs pour les messages
 */

// Re-export types used by websocket listeners
export type { Channel } from '@domain/channels/types';
export type { Member } from '@domain/members/types';

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DELETED = 'deleted',
}

export interface Message {
  id: string;
  /** Client-only temp id for optimistic messages */
  clientTempId?: string;
  channelId: string;
  authorId: string;
  content: string;
  attachments: Attachment[];
  reactions: MessageReaction[];
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    username: string;
    avatar?: string;
  };
  deliveredAt?: string;
  /** Présent si le message a été supprimé — contient le username de celui qui a supprimé */
  deletedBy?: string;
  /** ID de celui qui a supprimé — pour comparer avec currentUserId */
  deletedByUserId?: string;
  /** Rôle de celui qui a supprimé (OWNER / ADMIN / MEMBER) */
  deletedByRole?: 'OWNER' | 'ADMIN' | 'MEMBER';
}

export interface Attachment {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userIds: string[];
}

export interface CreateMessageRequest {
  content: string;
  channelId: string;
  attachments?: File[];
}

export interface UpdateMessageRequest {
  content: string;
}
