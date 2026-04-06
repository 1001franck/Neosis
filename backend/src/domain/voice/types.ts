/**
 * DOMAIN - VOICE TYPES
 * Types et interfaces pour la communication vocale
 */

/**
 * État de l'utilisateur dans un voice channel
 */
export interface VoiceState {
  isMuted: boolean;    // Micro coupé
  isDeafened: boolean; // Son coupé (implique aussi muted)
}

/**
 * Informations d'un utilisateur connecté à un voice channel
 */
export interface VoiceUser {
  userId: string;
  username: string;
  avatar: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  connectedAt: Date;
}
