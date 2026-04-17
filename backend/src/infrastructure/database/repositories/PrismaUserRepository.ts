import { PrismaClient } from '@prisma/client';
import { User } from '../../../domain/users/entities/User.js';
import type { IUserRepository } from '../../../domain/users/repositories/UserRepository.js';

/**
 * Implémentation concrète du Repository User avec Prisma
 * Responsabilité: Faire le mapping Prisma Model <-> Domain Entity
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByIds(ids: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } } });
    return users.map(u => this.toDomain(u));
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        customStatus: user.customStatus,
        statusEmoji: user.statusEmoji,
        bannerUrl: user.bannerUrl,
      },
    });
    return this.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        customStatus: user.customStatus,
        statusEmoji: user.statusEmoji,
        bannerUrl: user.bannerUrl,
        updatedAt: new Date(),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  /**
   * Mapper: Prisma Model -> Domain Entity
   */
  private toDomain(raw: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    avatarUrl: string | null;
    bio: string | null;
    customStatus: string | null;
    statusEmoji: string | null;
    bannerUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      raw.id,
      raw.email,
      raw.username,
      raw.passwordHash,
      raw.avatarUrl,
      raw.createdAt,
      raw.updatedAt,
      raw.bio,
      raw.customStatus,
      raw.statusEmoji,
      raw.bannerUrl
    );
  }
}
