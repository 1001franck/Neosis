/**
 * =====================================================
 * Classe de base pour tous les Use Cases
 * =====================================================
 * 
 * Tous les Use Cases doivent hériter de cette classe
 * Fournit les utils et le logging
 */

import { Logger } from '../../shared/utils/logger.js';
import { ValidationError } from '../../shared/errors/AppError.js';

/**
 * Classe de base pour tous les Use Cases
 * 
 * Générique:
 * - TRequest: Type de la requête d'entrée
 * - TResponse: Type de la réponse de sortie
 * 
 * @example
 * export class CreateUserUseCase extends BaseUseCase<CreateUserRequest, UserResponse> {
 *   async execute(request: CreateUserRequest): Promise<UserResponse> { ... }
 * }
 */
export abstract class BaseUseCase<TRequest, TResponse> {
  protected logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Exécute le use case
   * À implémenter dans les classes enfants
   */
  abstract execute(request: TRequest): Promise<TResponse>;

  /**
   * Valide une requête non nulle
   */
  protected validateNotNull<T>(value: T | null | undefined, fieldName: string): asserts value is T {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Valide qu'une string n'est pas vide
   */
  protected validateNotEmpty(value: string, fieldName: string): void {
    if (!value || value.trim() === '') {
      throw new ValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Valide qu'un tableau n'est pas vide
   */
  protected validateNotEmptyArray<T>(array: T[], fieldName: string): void {
    if (!Array.isArray(array) || array.length === 0) {
      throw new ValidationError(`${fieldName} must not be empty`);
    }
  }
}
