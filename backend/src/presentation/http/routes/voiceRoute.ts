/**
 * PRESENTATION - VOICE ROUTES
 * Routes HTTP pour les endpoints voice
 */

import { Router } from 'express';
import type { VoiceController } from '../controllers/VoiceController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

/**
 * Créer le router pour les endpoints voice
 */
export function createVoiceRouter(voiceController: VoiceController): Router {
  const router = Router();

  // Toutes les routes nécessitent l'authentification
  router.use(authMiddleware);

  /**
   * GET /voice/channels/:channelId/users
   * Récupère la liste des utilisateurs connectés à un voice channel
   */
  router.get('/channels/:channelId/users', voiceController.getChannelUsers);

  return router;
}
