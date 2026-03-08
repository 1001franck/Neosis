/**
 * HOOK TEMPLATE
 * 
 * Emplacement: src/application/[feature]/use[Feature].ts
 * 
 * Responsabilité:
 * - Encapsuler la logique de la feature
 * - Combiner Service + Store + Logic
 * - Fournir une interface simple aux composants
 * - Gérer le cycle de vie et les effects
 * 
 * Dépendances: Service, Store, React hooks
 * 
 * Règles:
 * ✓ Pas de JSX ici (c'est un hook custom)
 * ✓ Combiner plusieurs stores si nécessaire
 * ✓ Gérer les subscriptions/unsubscriptions
 * ✓ Documenter les paramètres et retours
 */

import { useCallback, useEffect } from 'react';
import { FeatureService } from './featureService';
import { useFeatureStore } from './featureStore';
import type {
  FeatureEntity,
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from '@domain/[feature]/types';

const service = new FeatureService();

/**
 * Hook pour utiliser les [features]
 * 
 * @example
 * const { items, isLoading, createFeature } = useFeatures();
 * 
 * useEffect(() => {
 *   listFeatures();
 * }, [listFeatures]);
 */
export const useFeatures = () => {
  // ===== STATE =====
  const items = useFeatureStore((state) => state.items);
  const currentItem = useFeatureStore((state) => state.currentItem);
  const isLoading = useFeatureStore((state) => state.isLoading);
  const error = useFeatureStore((state) => state.error);
  const selectedIds = useFeatureStore((state) => state.selectedIds);

  // ===== STORE ACTIONS =====
  const {
    setItems,
    addItem,
    updateItem,
    removeItem,
    setCurrentItem,
    selectItem,
    deselectItem,
    clearSelection,
    setLoading,
    setError,
    reset,
  } = useFeatureStore();

  // ===== CALLBACKS =====

  /**
   * Récupérer la liste des [features]
   */
  const listFeatures = useCallback(
    async (params?: { limit?: number; offset?: number }) => {
      try {
        setLoading(true);
        const items = await service.listFeatures(params);
        setItems(items);
      } catch (err) {
        setError('Failed to load features');
      } finally {
        setLoading(false);
      }
    },
    [setItems, setLoading, setError]
  );

  /**
   * Récupérer un [feature] spécifique
   */
  const getFeature = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const item = await service.getFeature(id);
        setCurrentItem(item);
        return item;
      } catch (err) {
        setError('Failed to load feature');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentItem, setLoading, setError]
  );

  /**
   * Créer un nouveau [feature]
   */
  const createFeature = useCallback(
    async (request: CreateFeatureRequest) => {
      try {
        setLoading(true);
        const item = await service.createFeature(request);
        addItem(item);
        setCurrentItem(item);
        return item;
      } catch (err) {
        setError('Failed to create feature');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addItem, setCurrentItem, setLoading, setError]
  );

  /**
   * Mettre à jour un [feature]
   */
  const updateFeatureItem = useCallback(
    async (id: string, updates: UpdateFeatureRequest) => {
      try {
        setLoading(true);
        const item = await service.updateFeature(id, updates);
        updateItem(id, item);
        if (currentItem?.id === id) {
          setCurrentItem(item);
        }
        return item;
      } catch (err) {
        setError('Failed to update feature');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateItem, currentItem?.id, setCurrentItem, setLoading, setError]
  );

  /**
   * Supprimer un [feature]
   */
  const deleteFeature = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await service.deleteFeature(id);
        removeItem(id);
        deselectItem(id);
        if (currentItem?.id === id) {
          setCurrentItem(null);
        }
      } catch (err) {
        setError('Failed to delete feature');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeItem, deselectItem, currentItem?.id, setCurrentItem, setLoading, setError]
  );

  // ===== RETURN INTERFACE =====
  return {
    // State
    items,
    currentItem,
    isLoading,
    error,
    selectedIds,
    isEmpty: items.length === 0,
    count: items.length,

    // Queries
    listFeatures,
    getFeature,

    // Mutations
    createFeature,
    updateFeature: updateFeatureItem,
    deleteFeature,

    // Selection
    selectItem,
    deselectItem,
    clearSelection,

    // Lifecycle
    reset,
  };
};
