/**
 * DOMAIN - CHANNELS TYPES
 * Types métier purs pour les canaux
 */

export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: ChannelType;
  createdAt: string;
  /** Champs optionnels — non fournis par le backend actuellement */
  topic?: string;
  position?: number;
  isPrivate?: boolean;
  categoryId?: string;
  updatedAt?: string;
}

export interface ChannelCategory {
  id: string;
  serverId: string;
  name: string;
  position: number;
  isCollapsed: boolean;
}

export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
}

export interface UpdateChannelRequest {
  name?: string;
  type?: ChannelType;
}

/**
 * MEDIA ITEM
 * Média partagé dans un channel (image, vidéo, fichier)
 */
export interface MediaItem {
  id: string;
  channelId: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnail?: string;
  name: string;
  size?: number;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
}
