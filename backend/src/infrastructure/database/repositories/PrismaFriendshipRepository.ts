import { PrismaClient, FriendshipStatus } from '@prisma/client';
import type { FriendshipRepository } from '../../../domain/direct/repositories/FriendshipRepository.js';
import { Friendship } from '../../../domain/direct/entities/Friendship.js';

export class PrismaFriendshipRepository implements FriendshipRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUsers(userOneId: string, userTwoId: string): Promise<Friendship | null> {
    const record = await this.prisma.friendship.findUnique({
      where: {
        userOneId_userTwoId: {
          userOneId,
          userTwoId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async findById(friendshipId: string): Promise<Friendship | null> {
    const record = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });
    return record ? this.toDomain(record) : null;
  }

  async create(friendship: Friendship): Promise<Friendship> {
    const created = await this.prisma.friendship.create({
      data: {
        id: friendship.id,
        userOneId: friendship.userOneId,
        userTwoId: friendship.userTwoId,
        requesterId: friendship.requesterId,
        status: friendship.status as FriendshipStatus,
        createdAt: friendship.createdAt,
        updatedAt: friendship.updatedAt,
      },
    });
    return this.toDomain(created);
  }

  async updateStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'BLOCKED'): Promise<Friendship> {
    const updated = await this.prisma.friendship.update({
      where: { id },
      data: { status: status as FriendshipStatus },
    });
    return this.toDomain(updated);
  }

  async listForUser(userId: string): Promise<Friendship[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(this.toDomain);
  }

  async listPendingForUser(userId: string): Promise<Friendship[]> {
    const rows = await this.prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.PENDING,
        OR: [{ userOneId: userId }, { userTwoId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(this.toDomain);
  }

  private toDomain(raw: {
    id: string;
    userOneId: string;
    userTwoId: string;
    requesterId: string;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
  }): Friendship {
    return new Friendship(
      raw.id,
      raw.userOneId,
      raw.userTwoId,
      raw.requesterId,
      raw.status,
      raw.createdAt,
      raw.updatedAt
    );
  }
}
