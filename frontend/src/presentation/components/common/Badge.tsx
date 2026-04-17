/**
 * BADGE COMPONENT
 * Composant badge réutilisable pour labels et statuts
 */

'use client';

import React, { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary/20 text-primary',
  secondary: 'bg-secondary text-muted-foreground',
  success: 'bg-green-500/20 text-green-400',
  danger: 'bg-red-500/20 text-red-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  info: 'bg-indigo-500/20 text-indigo-400',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

/**
 * Composant Badge
 *
 * @example
 * <Badge variant="success">Online</Badge>
 * <Badge variant="danger" size="sm">Offline</Badge>
 */
export function Badge({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
}: BadgeProps): React.ReactNode {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

