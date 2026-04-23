/**
 * RESPONSIVE SIDEBAR COMPONENT
 * Composant wrapper générique pour toutes les sidebars
 * 
 * Responsabilités:
 * - Gestion automatique de la visibilité (mobile/desktop)
 * - Overlay mobile avec click-to-close
 * - Position (left/right), largeur et z-index automatiques
 * - Comportement cohérent pour toutes les sidebars
 * 
 * Usage:
 * <ResponsiveSidebar id="channels" position="left" width="w-60">
 *   <ChannelListContent />
 * </ResponsiveSidebar>
 */

'use client';

import React, { type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsiveLayout, type SidebarId } from '@presentation/contexts/ResponsiveLayoutContext';

interface ResponsiveSidebarProps {
  /** Identifiant unique de la sidebar */
  id: SidebarId;

  /** Position de la sidebar */
  position: 'left' | 'right';

  /** Largeur desktop (classes Tailwind) */
  width: string; // ex: 'w-60', 'w-[240px]', 'w-[340px]'

  /** Contenu de la sidebar */
  children: ReactNode;

  /** Afficher sur desktop par défaut (true par défaut sauf pour server) */
  showOnDesktop?: boolean;

  /** Classes CSS additionnelles */
  className?: string;
}


/**
 * ResponsiveSidebar - Composant générique pour sidebars responsive
 * 
 * Comportement:
 * - Mobile: Overlay plein écran (fixed inset-y-0, w-full, z-50) avec drag-to-close
 * - Desktop: Largeur fixe (width prop), toujours visible si showOnDesktop
 * - Overlay: Apparaît sur mobile si sidebar ouverte
 * - Close: Click overlay ou drag (swipe) vers l'extérieur
 */
export const ResponsiveSidebar = React.memo(function ResponsiveSidebar({
  id,
  position,
  width,
  children,
  showOnDesktop = id !== 'server',
  className = '',
}: ResponsiveSidebarProps): React.ReactElement | null {
  const { isMobile, isSidebarOpen, closeSidebar } = useResponsiveLayout();
  const isOpen = isSidebarOpen(id);

  // Border selon la position
  const borderClass = position === 'left' ? 'border-r' : 'border-l';

  // Paramètres de drag selon la position

  // Classes de positionnement
  const positionClasses = position === 'left'
    ? `fixed inset-y-0 left-0 z-50 w-full md:relative md:inset-auto md:z-auto md:${width}`
    : `fixed inset-y-0 right-0 z-50 w-full md:relative md:inset-auto md:z-auto md:${width}`;

  // Rendu spécifique pour Desktop : la sidebar est retirée du flux si fermée
  if (!isMobile) {
    // Afficher la sidebar uniquement si ouverte ou showOnDesktop
    if (!isOpen && !showOnDesktop) return null;
    return (
      <div
        className={`
          ${isOpen || showOnDesktop ? 'flex' : 'hidden'}
          ${positionClasses}
          h-full bg-background/80 backdrop-blur-sm flex flex-col
          ${borderClass} border-border/40
          ${className}
        `.trim().replace(/\s+/g, ' ')}
      >
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Overlay mobile avec animation de fondu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => closeSidebar(id)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar avec support du Swipe/Drag */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={position === 'left' ? { x: '-100%' } : { x: '100%' }}
            animate={{ x: 0 }}
            exit={position === 'left' ? { x: '-100%' } : { x: '100%' }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              mass: 0.8
            }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: position === 'left' ? -1000 : 0, right: position === 'right' ? 1000 : 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              const shouldClose = position === 'left'
                ? info.offset.x < -100 || info.velocity.x < -500
                : info.offset.x > 100 || info.velocity.x > 500;

              if (shouldClose) {
                closeSidebar(id);
              }
            }}
            className={`
              ${positionClasses}
              h-full bg-background/85 backdrop-blur-sm flex flex-col
              ${borderClass} border-border/40
              ${className}
              touch-none
            `.trim().replace(/\s+/g, ' ')}
          >
            {/* Drag Handle visible sur mobile pour suggérer le geste */}
            <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center p-1 opacity-30 md:hidden"
              style={{ [position === 'left' ? 'right' : 'left']: '4px' }}>
              <div className="w-1.5 h-12 bg-foreground/20 rounded-full" />
            </div>

            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
