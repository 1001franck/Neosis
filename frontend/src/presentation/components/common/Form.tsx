/**
 * FORM COMPONENT
 * Composant form wrapper réutilisable
 */

'use client';

import React, { FormHTMLAttributes, ReactNode } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * Composant Form avec structure standard
 *
 * @example
 * <Form onSubmit={handleSubmit}>
 *   <Input label="Email" type="email" name="email" required />
 *   <Input label="Password" type="password" name="password" required />
 *   <Button type="submit">Submit</Button>
 * </Form>
 */
export function Form({
  children,
  title,
  description,
  className,
  ...props
}: FormProps): React.ReactNode {
  return (
    <form className={`space-y-6 ${className || ''}`} {...props}>
      {/* Titre et description */}
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-muted-foreground text-sm mt-2">{description}</p>}
        </div>
      )}

      {/* Champs */}
      <div className="space-y-5">
        {children}
      </div>
    </form>
  );
}

