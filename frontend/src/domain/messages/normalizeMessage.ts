/**
 * DOMAIN - MESSAGE NORMALIZER
 *
 * Normalise les donnees message venant du backend (toJSON) vers le type frontend Message.
 *
 * Le backend envoie (via REST et Socket.IO):
 *   { id, content, memberId, authorId, channelId, createdAt, updatedAt,
 *     isEdited, isDeleted, deletedAt, attachments, author? }
 *
 * Le frontend attend:
 *   { id, channelId, authorId, content, attachments, reactions, status,
 *     createdAt, updatedAt, author?, deletedBy?, deletedByUserId? }
 *
 * Cette fonction est utilisee PARTOUT ou on recoit des messages du backend:
 *   - Socket listeners (message:new, message:updated)
 *   - REST API (GET /channels/:id/messages)
 */

import type { Message } from './types';
import { MessageStatus } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- boundary: données brutes socket/REST non typées
export function normalizeMessage(raw: any): Message {
  const isDeletedForUser = !!raw.isDeletedForUser;
  return {
    id: raw.id,
    clientTempId: raw.clientTempId ?? undefined,
    channelId: raw.channelId,
    authorId: raw.authorId || raw.author?.id || raw.memberId,
    content: raw.content || '',
    attachments: raw.attachments || [],
    reactions: raw.reactions || [],
    status: raw.isDeleted || isDeletedForUser
      ? MessageStatus.DELETED
      : raw.status || MessageStatus.SENT,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    author: raw.author
      ? {
          id: raw.author.id,
          username: raw.author.username,
          avatar: raw.author.avatar,
        }
      : undefined,
    deletedBy: raw.deletedBy,
    deletedByUserId: raw.deletedByUserId || raw.deletedForUserId,
    deletedByRole: raw.deletedByRole,
  };
}

/**
 * Normalise un tableau de messages (pour les reponses REST)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- boundary: tableau brut REST
export function normalizeMessages(raw: any[]): Message[] {
  return raw.map(normalizeMessage);
}
