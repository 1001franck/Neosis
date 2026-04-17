/**
 * PRESENTATION - VOICE CONTROLLER
 * Contrôleur HTTP pour les endpoints voice
 */

import type { Request, Response } from 'express';
import type { GetChannelVoiceUsersUseCase } from '../../../application/voice/usecases/GetChannelVoiceUsersUseCase.js';

/**
 * VoiceController
 *
 * Endpoints HTTP pour le voice (lecture seule)
 * Les actions (join/leave) se font via Socket.IO pour la réactivité temps réel
 */
export class VoiceController {
  constructor(
    private getChannelVoiceUsersUseCase: GetChannelVoiceUsersUseCase
  ) {}

  /**
   * GET /voice/channels/:channelId/users
   * Récupère la liste des utilisateurs connectés à un voice channel
   */
  getChannelUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { channelId } = req.params;

      if (!channelId || Array.isArray(channelId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid channelId'
        });
        return;
      }

      const users = await this.getChannelVoiceUsersUseCase.execute({ channelId });

      res.json({
        success: true,
        data: users
      });
    } catch (error: unknown) {
      console.error('Failed to get voice channel users:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}
