/**
 * PRESENTATION - VOICE CONTROLLER
 * Contrôleur HTTP pour les endpoints voice
 */

import type { Request, Response } from 'express';
import type { GetChannelVoiceUsersUseCase } from '../../../application/voice/usecases/GetChannelVoiceUsersUseCase.js';

interface IceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

// Serveurs STUN Google utilisés en fallback si la clé API TURN n'est pas configurée
const STUN_FALLBACK: IceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

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
   * GET /voice/turn-credentials
   * Retourne les serveurs ICE (STUN + TURN) pour WebRTC.
   * La clé API Metered reste côté serveur — le frontend ne la voit jamais.
   */
  getTurnCredentials = async (_req: Request, res: Response): Promise<void> => {
    const apiKey = process.env.METERED_TURN_API_KEY;

    if (!apiKey) {
      // Pas de clé configurée → retourner uniquement les serveurs STUN
      res.json({ success: true, data: STUN_FALLBACK });
      return;
    }

    try {
      const response = await fetch(
        `https://neosis.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`Metered API error: ${response.status}`);
      }

      const iceServers = await response.json() as IceServer[];

      // Chrome ralentit la découverte ICE au-delà de 5 serveurs.
      // On garde : 1 STUN + TURN UDP(443) + TURN TCP(443) + TURNS TLS = 4 max.
      const filtered = iceServers.filter((s) => {
        const url = Array.isArray(s.urls) ? s.urls[0] : s.urls;
        if (!url) return false;
        // Exclure les entrées TURN sur le port 80 (moins utiles que 443 pour passer les firewalls)
        if (url.includes(':80') && !url.startsWith('stun:')) return false;
        return true;
      }).slice(0, 4);

      res.json({ success: true, data: filtered.length > 0 ? filtered : iceServers.slice(0, 4) });
    } catch (error) {
      console.error('Failed to fetch TURN credentials:', error);
      // En cas d'erreur, fallback STUN pour ne pas bloquer l'appel
      res.json({ success: true, data: STUN_FALLBACK });
    }
  };

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
