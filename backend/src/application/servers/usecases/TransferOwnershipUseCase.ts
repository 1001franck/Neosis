import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { ServerRepository } from '../../../domain/servers/repositories/ServerRepository.js';
import { Member, MemberRole } from '../../../domain/members/entities/Member.js';
import { Server } from '../../../domain/servers/entities/server.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * DTO pour transférer la propriété d'un serveur
 */
export interface TransferOwnershipDTO {
  currentOwnerId: string;  // L'utilisateur actuel OWNER
  serverId: string;
  newOwnerId: string;  // L'utilisateur qui deviendra OWNER
}

/**
 * Use Case : Transférer la propriété d'un serveur
 * Responsabilités:
 * - Vérifier que le requester est le OWNER actuel
 * - Vérifier que le nouveau owner est membre du serveur
 * - Changer le rôle de l'ancien owner → ADMIN
 * - Changer le rôle du nouveau owner → OWNER
 * - Mettre à jour le serveur.ownerId
 */
export class TransferOwnershipUseCase extends BaseUseCase<TransferOwnershipDTO, Server> {
  constructor(
    private memberRepository: IMemberRepository,
    private serverRepository: ServerRepository
  ) { super(); }

  getName(): string {
    return 'TransferOwnershipUseCase';
  }

  async execute(data: TransferOwnershipDTO): Promise<Server> {
    // Vérifie que le requester est le OWNER actuel
    const currentOwnerMember = await this.memberRepository.findByUserAndServer(
      data.currentOwnerId,
      data.serverId
    );

    if (!currentOwnerMember) {
      throw new AppError(
        ErrorCode.MEMBER_NOT_FOUND,
        'Vous n\'êtes pas membre de ce serveur',
        404
      );
    }

    if (!currentOwnerMember.isOwner()) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'Seul le propriétaire peut transférer la propriété',
        403
      );
    }

    // Vérifie que l'utilisateur ne se transfère pas à lui-même
    if (data.currentOwnerId === data.newOwnerId) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Vous êtes déjà propriétaire de ce serveur',
        400
      );
    }

    // Vérifie que le nouveau owner est membre du serveur
    const newOwnerMember = await this.memberRepository.findByUserAndServer(
      data.newOwnerId,
      data.serverId
    );

    if (!newOwnerMember) {
      throw new AppError(
        ErrorCode.MEMBER_NOT_FOUND,
        'Le nouvel propriétaire doit être membre du serveur',
        404
      );
    }

    // Récupère le serveur
    const server = await this.serverRepository.findById(data.serverId);

    if (!server) {
      throw new AppError(
        ErrorCode.SERVER_NOT_FOUND,
        'Serveur non trouvé',
        404
      );
    }

    // Effectue le transfert
    // 1. Ancien owner → ADMIN
    currentOwnerMember.updateRole(MemberRole.ADMIN);
    await this.memberRepository.update(currentOwnerMember);

    // 2. Nouveau owner → OWNER
    newOwnerMember.updateRole(MemberRole.OWNER);
    await this.memberRepository.update(newOwnerMember);

    // 3. Met à jour le serveur.ownerId
    const updatedServer = await this.serverRepository.update(data.serverId, {
      ownerId: data.newOwnerId
    } as Partial<Server>);

    return updatedServer;
  }
}
