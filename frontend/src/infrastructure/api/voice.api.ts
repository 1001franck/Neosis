/**
 * INFRASTRUCTURE - VOICE API
 * Appels API pour les endpoints voice
 */

import { apiClient } from './client';

export const voiceApi = {
  /**
   * Récupère les serveurs ICE (STUN + TURN) depuis le backend.
   * La clé API Metered est gardée côté serveur.
   * GET /voice/turn-credentials
   */
  getTurnCredentials: async (): Promise<RTCIceServer[]> => {
    const { data } = await apiClient.get<RTCIceServer[]>('/voice/turn-credentials');
    return data;
  },
};
