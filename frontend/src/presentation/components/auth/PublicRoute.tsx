/**
 * PUBLIC ROUTE
 * Composant pour les routes publiques qui redirigent vers dashboard si authentifié
 *
 * Responsabilités:
 * - Vérifier l'authentification de l'utilisateur
 * - Rediriger vers dashboard si authentifié
 * - Afficher un loader pendant la vérification
 */

'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * Composant pour wrapper les pages publiques (auth, etc.)
 * Redirige vers dashboard si l'utilisateur est déjà authentifié
 *
 * @example
 * export default function LoginPage() {
 *   return (
 *     <PublicRoute>
 *       <LoginForm />
 *     </PublicRoute>
 *   );
 * }
 */
export function PublicRoute({ children }: PublicRouteProps): React.ReactNode {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isInitialized) return;

    // Navigation SPA — pas de rechargement complet pour ne pas réinitialiser le store et le socket
    if (isAuthenticated) {
      logger.info('Utilisateur déjà authentifié - redirection vers neosis');
      router.replace('/neosis/');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Vérification de session...</p>
        </div>
      </div>
    );
  }

  // Afficher un message si authentifié (le useEffect redirigera)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

