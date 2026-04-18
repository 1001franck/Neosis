import { create } from 'zustand';
import type { AuthUser } from '@domain/auth/types';

export interface AuthStoreState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setInitialized: (isInitialized: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  logout: () => set({ user: null, isAuthenticated: false }),
  reset: () => set({ user: null, isAuthenticated: false }),
}));
