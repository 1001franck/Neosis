/**
 * APPLICATION - JOIN VOICE CHANNEL USE CASE
 * Permet à un utilisateur de rejoindre un voice channel
 */

import crypto from 'crypto';
import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import type { ChannelRepository } from '../../../domain/channels/repositories/ChannelRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { VoiceConnection } from '../../../domain/voice/entities/VoiceConnection.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import { ChannelType } from '../../../domain/channels/entities/channel.js';

/**
 * DTO pour rejoindre un voice channel
 */
export interface JoinVoiceChannelDTO {
  userId: string;
  channelId: string;
}

/**
 * Use Case : Rejoindre un voice channel
 *
 * Logique métier :
 * 1. Vérifier que le channel existe et est de type VOICE
 * 2. Vérifier que l'utilisateur est membre du serveur
 * 3. Si l'utilisateur est déjà connecté ailleurs → le déconnecter d'abord
 * 4. Créer la VoiceConnection
 * 5. Retourner les informations de connexion
 */
export class JoinVoiceChannelUseCase extends BaseUseCase<JoinVoiceChannelDTO, VoiceConnection> {
  constructor(
    private voiceRepository: VoiceConnectionRepository,
    private channelRepository: ChannelRepository,
    private memberRepository: IMemberRepository
  ) {
    super();
  }

  getName(): string {
    return 'JoinVoiceChannelUseCase';
  }

  async execute(data: JoinVoiceChannelDTO): Promise<VoiceConnection> {
    // 1. Trouver le channel
    const channel = await this.channelRepository.findById(data.channelId);

    if (!channel) {
      throw new AppError(ErrorCode.CHANNEL_NOT_FOUND, 'Channel not found', 404);
    }

    // 2. Vérifier que c'est bien un voice channel
    if (channel.type !== ChannelType.VOICE) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'This channel is not a voice channel',
        400
      );
    }

    // 3. Vérifier que l'utilisateur est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(
      data.userId,
      channel.serverId
    );

    if (!member) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'You must be a member of this server to join voice channels',
        403
      );
    }

    // 4. Si l'utilisateur est déjà connecté ailleurs, le déconnecter
    const existingConnection = await this.voiceRepository.findByUserId(data.userId);
    if (existingConnection) {
      // Déconnecter du channel précédent
      await this.voiceRepository.delete(data.userId);
    }

    // 5. Créer la nouvelle connexion vocale
    const newConnection = new VoiceConnection(
      crypto.randomUUID(),
      data.userId,
      data.channelId,
      false, // isMuted = false par défaut
      false, // isDeafened = false par défaut
      new Date()
    );

    return await this.voiceRepository.create(newConnection);
  }
}
