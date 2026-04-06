'use client';

/**
 * SHARED - USE LOCALE HOOK
 * Gestion de la langue (fr/en) via Zustand — partagée entre tous les composants
 * Persistée dans localStorage, applique lang sur <html>
 */

import { create } from 'zustand';
import { STORAGE_KEYS } from '@shared/constants/app';
import { translations } from '@shared/i18n';

export type Locale = 'fr' | 'en';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  const stored = localStorage.getItem(STORAGE_KEYS.LOCALE);
  if (stored === 'fr' || stored === 'en') return stored;
  return 'fr';
}

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const useLocale = create<LocaleStore>((set, get) => ({
  locale: 'fr',
  setLocale: (newLocale: Locale) => {
    set({ locale: newLocale });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LOCALE, newLocale);
      document.documentElement.lang = newLocale;
    }
  },
  t: (key: string): string => {
    const { locale } = get();
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
}));

// Initialiser la locale depuis le localStorage au montage
if (typeof window !== 'undefined') {
  const stored = getStoredLocale();
  useLocale.getState().setLocale(stored);
}