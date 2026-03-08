/**
 * INFRASTRUCTURE - MEMBERS API
 * Appels API pour la gestion des membres
 *
 * Backend envelope { success, data } est unwrappée par l'intercepteur client.ts
 * Routes:
 *   GET /servers/:id/members                → liste
 *   PUT /servers/:id/members/:memberId      → modifier rôle
 *   PUT /servers/:id/transfer               → transférer propriété
 */

import { apiClient } from './client';
import type { Member, UpdateMemberRequest } from '@domain/members/types';

export const membersApi = {
  /**
   * Lister les membres d'un serveur
   * GET /servers/:serverId/members
   */
  getMembers: async (serverId: string): Promise<Member[]> => {
    const response = await apiClient.get<Member[]>(`/servers/${serverId}/members`);
    return response.data;
  },

  /**
   * Mettre à jour le rôle d'un membre
   * PUT /servers/:serverId/members/:memberId
   */
  updateMember: async (serverId: string, memberId: string, request: UpdateMemberRequest): Promise<Member> => {
    const response = await apiClient.put<Member>(
      `/servers/${serverId}/members/${memberId}`,
      request
    );
    return response.data;
  },

  /**
   * Transférer la propriété du serveur
   * PUT /servers/:serverId/transfer
   */
  transferOwnership: async (serverId: string, newOwnerId: string): Promise<void> => {
    await apiClient.put(`/servers/${serverId}/transfer`, { newOwnerId });
  },

  /**
   * Kick a member from the server
   * DELETE /servers/:serverId/members/:memberId/kick
   */
  kickMember: async (serverId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/servers/${serverId}/members/${memberId}/kick`);
  },

  /**
   * Ban a member from the server (temporaire ou definitif)
   * DELETE /servers/:serverId/members/:memberId/ban?durationHours=...
   */
  banMember: async (serverId: string, memberId: string, durationHours?: number | null, reason?: string): Promise<void> => {
    await apiClient.delete(`/servers/${serverId}/members/${memberId}/ban`, {
      params: durationHours ? { durationHours } : undefined,
      data: reason ? { reason } : undefined,
    });
  },
};
