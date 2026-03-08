/**
 * RESPONSIVE LAYOUT CONTEXT
 * Gère l'état global des sidebars pour la responsivité
 * Système unifié pour toutes les sidebars de l'application
 */

'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useMediaQuery } from '@presentation/hooks/useMediaQuery';

export type SidebarId = 
  | 'server'           // ServerSidebar (72px)
  | 'dm-panel'         // DirectMessagesPanel (240px)
  | 'channels'         // ServerChannelsSidebar (240px)
  | 'members'          // MembersSidebar (240px)
  | 'channel-info'     // ChannelInfoSidebar (340px)
  | 'friends';         // Friends sidebar (DM panel in server view)

interface ResponsiveLayoutState {
  // Breakpoint info
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Generic sidebar state
  isSidebarOpen: (id: SidebarId) => boolean;
  toggleSidebar: (id: SidebarId) => void;
  openSidebar: (id: SidebarId) => void;
  closeSidebar: (id: SidebarId) => void;
  closeAllSidebars: () => void;

  // Collapsed sidebar state (desktop only)
  isSidebarCollapsed: (id: SidebarId) => boolean;
  setSidebarCollapsed: (id: SidebarId, collapsed: boolean) => void;
  toggleSidebarCollapsed: (id: SidebarId) => void;
  
  // Legacy compatibility (deprecated)
  /** @deprecated Use isSidebarOpen('server') */
  isServerSidebarOpen: boolean;
  /** @deprecated Use isSidebarOpen('channels') */
  isChannelSidebarOpen: boolean;
  /** @deprecated Use isSidebarOpen('members') */
  isMembersSidebarOpen: boolean;
  /** @deprecated Use isSidebarOpen('channel-info') */
  isChannelInfoOpen: boolean;
  /** @deprecated Use toggleSidebar('server') */
  toggleServerSidebar: () => void;
  /** @deprecated Use toggleSidebar('channels') */
  toggleChannelSidebar: () => void;
  /** @deprecated Use toggleSidebar('members') */
  toggleMembersSidebar: () => void;
  /** @deprecated Use toggleSidebar('channel-info') */
  toggleChannelInfo: () => void;
}

const ResponsiveLayoutContext = createContext<ResponsiveLayoutState | undefined>(undefined);

interface ResponsiveLayoutProviderProps {
  children: ReactNode;
}

export function ResponsiveLayoutProvider({ children }: ResponsiveLayoutProviderProps) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('md');
  const isDesktop = useMediaQuery('lg');

  // État unifié: Set des sidebars ouvertes
  const [openSidebars, setOpenSidebars] = useState<Set<SidebarId>>(() => {
    // Par défaut sur desktop: channels ouvert
    // Sur mobile: tout fermé
    return new Set(isMobile ? [] : ['channels']);
  });

  // État unifié: Set des sidebars collapsed (desktop)
  const [collapsedSidebars, setCollapsedSidebars] = useState<Set<SidebarId>>(new Set());

  // Sync avec le breakpoint change
  useEffect(() => {
    if (isMobile) {
      // Fermer toutes les sidebars sur mobile
      setOpenSidebars(new Set());
    } else {
      // Ouvrir channels par défaut sur desktop
      setOpenSidebars(prev => new Set([...prev, 'channels']));
    }
  }, [isMobile]);

  // Generic functions
  const isSidebarOpen = useCallback((id: SidebarId): boolean => {
    return openSidebars.has(id);
  }, [openSidebars]);

  const toggleSidebar = useCallback((id: SidebarId) => {
    setOpenSidebars(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Sur mobile, fermer les autres sidebars du même côté
        if (isMobile) {
          const leftSidebars: SidebarId[] = ['server', 'dm-panel', 'channels'];
          const rightSidebars: SidebarId[] = ['members', 'channel-info', 'friends'];
          
          if (leftSidebars.includes(id)) {
            leftSidebars.forEach(s => next.delete(s));
          } else if (rightSidebars.includes(id)) {
            rightSidebars.forEach(s => next.delete(s));
          }
        }
        next.add(id);
      }
      return next;
    });
  }, [isMobile]);

  const openSidebar = useCallback((id: SidebarId) => {
    setOpenSidebars(prev => {
      const next = new Set(prev);
      // Sur mobile, fermer les autres du même côté
      if (isMobile) {
        const leftSidebars: SidebarId[] = ['server', 'dm-panel', 'channels'];
        const rightSidebars: SidebarId[] = ['members', 'channel-info', 'friends'];
        
        if (leftSidebars.includes(id)) {
          leftSidebars.forEach(s => next.delete(s));
        } else if (rightSidebars.includes(id)) {
          rightSidebars.forEach(s => next.delete(s));
        }
      }
      next.add(id);
      return next;
    });
  }, [isMobile]);

  const closeSidebar = useCallback((id: SidebarId) => {
    setOpenSidebars(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const closeAllSidebars = useCallback(() => {
    setOpenSidebars(new Set());
  }, []);

  const isSidebarCollapsed = useCallback((id: SidebarId): boolean => {
    return collapsedSidebars.has(id);
  }, [collapsedSidebars]);

  const setSidebarCollapsed = useCallback((id: SidebarId, collapsed: boolean) => {
    setCollapsedSidebars(prev => {
      const next = new Set(prev);
      if (collapsed) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleSidebarCollapsed = useCallback((id: SidebarId) => {
    setCollapsedSidebars(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Legacy compatibility
  const isServerSidebarOpen = isSidebarOpen('server');
  const isChannelSidebarOpen = isSidebarOpen('channels');
  const isMembersSidebarOpen = isSidebarOpen('members');
  const isChannelInfoOpen = isSidebarOpen('channel-info');

  const value: ResponsiveLayoutState = {
    isMobile,
    isTablet: isTablet && !isDesktop,
    isDesktop,
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    closeAllSidebars,
    isSidebarCollapsed,
    setSidebarCollapsed,
    toggleSidebarCollapsed,
    // Legacy
    isServerSidebarOpen,
    isChannelSidebarOpen,
    isMembersSidebarOpen,
    isChannelInfoOpen,
    toggleServerSidebar: () => toggleSidebar('server'),
    toggleChannelSidebar: () => toggleSidebar('channels'),
    toggleMembersSidebar: () => toggleSidebar('members'),
    toggleChannelInfo: () => toggleSidebar('channel-info'),
  };

  return (
    <ResponsiveLayoutContext.Provider value={value}>
      {children}
    </ResponsiveLayoutContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte responsive layout
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  const context = useContext(ResponsiveLayoutContext);
  if (!context) {
    throw new Error('useResponsiveLayout must be used within ResponsiveLayoutProvider');
  }
  return context;
}
