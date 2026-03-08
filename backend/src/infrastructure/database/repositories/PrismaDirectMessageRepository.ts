import { PrismaClient } from '@prisma/client';
import type { DirectMessageRepository } from '../../../domain/direct/repositories/DirectMessageRepository.js';
import { DirectMessage } from '../../../domain/direct/entities/DirectMessage.js';

export class PrismaDirectMessageRepository implements DirectMessageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(message: DirectMessage): Promise<DirectMessage> {
    const created = await this.prisma.directMessage.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        deletedAt: message.deletedAt,
      },
    });
    return this.toDomain(created);
  }

  async listByConversation(conversationId: string, limit = 50, offset = 0): Promise<DirectMessage[]> {
    const rows = await this.prisma.directMessage.findMany({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });
    return rows.map(this.toDomain);
  }

  private toDomain(raw: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): DirectMessage {
    return new DirectMessage(
      raw.id,
      raw.conversationId,
      raw.senderId,
      raw.content,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt
    );
  }
}
