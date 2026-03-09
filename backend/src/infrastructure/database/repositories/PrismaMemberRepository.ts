import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { Member, MemberRole } from '../../../domain/members/entities/Member.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';

/**
 * Implémentation concrète du Repository Member avec Prisma
 * Responsabilité: Faire le mapping Prisma Model <-> Domain Entity
 */
export class PrismaMemberRepository implements IMemberRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: { id }
    });
    if (!member) return null;
    return this.toDomain(member);
  }

  async findByUserAndServer(userId: string, serverId: string): Promise<Member | null> {
    const member = await this.prisma.member.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId
        }
      }
    });
    if (!member) return null;
    return this.toDomain(member);
  }

  async findByServerId(serverId: string): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      where: { serverId },
      include: { user: true },
      orderBy: { role: 'asc' } // OWNER first, then ADMIN, then MEMBER (PostgreSQL enum declaration order)
    });
    return members.map(m => this.toDomainWithUser(m));
  }

  async findByUserId(userId: string): Promise<Member[]> {
    const members = await this.prisma.member.findMany({
      where: { userId }
    });
    return members.map(m => this.toDomain(m));
  }

  async create(member: Member): Promise<Member> {
    const created = await this.prisma.member.create({
      data: {
        id: member.id,
        userId: member.userId,
        serverId: member.serverId,
        role: this.toPrismaRole(member.role)
      }
    });
    return this.toDomain(created);
  }

  async update(member: Member): Promise<Member> {
    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        role: this.toPrismaRole(member.role)
      },
      include: { user: true }
    });
    return this.toDomainWithUser(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.member.delete({
      where: { id }
    });
  }

  async countByServerId(serverId: string): Promise<number> {
    return await this.prisma.member.count({
      where: { serverId }
    });
  }

  async existsByUserAndServer(userId: string, serverId: string): Promise<boolean> {
    const count = await this.prisma.member.count({
      where: {
        userId,
        serverId
      }
    });
    return count > 0;
  }

  /**
   * Mapper: Prisma Model -> Domain Entity
   */
  private toDomain(raw: {
    id: string;
    userId: string;
    serverId: string;
    role: PrismaRole;
    createdAt: Date;
  }): Member {
    return new Member(
      raw.id,
      raw.userId,
      raw.serverId,
      this.toDomainRole(raw.role),
      raw.createdAt
    );
  }

  /**
   * Mapper: Prisma Model with User -> Domain Entity with user data
   */
  private toDomainWithUser(raw: {
    id: string;
    userId: string;
    serverId: string;
    role: PrismaRole;
    createdAt: Date;
    user: {
      id: string;
      username: string;
      email: string;
      avatarUrl: string | null;
      bio: string | null;
      customStatus: string | null;
      statusEmoji: string | null;
      bannerUrl: string | null;
    };
  }): Member {
    const member = new Member(
      raw.id,
      raw.userId,
      raw.serverId,
      this.toDomainRole(raw.role),
      raw.createdAt
    );
    member.user = {
      id: raw.user.id,
      username: raw.user.username,
      email: raw.user.email,
      avatar: raw.user.avatarUrl,
      bio: raw.user.bio,
      customStatus: raw.user.customStatus,
      statusEmoji: raw.user.statusEmoji,
      banner: raw.user.bannerUrl,
    };
    return member;
  }

  /**
   * Convertit le rôle Prisma en rôle Domain
   */
  private toDomainRole(prismaRole: PrismaRole): MemberRole {
    switch (prismaRole) {
      case 'OWNER':
        return MemberRole.OWNER;
      case 'ADMIN':
        return MemberRole.ADMIN;
      case 'MEMBER':
        return MemberRole.MEMBER;
      default:
        throw new Error(`Rôle Prisma inconnu: ${prismaRole}`);
    }
  }

  /**
   * Convertit le rôle Domain en rôle Prisma
   */
  private toPrismaRole(domainRole: MemberRole): PrismaRole {
    switch (domainRole) {
      case MemberRole.OWNER:
        return 'OWNER';
      case MemberRole.ADMIN:
        return 'ADMIN';
      case MemberRole.MEMBER:
        return 'MEMBER';
      default:
        throw new Error(`Rôle Domain inconnu: ${domainRole}`);
    }
  }
}
