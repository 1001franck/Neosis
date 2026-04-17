/**
 * LOADING SPINNER COMPONENT
 * Composant pour afficher un indicateur de chargement
 *
 * Responsabilités:
 * - Afficher une animation de chargement
 * - Supporter différentes tailles
 * - Afficher un message optionnel
 */

'use client';

import React from 'react';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingProps {
  size?: LoadingSize;
  message?: string;
  fullscreen?: boolean;
}

const sizeStyles: Record<LoadingSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

/**
 * Composant Loading réutilisable
 *
 * @example
 * <Loading size="md" message="Chargement..." />
 */
export function Loading({ size = 'md', message, fullscreen = false }: LoadingProps): React.ReactNode {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`inline-block animate-spin rounded-full border-b-2 border-primary ${sizeStyles[size]}`} />
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );

  if (fullscreen) {
    return <div className="min-h-screen flex items-center justify-center bg-background">{content}</div>;
  }

  return content;
}

