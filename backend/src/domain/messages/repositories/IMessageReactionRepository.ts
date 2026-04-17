import type { MessageReactionData } from '../entities/message.js';

/**
 * Interface du repository des réactions de messages
 */
export interface IMessageReactionRepository {
  /** Ajoute une réaction (upsert — ignore le doublon) */
  add(messageId: string, userId: string, emoji: string): Promise<void>;

  /** Supprime une réaction d'un utilisateur */
  remove(messageId: string, userId: string, emoji: string): Promise<void>;

  /** Retourne les réactions agrégées d'un message */
  findByMessageId(messageId: string): Promise<MessageReactionData[]>;
}
