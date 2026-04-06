'use client';

/**
 * SHARED - USE LOCALE HOOK
 * Gestion de la langue (fr/en), persistée dans localStorage
 * Fonctionne comme useTheme : lecture au montage, application immédiate
 */

import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@shared/constants/app';
import { translations } from '@shared/i18n';

export type Locale = 'fr' | 'en';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALE);
  if (stored === 'fr' || stored === 'en') return stored;
  return 'fr';
}

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>('fr');

  useEffect(() => {
    const stored = getStoredLocale();
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.');
      let value: unknown = translations[locale];
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    },
    [locale],
  );

  return { locale, setLocale, t };
}