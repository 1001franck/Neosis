/**
 * =====================================================
 * TEMPLATE: Domain Entity
 * =====================================================
 * 
 * Copie ce fichier et remplace XXX par ton concept
 * 
 * Règles:
 *  Que du code métier pur
 *  Pas de dépendances externes (Prisma, Express, etc)
 *  Toutes les propriétés en readonly
 *  Méthodes qui expriment les règles métier
 */

/**
 * Entity: XXX
 * 
 * Responsabilité: Représenter XXX avec ses règles métier
 * 
 * @example
 * const entity = new XXX(...)
 * if (entity.canDoAction(userId)) {
 *   // Business logic
 * }
 */
export class XXX {
  constructor(
    public readonly id: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    // Ajoute tes propriétés ici
  ) {
    // Valide les invariants métier
    if (!id) throw new Error('ID is required');
  }

  /**
   * Méthode métier: Exprime une règle du domaine
   * 
   * @param userId - L'utilisateur qui fait l'action
   * @returns true si l'action est autorisée
   */
  canDoAction(userId: string): boolean {
    // Logique métier pure
    return true;
  }

  /**
   * Valide les invariants de cette entité
   */
  private validate(): void {
    // Vérifications métier
  }
}
