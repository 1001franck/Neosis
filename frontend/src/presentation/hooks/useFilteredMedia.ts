/**
 * USE FILTERED MEDIA HOOK
 * Centralise la logique de filtrage et de tri des médias
 * Utilise memoization pour performance
 */

import { useMemo } from 'react';
import type { ChannelMedia, MediaFilter } from '@presentation/components/channels/types';

export type SortBy = 'date' | 'name' | 'size';
export type SortOrder = 'asc' | 'desc';

interface FilterOptions {
  searchQuery: string;
  filter: MediaFilter;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

/**
 * Filtrer les médias par type
 */
function filterMediaByType(media: ChannelMedia[], filter: MediaFilter): ChannelMedia[] {
  if (filter === 'all') return media;
  
  // Map filter to type: 'images' -> 'image', 'videos' -> 'video'
  if (filter === 'images') {
    return media.filter(item => item.type === 'image');
  }
  if (filter === 'videos') {
    return media.filter(item => item.type === 'video');
  }
  
  return media;
}

/**
 * Filtrer les médias par recherche
 */
function filterBySearch(media: ChannelMedia[], query: string): ChannelMedia[] {
  if (!query.trim()) return media;
  
  const lowercaseQuery = query.toLowerCase();
  return media.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.uploadedBy.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Trier les médias
 */
function sortMedia(media: ChannelMedia[], sortBy: SortBy, sortOrder: SortOrder): ChannelMedia[] {
  const sorted = [...media];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        // Size not available on ChannelMedia, fallback to date
        comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Hook pour filtrer et trier les médias avec memoization
 */
export function useFilteredMedia(media: ChannelMedia[], options: FilterOptions): ChannelMedia[] {
  return useMemo(() => {
    const { searchQuery, filter, sortBy, sortOrder } = options;
    
    // Chaîner les filtres
    let result = filterMediaByType(media, filter);
    result = filterBySearch(result, searchQuery);
    result = sortMedia(result, sortBy, sortOrder);
    
    return result;
  }, [media, options.searchQuery, options.filter, options.sortBy, options.sortOrder]);
}
