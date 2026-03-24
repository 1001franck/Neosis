import type { Request, Response, NextFunction } from 'express';
import {
  GetServerByIdUseCase,
  GetUserServersUseCase,
  UpdateServerUseCase,
  DeleteServerUseCase,
  JoinServerUseCase
} from '../../../application/servers/usecases/serverUseCase.js';
import { CreateServerUseCase } from '../../../application/servers/usecases/createServerUserCase.js';
import { LeaveServerUseCase } from '../../../application/servers/usecases/LeaveServerUseCase.js';
import { TransferOwnershipUseCase } from '../../../application/servers/usecases/TransferOwnershipUseCase.js';
import { GetServerMembersUseCase } from '../../../application/members/usecases/GetServerMembersUseCase.js';
import { UpdateMemberRoleUseCase } from '../../../application/members/usecases/UpdateMemberRoleUseCase.js';
import { KickMemberUseCase } from '../../../application/members/usecases/KickMemberUseCase.js';
import { BanMemberUseCase } from '../../../application/members/usecases/BanMemberUseCase.js';
import { MemberRole } from '../../../domain/members/entities/Member.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import { uploadToSupabase, deleteFromSupabase } from '../../../infrastructure/storage/supabaseStorage.js';
import type { IBanRepository } from '../../../domain/bans/repositories/IBanRepository.js';
import { GetServerBansUseCase } from '../../../application/members/usecases/GetServerBansUseCase.js';
import type { Server as SocketIOServer } from 'socket.io';

/**
 * Contrôleur pour les serveurs
 * Gère les requêtes HTTP liées aux serveurs
 */
export class ServerController {
  constructor(
    private createServerUseCase: CreateServerUseCase,
    private getServerByIdUseCase: GetServerByIdUseCase,
    private getUserServersUseCase: GetUserServersUseCase,
    private updateServerUseCase: UpdateServerUseCase,
    private deleteServerUseCase: DeleteServerUseCase,
    private joinServerUseCase: JoinServerUseCase,
    private leaveServerUseCase: LeaveServerUseCase,
    private getServerMembersUseCase: GetServerMembersUseCase,
    private updateMemberRoleUseCase: UpdateMemberRoleUseCase,
    private transferOwnershipUseCase: TransferOwnershipUseCase,
    private kickMemberUseCase: KickMemberUseCase,
    private banMemberUseCase: BanMemberUseCase,
    private banRepository: IBanRepository,
    private getServerBansUseCase: GetServerBansUseCase,
    private io?: SocketIOServer
  ) {}

  /**
   * Créer un nouveau serveur
   * POST /servers
   */
  createServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, imageUrl, description } = req.body;
      const userId = req.userId!;

      const server = await this.createServerUseCase.execute({
        name,
        ownerId: userId,
        imageUrl,
        description
      });

      res.status(201).json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir un serveur par ID
   * GET /servers/:id
   */
  getServerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;

      const server = await this.getServerByIdUseCase.execute({ serverId: id, userId });

      res.status(200).json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir tous les serveurs de l'utilisateur
   * GET /servers
   */
  getUserServers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const servers = await this.getUserServersUseCase.execute(userId);

      res.status(200).json({
        success: true,
        data: servers
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Rejoindre un serveur avec un code d'invitation
   * POST /servers/join
   */
  joinServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { inviteCode } = req.body;
      const userId = req.userId!;

      const server = await this.joinServerUseCase.execute({
        userId,
        inviteCode
      });

      res.status(200).json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour un serveur
   * PUT /servers/:id
   * ⚠️ PERMISSIONS : Seul le OWNER peut modifier
   */
  updateServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { name, description, imageUrl } = req.body;
      const userId = req.userId!;

      const server = await this.updateServerUseCase.execute({
        serverId: id,
        userId,
        name,
        description,
        imageUrl
      });

      res.status(200).json({
        success: true,
        data: server
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload l'image d'un serveur
   * POST /servers/:id/image
   * ⚠️ PERMISSIONS : Seul le OWNER peut uploader l'image
   * Body: multipart/form-data with field "image" (single file)
   */
  uploadServerImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const userId = req.userId!;
      const file = req.file as Express.Multer.File | undefined;

      if (!file) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Aucun fichier fourni', 400);
      }

      // Vérifier que le fichier est une image
      if (!file.mimetype.startsWith('image/')) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Le fichier doit être une image', 400);
      }

      // Récupérer le serveur pour vérifier les permissions et l'ancienne image
      const server = await this.getServerByIdUseCase.execute({ serverId, userId });

      // Supprimer l'ancienne image de Supabase si elle existe
      if (server.imageUrl) {
        await deleteFromSupabase(server.imageUrl).catch((e) => console.warn('Échec suppression ancienne image serveur:', e));
      }

      // Uploader vers Supabase
      const imageUrl = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'servers');

      // Mettre à jour le serveur avec la nouvelle image
      const updatedServer = await this.updateServerUseCase.execute({
        serverId,
        userId,
        imageUrl
      });

      res.status(200).json({
        success: true,
        data: updatedServer,
        imageUrl
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Supprimer un serveur
   * DELETE /servers/:id
   */
  deleteServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId!;

      await this.deleteServerUseCase.execute({
        serverId: id,
        userId
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Quitter un serveur
   * DELETE /servers/:id/leave
   */
  leaveServer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId!;

      await this.leaveServerUseCase.execute({
        userId,
        serverId: id
      });

      res.status(200).json({
        success: true,
        message: 'Vous avez quitté le serveur avec succès'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtenir les membres d'un serveur
   * GET /servers/:id/members
   */
  getServerMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId as string;

      const members = await this.getServerMembersUseCase.execute({ serverId: id, userId });

      res.status(200).json({
        success: true,
        data: members
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mettre à jour le rôle d'un membre
   * PUT /servers/:id/members/:memberId
   */
  updateMemberRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const { role } = req.body;
      const requesterId = req.userId!;

      // Validation du rôle
      if (!Object.values(MemberRole).includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rôle invalide. Doit être OWNER, ADMIN ou MEMBER'
        });
      }

      const updatedMember = await this.updateMemberRoleUseCase.execute({
        requesterId,
        serverId,
        targetMemberId: memberId,
        newRole: role
      });

      // Notifier le membre en temps réel de son nouveau rôle
      this.io?.to(`user:${updatedMember.userId}`).emit('user:role_updated', {
        serverId,
        role: updatedMember.role
      });

      res.status(200).json({
        success: true,
        data: updatedMember
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Transférer la propriété du serveur
   * PUT /servers/:id/transfer
   */
  transferOwnership = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const { newOwnerId } = req.body;
      const currentOwnerId = req.userId!;

      if (!newOwnerId) {
        return res.status(400).json({
          success: false,
          error: 'Le champ newOwnerId est requis'
        });
      }

      const updatedServer = await this.transferOwnershipUseCase.execute({
        currentOwnerId,
        serverId,
        newOwnerId
      });

      res.status(200).json({
        success: true,
        data: updatedServer,
        message: 'Ownership transferred successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Kick a member from the server
   * DELETE /servers/:id/members/:memberId/kick
   */
  kickMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const requesterId = req.userId!;

      const { userId: targetUserId } = await this.kickMemberUseCase.execute({
        requesterId,
        serverId,
        targetMemberId: memberId
      });

      // Notifier la cible en temps réel
      this.io?.to(`user:${targetUserId}`).emit('user:server_kicked', { serverId });

      res.status(200).json({
        success: true,
        message: 'Member kicked successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Ban a member from the server
   * DELETE /servers/:id/members/:memberId/ban
   */
  banMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const memberId = req.params.memberId as string;
      const requesterId = req.userId!;
      const durationRaw = req.body?.durationHours ?? req.query?.durationHours;
      const reason = req.body?.reason as string | undefined;

      const durationHours = durationRaw !== undefined && durationRaw !== null && durationRaw !== ''
        ? Number(durationRaw)
        : null;

      const { userId: targetUserId, isPermanent, expiresAt } = await this.banMemberUseCase.execute({
        requesterId,
        serverId,
        targetMemberId: memberId,
        durationHours: Number.isFinite(durationHours) ? durationHours : null,
        ...(reason !== undefined ? { reason } : {})
      });

      // Notifier la cible en temps réel
      this.io?.to(`user:${targetUserId}`).emit('user:server_banned', {
        serverId,
        isPermanent,
        expiresAt: expiresAt ? expiresAt.toISOString() : null,
        reason: reason ?? null,
      });

      res.status(200).json({
        success: true,
        message: 'Member banned successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lister les bans actifs d'un serveur (temporaires seulement - les définitifs n'ont plus de membre)
   * GET /servers/:id/bans
   */
  getServerBans = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const userId = req.userId as string;

      // Vérifier que le requester est ADMIN ou OWNER du serveur
      const members = await this.getServerMembersUseCase.execute({ serverId, userId });
      const requester = members.find(m => m.userId === userId);
      if (!requester || !requester.isAdminOrOwner()) {
        return res.status(403).json({ success: false, error: 'Seuls les admins et le propriétaire peuvent voir les bans' });
      }

      const activeBans = await this.getServerBansUseCase.execute(serverId);

      return res.status(200).json({ success: true, data: activeBans });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Statut de ban de l'utilisateur courant dans un serveur
   * GET /servers/:id/ban-status
   */
  getMyBanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const serverId = req.params.id as string;
      const userId = req.userId!;

      const ban = await this.banRepository.findActiveByUserAndServer(userId, serverId);

      if (!ban) {
        return res.status(200).json({ success: true, data: { isBanned: false } });
      }

      return res.status(200).json({
        success: true,
        data: {
          isBanned: true,
          isPermanent: ban.isPermanent(),
          expiresAt: ban.expiresAt ? ban.expiresAt.toISOString() : null,
          reason: ban.reason,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
