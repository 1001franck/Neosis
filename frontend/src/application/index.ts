/**
 * APPLICATION HOOKS INDEX
 * Exporte tous les hooks de l'application pour un accès facile
 *
 * Responsabilités:
 * - Centraliser les exports de tous les hooks
 * - Fournir un point d'accès unique
 * - Faciliter l'importation dans les composants
 */

// === AUTH HOOKS ===
export { useAuth } from './auth/useAuth';
export { AuthProvider, useAuthContext } from './auth/AuthContext';
export type { AuthStoreState } from './auth/authStore';

// === SERVERS HOOKS ===
export { useServers } from './servers/useServers';

// === CHANNELS HOOKS ===
export { useChannels } from './channels/useChannels';

// === MESSAGES HOOKS ===
export { useMessages } from './messages/useMessages';

// === MEMBERS HOOKS ===
export { useMembers } from './members/useMembers';
