import { Router } from 'express';
import { FriendController } from '../controllers/FriendController.js';
import { validate } from '../middlewares/validate.middleware.js';
import { RequestFriendDTO, AcceptFriendDTO } from '../../../application/direct/dtos/DirectDTO.js';

export function createFriendRoutes(controller: FriendController): Router {
  const router = Router();

  router.post('/request', validate(RequestFriendDTO), controller.requestFriend);
  router.post('/accept', validate(AcceptFriendDTO), controller.acceptFriend);
  router.post('/decline', controller.declineFriend);
  router.post('/cancel', controller.cancelFriendRequest);
  router.delete('/:id', controller.removeFriend);
  router.get('/', controller.listFriends);
  router.get('/requests', controller.listRequests);

  return router;
}
