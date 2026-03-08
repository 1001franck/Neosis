/**
 * USE SERVER CHANNELS SIDEBAR STATE HOOK
 * Gère tout l'état de la sidebar des channels d'un serveur
 * 
 * Responsabilités:
 * - Gérer l'état collapsed/expanded de la sidebar principale
 * - Gérer les catégories collapsed
 * - Gérer les notifications
 * - Logique de groupement des channels par catégorie
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Channel, ChannelCategory } from '@domain/channels/types';

export interface ServerChannelsSidebarState {
  // État de la sidebar
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  toggleCollapsed: () => void;
  
  // Catégories collapsed
  collapsedCategories: Set<string>;
  toggleCategory: (categoryId: string) => void;
  
  // Groupement des channels
  channelsByCategory: Record<string, Channel[]>;
  getSortedCategories: (categories: ChannelCategory[]) => ChannelCategory[];
}

interface UseServerChannelsSidebarStateParams {
  channels: Channel[];
}

/**
 * Hook principal pour gérer l'état de la sidebar des channels
 */
export function useServerChannelsSidebarState({
  channels,
}: UseServerChannelsSidebarStateParams): ServerChannelsSidebarState {
  // État collapsed de la sidebar principale
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  
  // État des catégories collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  /**
   * Toggle l'état collapsed de la sidebar
   */
  const toggleCollapsed = useCallback((): void => {
    setIsCollapsed(prev => !prev);
  }, []);

  /**
   * Toggle collapsed state d'une catégorie
   */
  const toggleCategory = useCallback((categoryId: string): void => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  /**
   * Grouper les channels par catégorie
   */
  const channelsByCategory = useMemo<Record<string, Channel[]>>(() => {
    return channels.reduce<Record<string, Channel[]>>((acc, channel) => {
      const categoryId = channel.categoryId || 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(channel);
      return acc;
    }, {});
  }, [channels]);

  /**
   * Trier les catégories par position
   */
  const getSortedCategories = useCallback((categories: ChannelCategory[]): ChannelCategory[] => {
    return [...categories].sort((a, b) => a.position - b.position);
  }, []);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapsed,
    collapsedCategories,
    toggleCategory,
    channelsByCategory,
    getSortedCategories,
  };
}
