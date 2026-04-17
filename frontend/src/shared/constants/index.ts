// Constantes partagées

export * from './app';

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const CHANNEL_TYPES = {
  TEXT: 'TEXT',
  VOICE: 'VOICE',
} as const;

export const MESSAGES = {
  SUCCESS_CREATE: 'Créé avec succès',
  ERROR_GENERIC: 'Quelque chose s\'est mal passé',
} as const;
