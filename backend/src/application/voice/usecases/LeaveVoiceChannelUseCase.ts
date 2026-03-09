/**
 * APPLICATION - LEAVE VOICE CHANNEL USE CASE
 * Permet à un utilisateur de quitter le voice channel
 */

import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * DTO pour quitter un voice channel
 */
export interface LeaveVoiceChannelDTO {
  userId: string;
}

/**
 * Use Case : Quitter un voice channel
 *
 * Logique métier :
 * 1. Vérifier que l'utilisateur est bien connecté à un voice channel
 * 2. Supprimer la VoiceConnection
 */
export class LeaveVoiceChannelUseCase extends BaseUseCase<LeaveVoiceChannelDTO, { channelId: string }> {
  constructor(private voiceRepository: VoiceConnectionRepository) {
    super();
  }

  getName(): string {
    return 'LeaveVoiceChannelUseCase';
  }

  async execute(data: LeaveVoiceChannelDTO): Promise<{ channelId: string }> {
    // 1. Vérifier que l'utilisateur est connecté
    const connection = await this.voiceRepository.findByUserId(data.userId);

    if (!connection) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'You are not connected to any voice channel',
        400
      );
    }

    const channelId = connection.channelId;

    // 2. Supprimer la connexion (= quitter)
    await this.voiceRepository.delete(data.userId);

    return { channelId };
  }
}
