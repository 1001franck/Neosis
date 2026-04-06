/**
 * DOMAIN TYPES TEMPLATE
 * 
 * Emplacement: src/domain/[FEATURE]/types.ts
 * 
 * Responsabilité:
 * - Définir tous les types et interfaces du domaine
 * - Représenter les données métier
 * - Être INDÉPENDANT de toute implémentation technique
 * 
 * Dépendances: ❌ AUCUNE (pas même d'imports)
 * 
 * Règles:
 * ✓ Interfaces immutables
 * ✓ Types explicites (pas de `any`)
 * ✓ Documenté avec JSDoc
 * ✓ Pas d'implémentation
 */

/**
 * Représente un [FEATURE_NAME] dans le système
 */
export interface FeatureEntity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  // Ajouter d'autres champs...
}

/**
 * Requête pour créer un [FEATURE_NAME]
 */
export interface CreateFeatureRequest {
  name: string;
  // Ajouter d'autres champs...
}

/**
 * Réponse de l'API pour la création
 */
export interface CreateFeatureResponse {
  feature: FeatureEntity;
}

/**
 * Requête pour mettre à jour un [FEATURE_NAME]
 */
export interface UpdateFeatureRequest {
  name?: string;
  // Ajouter d'autres champs...
}

/**
 * Réponse avec liste
 */
export interface ListFeaturesResponse {
  features: FeatureEntity[];
  total: number;
}

/**
 * Énumérations ou union types spécifiques au domaine
 */
export type FeatureStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/**
 * Erreurs du domaine (voir errors.ts)
 */
export interface DomainError {
  code: string;
  message: string;
}
