import { PrismaClient } from '@prisma/client';
import type { IBanRepository } from '../../../domain/bans/repositories/IBanRepository.js';
import { Ban } from '../../../domain/bans/entities/Ban.js';

/**
 * Implementation Prisma du repository Ban
 */
export class PrismaBanRepository implements IBanRepository {
  constructor(private prisma: PrismaClient) {}

  async create(ban: Ban): Promise<Ban> {
    const created = await this.prisma.ban.upsert({
      where: {
        userId_serverId: {
          userId: ban.userId,
          serverId: ban.serverId,
        },
      },
      create: {
        id: ban.id,
        userId: ban.userId,
        serverId: ban.serverId,
        bannedBy: ban.bannedBy,
        reason: ban.reason,
        expiresAt: ban.expiresAt,
      },
      update: {
        bannedBy: ban.bannedBy,
        reason: ban.reason,
        expiresAt: ban.expiresAt,
        createdAt: new Date(),
      },
    });

    return this.toDomain(created);
  }

  async findActiveByUserAndServer(userId: string, serverId: string): Promise<Ban | null> {
    const ban = await this.prisma.ban.findUnique({
      where: {
        userId_serverId: { userId, serverId },
      },
    });

    if (!ban) return null;

    const domainBan = this.toDomain(ban);

    // Si le ban temporaire a expire, le supprimer et retourner null
    if (domainBan.isExpired()) {
      await this.prisma.ban.delete({
        where: { id: ban.id },
      });
      return null;
    }

    return domainBan;
  }

  async delete(userId: string, serverId: string): Promise<void> {
    await this.prisma.ban.deleteMany({
      where: { userId, serverId },
    });
  }

  async findByServerId(serverId: string): Promise<Ban[]> {
    const bans = await this.prisma.ban.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' },
    });

    return bans.map(b => this.toDomain(b));
  }

  private toDomain(raw: {
    id: string;
    userId: string;
    serverId: string;
    bannedBy: string;
    reason: string | null;
    expiresAt: Date | null;
    createdAt: Date;
  }): Ban {
    return new Ban(
      raw.id,
      raw.userId,
      raw.serverId,
      raw.bannedBy,
      raw.reason,
      raw.expiresAt,
      raw.createdAt
    );
  }
}
