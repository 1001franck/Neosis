/**
 * INFRASTRUCTURE - MESSAGES API
 * Appels API pour les messages
 *
 * Backend envelope { success, data } est unwrappée par l'intercepteur client.ts
 * Routes:
 *   GET    /channels/:channelId/messages        → liste (query: ?limit=N&before=DATE)
 *   POST   /channels/:channelId/messages        → créer
 *   GET    /messages/:id                        → détail
 *   PUT    /channels/:channelId/messages/:id    → modifier
 *   DELETE /channels/:channelId/messages/:id    → supprimer
 */

import { apiClient } from './client';
import type { Message, CreateMessageRequest, UpdateMessageRequest } from '@domain/messages/types';

export const messagesApi = {
  /**
   * Lister les messages d'un canal
   * GET /channels/:channelId/messages?limit=N&before=DATE
   */
  getMessages: async (channelId: string, limit?: number, before?: string): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (before) params.set('before', before);
    const qs = params.toString();
    const response = await apiClient.get<Message[]>(
      `/channels/${channelId}/messages${qs ? `?${qs}` : ''}`
    );
    return response.data;
  },

  /**
   * Récupérer un message
   * GET /messages/:id
   */
  getMessage: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get<Message>(`/messages/${messageId}`);
    return response.data;
  },

  /**
   * Créer un message
   * POST /channels/:channelId/messages
   */
  createMessage: async (request: CreateMessageRequest): Promise<Message> => {
    const { channelId, ...body } = request;
    const response = await apiClient.post<Message>(
      `/channels/${channelId}/messages`,
      body
    );
    return response.data;
  },

  /**
   * Modifier un message
   * PUT /channels/:channelId/messages/:id
   */
  updateMessage: async (channelId: string, messageId: string, request: UpdateMessageRequest): Promise<Message> => {
    const response = await apiClient.put<Message>(
      `/channels/${channelId}/messages/${messageId}`,
      request
    );
    return response.data;
  },

  /**
   * Supprimer un message
   * DELETE /channels/:channelId/messages/:id
   */
  deleteMessage: async (channelId: string, messageId: string, scope?: 'me' | 'everyone'): Promise<void> => {
    const qs = scope ? `?scope=${scope}` : '';
    await apiClient.delete(`/channels/${channelId}/messages/${messageId}${qs}`);
  },
};
