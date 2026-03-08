/**
 * =====================================================
 * TEMPLATE: Domain Repository Interface
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  Interface seulement (pas d'implémentation)
 *  Décrire le contrat d'accès aux données
 *  Pas de détails d'implémentation
 *  Typage fort
 */

import { XXX } from '../entities/XXX';

/**
 * Repository Interface: XXX
 * 
 * Définit le contrat pour accéder aux données XXX
 * L'implémentation se fait en infrastructure/
 * 
 * Pattern: Inversion de dépendances
 * - Application dépend de cette interface
 * - Infrastructure implémente cette interface
 * 
 * Bénéfice: On peut changer de BD sans toucher Application
 */
export interface IXXXRepository {
  /**
   * Trouve un XXX par ID
   * 
   * @param id - L'identifiant unique
   * @returns L'entité XXX ou null si pas trouvée
   */
  findById(id: string): Promise<XXX | null>;

  /**
   * Crée un nouveau XXX
   * 
   * @param entity - L'entité à créer (sans ID, créé par la BD)
   * @returns L'entité créée avec ID et timestamps
   */
  create(entity: XXX): Promise<XXX>;

  /**
   * Met à jour un XXX existant
   * 
   * @param entity - L'entité mise à jour
   * @returns L'entité après la mise à jour
   */
  update(entity: XXX): Promise<XXX>;

  /**
   * Supprime un XXX
   * 
   * @param id - L'ID à supprimer
   */
  delete(id: string): Promise<void>;

  /**
   * Trouve tous les XXX (avec pagination)
   * 
   * @param page - Numéro de page (commence à 1)
   * @param limit - Nombre d'items par page
   * @returns Liste des entités avec metadata de pagination
   */
  findAll(page: number, limit: number): Promise<{
    items: XXX[];
    total: number;
    hasMore: boolean;
  }>;
}
