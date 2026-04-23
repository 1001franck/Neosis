/**
 * INFRASTRUCTURE - AUTH API
 * Appels API pour l'authentification
 */

import { apiClient } from './client';
import { storage } from '@infrastructure/storage/localStorage';
import { STORAGE_KEYS } from '@shared/constants/app';
import type { LoginRequest, RegisterRequest, AuthUser, UpdateProfileRequest } from '@domain/auth/types';

const ENDPOINT = '/auth';

interface AuthApiResponse {
  user: AuthUser;
  token?: string;
}

export const authApi = {
  /**
   * Se connecter
   * Backend: POST /auth/login → { success, data: { user, token? } }
   */
  login: async (request: LoginRequest): Promise<{ user: AuthUser }> => {
    const response = await apiClient.post<AuthApiResponse>(`${ENDPOINT}/login`, request);
    if (response.data.token) {
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    }
    return { user: response.data.user };
  },

  /**
   * S'enregistrer
   * Backend: POST /auth/signup → { success, data: { user, token? } }
   */
  register: async (request: RegisterRequest): Promise<{ user: AuthUser }> => {
    const response = await apiClient.post<AuthApiResponse>(`${ENDPOINT}/signup`, request);
    if (response.data.token) {
      storage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
    }
    return { user: response.data.user };
  },

  /**
   * Se déconnecter
   * Backend: POST /auth/logout → supprime le cookie
   */
  logout: async (): Promise<void> => {
    await apiClient.post(`${ENDPOINT}/logout`);
    storage.removeItem(STORAGE_KEYS.TOKEN);
  },

  /**
   * Récupérer le profil actuel
   * Backend: GET /auth/me → { success, data: { user } }
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get(`${ENDPOINT}/me`);
    return response.data.user;
  },

  /**
   * Mettre à jour le profil
   * Backend: PUT /auth/me → { success, data: { user } }
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<AuthUser> => {
    const response = await apiClient.put(`${ENDPOINT}/me`, data);
    return response.data.user;
  },

  /**
   * Upload avatar
   * Backend: POST /auth/me/avatar (multipart/form-data)
   */
  uploadAvatar: async (file: File): Promise<AuthUser> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post(`${ENDPOINT}/me/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.user;
  },

  /**
   * Upload banner
   * Backend: POST /auth/me/banner (multipart/form-data)
   */
  uploadBanner: async (file: File): Promise<AuthUser> => {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await apiClient.post(`${ENDPOINT}/me/banner`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.user;
  },
};
