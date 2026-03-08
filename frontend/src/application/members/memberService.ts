/**
 * APPLICATION - MEMBERS SERVICE
 */

import { membersApi } from '@infrastructure/api/members.api';
import type { Member, UpdateMemberRequest } from '@domain/members/types';
import { InsufficientPermissionsError } from '@domain/members/errors';
import { logger } from '@shared/utils/logger';

export class MemberService {
  async getMembers(serverId: string): Promise<Member[]> {
    try {
      logger.info('Fetching members', { serverId });
      return await membersApi.getMembers(serverId);
    } catch (error) {
      logger.error('Failed to fetch members', error);
      throw error;
    }
  }

  async updateMember(serverId: string, memberId: string, request: UpdateMemberRequest): Promise<Member> {
    try {
      logger.info('Updating member role', { serverId, memberId, role: request.role });
      return await membersApi.updateMember(serverId, memberId, request);
    } catch (error) {
      logger.error('Failed to update member', error);
      throw new InsufficientPermissionsError();
    }
  }

  async transferOwnership(serverId: string, newOwnerId: string): Promise<void> {
    try {
      logger.info('Transferring ownership', { serverId, newOwnerId });
      return await membersApi.transferOwnership(serverId, newOwnerId);
    } catch (error) {
      logger.error('Failed to transfer ownership', error);
      throw new InsufficientPermissionsError();
    }
  }

  async kickMember(serverId: string, memberId: string): Promise<void> {
    try {
      logger.info('Kicking member', { serverId, memberId });
      return await membersApi.kickMember(serverId, memberId);
    } catch (error) {
      logger.error('Failed to kick member', error);
      throw error;
    }
  }

  async banMember(serverId: string, memberId: string, durationHours?: number | null, reason?: string): Promise<void> {
    try {
      logger.info('Banning member', { serverId, memberId });
      return await membersApi.banMember(serverId, memberId, durationHours, reason);
    } catch (error) {
      logger.error('Failed to ban member', error);
      throw error;
    }
  }
}

export const memberService = new MemberService();
