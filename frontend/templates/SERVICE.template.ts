/**
 * SERVICE TEMPLATE
 * 
 * Emplacement: src/application/[feature]/[feature]Service.ts
 * 
 * Responsabilité:
 * - Orchestrer la logique métier
 * - Appeler l'API via le client
 * - Logger les opérations
 * - Transformer les données
 * - Gérer les erreurs
 * 
 * Dépendances: API client, logger, types
 * 
 * Règles:
 * ✓ Chaque méthode = 1 action métier
 * ✓ Logguer les entrées/sorties
 * ✓ Gérer les erreurs gracieusement
 * ✓ Pas d'effets secondaires (pas d'update Zustand ici)
 */

import { featuresApi } from '@infrastructure/api/[feature].api';
import type {
  FeatureEntity,
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from '@domain/[feature]/types';
import { logger } from '@shared/utils/logger';

/**
 * Service métier pour les [features]
 */
export class FeatureService {
  /**
   * Récupérer tous les [features]
   */
  async listFeatures(params?: {
    limit?: number;
    offset?: number;
  }): Promise<FeatureEntity[]> {
    try {
      logger.info('Fetching features list', params);
      const response = await featuresApi.list(params);
      logger.info('Features list fetched', { count: response.features.length });
      return response.features;
    } catch (error) {
      logger.error('Failed to fetch features', error);
      throw error;
    }
  }

  /**
   * Récupérer un [feature] spécifique
   */
  async getFeature(id: string): Promise<FeatureEntity> {
    try {
      logger.info('Fetching feature', { id });
      const feature = await featuresApi.getById(id);
      logger.info('Feature fetched', { id });
      return feature;
    } catch (error) {
      logger.error('Failed to fetch feature', error, { id });
      throw error;
    }
  }

  /**
   * Créer un nouveau [feature]
   */
  async createFeature(request: CreateFeatureRequest): Promise<FeatureEntity> {
    try {
      logger.info('Creating feature', request);
      const response = await featuresApi.create(request);
      logger.info('Feature created', { id: response.feature.id });
      return response.feature;
    } catch (error) {
      logger.error('Failed to create feature', error, request);
      throw error;
    }
  }

  /**
   * Mettre à jour un [feature]
   */
  async updateFeature(
    id: string,
    updates: UpdateFeatureRequest
  ): Promise<FeatureEntity> {
    try {
      logger.info('Updating feature', { id, updates });
      const feature = await featuresApi.update(id, updates);
      logger.info('Feature updated', { id });
      return feature;
    } catch (error) {
      logger.error('Failed to update feature', error, { id });
      throw error;
    }
  }

  /**
   * Supprimer un [feature]
   */
  async deleteFeature(id: string): Promise<void> {
    try {
      logger.info('Deleting feature', { id });
      await featuresApi.delete(id);
      logger.info('Feature deleted', { id });
    } catch (error) {
      logger.error('Failed to delete feature', error, { id });
      throw error;
    }
  }
}
