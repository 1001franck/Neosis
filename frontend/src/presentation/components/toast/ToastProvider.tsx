/**
 * TOAST PROVIDER
 * Fournit le contexte et la fonctionnalité de notifications toast
 *
 * Responsabilités:
 * - Gérer la queue de toasts
 * - Fournir des functions pour afficher des toasts
 * - Gérer la suppression automatique des toasts
 * - Afficher les toasts dans l'interface
 */

'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Toast } from './Toast';
import { toastBus } from '@shared/utils/toastBus';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number; // millisecondes, 0 = ne pas fermer automatiquement
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Hook pour utiliser les toasts dans les composants
 *
 * @example
 * const { toast } = useToast();
 * toast.success('Opération réussie');
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un composant enfant de ToastProvider');
  }
  return context;
}

/**
 * Provider pour les toasts
 */
export function ToastProvider({ children }: { children: React.ReactNode }): React.ReactNode {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  /**
   * Créer un nouveau toast
   */
  const addToast = useCallback(
    (type: ToastMessage['type'], message: string, duration: number = 4000) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast: ToastMessage = {
        id,
        type,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Supprimer automatiquement après la durée
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    []
  );

  /**
   * Supprimer un toast
   */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value: ToastContextValue = {
    toast: {
      success: (message, duration) => addToast('success', message, duration),
      error: (message, duration) => addToast('error', message, duration),
      warning: (message, duration) => addToast('warning', message, duration),
      info: (message, duration) => addToast('info', message, duration),
    },
  };

  useEffect(() => {
    const unsubscribe = toastBus.on(({ type, message, duration }) => {
      addToast(type, message, duration);
    });
    return () => unsubscribe();
  }, [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Conteneur des toasts */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
