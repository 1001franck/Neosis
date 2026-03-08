import type { ServerRepository } from '../../../domain/servers/repositories/ServerRepository.js';
import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { IBanRepository } from '../../../domain/bans/repositories/IBanRepository.js';
import { Server } from '../../../domain/servers/entities/server.js';
import { Member, MemberRole } from '../../../domain/members/entities/Member.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import crypto from 'crypto';

/**
 * Use Case : Obtenir un serveur par ID
 */
export interface GetServerByIdDTO {
  serverId: string;
  userId: string;
}

export class GetServerByIdUseCase extends BaseUseCase<GetServerByIdDTO, Server> {
  constructor(
    private serverRepository: ServerRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'GetServerByIdUseCase';
  }

  async execute(data: GetServerByIdDTO): Promise<Server> {
    const server = await this.serverRepository.findById(data.serverId);
    
    if (!server) {
      throw new AppError(ErrorCode.SERVER_NOT_FOUND, 'Serveur non trouvé', 404);
    }

    // Vérifier que le requester est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, data.serverId);
    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    return server;
  }
}

/**
 * Use Case : Obtenir tous les serveurs d'un utilisateur
 */
export class GetUserServersUseCase extends BaseUseCase<string, Server[]> {
  constructor(private serverRepository: ServerRepository) { super(); }

  getName(): string {
    return 'GetUserServersUseCase';
  }

  async execute(userId: string): Promise<Server[]> {
    return await this.serverRepository.findByUserId(userId);
  }
}

/**
 * Use Case : Rejoindre un serveur avec un code d'invitation
 */
export interface JoinServerDTO {
  userId: string;
  inviteCode: string;
}

export class JoinServerUseCase extends BaseUseCase<JoinServerDTO, Server> {
  constructor(
    private serverRepository: ServerRepository,
    private memberRepository: IMemberRepository,
    private banRepository: IBanRepository
  ) { super(); }

  getName(): string {
    return 'JoinServerUseCase';
  }

  async execute(data: JoinServerDTO): Promise<Server> {
    const server = await this.serverRepository.findByInviteCode(data.inviteCode);
    
    if (!server) {
      throw new AppError(ErrorCode.SERVER_NOT_FOUND, 'Code d\'invitation invalide', 404);
    }

    // Vérifie si l'utilisateur est banni du serveur
    const activeBan = await this.banRepository.findActiveByUserAndServer(data.userId, server.id);
    if (activeBan) {
      const message = activeBan.isPermanent()
        ? 'Vous êtes banni définitivement de ce serveur'
        : `Vous êtes banni de ce serveur jusqu'au ${activeBan.expiresAt!.toISOString()}`;
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, message, 403);
    }

    // Vérifie si l'utilisateur est déjà membre du serveur
    const existingMember = await this.memberRepository.findByUserAndServer(
      data.userId,
      server.id
    );

    if (existingMember) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Vous êtes déjà membre de ce serveur', 409);
    }

    // Crée le member avec le rôle MEMBER
    const newMember = new Member(
      crypto.randomUUID(),
      data.userId,
      server.id,
      MemberRole.MEMBER,
      new Date()
    );

    try {
      await this.memberRepository.create(newMember);
    } catch (error: unknown) {
      // Prisma P2002 = unique constraint violation (race condition: concurrent join)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Vous êtes déjà membre de ce serveur', 409);
      }
      throw error;
    }

    return server;
  }
}

/**
 * Use Case : Mettre à jour un serveur
 * ⚠️ PERMISSIONS : Seul le OWNER peut modifier le serveur
 */
export interface UpdateServerDTO {
  serverId: string;
  userId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export class UpdateServerUseCase extends BaseUseCase<UpdateServerDTO, Server> {
  constructor(
    private serverRepository: ServerRepository,
    private memberRepository: IMemberRepository
  ) { super(); }

  getName(): string {
    return 'UpdateServerUseCase';
  }

  async execute(data: UpdateServerDTO): Promise<Server> {
    const server = await this.serverRepository.findById(data.serverId);

    if (!server) {
      throw new AppError(ErrorCode.SERVER_NOT_FOUND, 'Serveur non trouvé', 404);
    }

    // Vérifier que l'utilisateur est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(data.userId, data.serverId);
    if (!member) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous devez être membre du serveur', 403);
    }

    // ⚠️ CRITIQUE : Seul le OWNER peut modifier le serveur
    if (!member.canManageServer()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seul le propriétaire peut modifier les paramètres du serveur', 403);
    }

    const updateData: Partial<Server> = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();
      if (trimmedName.length === 0 || trimmedName.length > 100) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Le nom doit contenir entre 1 et 100 caractères', 400);
      }
      server.updateName(trimmedName);
      updateData.name = trimmedName;
    }

    if (data.description !== undefined) {
      const trimmedDesc = data.description.trim();
      if (trimmedDesc.length > 500) {
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'La description ne peut pas dépasser 500 caractères', 400);
      }
      updateData.description = trimmedDesc || null;
    }

    if (data.imageUrl !== undefined) {
      server.updateImage(data.imageUrl);
      updateData.imageUrl = data.imageUrl;
    }

    return await this.serverRepository.update(data.serverId, updateData);
  }
}

/**
 * Use Case : Supprimer un serveur
 */
export interface DeleteServerDTO {
  serverId: string;
  userId: string;
}

export class DeleteServerUseCase extends BaseUseCase<DeleteServerDTO, void> {
  constructor(private serverRepository: ServerRepository) { super(); }

  getName(): string {
    return 'DeleteServerUseCase';
  }

  async execute(data: DeleteServerDTO): Promise<void> {
    const server = await this.serverRepository.findById(data.serverId);
    
    if (!server) {
      throw new AppError(ErrorCode.SERVER_NOT_FOUND, 'Serveur non trouvé', 404);
    }

    if (!server.isOwner(data.userId)) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Seul le propriétaire peut supprimer le serveur', 403);
    }

    await this.serverRepository.delete(data.serverId);
  }
}