/**
 * APPLICATION - UPDATE VOICE STATE USE CASE
 * Permet de mettre à jour l'état vocal (mute/deafen)
 */

import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import type { VoiceConnection } from '../../../domain/voice/entities/VoiceConnection.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * DTO pour mettre à jour l'état vocal
 */
export interface UpdateVoiceStateDTO {
  userId: string;
  isMuted?: boolean;
  isDeafened?: boolean;
}

/**
 * Use Case : Mettre à jour l'état vocal (mute/deafen)
 *
 * Logique métier :
 * 1. Vérifier que l'utilisateur est connecté à un voice channel
 * 2. Appliquer les changements d'état
 * 3. Respecter la règle : deafened implique muted
 */
export class UpdateVoiceStateUseCase extends BaseUseCase<UpdateVoiceStateDTO, VoiceConnection> {
  constructor(private voiceRepository: VoiceConnectionRepository) {
    super();
  }

  getName(): string {
    return 'UpdateVoiceStateUseCase';
  }

  async execute(data: UpdateVoiceStateDTO): Promise<VoiceConnection> {
    // 1. Vérifier que l'utilisateur est connecté
    const connection = await this.voiceRepository.findByUserId(data.userId);

    if (!connection) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'You are not connected to any voice channel',
        400
      );
    }

    // 2. Appliquer les changements
    let newMuted = connection.isMuted;
    let newDeafened = connection.isDeafened;

    if (data.isMuted !== undefined) {
      newMuted = data.isMuted;
    }

    if (data.isDeafened !== undefined) {
      newDeafened = data.isDeafened;
    }

    // 3. Règle métier : deafened implique muted
    if (newDeafened) {
      newMuted = true;
    }

    // 4. Sauvegarder en base
    return await this.voiceRepository.updateState(data.userId, newMuted, newDeafened);
  }
}
