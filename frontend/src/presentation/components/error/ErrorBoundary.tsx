/**
 * ERROR BOUNDARY
 * Composant pour capturer les erreurs React et afficher une UI fallback
 *
 * Responsabilités:
 * - Capturer les erreurs JavaScript en rendu
 * - Afficher une UI fallback conviviale
 * - Logger les erreurs en production
 * - Permettre à l'utilisateur de réessayer
 */

'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { logger } from '@shared/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary pour capturer les erreurs non contrôlées
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in component tree', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-md w-full">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Oups ! 😞
              </h1>
              <p className="text-muted-foreground mb-2">
                Une erreur inattendue s'est produite
              </p>
              <p className="text-sm text-muted-foreground mb-6 font-mono bg-secondary p-3 rounded overflow-auto">
                {this.state.error?.message || 'Erreur inconnue'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition"
                >
                  Réessayer
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition"
                >
                  Retour à l'accueil
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

