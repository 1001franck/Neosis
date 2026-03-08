import  {PrismaClient} from '@prisma/client';
import type { ServerRepository } from '../../../domain/servers/repositories/ServerRepository.js';
import { Server } from '../../../domain/servers/entities/server.js';

/**
 * Implémentation Prisma du repository Server
 */
export class PrismaServerRepository implements ServerRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crée un nouveau serveur dans la base de données
   */
  async create(server: Server): Promise<Server> {
    const created = await this.prisma.server.create({
      data: {
        id: server.id,
        name: server.name,
        ownerId: server.ownerId,
        inviteCode: server.inviteCode,
        imageUrl: server.imageUrl,
      },
    });

    return this.toDomain(created);
  }

  /**
   * Trouve un serveur par son ID
   */
  async findById(id: string): Promise<Server | null> {
    const server = await this.prisma.server.findUnique({
      where: { id },
    });

    return server ? this.toDomain(server) : null;
  }

  /**
   * Trouve un serveur par son code d'invitation
   */
  async findByInviteCode(inviteCode: string): Promise<Server | null> {
    const server = await this.prisma.server.findUnique({
      where: { inviteCode },
    });

    return server ? this.toDomain(server) : null;
  }

  /**
   * Trouve tous les serveurs où un utilisateur est membre
   */
  async findByUserId(userId: string): Promise<Server[]> {
    const members = await this.prisma.member.findMany({
      where: { userId },
      include: {
        server: true,
      },
    });

    return members.map((member) => this.toDomain(member.server));
  }

  /**
   * Met à jour un serveur
   */
  async update(id: string, data: Partial<Server>): Promise<Server> {
    const updated = await this.prisma.server.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.inviteCode !== undefined && { inviteCode: data.inviteCode }),
        ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
      },
    });

    return this.toDomain(updated);
  }

  /**
   * Supprime un serveur
   */
  async delete(id: string): Promise<void> {
    await this.prisma.server.delete({
      where: { id },
    });
  }

  /**
   * Vérifie si un code d'invitation existe déjà
   */
  async inviteCodeExists(inviteCode: string): Promise<boolean> {
    const count = await this.prisma.server.count({
      where: { inviteCode },
    });

    return count > 0;
  }

  /**
   * Compte le nombre de membres d'un serveur
   */
  async countMembers(serverId: string): Promise<number> {
    return await this.prisma.member.count({
      where: { serverId },
    });
  }

  /**
   * Convertit un modèle Prisma en entité du domaine
   */
  private toDomain(prismaServer: any): Server {
    return new Server(
      prismaServer.id,
      prismaServer.name,
      prismaServer.ownerId,
      prismaServer.inviteCode,
      prismaServer.imageUrl,
      prismaServer.createdAt,
      prismaServer.description ?? null
    );
  }
}