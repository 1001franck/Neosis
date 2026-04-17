/**
 * MOCK CONFIGURATION
 * 
 * Contrôle l'activation/désactivation des mocks
 * 
 * Pour passer en production:
 * 1. Mettre USE_MOCKS = false
 * 2. Supprimer le dossier __mocks__
 */

export const USE_MOCKS = true;

/**
 * Flag pour activer/désactiver les mocks
 * @returns true si les mocks doivent être utilisés
 */
export function shouldUseMocks(): boolean {
  return USE_MOCKS && process.env.NODE_ENV === 'development';
}
