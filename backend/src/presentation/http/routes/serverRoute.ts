import { Router } from 'express';
import { ServerController } from '../controllers/ServerController.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  CreateServerDTO,
  UpdateServerDTO,
  JoinServerDTO,
  UpdateMemberRoleDTO,
  TransferOwnershipDTO
} from '../../../application/servers/dtos/ServerDTO.js';
import { upload } from '../../../infrastructure/upload/multerConfig.js';

/**
 * Configure les routes pour les serveurs
 */
export function createServerRoutes(serverController: ServerController): Router {
  const router = Router();

  // Créer un nouveau serveur
  router.post('/', validate(CreateServerDTO), serverController.createServer.bind(serverController));

  // Obtenir tous les serveurs de l'utilisateur
  router.get('/', serverController.getUserServers.bind(serverController));

  // Obtenir un serveur par ID
  router.get('/:id', serverController.getServerById.bind(serverController));

  // Rejoindre un serveur avec un code d'invitation
  router.post('/join', validate(JoinServerDTO), serverController.joinServer.bind(serverController));

  // Mettre à jour un serveur
  router.put('/:id', validate(UpdateServerDTO), serverController.updateServer.bind(serverController));

  // Upload l'image d'un serveur (OWNER uniquement)
  router.post('/:id/image', upload.single('image'), serverController.uploadServerImage.bind(serverController));

  // Supprimer un serveur
  router.delete('/:id', serverController.deleteServer.bind(serverController));

  // Quitter un serveur
  router.delete('/:id/leave', serverController.leaveServer.bind(serverController));

  // Obtenir les membres d'un serveur
  router.get('/:id/members', serverController.getServerMembers.bind(serverController));

  // Mettre à jour le rôle d'un membre
  router.put('/:id/members/:memberId', validate(UpdateMemberRoleDTO), serverController.updateMemberRole.bind(serverController));

  // Transférer la propriété du serveur
  router.put('/:id/transfer', validate(TransferOwnershipDTO), serverController.transferOwnership.bind(serverController));

  // Kick a member from the server
  router.delete('/:id/members/:memberId/kick', serverController.kickMember.bind(serverController));

  // Ban a member from the server
  router.delete('/:id/members/:memberId/ban', serverController.banMember.bind(serverController));

  // Statut de ban de l'utilisateur courant
  router.get('/:id/ban-status', serverController.getMyBanStatus.bind(serverController));

  // Lister les bans actifs du serveur (pour affichage visuel)
  router.get('/:id/bans', serverController.getServerBans.bind(serverController));

  return router;
}
