/**
 * DOMAIN - VOICE TYPES
 * Types TypeScript pour la communication vocale
 */

/**
 * Utilisateur connecté dans un voice channel
 */
export interface VoiceUser {
  userId: string;
  username: string;
  avatar: string | null;
  isMuted: boolean;      // Micro coupé
  isDeafened: boolean;   // Son coupé
  isSpeaking?: boolean;  // En train de parler
  connectedAt: string;   // ISO date string
}

/**
 * État vocal de l'utilisateur courant
 */
export interface VoiceState {
  isConnected: boolean;           // Connecté à un voice channel
  connectedChannelId: string | null;  // ID du channel vocal actuel
  isMuted: boolean;               // Mon micro est coupé
  isDeafened: boolean;            // Mon son est coupé
  isConnecting: boolean;          // En train de se connecter
  error: string | null;           // Erreur éventuelle
}

/**
 * Événements Socket.IO pour le voice
 */
export interface VoiceEvents {
  // Client → Serveur
  'voice:join': { channelId: string };
  'voice:leave': Record<string, never>;
  'voice:state': { isMuted?: boolean; isDeafened?: boolean };
  'voice:webrtc_signal': { targetUserId: string; signal: unknown };

  // Serveur → Client
  'voice:user_joined': {
    userId: string;
    username: string;
    channelId: string;
    isMuted: boolean;
    isDeafened: boolean;
  };
  'voice:user_left': {
    userId: string;
    channelId: string;
  };
  'voice:user_state_changed': {
    userId: string;
    isMuted: boolean;
    isDeafened: boolean;
  };
  'voice:channel_users': {
    channelId: string;
    users: VoiceUser[];
  };
  'voice:error': {
    message: string;
  };
}
