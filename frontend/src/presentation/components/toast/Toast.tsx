/**
 * TOAST COMPONENT
 * Composant d'affichage individuel pour les notifications
 */

'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { TOAST_COLORS } from '@shared/constants/colors';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Composant Toast individuel avec icône appropriée et animations
 */
export function Toast({ type, message, onClose, duration = 5000, action }: ToastProps): React.ReactNode {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  // Auto-close avec barre de progression
  useEffect(() => {
    if (duration === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const styles = {
    success: `bg-green-500 border-[${TOAST_COLORS.SUCCESS_BORDER}] text-white`,
    error: `bg-red-500 border-[${TOAST_COLORS.ERROR_BORDER}] text-white`,
    warning: `bg-yellow-500 border-[${TOAST_COLORS.WARNING_BORDER}] text-white`,
    info: `bg-primary border-[${TOAST_COLORS.INFO_BORDER}] text-white`,
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`
        relative overflow-hidden border rounded-lg shadow-lg
        flex items-start gap-3 p-4 w-[92vw] sm:w-auto sm:min-w-[300px] max-w-[500px]
        ${styles[type]}
        ${isExiting ? 'animate-slideOutRight' : 'animate-slideInRight'}
      `}
      role="alert"
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{message}</p>

        {/* Action button */}
        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            className="mt-2 text-sm font-semibold underline hover:no-underline transition-all"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* Animations supplémentaires pour Toast */
const toastStyles = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out;
  }

  .animate-slideOutRight {
    animation: slideOutRight 0.3s ease-in;
  }
`;

// Injecter les styles dans le head
if (typeof document !== 'undefined') {
  const styleElement = document.getElementById('toast-styles');
  if (!styleElement) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = toastStyles;
    document.head.appendChild(style);
  }
}


