/**
 * INFRASTRUCTURE - SERVERS API
 * Appels API pour les serveurs
 *
 * Backend envelope { success, data } est unwrappée par l'intercepteur client.ts
 */

import { apiClient } from './client';
import type { Server, ServerWithMembers, CreateServerRequest, UpdateServerRequest } from '@domain/servers/types';

const ENDPOINT = '/servers';

export const serversApi = {
  /**
   * Lister les serveurs de l'utilisateur
   * GET /servers → { success, data: Server[] }
   */
  getServers: async (): Promise<Server[]> => {
    const response = await apiClient.get<Server[]>(`${ENDPOINT}`);
    return response.data;
  },

  /**
   * Récupérer un serveur avec ses détails
   * GET /servers/:id → { success, data: Server }
   */
  getServer: async (serverId: string): Promise<ServerWithMembers> => {
    const response = await apiClient.get<ServerWithMembers>(`${ENDPOINT}/${serverId}`);
    return response.data;
  },

  /**
   * Créer un serveur
   * POST /servers → { success, data: Server }
   */
  createServer: async (request: CreateServerRequest): Promise<Server> => {
    const response = await apiClient.post<Server>(`${ENDPOINT}`, request);
    return response.data;
  },

  /**
   * Mettre à jour un serveur
   * PUT /servers/:id → { success, data: Server }
   */
  updateServer: async (serverId: string, request: UpdateServerRequest): Promise<Server> => {
    const response = await apiClient.put<Server>(`${ENDPOINT}/${serverId}`, request);
    return response.data;
  },

  /**
   * Uploader l'image d'un serveur
   * POST /servers/:id/image (multipart/form-data)
   */
  uploadServerImage: async (serverId: string, file: File): Promise<Server> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post<Server>(`${ENDPOINT}/${serverId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Supprimer un serveur
   * DELETE /servers/:id → 204
   */
  deleteServer: async (serverId: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINT}/${serverId}`);
  },

  /**
   * Rejoindre un serveur
   * POST /servers/join → { success, data: Server }
   */
  joinServer: async (inviteCode: string): Promise<Server> => {
    const response = await apiClient.post<Server>(`${ENDPOINT}/join`, { inviteCode });
    return response.data;
  },

  /**
   * Quitter un serveur
   * DELETE /servers/:id/leave → { success, message }
   */
  leaveServer: async (serverId: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINT}/${serverId}/leave`);
  },

  /**
   * Statut de ban de l'utilisateur courant dans un serveur
   * GET /servers/:id/ban-status
   */
  getMyBanStatus: async (serverId: string): Promise<{
    isBanned: boolean;
    isPermanent?: boolean;
    expiresAt?: string | null;
    reason?: string | null;
  }> => {
    const response = await apiClient.get(`${ENDPOINT}/${serverId}/ban-status`);
    return response.data;
  },
};
