/**
 * UPLOAD CONSTANTS
 * Constantes pour l'upload de fichiers
 */

/**
 * Types de fichiers acceptés par défaut
 */
export const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/webm',
];

/**
 * Taille maximale par défaut (10MB)
 */
export const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;

/**
 * Nombre maximal de fichiers par défaut
 */
export const DEFAULT_MAX_FILES = 10;

/**
 * Types MIME par catégorie
 */
export const MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/ogg'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
} as const;

/**
 * Extensions de fichiers par type
 */
export const FILE_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  videos: ['.mp4', '.webm', '.ogg'],
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  audio: ['.mp3', '.wav', '.ogg'],
} as const;

/**
 * Vérifier si un type MIME est une image
 */
export function isImageType(mimeType: string): boolean {
  return (MIME_TYPES.images as readonly string[]).includes(mimeType);
}

/**
 * Vérifier si un type MIME est une vidéo
 */
export function isVideoType(mimeType: string): boolean {
  return (MIME_TYPES.videos as readonly string[]).includes(mimeType);
}
