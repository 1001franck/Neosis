import type { Ban } from '../entities/Ban.js';

/**
 * Interface du repository pour les bans
 * Definit les operations de persistance pour l'entite Ban
 */
export interface IBanRepository {
  /**
   * Cree un nouveau ban
   * Si un ban existe deja pour ce user/server, le remplace (upsert)
   */
  create(ban: Ban): Promise<Ban>;

  /**
   * Trouve un ban actif pour un utilisateur dans un serveur
   * Retourne null si pas de ban ou si le ban a expire
   */
  findActiveByUserAndServer(userId: string, serverId: string): Promise<Ban | null>;

  /**
   * Supprime un ban (unban)
   */
  delete(userId: string, serverId: string): Promise<void>;

  /**
   * Liste tous les bans actifs d'un serveur
   */
  findByServerId(serverId: string): Promise<Ban[]>;
}
