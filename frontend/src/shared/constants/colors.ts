/**
 * SHARED CONSTANTS - COLORS
 * Centralized color definitions for design system consistency
 */

/**
 * User status indicator colors
 */
export const STATUS_COLORS = {
  ONLINE: '#3ba55d',
  IDLE: '#faa81a',
  DND: '#ed4245',
  OFFLINE: '#747f8d',
} as const;

/**
 * Background colors
 */
export const BACKGROUND_COLORS = {
  PRIMARY: '#2f3136',
  SECONDARY: '#36393f',
  MUTED: '#4e5058',
  HOVER: '#5c5e66',
  ACCENT: '#5865f2',
} as const;

/**
 * Text colors
 */
export const TEXT_COLORS = {
  PRIMARY: '#dcddde',
  SECONDARY: '#b9bbbe',
  MUTED: '#96989d',
  PLACEHOLDER: '#72767d',
  DISABLED: '#4f545c',
} as const;

/**
 * Brand and accent colors
 */
export const BRAND_COLORS = {
  LINK: '#00b0f4',
  PRIMARY: '#5865f2',
  SUCCESS: '#3ca374',
  ERROR: '#d84040',
  ERROR_LIGHT: '#f23f42',
  ERROR_HOVER: '#f04747',
  WARNING: '#e09016',
} as const;

/**
 * Toast notification colors
 */
export const TOAST_COLORS = {
  SUCCESS_BORDER: '#3ca374',
  ERROR_BORDER: '#d84040',
  WARNING_BORDER: '#e09016',
  INFO_BORDER: '#4752c4',
} as const;

/**
 * Utility function to create Tailwind class from hex color
 */
export function createTailwindBg(hexColor: string): string {
  return `bg-[${hexColor}]`;
}

export function createTailwindText(hexColor: string): string {
  return `text-[${hexColor}]`;
}

export function createTailwindBorder(hexColor: string): string {
  return `border-[${hexColor}]`;
}

export function createTailwindPlaceholder(hexColor: string): string {
  return `placeholder-[${hexColor}]`;
}

/**
 * Get Tailwind background class for user status
 */
export function getStatusBgClass(status?: 'online' | 'offline' | 'idle' | 'dnd'): string {
  const colorMap = {
    online: STATUS_COLORS.ONLINE,
    idle: STATUS_COLORS.IDLE,
    dnd: STATUS_COLORS.DND,
    offline: STATUS_COLORS.OFFLINE,
  };
  return createTailwindBg(colorMap[status ?? 'offline']);
}
