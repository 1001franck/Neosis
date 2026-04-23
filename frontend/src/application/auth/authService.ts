/**
 * APPLICATION - AUTH SERVICE
 * Logique métier pour l'authentification
 */

import { authApi } from '@infrastructure/api/auth.api';
import { storage } from '@infrastructure/storage/localStorage';
import type { LoginRequest, RegisterRequest, AuthUser, UpdateProfileRequest } from '@domain/auth/types';
import { InvalidCredentialsError, UserAlreadyExistsError } from '@domain/auth/errors';
import { logger } from '@shared/utils/logger';
import { STORAGE_KEYS } from '@shared/constants/app';

const USER_KEY = 'auth_user';

/**
 * Service d'authentification
 */
export class AuthService {
  async login(request: LoginRequest): Promise<{ user: AuthUser }> {
    try {
      const response = await authApi.login(request);

      // Persister les infos user (pas le token — il est dans le cookie httpOnly)
      storage.setItem(USER_KEY, response.user);

      logger.info('Login successful', { userId: response.user.id });
      return response;
    } catch (error: unknown) {
      logger.error('Login failed', error instanceof Error ? error.message : 'Unknown error');
      const msg = this.extractErrorMessage(error);
      throw new InvalidCredentialsError(msg);
    }
  }

  async register(request: RegisterRequest): Promise<{ user: AuthUser }> {
    try {
      const response = await authApi.register(request);

      storage.setItem(USER_KEY, response.user);

      logger.info('Register successful', { userId: response.user.id });
      return response;
    } catch (error: unknown) {
      logger.error('Register failed', error instanceof Error ? error.message : 'Unknown error');
      const msg = this.extractErrorMessage(error);
      throw new UserAlreadyExistsError(msg);
    }
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout();
      storage.removeItem(USER_KEY);
      storage.removeItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      logger.error('Logout failed', error);
      storage.removeItem(USER_KEY);
      storage.removeItem(STORAGE_KEYS.TOKEN);
    }
  }

  getStoredUser(): AuthUser | null {
    return storage.getItem<AuthUser>(USER_KEY);
  }

  /**
   * Met à jour le profil utilisateur via PUT /auth/me
   */
  async updateProfile(data: UpdateProfileRequest): Promise<AuthUser> {
    const user = await authApi.updateProfile(data);
    storage.setItem(USER_KEY, user);
    logger.info('Profile updated', { userId: user.id });
    return user;
  }

  /**
   * Upload avatar via POST /auth/me/avatar
   */
  async uploadAvatar(file: File): Promise<AuthUser> {
    const user = await authApi.uploadAvatar(file);
    storage.setItem(USER_KEY, user);
    logger.info('Avatar uploaded', { userId: user.id });
    return user;
  }

  /**
   * Upload banner via POST /auth/me/banner
   */
  async uploadBanner(file: File): Promise<AuthUser> {
    const user = await authApi.uploadBanner(file);
    storage.setItem(USER_KEY, user);
    logger.info('Banner uploaded', { userId: user.id });
    return user;
  }

  /**
   * Vérifie si l'utilisateur a une session active en appelant GET /auth/me
   * Le cookie httpOnly est envoyé automatiquement par le navigateur
   */
  async checkSession(): Promise<AuthUser | null> {
    try {
      const user = await authApi.getCurrentUser();
      storage.setItem(USER_KEY, user);
      return user;
    } catch (error: unknown) {
      // Only clear storage if the server explicitly rejected (401 = cookie expired)
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        storage.removeItem(USER_KEY);
        storage.removeItem(STORAGE_KEYS.TOKEN);
        return null;
      }
      // Network error / timeout — don't touch storage, re-throw so caller can decide
      throw error;
    }
  }

  /**
   * Extraire le vrai message d'erreur du backend (réponse Axios)
   * Le backend renvoie soit :
   *   - AppError: { success: false, error: { code, message } }
   *   - Validation: { success: false, error: "string", details: [...] }
   */
  private extractErrorMessage(error: unknown): string | undefined {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: Record<string, unknown> } };
      const data = axiosError.response?.data;
      if (!data) return undefined;

      // Format AppError: { error: { message: "..." } }
      if (data.error && typeof data.error === 'object' && 'message' in (data.error as Record<string, unknown>)) {
        return (data.error as Record<string, unknown>).message as string;
      }

      // Format validation: { error: "Validation échouée", details: [...] }
      if (data.details && Array.isArray(data.details) && data.details.length > 0) {
        const detail = data.details[0] as { field?: string; message?: string };
        return detail.message || (data.error as string);
      }

      // Format simple: { error: "string" } ou { message: "string" }
      if (typeof data.error === 'string') return data.error;
      if (typeof data.message === 'string') return data.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return undefined;
  }
}

export const authService = new AuthService();
