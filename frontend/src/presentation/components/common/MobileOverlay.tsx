/**
 * MOBILE OVERLAY
 * Overlay semi-transparent pour fermer les sidebars sur mobile
 * Apparaît quand une sidebar est ouverte
 */

'use client';

import { memo } from 'react';

interface MobileOverlayProps {
  onClick: () => void;
  isVisible?: boolean; // Optional pour backward compatibility
}

const MobileOverlayComponent = ({ 
  isVisible, 
  onClick 
}: MobileOverlayProps): React.ReactNode => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={onClick}
      aria-hidden="true"
    />
  );
};

export const MobileOverlay = memo(MobileOverlayComponent);
