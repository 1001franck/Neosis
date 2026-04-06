import type { IMemberRepository } from '../../../domain/members/repositories/IMemberRepository.js';
import type { Member } from '../../../domain/members/entities/Member.js';
import { BaseUseCase } from '../../shared/BaseUseCase.js';
import { AppError, ErrorCode } from '../../../shared/errors/AppError.js';

/**
 * Use Case : Obtenir tous les membres d'un serveur
 * Vérifie que le requester est membre du serveur
 */
export interface GetServerMembersDTO {
  serverId: string;
  userId: string;
}

export class GetServerMembersUseCase extends BaseUseCase<GetServerMembersDTO, Member[]> {
  constructor(private memberRepository: IMemberRepository) { super(); }

  getName(): string {
    return 'GetServerMembersUseCase';
  }

  async execute(data: GetServerMembersDTO): Promise<Member[]> {
    // Vérifier que le requester est membre du serveur
    const requester = await this.memberRepository.findByUserAndServer(data.userId, data.serverId);
    if (!requester) {
      throw new AppError(ErrorCode.INVALID_PERMISSIONS, 'Vous n\'êtes pas membre de ce serveur', 403);
    }

    return await this.memberRepository.findByServerId(data.serverId);
  }
}
