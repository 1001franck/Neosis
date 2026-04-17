/**
 * MOBILE MENU BUTTON
 * Bouton hamburger pour ouvrir/fermer les sidebars sur mobile
 * Animé avec transition smooth
 */

'use client';

import { memo } from 'react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  label?: string;
}

const MobileMenuButtonComponent = ({ 
  isOpen, 
  onClick,
  label = 'Menu'
}: MobileMenuButtonProps): React.ReactElement => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded hover:bg-secondary transition-colors md:hidden"
      aria-label={label}
      aria-expanded={isOpen}
    >
      <div className="w-6 h-5 flex flex-col justify-between">
        {/* Top bar */}
        <span
          className={`w-full h-0.5 bg-foreground transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        {/* Middle bar */}
        <span
          className={`w-full h-0.5 bg-foreground transition-all duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        {/* Bottom bar */}
        <span
          className={`w-full h-0.5 bg-foreground transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
    </button>
  );
};

export const MobileMenuButton = memo(MobileMenuButtonComponent);
