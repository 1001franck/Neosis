/**
 * APPLICATION - AUTH
 * Hook personnalisé pour utiliser l'authentification
 *
 * Le token JWT est géré exclusivement via cookie httpOnly.
 * Ce hook ne manipule plus le token directement.
 */

import { useCallback, useEffect } from 'react';
import { useAuthStore } from './authStore';
import type { AuthStoreState } from './authStore';
import { authService } from './authService';
import { connectSocket, disconnectSocket } from '@infrastructure/websocket/socket';
import { setupListeners, cleanupListeners } from '@infrastructure/websocket/listeners';
import type { LoginRequest, RegisterRequest, UpdateProfileRequest } from '@domain/auth/types';
import { logger } from '@shared/utils/logger';

// Flag module-level : empêche deux initialisations parallèles si plusieurs composants montent simultanément
let _authInitStarted = false;

export function useAuth() {
  // === STATE SELECTORS ===
  const user = useAuthStore((state: AuthStoreState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthStoreState) => state.isAuthenticated);
  const isInitialized = useAuthStore((state: AuthStoreState) => state.isInitialized);

  // === STORE ACTIONS ===
  const setUser = useAuthStore((state: AuthStoreState) => state.setUser);
  const setAuthenticated = useAuthStore((state: AuthStoreState) => state.setAuthenticated);
  const setInitialized = useAuthStore((state: AuthStoreState) => state.setInitialized);
  const reset = useAuthStore((state: AuthStoreState) => state.reset);

  /**
   * Initialiser l'authentification au montage — une seule fois globalement
   * Restaure depuis le localStorage puis valide la session via GET /auth/me
   */
  useEffect(() => {
    // Garde : ne lancer qu'une seule fois, même si plusieurs composants montent en même temps
    if (_authInitStarted || useAuthStore.getState().isInitialized) return;
    _authInitStarted = true;

    const initializeAuth = async () => {
      try {
        // Restaurer depuis localStorage (synchrone — immédiat)
        const storedUser = authService.getStoredUser();

        if (storedUser) {
          setUser(storedUser);
          setAuthenticated(true);
        }

        // Déclarer l'app initialisée DÈS ICI pour débloquer l'UI immédiatement
        // La validation réseau ci-dessous se fait en arrière-plan
        setInitialized(true);

        // Valider la session côté serveur (cookie httpOnly ou token Bearer)
        const validUser = await authService.checkSession();
        if (validUser) {
          setUser(validUser);
          setAuthenticated(true);
          connectSocket();
          cleanupListeners();
          setupListeners();
          logger.info('Auth restored and validated', { userId: validUser.id });
        } else if (storedUser) {
          // Server returned 401 — session expirée
          reset();
          logger.warn('Stored session invalid, logged out');
        }
        // Si ni storedUser ni validUser → reste non authentifié (ProtectedRoute redirigera)
      } catch (error) {
        // Erreur réseau — dégradation gracieuse
        if (authService.getStoredUser()) {
          logger.warn('Session check failed (network), keeping stored session');
          connectSocket();
          cleanupListeners();
          setupListeners();
        } else {
          logger.error('Failed to initialize auth', error instanceof Error ? error.message : 'Unknown error');
        }
        // Assurer que l'UI est débloquée même en cas d'erreur réseau
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [setUser, setAuthenticated, setInitialized, reset]);

  /**
   * Connexion utilisateur
   */
  const login = useCallback(
    async (request: LoginRequest) => {
      try {
        const response = await authService.login(request);
        setUser(response.user);
        setAuthenticated(true);
        connectSocket();
        cleanupListeners();
        setupListeners();
        logger.info('Login successful', { userId: response.user.id });
        return response;
      } catch (error) {
        logger.error('Login failed', error);
        reset();
        throw error;
      }
    },
    [setUser, setAuthenticated, reset]
  );

  /**
   * Inscription utilisateur
   */
  const register = useCallback(
    async (request: RegisterRequest) => {
      try {
        const response = await authService.register(request);
        setUser(response.user);
        setAuthenticated(true);
        connectSocket();
        cleanupListeners();
        setupListeners();
        logger.info('Registration successful', { userId: response.user.id });
        return response;
      } catch (error) {
        logger.error('Registration failed', error);
        reset();
        throw error;
      }
    },
    [setUser, setAuthenticated, reset]
  );

  /**
   * Déconnexion utilisateur
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      cleanupListeners();
      disconnectSocket();
      reset();
      logger.info('Logout successful');
    } catch (error) {
      logger.error('Logout error', error);
      reset();
    }
  }, [reset]);

  /**
   * Mise à jour du profil utilisateur
   */
  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    },
    [setUser]
  );

  /**
   * Upload d'avatar
   */
  const uploadAvatar = useCallback(
    async (file: File) => {
      const updatedUser = await authService.uploadAvatar(file);
      setUser(updatedUser);
      return updatedUser;
    },
    [setUser]
  );

  /**
   * Upload de bannière
   */
  const uploadBanner = useCallback(
    async (file: File) => {
      const updatedUser = await authService.uploadBanner(file);
      setUser(updatedUser);
      return updatedUser;
    },
    [setUser]
  );

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    updateProfile,
    uploadAvatar,
    uploadBanner,
  };
}

export type { AuthStoreState };


