/**
 * APPLICATION - GET CHANNEL VOICE USERS USE CASE
 * Récupère la liste des utilisateurs connectés à un voice channel
 */

import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import type { PrismaClient } from '@prisma/client';
import type { VoiceUser } from '../../../domain/voice/types.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';

/**
 * DTO pour récupérer les utilisateurs d'un voice channel
 */
export interface GetChannelVoiceUsersDTO {
  channelId: string;
}

/**
 * Use Case : Récupérer les utilisateurs connectés à un voice channel
 *
 * Logique métier :
 * 1. Récupérer toutes les VoiceConnections du channel
 * 2. Enrichir avec les données utilisateur (username, avatar)
 * 3. Retourner la liste complète
 */
export class GetChannelVoiceUsersUseCase extends BaseUseCase<GetChannelVoiceUsersDTO, VoiceUser[]> {
  constructor(
    private voiceRepository: VoiceConnectionRepository,
    private prisma: PrismaClient
  ) {
    super();
  }

  getName(): string {
    return 'GetChannelVoiceUsersUseCase';
  }

  async execute(data: GetChannelVoiceUsersDTO): Promise<VoiceUser[]> {
    // 1. Récupérer toutes les connexions du channel
    const connections = await this.voiceRepository.findByChannelId(data.channelId);

    // 2. Enrichir avec les données utilisateur
    const voiceUsers: VoiceUser[] = [];

    for (const connection of connections) {
      // Récupérer les infos de l'utilisateur
      const user = await this.prisma.user.findUnique({
        where: { id: connection.userId },
        select: {
          id: true,
          username: true,
          avatarUrl: true
        }
      });

      if (user) {
        voiceUsers.push({
          userId: user.id,
          username: user.username,
          avatar: user.avatarUrl,
          isMuted: connection.isMuted,
          isDeafened: connection.isDeafened,
          isVideoEnabled: connection.isVideoEnabled,
          isScreenSharing: connection.isScreenSharing,
          connectedAt: connection.connectedAt
        });
      }
    }

    return voiceUsers;
  }
}
