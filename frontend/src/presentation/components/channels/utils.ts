/**
 * CHANNEL UTILITIES
 * Fonctions utilitaires pour filtrer les médias et contenus
 */

import type { ChannelMedia, MediaFilter } from './types';

/**
 * Filtrer les médias selon le type sélectionné
 */
export function filterMediaByType(media: ChannelMedia[], filter: MediaFilter): ChannelMedia[] {
  if (filter === 'all') return media;
  if (filter === 'images') return media.filter(m => m.type === 'image');
  if (filter === 'videos') return media.filter(m => m.type === 'video');
  return media;
}

/**
 * Filtrer par recherche textuelle (nom ou titre)
 */
export function filterBySearch<T extends { name?: string; title?: string }>(
  items: T[],
  search: string
): T[] {
  if (!search.trim()) return items;
  const searchLower = search.toLowerCase();
  return items.filter(item => {
    const name = item.name || item.title || '';
    return name.toLowerCase().includes(searchLower);
  });
}
