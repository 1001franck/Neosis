/**
 * DOMAIN - MEMBERS TYPES
 * Types métier purs pour les membres des serveurs
 */

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum MemberStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  KICKED = 'kicked',
}

export interface Member {
  id: string;
  serverId: string;
  userId: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    bio?: string | null;
    customStatus?: string | null;
    statusEmoji?: string | null;
    banner?: string | null;
  };
}

export interface UpdateMemberRequest {
  role?: MemberRole;
  status?: MemberStatus;
}

export interface BanMemberRequest {
  memberId: string;
  reason?: string;
}

export interface KickMemberRequest {
  memberId: string;
  reason?: string;
}

/**
 * ROLE
 * Rôle dans un serveur avec permissions et apparence
 */
export interface Role {
  id: string;
  serverId: string;
  name: string;
  color?: string;
  position: number;
  permissions: string[];
  createdAt: string;
}
