/**
 * SHARED - USE THEME HOOK
 * Toggle light/dark theme, persisté dans localStorage
 *
 * Le thème est appliqué en ajoutant/retirant la classe "dark" sur <html>.
 * Le CSS globals.css définit déjà les variables :root (light) et .dark (dark).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@shared/constants/app';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = STORAGE_KEYS.THEME;

/**
 * Lire le thème sauvegardé ou retourner 'dark' par défaut
 */
function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

/**
 * Appliquer le thème au <html>
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Initialiser depuis localStorage au montage client
  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
