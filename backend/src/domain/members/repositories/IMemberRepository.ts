import type { Member } from '../entities/Member.js';

/**
 * Interface du repository pour les membres
 * Définit les opérations de persistance pour l'entité Member
 */
export interface IMemberRepository {
  /**
   * Trouve un membre par son ID
   */
  findById(id: string): Promise<Member | null>;

  /**
   * Trouve un membre par utilisateur et serveur
   * Permet de vérifier si un user est membre d'un serveur spécifique
   */
  findByUserAndServer(userId: string, serverId: string): Promise<Member | null>;

  /**
   * Trouve tous les membres d'un serveur
   */
  findByServerId(serverId: string): Promise<Member[]>;

  /**
   * Trouve tous les serveurs dont un utilisateur est membre
   */
  findByUserId(userId: string): Promise<Member[]>;

  /**
   * Crée un nouveau membre
   */
  create(member: Member): Promise<Member>;

  /**
   * Met à jour un membre (principalement son rôle)
   */
  update(member: Member): Promise<Member>;

  /**
   * Supprime un membre (quand il quitte le serveur)
   */
  delete(id: string): Promise<void>;

  /**
   * Compte le nombre de membres dans un serveur
   */
  countByServerId(serverId: string): Promise<number>;

  /**
   * Vérifie si un utilisateur est membre d'un serveur
   */
  existsByUserAndServer(userId: string, serverId: string): Promise<boolean>;
}
