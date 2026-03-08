/**
 * BROWSER UTILITIES
 * Fonctions pour interactions navigateur
 */

import { logger } from './logger';

/**
 * Ouvrir une URL dans un nouvel onglet
 * @param url URL à ouvrir
 */
export function openInNewTab(url: string): void {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    logger.debug('Opened URL in new tab', { url });
  } catch (error) {
    logger.error('Failed to open URL in new tab', { error, url });
  }
}
