import { PrismaClient } from '@prisma/client';
import type { DirectConversationRepository } from '../../../domain/direct/repositories/DirectConversationRepository.js';
import { DirectConversation } from '../../../domain/direct/entities/DirectConversation.js';

export class PrismaDirectConversationRepository implements DirectConversationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUsers(userOneId: string, userTwoId: string): Promise<DirectConversation | null> {
    const record = await this.prisma.directConversation.findUnique({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async create(conversation: DirectConversation): Promise<DirectConversation> {
    const created = await this.prisma.directConversation.create({
      data: {
        id: conversation.id,
        userOneId: conversation.userOneId,
        userTwoId: conversation.userTwoId,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async listByUser(userId: string): Promise<DirectConversation[]> {
    const rows = await this.prisma.directConversation.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(this.toDomain);
  }

  async findById(conversationId: string): Promise<DirectConversation | null> {
    const record = await this.prisma.directConversation.findUnique({
      where: { id: conversationId },
    });
    return record ? this.toDomain(record) : null;
  }

  private toDomain(raw: {
    id: string;
    userOneId: string;
    userTwoId: string;
    createdAt: Date;
    updatedAt: Date;
  }): DirectConversation {
    return new DirectConversation(
      raw.id,
      raw.userOneId,
      raw.userTwoId,
      raw.createdAt,
      raw.updatedAt
    );
  }
}
