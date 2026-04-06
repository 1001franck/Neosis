/**
 * CARD COMPONENT
 * Composant Card réutilisable pour les conteneurs stylisés
 *
 * Responsabilités:
 * - Fournir des styles cohérents
 * - Supporter les headers et footers optionnels
 * - Gérer l'espacement et le padding
 */

'use client';

import React, { ReactNode } from 'react';

interface CardProps {
  title?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Composant Card réutilisable
 *
 * @example
 * <Card title="Mon Titre">
 *   Contenu de la carte
 * </Card>
 */
export function Card({ title, footer, children, className }: CardProps): React.ReactNode {
  return (
    <div
      className={`bg-card border border-border rounded-lg shadow-sm ${className || ''}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-border bg-secondary/50">
          {footer}
        </div>
      )}
    </div>
  );
}

