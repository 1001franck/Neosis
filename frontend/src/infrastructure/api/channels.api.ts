/**
 * INFRASTRUCTURE - CHANNELS API
 * Appels API pour les canaux
 *
 * Backend envelope { success, data } est unwrappée par l'intercepteur client.ts
 * Routes:
 *   GET    /servers/:serverId/channels     → liste
 *   POST   /servers/:serverId/channels     → créer
 *   GET    /channels/:id                   → détail
 *   PUT    /channels/:id                   → modifier
 *   DELETE /channels/:id                   → supprimer
 */

import { apiClient } from './client';
import type { Channel, CreateChannelRequest, UpdateChannelRequest } from '@domain/channels/types';

export const channelsApi = {
  /**
   * Lister les canaux d'un serveur
   * GET /servers/:serverId/channels
   */
  getChannels: async (serverId: string): Promise<Channel[]> => {
    const response = await apiClient.get<Channel[]>(`/servers/${serverId}/channels`);
    return response.data;
  },

  /**
   * Récupérer un canal
   * GET /channels/:id
   */
  getChannel: async (channelId: string): Promise<Channel> => {
    const response = await apiClient.get<Channel>(`/channels/${channelId}`);
    return response.data;
  },

  /**
   * Créer un canal
   * POST /servers/:serverId/channels
   */
  createChannel: async (serverId: string, request: CreateChannelRequest): Promise<Channel> => {
    const response = await apiClient.post<Channel>(`/servers/${serverId}/channels`, request);
    return response.data;
  },

  /**
   * Mettre à jour un canal
   * PUT /channels/:id
   */
  updateChannel: async (channelId: string, request: UpdateChannelRequest): Promise<Channel> => {
    const response = await apiClient.put<Channel>(`/channels/${channelId}`, request);
    return response.data;
  },

  /**
   * Supprimer un canal
   * DELETE /channels/:id
   */
  deleteChannel: async (channelId: string): Promise<void> => {
    await apiClient.delete(`/channels/${channelId}`);
  },
};
