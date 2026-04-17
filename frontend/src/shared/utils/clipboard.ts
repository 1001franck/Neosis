/**
 * CLIPBOARD UTILITIES
 * Fonctions pour interagir avec le presse-papiers et téléchargements
 */

import { logger } from './logger';

/**
 * Copier du texte dans le presse-papiers
 * @param text Texte à copier
 * @returns true si succès, false sinon
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    logger.debug('Text copied to clipboard');
    return true;
  } catch (error) {
    logger.error('Failed to copy to clipboard', { error });
    return false;
  }
}

/**
 * Télécharger un fichier
 * @param url URL du fichier
 * @param filename Nom du fichier à télécharger
 */
export function downloadFile(url: string, filename: string): void {
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logger.debug('File download initiated', { filename });
  } catch (error) {
    logger.error('Failed to download file', { error, filename });
  }
}
