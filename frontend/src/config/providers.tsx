/**
 * PROVIDERS WRAPPER
 * Centralise tous les providers React au niveau racine
 *
 * Responsabilités:
 * - Fournir l'accès à React Query
 * - Fournir l'accès à Zustand stores
 * - Configurer le contexte global
 * - Gérer les erreurs globales
 */

'use client';

import { ReactNode, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/presentation/components/error/ErrorBoundary';
import { ToastProvider } from '@/presentation/components/toast/ToastProvider';
import { ResponsiveLayoutProvider } from '@/presentation/contexts/ResponsiveLayoutContext';
import { STORAGE_KEYS } from '@shared/constants/app';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper principal pour tous les providers
 *
 * Stack des providers (de l'intérieur vers l'extérieur):
 * 1. React Query (data fetching & caching)
 * 2. Zustand stores (implicite, pas de provider nécessaire)
 * 3. Toast notifications
 * 4. Error Boundary (gestion des erreurs UI)
 */
export function Providers({ children }: ProvidersProps): React.ReactNode {
  // Create QueryClient inside component to avoid sharing between requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));


  // Appliquer le thème sauvegardé au montage (avant le premier paint client)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    const root = document.documentElement;
    if (stored === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <ResponsiveLayoutProvider>
            {children}
          </ResponsiveLayoutProvider>
          
          {/* Dev tools - TEMPORAIREMENT DÉSACTIVÉ POUR TESTER */}
          {/* {isMounted && process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools 
              initialIsOpen={false}
              position="bottom"
            />
          )} */}
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
