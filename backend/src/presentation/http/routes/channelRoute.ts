import { Router } from 'express';
import { ChannelController } from '../controllers/ChannelController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { CreateChannelDTO, UpdateChannelDTO } from '../../../application/channels/dtos/ChannelDTO.js';

/**
 * Configure les routes pour les channels
 */
export function createChannelRoutes(channelController: ChannelController): Router {
  const router = Router();

  // Obtenir un channel par ID
  router.get('/:id', channelController.getChannelById.bind(channelController));

  // Mettre à jour un channel
  router.put('/:id', validate(UpdateChannelDTO), channelController.updateChannel.bind(channelController));

  // Supprimer un channel
  router.delete('/:id', channelController.deleteChannel.bind(channelController));

  return router;
}

/**
 * Routes pour les channels d'un serveur spécifique
 * À monter sur /servers/:serverId/channels
 */
export function createServerChannelRoutes(channelController: ChannelController): Router {
  const router = Router({ mergeParams: true });

  // Créer un nouveau channel dans un serveur
  router.post('/', validate(CreateChannelDTO), channelController.createChannel.bind(channelController));

  // Obtenir tous les channels d'un serveur
  router.get('/', channelController.getServerChannels.bind(channelController));

  return router;
}
