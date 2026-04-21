/**
 * INFRASTRUCTURE - PRISMA VOICE CONNECTION REPOSITORY
 * Implémentation Prisma du repository des connexions vocales
 */

import type { PrismaClient } from '@prisma/client';
import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import { VoiceConnection } from '../../../domain/voice/entities/VoiceConnection.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * Implémentation Prisma du VoiceConnectionRepository
 *
 * Traduit entre le Domain (VoiceConnection entity) et Prisma (database)
 */
export class PrismaVoiceConnectionRepository implements VoiceConnectionRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Créer une nouvelle connexion vocale
   */
  async create(connection: VoiceConnection): Promise<VoiceConnection> {
    try {
      const raw = await this.prisma.voiceConnection.create({
        data: {
          id: connection.id,
          userId: connection.userId,
          channelId: connection.channelId,
          isMuted: connection.isMuted,
          isDeafened: connection.isDeafened,
          isVideoEnabled: connection.isVideoEnabled,
          isScreenSharing: connection.isScreenSharing,
          connectedAt: connection.connectedAt
        }
      });

      return this.toDomain(raw);
    } catch (error: unknown) {
      // Prisma P2002 = unique constraint violation (userId unique)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new AppError(
          ErrorCode.VALIDATION_ERROR,
          'User is already connected to a voice channel',
          409
        );
      }
      throw error;
    }
  }

  /**
   * Trouver la connexion vocale d'un utilisateur
   */
  async findByUserId(userId: string): Promise<VoiceConnection | null> {
    const raw = await this.prisma.voiceConnection.findUnique({
      where: { userId }
    });

    return raw ? this.toDomain(raw) : null;
  }

  /**
   * Trouver toutes les connexions vocales d'un channel
   */
  async findByChannelId(channelId: string): Promise<VoiceConnection[]> {
    const rawList = await this.prisma.voiceConnection.findMany({
      where: { channelId },
      orderBy: { connectedAt: 'asc' } // Les premiers arrivés en premier
    });

    return rawList.map(raw => this.toDomain(raw));
  }

  /**
   * Mettre à jour l'état vocal (muted/deafened)
   */
  async updateState(userId: string, isMuted: boolean, isDeafened: boolean): Promise<VoiceConnection> {
    const raw = await this.prisma.voiceConnection.update({
      where: { userId },
      data: { isMuted, isDeafened }
    });

    return this.toDomain(raw);
  }

  async updateVideoState(userId: string, isVideoEnabled: boolean, isScreenSharing: boolean): Promise<VoiceConnection> {
    const raw = await this.prisma.voiceConnection.update({
      where: { userId },
      data: { isVideoEnabled, isScreenSharing }
    });

    return this.toDomain(raw);
  }

  /**
   * Supprimer une connexion vocale (quitter)
   */
  async delete(userId: string): Promise<void> {
    await this.prisma.voiceConnection.delete({
      where: { userId }
    });
  }

  /**
   * Compter le nombre d'utilisateurs connectés dans un channel
   */
  async countByChannelId(channelId: string): Promise<number> {
    return await this.prisma.voiceConnection.count({
      where: { channelId }
    });
  }

  /**
   * Supprimer toutes les connexions vocales.
   * Utilisé au démarrage pour purger les zombies laissés par un crash ou redémarrage.
   */
  async deleteAll(): Promise<void> {
    await this.prisma.voiceConnection.deleteMany({});
  }

  /**
   * Convertir du format Prisma vers l'entité Domain
   */
  private toDomain(raw: {
    id: string;
    userId: string;
    channelId: string;
    isMuted: boolean;
    isDeafened: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    connectedAt: Date;
  }): VoiceConnection {
    return new VoiceConnection(
      raw.id,
      raw.userId,
      raw.channelId,
      raw.isMuted,
      raw.isDeafened,
      raw.isVideoEnabled,
      raw.isScreenSharing,
      raw.connectedAt
    );
  }
}
