/**
 * INFRASTRUCTURE - API CLIENT
 * Configuration Axios avec intercepteurs pour token JWT et gestion 401
 */
import axios from 'axios';
import { env } from '@shared/config/env';
import { logger } from '@shared/utils/logger';
import { storage } from '@infrastructure/storage/localStorage';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: 5000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Client dédié aux uploads — timeout étendu à 60s pour les fichiers volumineux
export const uploadClient = axios.create({
  baseURL: env.API_URL,
  timeout: 60000,
  withCredentials: true,
});

// === RESPONSE INTERCEPTOR : Unwrap + gérer 401 (token expiré) ===
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    // Backend wraps data routes in { success, data: ... }
    if (body && typeof body === 'object' && 'data' in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    logger.error('API Error', error.response?.data || error.message);

    // Si 401 (token expiré/invalide) ET ce n'est PAS une requête auth (login/signup/me)
    // → Forcer la déconnexion et rediriger vers login
    // On exclut /auth/me car checkSession() gère cette erreur gracieusement
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/signup') && !url.includes('/auth/me')) {
      logger.warn('Token expiré ou invalide - déconnexion automatique');

      // Nettoyer le storage
      storage.removeItem('auth_user');

      // Rediriger vers login (si pas déjà sur une page auth)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);
