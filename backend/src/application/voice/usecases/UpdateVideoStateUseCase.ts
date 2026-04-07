/**
 * APPLICATION - UPDATE VIDEO STATE USE CASE
 * Permet de mettre à jour l'état vidéo (caméra / partage d'écran)
 */

import type { VoiceConnectionRepository } from '../../../domain/voice/repositories/VoiceConnectionRepository.js';
import type { VoiceConnection } from '../../../domain/voice/entities/VoiceConnection.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

export interface UpdateVideoStateDTO {
  userId: string;
  isVideoEnabled?: boolean;
  isScreenSharing?: boolean;
}

/**
 * Use Case : Mettre à jour l'état vidéo (caméra / partage d'écran)
 *
 * Règle métier : caméra et partage d'écran sont mutuellement exclusifs.
 * Si isScreenSharing passe à true, isVideoEnabled est forcé à false.
 */
export class UpdateVideoStateUseCase extends BaseUseCase<UpdateVideoStateDTO, VoiceConnection> {
  constructor(private voiceRepository: VoiceConnectionRepository) {
    super();
  }

  getName(): string {
    return 'UpdateVideoStateUseCase';
  }

  async execute(data: UpdateVideoStateDTO): Promise<VoiceConnection> {
    const connection = await this.voiceRepository.findByUserId(data.userId);

    if (!connection) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'You are not connected to any voice channel',
        400
      );
    }

    let newVideoEnabled = connection.isVideoEnabled;
    let newScreenSharing = connection.isScreenSharing;

    if (data.isVideoEnabled !== undefined) {
      newVideoEnabled = data.isVideoEnabled;
    }

    if (data.isScreenSharing !== undefined) {
      newScreenSharing = data.isScreenSharing;
    }

    // Règle métier : screen share et caméra sont mutuellement exclusifs
    if (newScreenSharing) {
      newVideoEnabled = false;
    }

    return await this.voiceRepository.updateVideoState(data.userId, newVideoEnabled, newScreenSharing);
  }
}
