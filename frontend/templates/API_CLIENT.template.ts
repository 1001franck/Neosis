/**
 * API CLIENT TEMPLATE
 * 
 * Emplacement: src/infrastructure/api/[feature].api.ts
 * 
 * Responsabilité:
 * - Définir tous les appels API pour une feature
 * - Typer complètement les requêtes et réponses
 * - Transformer les réponses si nécessaire
 * 
 * Dépendances: apiClient, domain types
 * 
 * Règles:
 * ✓ Toujours utiliser apiClient (jamais fetch direct)
 * ✓ Types génériques pour les appels répétitifs
 * ✓ Documenter chaque endpoint
 * ✓ Gérer les erreurs de manière cohérente
 */

import { apiClient } from './client';
import type {
  FeatureEntity,
  CreateFeatureRequest,
  CreateFeatureResponse,
  UpdateFeatureRequest,
  ListFeaturesResponse,
} from '@domain/[feature]/types';

const ENDPOINT = '/[features]';

/**
 * API pour les opérations [FEATURE]
 */
export const featuresApi = {
  /**
   * Récupérer tous les [features]
   */
  list: async (params?: {
    limit?: number;
    offset?: number;
    sort?: string;
  }): Promise<ListFeaturesResponse> => {
    const response = await apiClient.get(ENDPOINT, { params });
    return response.data;
  },

  /**
   * Récupérer un [feature] par ID
   */
  getById: async (id: string): Promise<FeatureEntity> => {
    const response = await apiClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau [feature]
   */
  create: async (request: CreateFeatureRequest): Promise<CreateFeatureResponse> => {
    const response = await apiClient.post(ENDPOINT, request);
    return response.data;
  },

  /**
   * Mettre à jour un [feature]
   */
  update: async (
    id: string,
    request: UpdateFeatureRequest
  ): Promise<FeatureEntity> => {
    const response = await apiClient.patch(`${ENDPOINT}/${id}`, request);
    return response.data;
  },

  /**
   * Supprimer un [feature]
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
