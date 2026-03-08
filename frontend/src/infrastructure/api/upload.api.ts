/**
 * INFRASTRUCTURE - UPLOAD API
 * Appels API pour l'upload de fichiers et la récupération de médias
 *
 * Routes:
 *   POST   /upload                       → Upload fichiers (multipart/form-data)
 *   GET    /channels/:channelId/media    → Médias/fichiers/liens d'un channel
 */

import { apiClient } from './client';
import type { Attachment } from '@domain/messages/types';

export interface ChannelMediaResponse {
  media: {
    id: string;
    type: 'image' | 'video';
    url: string;
    name: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
  }[];
  files: {
    id: string;
    type: 'file';
    url: string;
    name: string;
    size: number;
    uploadedBy: string;
    uploadedAt: string;
  }[];
  links: {
    id: string;
    url: string;
    title: string;
    postedBy: string;
    postedAt: string;
  }[];
}

export const uploadApi = {
  /**
   * Upload fichiers en multipart/form-data
   * POST /upload
   */
  uploadFiles: async (
    files: File[],
    channelId: string,
    messageId?: string
  ): Promise<Attachment[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('channelId', channelId);
    if (messageId) {
      formData.append('messageId', messageId);
    }

    const response = await apiClient.post<Attachment[]>('/upload', formData, {
      headers: { 'Content-Type': undefined },  // laisser le navigateur auto-set le boundary
      timeout: 60000, // 60s pour les gros fichiers
    });
    return response.data;
  },

  /**
   * Récupérer les médias/fichiers/liens d'un channel
   * GET /channels/:channelId/media
   */
  getChannelMedia: async (channelId: string): Promise<ChannelMediaResponse> => {
    const response = await apiClient.get<ChannelMediaResponse>(
      `/channels/${channelId}/media`
    );
    return response.data;
  },
};
