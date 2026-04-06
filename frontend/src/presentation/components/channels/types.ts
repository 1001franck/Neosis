/**
 * CHANNEL COMPONENTS TYPES
 * Types partagés entre les composants de channel
 */

export interface ChannelMedia {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnail?: string;
  name: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ChannelLink {
  id: string;
  url: string;
  title: string;
  description?: string;
  postedBy: string;
  postedAt: Date;
}

export type TabType = 'media' | 'links' | 'files';
export type MediaFilter = 'all' | 'images' | 'videos';
