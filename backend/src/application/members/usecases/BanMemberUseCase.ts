import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { IBanRepository } from '../../../domain/bans/repositories/IBanRepository.js';
import { Ban } from '../../../domain/bans/entities/Ban.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';
import crypto from 'crypto';

export interface BanMemberDTO {
  requesterId: string;
  serverId: string;
  targetMemberId: string;
  reason?: string;
  /** Duree du ban en heures. null ou absent = ban definitif */
  durationHours?: number | null;
}

/**
 * Use Case : Ban un membre du serveur
 *
 * Logique :
 * 1. Verifie les permissions (OWNER uniquement)
 * 2. Resout le userId depuis le memberId
 * 3. Cree un enregistrement Ban (temporaire ou definitif)
 * 4. Supprime le member du serveur
 *
 * Un ban temporaire : expiresAt = now + durationHours
 * Un ban definitif  : expiresAt = null
 *
 * Le JoinServerUseCase verifie ensuite si l'utilisateur est banni
 * avant de le laisser rejoindre.
 */
export class BanMemberUseCase extends BaseUseCase<BanMemberDTO, void> {
  constructor(
    private memberRepository: IMemberRepository,
    private banRepository: IBanRepository
  ) { super(); }

  getName(): string {
    return 'BanMemberUseCase';
  }

  async execute(data: BanMemberDTO): Promise<void> {
    // 1. Verifier que le demandeur est membre du serveur
    const requester = await this.memberRepository.findByUserAndServer(
      data.requesterId,
      data.serverId
    );

    if (!requester) {
      throw new AppError(ErrorCode.MEMBER_NOT_FOUND, 'You are not a member of this server', 404);
    }

    // 2. Seul le OWNER peut bannir
    if (!requester.canBanMembers()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Only the server owner can ban members', 403);
    }

    // 3. Recuperer le membre cible
    const target = await this.memberRepository.findById(data.targetMemberId);

    if (!target) {
      throw new AppError(ErrorCode.MEMBER_NOT_FOUND, 'Member not found', 404);
    }

    // 4. Verifier que la cible est dans le meme serveur
    if (target.serverId !== data.serverId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Member is not in this server', 400);
    }

    // 5. Impossible de bannir le owner
    if (target.isOwner()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Cannot ban the server owner', 403);
    }

    // 6. Protection supplémentaire : impossible de bannir un admin
    // (Cette vérification est redondante car seul OWNER peut arriver ici,
    // mais on la garde pour la clarté et la sécurité défensive)
    if (target.isAdmin()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Cannot ban an admin', 403);
    }

    // 7. Calculer la date d'expiration
    let expiresAt: Date | null = null;
    if (data.durationHours !== undefined && data.durationHours !== null && data.durationHours > 0) {
      expiresAt = new Date(Date.now() + data.durationHours * 60 * 60 * 1000);
    }

    // 8. Creer le ban en base (upsert si deja banni -> remplace)
    const ban = new Ban(
      crypto.randomUUID(),
      target.userId,
      data.serverId,
      data.requesterId,
      data.reason || null,
      expiresAt,
      new Date()
    );

    await this.banRepository.create(ban);

    // 9. Supprimer le membre du serveur
    await this.memberRepository.delete(target.id);
  }
}
