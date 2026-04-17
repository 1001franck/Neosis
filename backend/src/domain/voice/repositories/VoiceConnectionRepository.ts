/**
 * DOMAIN - VOICE CONNECTION REPOSITORY INTERFACE
 * Contrat pour la persistance des connexions vocales
 */

import type { VoiceConnection } from '../entities/VoiceConnection.js';

/**
 * Interface du repository pour les connexions vocales
 *
 * Clean Architecture : le Domain définit l'interface,
 * l'Infrastructure fournit l'implémentation concrète (Prisma)
 */
export interface VoiceConnectionRepository {
  /**
   * Créer une nouvelle connexion vocale
   * @throws Error si l'utilisateur est déjà connecté ailleurs
   */
  create(connection: VoiceConnection): Promise<VoiceConnection>;

  /**
   * Trouver la connexion vocale d'un utilisateur (peu importe le channel)
   */
  findByUserId(userId: string): Promise<VoiceConnection | null>;

  /**
   * Trouver toutes les connexions vocales d'un channel
   */
  findByChannelId(channelId: string): Promise<VoiceConnection[]>;

  /**
   * Mettre à jour l'état vocal (muted/deafened)
   */
  updateState(userId: string, isMuted: boolean, isDeafened: boolean): Promise<VoiceConnection>;

  /**
   * Mettre à jour l'état vidéo (caméra / partage d'écran)
   */
  updateVideoState(userId: string, isVideoEnabled: boolean, isScreenSharing: boolean): Promise<VoiceConnection>;

  /**
   * Supprimer une connexion vocale (= quitter le voice channel)
   */
  delete(userId: string): Promise<void>;

  /**
   * Compter le nombre d'utilisateurs connectés dans un channel
   */
  countByChannelId(channelId: string): Promise<number>;
}
