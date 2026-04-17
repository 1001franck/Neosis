/**
 * DOMAIN ERRORS TEMPLATE
 * 
 * Emplacement: src/domain/[FEATURE]/errors.ts
 * 
 * Responsabilité:
 * - Définir les erreurs métier spécifiques
 * - Hériter de AppError
 * - Utiliser des codes d'erreur explicites
 * 
 * Dépendances: AppError seulement
 */

import { AppError } from '@shared/errors/AppError';

/**
 * Erreur levée quand un [FEATURE] n'existe pas
 */
export class FeatureNotFoundError extends AppError {
  constructor(public readonly id: string) {
    super(`[FEATURE] with id ${id} not found`, 'FEATURE_NOT_FOUND');
  }
}

/**
 * Erreur levée quand les données sont invalides
 */
export class InvalidFeatureError extends AppError {
  constructor(public readonly reason: string) {
    super(`Invalid [FEATURE]: ${reason}`, 'INVALID_FEATURE');
  }
}

/**
 * Erreur levée quand les permissions manquent
 */
export class FeatureAccessDeniedError extends AppError {
  constructor(public readonly featureId: string) {
    super(`Access denied to [FEATURE] ${featureId}`, 'FEATURE_ACCESS_DENIED');
  }
}

/**
 * Erreur levée quand une ressource existe déjà
 */
export class FeatureAlreadyExistsError extends AppError {
  constructor(public readonly name: string) {
    super(`[FEATURE] with name ${name} already exists`, 'FEATURE_ALREADY_EXISTS');
  }
}

/**
 * Type union de toutes les erreurs possibles
 */
export type FeatureDomainError =
  | FeatureNotFoundError
  | InvalidFeatureError
  | FeatureAccessDeniedError
  | FeatureAlreadyExistsError;
