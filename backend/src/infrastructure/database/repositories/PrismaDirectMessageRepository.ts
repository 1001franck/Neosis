import { PrismaClient } from '@prisma/client';
import type { DirectMessageRepository } from '../../../domain/direct/repositories/DirectMessageRepository.js';
import { DirectMessage } from '../../../domain/direct/entities/DirectMessage.js';

const SENDER_SELECT = { id: true, username: true, avatarUrl: true } as const;

const DM_INCLUDE = {
  sender: { select: SENDER_SELECT },
  replyTo: {
    include: {
      sender: { select: SENDER_SELECT },
    },
  },
} as const;

export class PrismaDirectMessageRepository implements DirectMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(message: DirectMessage): Promise<DirectMessage> {
    // Transaction : créer le message ET mettre à jour updatedAt de la conversation
    // pour que la liste des DM affiche le bon horodatage du dernier message.
    const [, created] = await this.prisma.$transaction([
      this.prisma.directConversation.update({
        where: { id: message.conversationId },
        data: { updatedAt: message.createdAt },
      }),
      this.prisma.directMessage.create({
        data: {
          id: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          content: message.content,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          deletedAt: message.deletedAt,
          ...(message.replyToId ? { replyToId: message.replyToId } : {}),
        },
        include: DM_INCLUDE,
      }),
    ]);
    return this.toDomain(created);
  }

  async listByConversation(conversationId: string, limit = 50, offset = 0): Promise<DirectMessage[]> {
    const rows = await this.prisma.directMessage.findMany({
      where: { conversationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
      include: DM_INCLUDE,
    });
    return rows.map(r => this.toDomain(r));
  }

  private toDomain(raw: any): DirectMessage {
    const msg = new DirectMessage(
      raw.id,
      raw.conversationId,
      raw.senderId,
      raw.content,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
      raw.replyToId ?? null
    );
    if (raw.sender) {
      msg.sender = { id: raw.sender.id, username: raw.sender.username, avatarUrl: raw.sender.avatarUrl };
    }
    if (raw.replyTo) {
      msg.replyTo = {
        id: raw.replyTo.id,
        content: raw.replyTo.content,
        senderId: raw.replyTo.senderId,
        sender: raw.replyTo.sender ?? null,
      };
    }
    return msg;
  }
}
