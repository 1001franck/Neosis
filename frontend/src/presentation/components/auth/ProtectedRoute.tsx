/**
 * PROTECTED ROUTE
 * Composant pour protéger les routes qui nécessitent une authentification
 *
 * Responsabilités:
 * - Vérifier l'authentification de l'utilisateur
 * - Rediriger vers login si non authentifié
 * - Afficher un loader pendant la vérification
 */

'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@application/index';
import { logger } from '@shared/utils/logger';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Composant pour wrapper les pages protégées
 *
 * @example
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardContent />
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactNode {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isInitialized) return;

    // Navigation SPA — pas de rechargement complet pour ne pas réinitialiser le store et le socket
    if (!isAuthenticated) {
      logger.warn('Accès refusé - redirection vers login');
      router.replace('/auth/login/');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Afficher un loader pendant l'initialisation
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher un message si pas authentifié (le useEffect redirigera)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Redirection vers l&apos;authentification...</p>
        </div>
      </div>
    );
  }

  return <div className="h-full w-full">{children}</div>;
}

