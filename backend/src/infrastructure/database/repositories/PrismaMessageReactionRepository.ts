import { PrismaClient } from '@prisma/client';
import type { IMessageReactionRepository } from '../../../domain/messages/repositories/IMessageReactionRepository.js';
import type { MessageReactionData } from '../../../domain/messages/entities/message.js';
import crypto from 'crypto';

/**
 * Implémentation Prisma du repository des réactions de messages
 */
export class PrismaMessageReactionRepository implements IMessageReactionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Ajoute/remplace une réaction pour un utilisateur sur un message.
   * Règle métier: un utilisateur ne peut avoir qu'une seule réaction par message.
   */
  async add(messageId: string, userId: string, emoji: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Supprimer toute autre réaction existante de cet utilisateur sur le même message
      await tx.messageReaction.deleteMany({
        where: {
          messageId,
          userId,
          emoji: { not: emoji },
        },
      });

      // Conserver ou créer la réaction cible
      await tx.messageReaction.upsert({
        where: { messageId_userId_emoji: { messageId, userId, emoji } },
        update: {},
        create: { id: crypto.randomUUID(), messageId, userId, emoji },
      });
    });
  }

  /**
   * Supprime une réaction d'un utilisateur
   */
  async remove(messageId: string, userId: string, emoji: string): Promise<void> {
    await this.prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  }

  /**
   * Retourne les réactions agrégées par emoji pour un message
   */
  async findByMessageId(messageId: string): Promise<MessageReactionData[]> {
    const rows = await this.prisma.messageReaction.findMany({
      where: { messageId },
      select: { emoji: true, userId: true },
    });

    return this.aggregateReactions(rows);
  }

  /**
   * Agrège les lignes brutes en { emoji, count, userIds }
   */
  aggregateReactions(rows: { emoji: string; userId: string }[]): MessageReactionData[] {
    const map = new Map<string, string[]>();
    for (const row of rows) {
      if (!map.has(row.emoji)) map.set(row.emoji, []);
      map.get(row.emoji)!.push(row.userId);
    }
    return Array.from(map.entries()).map(([emoji, userIds]) => ({
      emoji,
      count: userIds.length,
      userIds,
    }));
  }
}
