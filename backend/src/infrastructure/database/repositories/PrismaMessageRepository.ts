import { PrismaClient } from '@prisma/client';
import type { MessageRepository } from '../../../domain/messages/repositories/MessageRepository.js';
import { Message } from '../../../domain/messages/entities/message.js';

/** Include Prisma réutilisable pour charger l'auteur + replyTo */
const MESSAGE_INCLUDE = {
  member: {
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  },
  attachments: true,
  reactions: { select: { emoji: true, userId: true } },
  replyTo: {
    include: {
      member: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
      },
    },
  },
} as const;

/**
 * Implémentation Prisma du repository Message
 */
export class PrismaMessageRepository implements MessageRepository {
  constructor(private prisma: PrismaClient) { }

  /**
   * Crée un nouveau message dans la base de données
   */
  async create(message: Message): Promise<Message> {
    const created = await this.prisma.message.create({
      data: {
        id: message.id,
        content: message.content,
        memberId: message.memberId,
        channelId: message.channelId,
        ...(message.replyToId ? { replyToId: message.replyToId } : {}),
      },
      include: MESSAGE_INCLUDE,
    });

    return this.toDomain(created);
  }

  /**
   * Trouve un message par son ID
   */
  async findById(id: string): Promise<Message | null> {
    const message = await this.prisma.message.findUnique({
      where: { id },
      include: MESSAGE_INCLUDE,
    });

    return message ? this.toDomain(message) : null;
  }

  /**
   * Trouve les messages d'un channel avec pagination
   */
  async findByChannelId(
    channelId: string,
    limit: number = 50,
    before?: Date,
    userId?: string
  ): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
        deletedAt: null,
        ...(before && { createdAt: { lt: before } }),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        ...MESSAGE_INCLUDE,
        deletions: userId ? { where: { userId }, select: { userId: true } } : false,
      },
    });

    return messages.map((message) => this.toDomain(message, userId)).reverse();
  }

  /**
   * Recherche des messages dans tous les channels d'un serveur
   */
  async searchInServer(
    serverId: string,
    query: string,
    limit: number = 100,
    userId?: string
  ): Promise<Message[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return [];

    const messages = await this.prisma.message.findMany({
      where: {
        deletedAt: null,
        content: {
          contains: trimmedQuery,
          mode: 'insensitive',
        },
        channel: {
          serverId,
        },
        ...(userId
          ? {
              deletions: {
                none: { userId },
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        ...MESSAGE_INCLUDE,
        deletions: userId ? { where: { userId }, select: { userId: true } } : false,
      },
    });

    return messages.map((message) => this.toDomain(message, userId));
  }

  /**
   * Met à jour un message
   */
  async update(id: string, content: string): Promise<Message> {
    const updated = await this.prisma.message.update({
      where: { id },
      data: { content, updatedAt: new Date() },
      include: MESSAGE_INCLUDE,
    });

    return this.toDomain(updated);
  }

  /**
   * Supprime un message (soft delete)
   */
  async softDelete(id: string): Promise<void> {
    await this.prisma.message.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Supprime définitivement un message
   */
  async hardDelete(id: string): Promise<void> {
    await this.prisma.message.delete({
      where: { id },
    });
  }

  /**
   * Compte le nombre de messages non supprimés dans un channel
   */
  async countByChannelId(channelId: string): Promise<number> {
    return await this.prisma.message.count({
      where: {
        channelId,
      },
    });
  }

  /**
   * Trouve les messages récents d'un channel
   */
  async findRecentByChannelId(channelId: string, limit: number, userId?: string): Promise<Message[]> {
    const messages = await this.prisma.message.findMany({
      where: {
        channelId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        ...MESSAGE_INCLUDE,
        deletions: userId ? { where: { userId }, select: { userId: true } } : false,
      },
    });

    return messages.map((message) => this.toDomain(message, userId)).reverse();
  }

  /**
   * Vérifie si un message existe
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.message.count({
      where: { id },
    });

    return count > 0;
  }

  /**
   * Lie des pièces jointes existantes à un message
   */
  async linkAttachments(messageId: string, attachmentIds: string[]): Promise<Message> {
    await this.prisma.attachment.updateMany({
      where: { id: { in: attachmentIds } },
      data: { messageId },
    });

    // Re-fetch le message avec les attachments liés
    const updated = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: MESSAGE_INCLUDE,
    });

    return this.toDomain(updated);
  }

  /**
   * Marquer un message comme supprimé pour un utilisateur (delete for me)
   */
  async deleteForUser(messageId: string, userId: string): Promise<void> {
    await this.prisma.messageDeletion.upsert({
      where: {
        messageId_userId: { messageId, userId },
      },
      update: {},
      create: {
        messageId,
        userId,
      },
    });
  }

  /**
   * Convertit un modèle Prisma en entité du domaine
   * Attache les données auteur si member.user est inclus
   */
  private toDomain(prismaMessage: any, userId?: string): Message {
    const hasAttachments = Array.isArray(prismaMessage.attachments) && prismaMessage.attachments.length > 0;

    const message = new Message(
      prismaMessage.id,
      prismaMessage.content,
      prismaMessage.memberId,
      prismaMessage.channelId,
      prismaMessage.createdAt,
      prismaMessage.updatedAt,
      prismaMessage.deletedAt,
      prismaMessage.deliveredAt,
      hasAttachments,
      prismaMessage.replyToId ?? null
    );

    // Attacher les informations auteur (user) au message
    if (prismaMessage.member?.user) {
      message.author = {
        id: prismaMessage.member.user.id,
        username: prismaMessage.member.user.username,
        avatar: prismaMessage.member.user.avatarUrl,
      };
    }

    // Attacher les pièces jointes
    if (prismaMessage.attachments) {
      message.attachments = prismaMessage.attachments.map((a: any) => ({
        id: a.id,
        url: a.url,
        name: a.name,
        size: a.size,
        mimeType: a.mimeType,
      }));
    }

    if (userId && prismaMessage.deletions && prismaMessage.deletions.length > 0) {
      message.deletedForUserId = userId;
    }

    // Agréger les réactions par emoji
    if (prismaMessage.reactions && prismaMessage.reactions.length > 0) {
      const reactionMap = new Map<string, string[]>();
      for (const r of prismaMessage.reactions as { emoji: string; userId: string }[]) {
        if (!reactionMap.has(r.emoji)) reactionMap.set(r.emoji, []);
        reactionMap.get(r.emoji)!.push(r.userId);
      }
      message.reactions = Array.from(reactionMap.entries()).map(([emoji, userIds]) => ({
        emoji,
        count: userIds.length,
        userIds,
      }));
    }

    // Peupler le message auquel on répond
    if (prismaMessage.replyTo) {
      const rt = prismaMessage.replyTo;
      message.replyTo = {
        id: rt.id,
        content: rt.content,
        authorId: rt.member?.user?.id ?? rt.memberId,
        author: rt.member?.user
          ? { id: rt.member.user.id, username: rt.member.user.username, avatar: rt.member.user.avatarUrl }
          : null,
      };
    }

    return message;
  }
}
