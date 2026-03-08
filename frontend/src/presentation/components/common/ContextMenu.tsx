/**
 * CONTEXT MENU COMPONENT
 * Menu contextuel Discord-style
 * 
 * Responsabilités:
 * - Afficher un menu au clic droit
 * - Positionner intelligemment (éviter les bords)
 * - Fermer au clic extérieur ou ESC
 * - Support des icônes et raccourcis
 */

'use client';

import React, { useEffect, useRef, useCallback } from 'react';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

/**
 * Calculer la position du menu pour éviter de sortir de l'écran
 */
function calculatePosition(
  x: number,
  y: number,
  menuWidth: number,
  menuHeight: number
): { x: number; y: number } {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  let finalX = x;
  let finalY = y;
  
  // Ajuster si dépasse à droite
  if (x + menuWidth > windowWidth) {
    finalX = windowWidth - menuWidth - 10;
  }
  
  // Ajuster si dépasse en bas
  if (y + menuHeight > windowHeight) {
    finalY = windowHeight - menuHeight - 10;
  }
  
  // Éviter les valeurs négatives
  finalX = Math.max(10, finalX);
  finalY = Math.max(10, finalY);
  
  return { x: finalX, y: finalY };
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps): React.ReactElement {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y });

  /**
   * Calculer la position au montage
   */
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const newPos = calculatePosition(x, y, rect.width, rect.height);
      setPosition(newPos);
    }
  }, [x, y]);

  /**
   * Gérer les clics extérieurs
   */
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  /**
   * Gérer la touche ESC
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Petit délai pour éviter de fermer immédiatement
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClickOutside, handleKeyDown]);

  /**
   * Handler pour les items
   */
  const handleItemClick = (item: ContextMenuItem): void => {
    if (item.disabled) return;
    
    item.onClick?.();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] bg-secondary rounded-md shadow-xl border border-[#2e3035] py-1.5 animate-fadeIn"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return (
            <div
              key={`divider-${index}`}
              className="h-px bg-[#2e3035] my-1"
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            className={`
              w-full px-3 py-2 text-left text-sm flex items-center gap-3
              transition-colors
              ${item.disabled
                ? 'text-muted cursor-not-allowed'
                : item.danger
                  ? 'text-[#f23f42] hover:bg-[#f23f42] hover:text-foreground'
                  : 'text-foreground hover:bg-primary hover:text-foreground'
              }
            `}
          >
            {item.icon && (
              <span className="w-4 h-4 flex-shrink-0">
                {item.icon}
              </span>
            )}
            <span className="flex-1">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

