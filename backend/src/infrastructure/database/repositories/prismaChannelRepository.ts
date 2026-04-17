import { PrismaClient, ChannelType as PrismaChannelType } from '@prisma/client';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import { Channel, ChannelType } from '../../../domain/channels/entities/channel.js';

/**
 * Implémentation Prisma du repository Channel
 */
export class PrismaChannelRepository implements ChannelRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crée un nouveau channel dans la base de données
   */
  async create(channel: Channel): Promise<Channel> {
    const created = await this.prisma.channel.create({
      data: {
        id: channel.id,
        name: channel.name,
        type: channel.type as PrismaChannelType,
        serverId: channel.serverId,
      },
    });

    return this.toDomain(created);
  }

  /**
   * Trouve un channel par son ID
   */
  async findById(id: string): Promise<Channel | null> {
    const channel = await this.prisma.channel.findUnique({
      where: { id },
    });

    return channel ? this.toDomain(channel) : null;
  }

  /**
   * Trouve tous les channels d'un serveur
   */
  async findByServerId(serverId: string): Promise<Channel[]> {
    const channels = await this.prisma.channel.findMany({
      where: { serverId },
      orderBy: { createdAt: 'asc' },
    });

    return channels.map((channel) => this.toDomain(channel));
  }

  /**
   * Met à jour un channel
   */
  async update(id: string, data: Partial<Channel>): Promise<Channel> {
    const updated = await this.prisma.channel.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type as PrismaChannelType }),
      },
    });

    return this.toDomain(updated);
  }

  /**
   * Supprime un channel
   */
  async delete(id: string): Promise<void> {
    await this.prisma.channel.delete({
      where: { id },
    });
  }

  /**
   * Vérifie si un channel existe dans un serveur
   */
  async existsInServer(serverId: string, channelName: string): Promise<boolean> {
    const count = await this.prisma.channel.count({
      where: {
        serverId,
        name: channelName,
      },
    });

    return count > 0;
  }

  /**
   * Compte le nombre de messages dans un channel
   */
  async countMessages(channelId: string): Promise<number> {
    return await this.prisma.message.count({
      where: {
        channelId,
        deletedAt: null,
      },
    });
  }

  /**
   * Convertit un modèle Prisma en entité du domaine
   */
  private toDomain(prismaChannel: any): Channel {
    return new Channel(
      prismaChannel.id,
      prismaChannel.name,
      prismaChannel.type as ChannelType,
      prismaChannel.serverId,
      prismaChannel.createdAt,
      prismaChannel.topic ?? null,
      prismaChannel.position ?? 0
    );
  }
}