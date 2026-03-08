import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

export interface KickMemberDTO {
  requesterId: string;
  serverId: string;
  targetMemberId: string;
}

/**
 * Use Case : Kick un membre du serveur
 * Le membre est supprime mais peut rejoin avec un code d'invitation
 */
export class KickMemberUseCase extends BaseUseCase<KickMemberDTO, void> {
  constructor(private memberRepository: IMemberRepository) { super(); }

  getName(): string {
    return 'KickMemberUseCase';
  }

  async execute(data: KickMemberDTO): Promise<void> {
    // Verify requester is a member
    const requester = await this.memberRepository.findByUserAndServer(
      data.requesterId,
      data.serverId
    );

    if (!requester) {
      throw new AppError(ErrorCode.MEMBER_NOT_FOUND, 'You are not a member of this server', 404);
    }

    // Only OWNER and ADMIN can kick
    if (!requester.isAdminOrOwner()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Only admins and owners can kick members', 403);
    }

    // Get target member
    const target = await this.memberRepository.findById(data.targetMemberId);

    if (!target) {
      throw new AppError(ErrorCode.MEMBER_NOT_FOUND, 'Member not found', 404);
    }

    // Verify target is in the same server
    if (target.serverId !== data.serverId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Member is not in this server', 400);
    }

    // Cannot kick the owner
    if (target.isOwner()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Cannot kick the server owner', 403);
    }

    // Admin cannot kick other admins (only owner can)
    if (target.isAdmin() && !requester.isOwner()) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Only the owner can kick admins', 403);
    }

    // Remove the member
    await this.memberRepository.delete(target.id);
  }
}
