import { Router } from 'express';
import { DirectConversationController } from '../controllers/DirectConversationController.js';
import { DirectMessageController } from '../controllers/DirectMessageController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { CreateDirectConversationDTO, SendDirectMessageDTO } from '../../../application/direct/dtos/DirectDTO.js';

export function createDirectConversationRoutes(controller: DirectConversationController): Router {
  const router = Router();
  router.get('/', controller.listConversations);
  router.get('/:id', controller.getConversation);
  router.post('/', validate(CreateDirectConversationDTO), controller.createConversation);
  return router;
}

export function createDirectMessageRoutes(controller: DirectMessageController): Router {
  const router = Router({ mergeParams: true });
  router.get('/', controller.listMessages);
  router.post('/', validate(SendDirectMessageDTO), controller.sendMessage);
  return router;
}
