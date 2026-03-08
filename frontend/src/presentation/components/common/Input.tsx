/**
 * INPUT COMPONENT
 * Composant input réutilisable avec labels et validation
 */

'use client';

import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
}

/**
 * Composant Input avec styling cohérent
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="votre@email.com"
 *   error="Email invalide"
 * />
 */
export function Input({
  label,
  error,
  helpText,
  required,
  className,
  id,
  ...props
}: InputProps): React.ReactNode {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-muted-foreground mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`
          w-full px-4 py-2 border rounded-lg
          bg-secondary text-foreground placeholder-muted-foreground
          transition-colors duration-200
          focus:ring-2 focus:ring-offset-0 focus:outline-none
          disabled:bg-secondary/50 disabled:text-muted-foreground disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary focus:border-transparent'}
          ${className || ''}
        `}
        {...props}
      />

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {helpText && !error && <p className="mt-2 text-sm text-muted-foreground">{helpText}</p>}
    </div>
  );
}

