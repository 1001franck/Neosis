import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { Member, MemberRole } from '../../../domain/members/entities/Member.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * DTO pour mettre à jour le rôle d'un membre
 */
export interface UpdateMemberRoleDTO {
  requesterId: string;  // L'utilisateur qui fait la requête (doit être OWNER)
  serverId: string;
  targetMemberId: string;  // Le member dont on veut changer le rôle
  newRole: MemberRole;
}

/**
 * Use Case : Mettre à jour le rôle d'un membre
 * Responsabilités:
 * - Vérifier que le requester est OWNER du serveur
 * - Empêcher de changer le rôle du OWNER
 * - Mettre à jour le rôle du member cible
 */
export class UpdateMemberRoleUseCase extends BaseUseCase<UpdateMemberRoleDTO, Member> {
  constructor(private memberRepository: IMemberRepository) { super(); }

  getName(): string {
    return 'UpdateMemberRoleUseCase';
  }

  async execute(data: UpdateMemberRoleDTO): Promise<Member> {
    // Vérifie que le requester est membre du serveur
    const requester = await this.memberRepository.findByUserAndServer(
      data.requesterId,
      data.serverId
    );

    if (!requester) {
      throw new AppError(
        ErrorCode.MEMBER_NOT_FOUND,
        'Vous n\'êtes pas membre de ce serveur',
        404
      );
    }

    // Seul le OWNER peut modifier les rôles
    if (!requester.isOwner()) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'Seul le propriétaire peut modifier les rôles des membres',
        403
      );
    }

    // Récupère le member cible
    const targetMember = await this.memberRepository.findById(data.targetMemberId);

    if (!targetMember) {
      throw new AppError(
        ErrorCode.MEMBER_NOT_FOUND,
        'Membre non trouvé',
        404
      );
    }

    // Vérifie que le member cible est bien dans le même serveur
    if (targetMember.serverId !== data.serverId) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Le membre ne fait pas partie de ce serveur',
        400
      );
    }

    // Empêche de modifier le rôle du OWNER
    if (targetMember.isOwner()) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'Impossible de modifier le rôle du propriétaire. Utilisez le transfert de propriété.',
        403
      );
    }

    // Empêche de promouvoir quelqu'un en OWNER via cette route
    if (data.newRole === MemberRole.OWNER) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'Utilisez le transfert de propriété pour nommer un nouveau propriétaire',
        403
      );
    }

    // Met à jour le rôle
    targetMember.updateRole(data.newRole);
    return await this.memberRepository.update(targetMember);
  }
}
