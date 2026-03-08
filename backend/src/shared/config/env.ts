/**
 * Configuration des variables d'environnement
 * Valide les variables requises au démarrage du serveur
 */

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Variable d'environnement manquante : ${key}`);
  }
  return value;
}

/**
 * JWT_SECRET est REQUIS — le serveur refuse de démarrer sans.
 * Ne jamais utiliser de fallback hardcodé.
 */
export const JWT_SECRET = getEnvOrThrow('JWT_SECRET');

// Validation anti-déploiement accidentel avec secret dev
if (process.env.NODE_ENV === 'production') {
  if (JWT_SECRET.includes('change-in-production') || JWT_SECRET.includes('super-secret')) {
    throw new Error('❌ FATAL: JWT_SECRET must be changed in production! Current value is a development placeholder.');
  }
}

// Warning si secret trop court (même en dev)
if (JWT_SECRET.length < 32) {
  console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters for security (current: ' + JWT_SECRET.length + ' chars)');
}
