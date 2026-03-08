'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@application/auth/useAuth';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';
import { logger } from '@shared/utils/logger';

/**
 * PAGE SERVERS - Affiche la liste des serveurs de l'utilisateur
 */
export default function ServersPage(): React.ReactNode {
  const router = useRouter();
  const { user } = useAuth();

  // Rediriger vers /neosis (page d'entrée des serveurs)
  useEffect(() => {
    router.replace('/neosis');
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Redirection vers vos serveurs...</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
