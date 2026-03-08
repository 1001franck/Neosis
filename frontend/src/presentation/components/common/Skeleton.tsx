/**
 * LOADING SKELETON COMPONENT
 * Skeleton loaders pour les états de chargement
 */

'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer'
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse-subtle',
    shimmer: 'skeleton',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`bg-card ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
}

/**
 * Message Skeleton
 */
export function MessageSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-secondary/60 animate-slideInUp">
      {/* Avatar */}
      <Skeleton variant="circular" width={40} height={40} />
      
      <div className="flex-1 space-y-2">
        {/* Username + timestamp */}
        <div className="flex items-center gap-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={60} height={12} />
        </div>
        
        {/* Message content */}
        <Skeleton variant="text" width="80%" height={14} />
        <Skeleton variant="text" width="60%" height={14} />
      </div>
    </div>
  );
}

/**
 * Media Grid Skeleton
 */
export function MediaGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          className="aspect-square"
          animation="shimmer"
        />
      ))}
    </div>
  );
}

/**
 * Channel List Skeleton
 */
export function ChannelListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton variant="text" width={16} height={16} />
          <Skeleton variant="text" width="70%" height={16} />
        </div>
      ))}
    </div>
  );
}

/**
 * Member List Skeleton
 */
export function MemberListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2 px-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-1.5">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width="60%" height={16} />
        </div>
      ))}
    </div>
  );
}

/**
 * Server Card Skeleton
 */
export function ServerCardSkeleton() {
  return (
    <div className="p-4 bg-card rounded-lg space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="rounded" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" height={18} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>
      <Skeleton variant="text" width="100%" height={12} />
      <Skeleton variant="text" width="80%" height={12} />
    </div>
  );
}

