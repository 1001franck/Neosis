/**
 * DOMAIN - AUTH TYPES
 * Types métier purs (pas de dépendances externes)
 */

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  banner?: string | null;
  bio?: string | null;
  customStatus?: string | null;
  statusEmoji?: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  username?: string;
  avatarUrl?: string | null;
  bio?: string | null;
  customStatus?: string | null;
  statusEmoji?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}
