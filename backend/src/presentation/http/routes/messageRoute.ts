import { Router } from 'express';
import { MessageController } from '../controllers/MessageController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { CreateMessageDTO, UpdateMessageDTO } from '../../../application/messages/dtos/MessageDTO.js';

/**
 * Routes standalone pour les messages
 * Montées sur /messages
 */
export function createMessageRoutes(messageController: MessageController): Router {
  const router = Router();

  // Obtenir un message par ID
  router.get('/:id', messageController.getMessageById.bind(messageController));

  // Mettre à jour un message (résout channelId automatiquement)
  router.put('/:id', validate(UpdateMessageDTO), messageController.updateMessage.bind(messageController));

  // Supprimer un message (résout channelId automatiquement)
  router.delete('/:id', messageController.deleteMessage.bind(messageController));

  return router;
}

/**
 * Routes pour les messages d'un channel spécifique
 * À monter sur /channels/:channelId/messages
 */
export function createChannelMessageRoutes(messageController: MessageController): Router {
  const router = Router({ mergeParams: true });

  // Créer un nouveau message dans un channel
  router.post('/', validate(CreateMessageDTO), messageController.createMessage.bind(messageController));

  // Obtenir tous les messages d'un channel (avec pagination)
  router.get('/', messageController.getChannelMessages.bind(messageController));

  // Mettre à jour un message
  router.put('/:id', validate(UpdateMessageDTO), messageController.updateMessage.bind(messageController));

  // Supprimer un message
  router.delete('/:id', messageController.deleteMessage.bind(messageController));

  return router;
}
