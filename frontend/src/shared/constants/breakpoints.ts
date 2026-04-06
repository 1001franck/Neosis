/**
 * BREAKPOINTS CONSTANTS
 * Tailwind breakpoints standards pour la responsivité
 * Mobile-first approach
 */

export const BREAKPOINTS = {
  xs: 0,      // 0px - Extra small (mobile portrait)
  sm: 640,    // 640px - Small (mobile landscape)
  md: 768,    // 768px - Medium (tablet portrait)
  lg: 1024,   // 1024px - Large (tablet landscape / small desktop)
  xl: 1280,   // 1280px - Extra large (desktop)
  '2xl': 1536 // 1536px - 2X Extra large (large desktop)
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Media queries strings for programmatic use
 */
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
} as const;

/**
 * Common responsive visibility patterns
 */
export const RESPONSIVE_VISIBILITY = {
  // Visible seulement sur mobile
  mobileOnly: 'block md:hidden',
  // Caché sur mobile, visible desktop
  desktopOnly: 'hidden md:block',
  // Visible tablet et plus
  tabletUp: 'hidden md:block',
  // Visible sur grand écran uniquement
  desktopUp: 'hidden lg:block',
} as const;

/**
 * Sidebar widths responsive
 */
export const SIDEBAR_WIDTHS = {
  // Mobile: full width overlay
  mobile: 'w-full',
  // Tablet: 280px
  tablet: 'md:w-[280px]',
  // Desktop: valeurs standard
  channelSidebar: 'md:w-60',      // 240px
  membersSidebar: 'md:w-60',      // 240px
  channelInfo: 'md:w-[340px]',    // 340px
  serverNav: 'md:w-[72px]',       // 72px
} as const;
