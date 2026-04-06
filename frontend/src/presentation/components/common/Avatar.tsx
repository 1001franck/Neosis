/**
 * AVATAR COMPONENT
 * Composant avatar réutilisable avec initiales ou image
 */

'use client';

import React, { useMemo } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

// Couleurs pour les initiales
const colors = [
  'bg-red-500',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
];

/**
 * Obtenir les initiales d'un nom
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
    .slice(0, 2);
}

/**
 * Obtenir une couleur consistente pour un nom
 */
function getColorForName(name: string): string {
  const hash = name.charCodeAt(0);
  return colors[hash % colors.length];
}

/**
 * Composant Avatar
 *
 * @example
 * <Avatar name="John Doe" size="md" />
 * <Avatar name="Jane Smith" src="/avatar.jpg" size="lg" />
 */
export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps): React.ReactNode {
  const initials = useMemo(() => getInitials(name), [name]);
  const color = useMemo(() => getColorForName(name), [name]);

  return (
    <div
      className={`
        rounded-full flex items-center justify-center flex-shrink-0
        font-semibold text-white overflow-hidden
        ${sizeClasses[size]}
        ${src ? '' : color}
        ${className}
      `}
      title={name}
      role="img"
      aria-label={`Avatar pour ${name}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

