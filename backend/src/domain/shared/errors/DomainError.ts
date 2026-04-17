/**
 * =====================================================
 * Classe de base pour les erreurs du Domain
 * =====================================================
 * 
 * Toutes les erreurs métier doivent hériter de cette classe
 */

/**
 * Classe de base pour toutes les erreurs du domaine
 * 
 * @param code - Code d'erreur unique (ex: USER_ALREADY_EXISTS)
 * @param message - Message pour le développeur
 * @param statusCode - Code HTTP correspondant
 */
export abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * Convertir en JSON pour la réponse HTTP
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
