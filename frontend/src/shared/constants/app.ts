/**
 * SHARED CONSTANTS - APPLICATION
 * Constantes globales de l'application
 */

/**
 * États de message
 */
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export type MessageStatus = typeof MESSAGE_STATUS[keyof typeof MESSAGE_STATUS];

/**
 * Limites de contenu
 */
export const CONTENT_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_USERNAME_LENGTH: 32,
  MAX_SERVER_NAME_LENGTH: 100,
  MAX_CHANNEL_NAME_LENGTH: 100,
} as const;

/**
 * IDs par défaut pour le développement
 */
export const DEFAULT_IDS = {
  CURRENT_USER: 'current-user-id',
  DEFAULT_CHANNEL: 'general-chat',
} as const;

/**
 * Statuts utilisateur
 */
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  IDLE: 'idle',
  DND: 'dnd',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

/**
 * Tailles de sidebar
 */
export const SIDEBAR_WIDTHS = {
  SERVER: 72,           // ServerSidebar
  CHANNELS: 240,        // ServerChannelsSidebar
  CHANNELS_COLLAPSED: 72, // ServerChannelsSidebar collapsed
  MEMBERS: 240,         // MembersSidebar
  CHANNEL_INFO: 340,    // ChannelInfoSidebar
  DIRECT_MESSAGES: 240, // DirectMessagesPanel
} as const;

/**
 * Délais et timeouts
 */
export const TIMEOUTS = {
  TYPING_INDICATOR: 3000,
  TOAST_DEFAULT: 3000,
  API_TIMEOUT: 5000,
  DEBOUNCE_SEARCH: 300,
} as const;

/**
 * Clés de storage
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LOCALE: 'locale',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
} as const;

/**
 * Couleurs d'arrière-plan
 */
export const BACKGROUND_COLORS = {
  MUTED: '#2b2d31',
  PRIMARY: '#1e1f22',
  SECONDARY: '#2b2d31',
  TERTIARY: '#313338',
} as const;
