/**
 * ERROR BOUNDARY COMPONENT
 * Composant pour gérer les erreurs React gracieusement
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Appeler le callback onError si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Afficher l'UI d'erreur par défaut
      return (
        <div className="flex items-center justify-center min-h-screen bg-card p-4">
          <div className="max-w-md w-full bg-background rounded-lg p-6 space-y-4 animate-slideInUp">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#ed4245] rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-white text-center">
              Oups ! Une erreur s'est produite
            </h2>

            {/* Error message */}
            <div className="bg-card rounded p-3">
              <p className="text-sm text-foreground font-mono break-all">
                {this.state.error?.message || 'Une erreur inattendue s\'est produite'}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground text-center">
              L'équipe de développement a été notifiée. Essayez de recharger la page.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded transition-colors"
              >
                Réessayer
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-muted hover:bg-[#5d6069] text-white font-medium rounded transition-colors"
              >
                Recharger la page
              </button>
            </div>

            {/* Dev mode - Show stack trace */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-muted-foreground transition-colors">
                  Détails techniques (dev only)
                </summary>
                <pre className="mt-2 p-3 bg-secondary rounded text-xs text-foreground overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook pour utiliser ErrorBoundary de manière déclarative
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}

