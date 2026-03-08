/**
 * ZUSTAND STORE TEMPLATE
 * 
 * Emplacement: src/application/[feature]/[feature]Store.ts
 * 
 * Responsabilité:
 * - Gérer l'état global de la feature
 * - Persister les données reçues du serveur
 * - Fournir des actions pour modifier l'état
 * - Ne pas contenir de logique métier
 * 
 * Dépendances: zustand, domain types
 * 
 * Règles:
 * ✓ Un store par feature/domaine
 * ✓ State + Actions bien séparées
 * ✓ Actions pures (pas d'appels API ici)
 * ✓ Sélecteurs pour accéder à l'état
 * ✓ Reset pour nettoyer l'état
 */

import { create } from 'zustand';
import type { FeatureEntity } from '@domain/[feature]/types';

/**
 * Interface du store [Feature]
 */
interface FeatureStore {
  // ===== STATE =====
  items: FeatureEntity[];
  currentItem: FeatureEntity | null;
  selectedIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  // ===== ACTIONS =====
  setItems: (items: FeatureEntity[]) => void;
  addItem: (item: FeatureEntity) => void;
  updateItem: (id: string, updates: Partial<FeatureEntity>) => void;
  removeItem: (id: string) => void;
  setCurrentItem: (item: FeatureEntity | null) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

/**
 * État initial
 */
const initialState = {
  items: [],
  currentItem: null,
  selectedIds: new Set<string>(),
  isLoading: false,
  error: null,
};

/**
 * Store Zustand pour [Feature]
 */
export const useFeatureStore = create<FeatureStore>((set) => ({
  ...initialState,

  // ===== SETTERS =====

  setItems: (items) =>
    set({
      items,
      error: null,
    }),

  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      error: null,
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
      currentItem:
        state.currentItem?.id === id
          ? { ...state.currentItem, ...updates }
          : state.currentItem,
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      currentItem: state.currentItem?.id === id ? null : state.currentItem,
      selectedIds: new Set([...state.selectedIds].filter((sid) => sid !== id)),
    })),

  setCurrentItem: (item) =>
    set({
      currentItem: item,
    }),

  selectItem: (id) =>
    set((state) => ({
      selectedIds: new Set([...state.selectedIds, id]),
    })),

  deselectItem: (id) =>
    set((state) => ({
      selectedIds: new Set([...state.selectedIds].filter((sid) => sid !== id)),
    })),

  clearSelection: () =>
    set({
      selectedIds: new Set(),
    }),

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  reset: () => set(initialState),
}));

/**
 * Sélecteurs pour accéder à des parties spécifiques du state
 * Utilisation: const items = useFeatureStore(selectItems)
 */
export const selectItems = (state: FeatureStore) => state.items;
export const selectCurrentItem = (state: FeatureStore) => state.currentItem;
export const selectIsLoading = (state: FeatureStore) => state.isLoading;
export const selectError = (state: FeatureStore) => state.error;
export const selectSelectedIds = (state: FeatureStore) => state.selectedIds;
export const selectIsEmpty = (state: FeatureStore) => state.items.length === 0;
export const selectCount = (state: FeatureStore) => state.items.length;
