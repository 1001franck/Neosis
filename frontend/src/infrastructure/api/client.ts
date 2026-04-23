/**
 * INFRASTRUCTURE - API CLIENT
 * Configuration Axios avec intercepteurs pour token JWT et gestion 401
 */
import axios from 'axios';
import { env } from '@shared/config/env';
import { logger } from '@shared/utils/logger';
import { storage } from '@infrastructure/storage/localStorage';
import { STORAGE_KEYS } from '@shared/constants/app';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  // 15s pour absorber le cold start de Render (backend en veille)
  timeout: 15000,
  // Le Bearer token est utilisé pour toutes les requêtes (web + Tauri)
  // withCredentials: true causait un preflight CORS crédentiel bloqué dans WebView2 Tauri
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// === REQUEST INTERCEPTOR : Accept-Language + Authorization token (app desktop) ===
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const locale = localStorage.getItem(STORAGE_KEYS.LOCALE) || 'fr';
    config.headers['Accept-Language'] = locale;

    // En environnement Tauri les cookies cross-origin ne fonctionnent pas
    // On envoie le token en Authorization header si disponible
    const token = storage.getItem<string>(STORAGE_KEYS.TOKEN);
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
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
      storage.removeItem(STORAGE_KEYS.TOKEN);

      // Rediriger vers login (si pas déjà sur une page auth)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);
