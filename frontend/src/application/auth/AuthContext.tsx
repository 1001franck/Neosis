/**
 * AUTH CONTEXT
 * Context React pour gérer l'utilisateur authentifié
 * 
 * Responsabilités:
 * - Fournir currentUser à tous les composants
 * - Fournir currentUserId facilement accessible
 * - Éviter prop drilling
 */

'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@application/auth/useAuth';

interface AuthContextValue {
  user: ReturnType<typeof useAuthHook>['user'];
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider qui wrap l'application et fournit les infos auth
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const { user, isInitialized } = useAuthHook();

  const value: AuthContextValue = {
    user,
    userId: user?.id || null,
    isAuthenticated: !!user,
    isLoading: !isInitialized,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte auth
 * 
 * @example
 * const { userId, user, isAuthenticated } = useAuthContext();
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
