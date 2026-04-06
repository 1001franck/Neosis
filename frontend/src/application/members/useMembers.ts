/**
 * APPLICATION - MEMBERS
 * Hook personnalisé pour gérer les membres
 *
 * Responsabilités:
 * - Encapsuler la logique métier des membres
 * - Combiner le store Zustand et le service
 * - Fournir une interface simple et cohérente aux composants
 */

import { useCallback } from 'react';
import { useMemberStore } from './memberStore';
import { memberService } from './memberService';
import type { Member } from '@domain/members/types';
import type { UpdateMemberRequest } from '@domain/members/types';
import { logger } from '@shared/utils/logger';

/**
 * Hook pour gérer les membres
 *
 * @example
 * const { members, isLoading, loadMembers } = useMembers();
 */
export function useMembers() {
  // === STATE SELECTORS ===
  const members = useMemberStore((state) => state.members);
  const isLoading = useMemberStore((state) => state.isLoading);
  const error = useMemberStore((state) => state.error);

  // === STORE ACTIONS ===
  const setMembers = useMemberStore((state) => state.setMembers);
  const updateMember = useMemberStore((state) => state.updateMember);
  const removeMember = useMemberStore((state) => state.removeMember);
  const setLoading = useMemberStore((state) => state.setLoading);
  const setError = useMemberStore((state) => state.setError);

  /**
   * Charger la liste des membres d'un serveur
   */
  const loadMembers = useCallback(
    async (serverId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Loading members', { serverId });
        const members = await memberService.getMembers(serverId);
        setMembers(members);
        logger.info('Members loaded', { serverId, count: members.length });
        return members;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to load members', { error: message, serverId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setMembers, setLoading, setError]
  );

  /**
   * Changer le rôle d'un membre
   */
  const changeRole = useCallback(
    async (serverId: string, memberId: string, request: UpdateMemberRequest) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Changing member role', { serverId, memberId, role: request.role });
        const member = await memberService.updateMember(serverId, memberId, request);
        updateMember(memberId, member);
        logger.info('Member role changed', { serverId, memberId });
        return member;
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to change role', { error: message, serverId, memberId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateMember, setLoading, setError]
  );

  /**
   * Transférer la propriété du serveur
   */
  const transferOwnership = useCallback(
    async (serverId: string, newOwnerId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Transferring ownership', { serverId, newOwnerId });
        await memberService.transferOwnership(serverId, newOwnerId);
        logger.info('Ownership transferred', { serverId, newOwnerId });
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to transfer ownership', { error: message, serverId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  /**
   * Kick a member from the server
   */
  const kickMember = useCallback(
    async (serverId: string, memberId: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Kicking member', { serverId, memberId });
        await memberService.kickMember(serverId, memberId);
        removeMember(memberId);
        logger.info('Member kicked', { serverId, memberId });
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to kick member', { error: message, serverId, memberId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeMember, setLoading, setError]
  );

  /**
   * Ban a member from the server
   */
  const banMember = useCallback(
    async (serverId: string, memberId: string, durationHours?: number | null, reason?: string) => {
      setLoading(true);
      setError(null);
      try {
        logger.info('Banning member', { serverId, memberId });
        await memberService.banMember(serverId, memberId, durationHours, reason);
        removeMember(memberId);
        logger.info('Member banned', { serverId, memberId });
      } catch (err) {
        const message = (err as Error).message;
        logger.error('Failed to ban member', { error: message, serverId, memberId });
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeMember, setLoading, setError]
  );

  return {
    // === STATE ===
    members,
    isLoading,
    error,

    // === ACTIONS ===
    loadMembers,
    changeRole,
    transferOwnership,
    kickMember,
    banMember,
  };
}
