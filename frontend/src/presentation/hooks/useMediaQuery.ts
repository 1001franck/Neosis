/**
 * USE MEDIA QUERY HOOK
 * Hook pour détecter les breakpoints responsive
 * Utilise window.matchMedia avec SSR safety
 */

import { useState, useEffect } from 'react';
import { MEDIA_QUERIES, type Breakpoint } from '@shared/constants/breakpoints';

/**
 * Hook pour détecter si un media query match
 * @param query - Media query string ou breakpoint name
 * @returns boolean - true si le media query match
 */
export function useMediaQuery(query: string | Breakpoint): boolean {
  // Résoudre le breakpoint en media query string
  const mediaQuery = query in MEDIA_QUERIES 
    ? MEDIA_QUERIES[query as Breakpoint]
    : query;

  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // SSR safety check not strictly needed inside useEffect but good practice
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(mediaQuery);
    
    // Set initial value inside effect to avoid hydration mismatch
    setMatches(mediaQueryList.matches);

    // Handler pour les changements
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern API
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    } 
    // Fallback pour anciens navigateurs
    else {
      mediaQueryList.addListener(handleChange);
      return () => mediaQueryList.removeListener(handleChange);
    }
  }, [mediaQuery]);

  return matches;
}

/**
 * Hook pour avoir l'état de tous les breakpoints
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('md');
  const isDesktop = useMediaQuery('lg');
  const isLargeDesktop = useMediaQuery('xl');

  return {
    isMobile,
    isTablet: isTablet && !isDesktop,
    isDesktop,
    isLargeDesktop,
    // Helpers
    isSmallScreen: isMobile,
    isMediumScreen: isTablet && !isDesktop,
    isLargeScreen: isDesktop,
  };
}

/**
 * Hook pour obtenir le breakpoint actuel
 */
export function useCurrentBreakpoint(): Breakpoint {
  const is2xl = useMediaQuery('2xl');
  const isXl = useMediaQuery('xl');
  const isLg = useMediaQuery('lg');
  const isMd = useMediaQuery('md');
  const isSm = useMediaQuery('sm');

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}
