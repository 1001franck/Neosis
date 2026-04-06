/**
 * RATE LIMITING MIDDLEWARE
 * Protection contre les abus et attaques par force brute
 *
 * Implémentation in-memory simple (suffisante pour une app single-instance)
 * Pour du multi-instance, utiliser Redis à la place
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  /** Fenêtre de temps en millisecondes */
  windowMs: number;
  /** Nombre maximum de requêtes par fenêtre */
  maxRequests: number;
  /** Message d'erreur personnalisé */
  message?: string;
}

/**
 * Crée un middleware de rate limiting
 * Utilise l'IP du client comme identifiant
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, maxRequests, message = 'Trop de requêtes. Veuillez réessayer plus tard.' } = options;

  // Store in-memory des entrées par IP
  const store = new Map<string, RateLimitEntry>();

  // Nettoyage périodique des entrées expirées (toutes les 60 secondes)
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Empêcher l'intervalle de bloquer l'arrêt du processus
  cleanupInterval.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre
      store.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      // Trop de requêtes
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: message,
        retryAfter,
      });
      return;
    }

    next();
  };
}

/**
 * Rate limiter global : 100 requêtes par minute par IP
 */
export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  message: 'Trop de requêtes. Veuillez réessayer dans une minute.',
});

/**
 * Rate limiter strict pour l'authentification : 20 tentatives par 5 minutes
 */
export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20,
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques minutes.',
});

/**
 * Rate limiter pour l'envoi de messages : 30 messages par minute
 */
export const messageRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Vous envoyez trop de messages. Veuillez patienter.',
});
