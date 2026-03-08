/**
 * =====================================================
 * Rôles et constantes
 * =====================================================
 */

/**
 * Rôles utilisateurs dans un serveur
 */
export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

/**
 * Permissions par rôle
 */
export const ROLE_PERMISSIONS = {
  [UserRole.OWNER]: [
    'CREATE_CHANNEL',
    'DELETE_CHANNEL',
    'UPDATE_CHANNEL',
    'MANAGE_MEMBERS',
    'DELETE_MESSAGE',
    'KICK_MEMBER',
    'BAN_MEMBER',
    'TRANSFER_OWNERSHIP',
  ],
  [UserRole.ADMIN]: [
    'CREATE_CHANNEL',
    'DELETE_CHANNEL',
    'UPDATE_CHANNEL',
    'DELETE_MESSAGE',
    'KICK_MEMBER',
  ],
  [UserRole.MEMBER]: [
    'SEND_MESSAGE',
    'DELETE_OWN_MESSAGE',
  ],
};

/**
 * Vérifier si un rôle a une permission
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Types de canaux
 */
export enum ChannelType {
  TEXT = 'TEXT',
  VOICE = 'VOICE',
}
