'use client';

import { useEffect } from 'react';
import { useAuth } from '@application/auth/useAuth';
import { ProtectedRoute } from '@presentation/components/auth/ProtectedRoute';

/**
 * PAGE SERVERS - Affiche la liste des serveurs de l'utilisateur
 */
export default function ServersPage(): React.ReactNode {
  useAuth();

  // Rediriger vers /neosis/ — fichier statique existant dans out/
  useEffect(() => {
    window.location.href = '/neosis/';
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
