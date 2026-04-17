/**
 * DOMAIN - SERVERS TYPES
 * Types métier purs pour les serveurs Discord-like
 * 
 * NOTE: Channel, Member et Role sont dans leurs domaines respectifs:
 * - Channel → @domain/channels/types
 * - Member → @domain/members/types  
 * - Role → @domain/members/types
 */

export interface Server {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  inviteCode?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServerWithMembers extends Server {
  memberCount: number;
}

export interface CreateServerRequest {
  name: string;
  description?: string;
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
}
