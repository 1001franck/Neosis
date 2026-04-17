import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * DTO pour quitter un serveur
 */
export interface LeaveServerDTO {
  userId: string;
  serverId: string;
}

/**
 * Use Case : Quitter un serveur
 * Responsabilités:
 * - Vérifier que l'utilisateur est membre du serveur
 * - Empêcher le OWNER de quitter (il doit transférer ownership d'abord)
 * - Supprimer le member
 */
export class LeaveServerUseCase extends BaseUseCase<LeaveServerDTO, void> {
  constructor(private memberRepository: IMemberRepository) { super(); }

  getName(): string {
    return 'LeaveServerUseCase';
  }

  async execute(data: LeaveServerDTO): Promise<void> {
    // Vérifie que l'utilisateur est membre du serveur
    const member = await this.memberRepository.findByUserAndServer(
      data.userId,
      data.serverId
    );

    if (!member) {
      throw new AppError(
        ErrorCode.MEMBER_NOT_FOUND,
        'Vous n\'êtes pas membre de ce serveur',
        404
      );
    }

    // Empêche le OWNER de quitter le serveur
    if (member.isOwner()) {
      throw new AppError(
        ErrorCode.INVALID_PERMISSIONS,
        'Le propriétaire ne peut pas quitter le serveur. Transférez d\'abord la propriété ou supprimez le serveur.',
        403
      );
    }

    // Supprime le member
    await this.memberRepository.delete(member.id);
  }
}
