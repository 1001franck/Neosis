/**
 * ALERT COMPONENT
 * Composant alert réutilisable avec différentes variantes
 */

'use client';

import { ReactNode } from 'react';

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  closeable?: boolean;
}

const variantConfig = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    title: 'text-green-300',
    icon: '✓',
    iconBg: 'bg-green-500/20 text-green-400',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    title: 'text-red-300',
    icon: '✕',
    iconBg: 'bg-red-500/20 text-red-400',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    text: 'text-yellow-400',
    title: 'text-yellow-300',
    icon: '!',
    iconBg: 'bg-yellow-500/20 text-yellow-400',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    title: 'text-blue-300',
    icon: 'ℹ',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
};

/**
 * Composant Alert
 *
 * @example
 * <Alert variant="success" title="Succès">
 *   Serveur créé avec succès!
 * </Alert>
 */
export function Alert({
  variant,
  title,
  children,
  onClose,
  closeable = false,
}: AlertProps): React.ReactNode {
  const config = variantConfig[variant];

  return (
    <div
      className={`rounded-lg border ${config.bg} ${config.border} p-4 flex gap-3`}
      role="alert"
    >
      {/* Icône */}
      <div className={`flex-shrink-0 w-5 h-5 rounded-full ${config.iconBg} flex items-center justify-center font-bold text-sm`}>
        {config.icon}
      </div>

      {/* Contenu */}
      <div className="flex-1">
        {title && <h3 className={`font-semibold ${config.title}`}>{title}</h3>}
        <div className={`text-sm ${config.text} ${title ? 'mt-1' : ''}`}>
          {children}
        </div>
      </div>

      {/* Bouton fermer */}
      {closeable && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.text} hover:opacity-75 transition-opacity`}
          aria-label="Fermer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

